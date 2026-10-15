/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Equivalente assíncrono de observatory.ts, mas buscando dados reais de
 * `submissions` via as funções RPC de infra/supabase/migrations/008_painel_functions.sql
 * em vez de agregar HistoricalRecord[] no navegador. Mesma semântica de
 * sigilo k>=5 (mascarada no próprio banco, não aqui) — ver o comentário no
 * topo daquela migration.
 *
 * O formato de retorno (`Agg`, `ObsFilters`) é o mesmo de observatory.ts de
 * propósito, para o PublicPanel.tsx precisar mudar o mínimo possível ao
 * trocar "calcular localmente" por "buscar do servidor".
 */

import { supabase } from './supabase';
import { getMaturityLevel } from './scoring';
import type { DimensionId } from '../types';
import type { Agg, ObsFilters } from './observatory';
import { AREAS_PRIVADAS, AREAS_PUBLICAS, AREAS_TERCEIRO, RELACOES_IA, type Regiao } from './taxonomy';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const REGIOES: Regiao[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface ScoredRow {
  n: number;
  score_global: number | null;
  score_gov: number | null;
  score_tec: number | null;
  score_seg: number | null;
  score_edu: number | null;
  score_eco: number | null;
}

function rowToAgg(row: ScoredRow): Agg {
  if (row.score_global === null) return { n: row.n, score: null, level: null, dims: null };
  const dims: Record<DimensionId, number> = {
    gov: row.score_gov!, tec: row.score_tec!, seg: row.score_seg!, edu: row.score_edu!, eco: row.score_eco!,
  };
  return { n: row.n, score: row.score_global, level: getMaturityLevel(row.score_global).num, dims };
}

function filterArgs(f: ObsFilters) {
  return {
    p_setor: f.setor ?? null,
    p_esfera: f.esfera ?? null,
    p_area: f.area ?? null,
    p_poder: f.poder ?? null,
    p_relacao_ia: f.relacaoIA ?? null,
    p_porte: f.porte ?? null,
  };
}

/** Agregado único (Brasil inteiro, ou de uma UF se f.uf vier preenchido) — reaproveita painel_aggregate (006). */
export async function fetchAggregate(f: ObsFilters): Promise<Agg> {
  const { data, error } = await supabase.rpc('painel_aggregate', { ...filterArgs(f), p_uf: f.uf ?? null });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return { n: 0, score: null, level: null, dims: null };
  return rowToAgg(row as ScoredRow);
}

/** Sempre as 27 UFs, mesmo as com n=0 — `f` nunca deve trazer `uf` (estamos agrupando por ele). */
export async function fetchByUf(f: ObsFilters): Promise<Record<string, Agg>> {
  const { data, error } = await supabase.rpc('painel_byuf', filterArgs(f));
  const out: Record<string, Agg> = {};
  for (const uf of UFS) out[uf] = { n: 0, score: null, level: null, dims: null };
  if (error || !data) return out;
  for (const row of data as (ScoredRow & { estado: string })[]) out[row.estado] = rowToAgg(row);
  return out;
}

export async function fetchByRegion(f: ObsFilters): Promise<Record<Regiao, Agg>> {
  const { data, error } = await supabase.rpc('painel_byregion', filterArgs(f));
  const out = {} as Record<Regiao, Agg>;
  for (const r of REGIOES) out[r] = { n: 0, score: null, level: null, dims: null };
  if (error || !data) return out;
  for (const row of data as (ScoredRow & { regiao: Regiao })[]) out[row.regiao] = rowToAgg(row);
  return out;
}

/** % de avaliações em cada nível (0-5) do recorte filtrado (inclui UF, se houver). null = recorte inteiro com menos de 5. */
export async function fetchLevelDistribution(f: ObsFilters): Promise<number[] | null> {
  const { data, error } = await supabase.rpc('painel_level_distribution', { ...filterArgs(f), p_uf: f.uf ?? null });
  if (error || !data || (data as unknown[]).length === 0) return null;
  const counts = [0, 0, 0, 0, 0, 0];
  for (const row of data as { nivel: number; pct: number }[]) counts[row.nivel] = row.pct;
  return counts;
}

/** "Mmm/AAAA" do mês mais recente com alguma avaliação em todo o Brasil (sem filtros) — null se não houver nenhuma. */
export async function fetchLatestPeriodo(): Promise<string | null> {
  const { data, error } = await supabase.rpc('painel_monthly', { p_months: 1 });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row || row.n === 0) return null;
  return `${MESES_PT[row.mes - 1]}/${row.ano}`;
}

/** Série de meses (padrão 12) terminando no mês mais recente do recorte filtrado. */
export async function fetchMonthly(f: ObsFilters, months = 12): Promise<{ mes: string; n: number; score: number | null }[]> {
  const { data, error } = await supabase.rpc('painel_monthly', { ...filterArgs(f), p_uf: f.uf ?? null, p_months: months });
  if (error || !data) return [];
  return (data as { ano: number; mes: number; n: number; score_global: number | null }[]).map((row) => ({
    mes: `${MESES_PT[row.mes - 1]}/${String(row.ano).slice(-2)}`,
    n: row.n,
    score: row.score_global,
  }));
}

type CompareKey = 'setor' | 'esfera' | 'area' | 'porte' | 'relacaoIA' | 'poder';

const GROUP_BY_COLUMN: Record<CompareKey, string> = {
  setor: 'setor', esfera: 'esfera', area: 'area', porte: 'porte', relacaoIA: 'relacao_ia', poder: 'poder',
};

const SETOR_LABEL: Record<string, string> = { publico: 'Setor público', privado: 'Setor privado', terceiro: 'Terceiro setor', outro: 'Outro' };
const ESFERA_LABEL: Record<string, string> = { federal: 'Federal', estadual: 'Estadual ou Distrital', municipal: 'Municipal' };
const AREA_LABEL: Record<string, string> = Object.fromEntries(
  [...AREAS_PUBLICAS, ...AREAS_PRIVADAS, ...AREAS_TERCEIRO].map((a) => [a.id, a.label])
);
const RELACAO_LABEL: Record<string, string> = Object.fromEntries(RELACOES_IA.map((r) => [r.id, r.label]));

function groupLabel(key: CompareKey, value: string): string {
  if (key === 'setor') return SETOR_LABEL[value] ?? value;
  if (key === 'esfera') return ESFERA_LABEL[value] ?? value;
  if (key === 'area') return AREA_LABEL[value] ?? value;
  if (key === 'relacaoIA') return RELACAO_LABEL[value] ?? value;
  return value;
}

/** Uma linha por valor distinto do campo pedido, ordenada por score desc (como observatory.ts/compareBy). */
export async function fetchCompareBy(f: ObsFilters, key: CompareKey): Promise<{ grupo: string; agg: Agg }[]> {
  const { data, error } = await supabase.rpc('painel_compareby', {
    ...filterArgs(f), p_uf: f.uf ?? null, p_group_by: GROUP_BY_COLUMN[key],
  });
  if (error || !data) return [];
  return (data as (ScoredRow & { grupo: string })[])
    .map((row) => ({ grupo: groupLabel(key, row.grupo), agg: rowToAgg(row) }))
    .sort((a, b) => (b.agg.score ?? -1) - (a.agg.score ?? -1));
}

/** {campo: {valor: contagem}} para os 6 campos de filtro, cada contagem já aplicando os OUTROS filtros ativos (não o próprio campo). */
export async function fetchFilterCounts(f: ObsFilters): Promise<Record<string, Record<string, number>>> {
  const { data, error } = await supabase.rpc('painel_filter_counts', filterArgs(f));
  if (error || !data) return {};
  return data as Record<string, Record<string, number>>;
}
