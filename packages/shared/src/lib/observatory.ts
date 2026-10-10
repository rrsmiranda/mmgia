/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Camada de dados do Observatório (painel público): funções puras que recebem
 * os registros agregados e os filtros, e devolvem tudo o que a tela precisa.
 * Nenhum componente calcula nada sozinho — toda regra de sigilo (k-anonimato)
 * mora aqui, uma única vez.
 */

import { DIMENSIONS, DimensionId, HistoricalRecord } from '../types';
import { DIMENSION_WEIGHTS, getMaturityLevel } from './scoring';
import { Area, Esfera, Poder, Regiao, REGIAO_POR_UF, RELACOES_IA, RelacaoIA, rotuloArea, Setor } from './taxonomy';

export const K_MIN = 5;

const DIMENSION_IDS = Object.keys(DIMENSION_WEIGHTS) as DimensionId[];

export interface ObsFilters {
  setor?: Setor;
  esfera?: Esfera;
  area?: Area;
  poder?: Poder;
  relacaoIA?: RelacaoIA;
  porte?: string;
  uf?: string;
}

export interface Agg {
  n: number;
  score: number | null;
  level: number | null;
  dims: Record<DimensionId, number> | null;
}

function dimScore(r: HistoricalRecord, dim: DimensionId): number {
  switch (dim) {
    case 'gov': return r.score_gov;
    case 'tec': return r.score_tec;
    case 'seg': return r.score_seg;
    case 'edu': return r.score_edu;
    case 'eco': return r.score_eco;
  }
}

export function applyFilters(records: HistoricalRecord[], f: ObsFilters): HistoricalRecord[] {
  return records.filter((r) => {
    if (f.setor && r.setor !== f.setor) return false;
    if (f.esfera && r.esfera !== f.esfera) return false;
    if (f.area && r.area !== f.area) return false;
    if (f.poder && r.poder !== f.poder) return false;
    if (f.relacaoIA && r.relacaoIA !== f.relacaoIA) return false;
    if (f.porte && r.porte !== f.porte) return false;
    if (f.uf && r.estado !== f.uf) return false;
    return true;
  });
}

/** Agrega um conjunto de registros já filtrado. Aplica o sigilo k-anonimato: com menos de K_MIN, tudo vira null (exceto n). */
export function aggregate(records: HistoricalRecord[]): Agg {
  const n = records.length;
  if (n < K_MIN) return { n, score: null, level: null, dims: null };

  const score = records.reduce((acc, r) => acc + r.score_global, 0) / n;
  const dims = DIMENSION_IDS.reduce((acc, dim) => {
    acc[dim] = records.reduce((sum, r) => sum + dimScore(r, dim), 0) / n;
    return acc;
  }, {} as Record<DimensionId, number>);

  return { n, score, level: getMaturityLevel(score).num, dims };
}

export function byUf(records: HistoricalRecord[]): Record<string, Agg> {
  const byState = new Map<string, HistoricalRecord[]>();
  for (const uf of Object.keys(REGIAO_POR_UF)) byState.set(uf, []);
  for (const r of records) {
    const lista = byState.get(r.estado);
    if (lista) lista.push(r);
    else byState.set(r.estado, [r]);
  }
  const out: Record<string, Agg> = {};
  for (const [uf, lista] of byState) out[uf] = aggregate(lista);
  return out;
}

export function byRegion(records: HistoricalRecord[]): Record<Regiao, Agg> {
  const REGIOES: Regiao[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
  const byReg = new Map<Regiao, HistoricalRecord[]>(REGIOES.map((r) => [r, []]));
  for (const r of records) byReg.get(r.regiao)?.push(r);
  const out = {} as Record<Regiao, Agg>;
  for (const regiao of REGIOES) out[regiao] = aggregate(byReg.get(regiao) ?? []);
  return out;
}

/** % de organizações em cada nível (0-5). null se o recorte inteiro não atinge K_MIN. */
export function levelDistribution(records: HistoricalRecord[]): number[] | null {
  if (records.length < K_MIN) return null;
  const counts = [0, 0, 0, 0, 0, 0];
  for (const r of records) counts[getMaturityLevel(r.score_global).num] += 1;
  return counts.map((c) => (c / records.length) * 100);
}

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function parsePeriodo(periodo: string): { mes: number; ano: number } | null {
  const [mesStr, anoStr] = periodo.split('/');
  const mes = MESES_PT.indexOf(mesStr);
  const ano = Number(anoStr);
  if (mes < 0 || !Number.isFinite(ano)) return null;
  return { mes, ano };
}

/**
 * Série dos últimos `months` meses terminando no mês mais recente presente em
 * `records`. Meses sem nenhum registro, ou com menos de K_MIN, entram com
 * `score: null` (o chamador decide como desenhar — ponto vazado, por exemplo).
 */
export function monthly(records: HistoricalRecord[], months = 12): { mes: string; n: number; score: number | null }[] {
  const parsed = records.map((r) => ({ r, d: parsePeriodo(r.periodo) })).filter((x): x is { r: HistoricalRecord; d: { mes: number; ano: number } } => x.d !== null);
  if (parsed.length === 0) return [];

  const latest = parsed.reduce((acc, x) => {
    const key = x.d.ano * 12 + x.d.mes;
    return key > acc ? key : acc;
  }, -Infinity);

  const buckets: { key: number; mes: string; n: number; score: number | null }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const key = latest - i;
    const ano = Math.floor(key / 12);
    const mes = ((key % 12) + 12) % 12;
    buckets.push({ key, mes: `${MESES_PT[mes]}/${String(ano).slice(-2)}`, n: 0, score: null });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));

  const grouped = new Map<number, HistoricalRecord[]>();
  for (const { r, d } of parsed) {
    const key = d.ano * 12 + d.mes;
    if (!byKey.has(key)) continue;
    const lista = grouped.get(key) ?? [];
    lista.push(r);
    grouped.set(key, lista);
  }

  for (const [key, lista] of grouped) {
    const bucket = byKey.get(key);
    if (!bucket) continue;
    bucket.n = lista.length;
    bucket.score = lista.length >= K_MIN ? lista.reduce((acc, r) => acc + r.score_global, 0) / lista.length : null;
  }

  return buckets.map(({ mes, n, score }) => ({ mes, n, score }));
}

type CompareKey = 'setor' | 'esfera' | 'area' | 'porte' | 'relacaoIA';

const SETOR_LABEL: Record<Setor, string> = { publico: 'Setor público', privado: 'Setor privado', terceiro: 'Terceiro setor', outro: 'Outro' };
const ESFERA_LABEL: Record<Esfera, string> = { federal: 'Federal', estadual: 'Estadual ou Distrital', municipal: 'Municipal' };

function groupLabel(r: HistoricalRecord, key: CompareKey): string | null {
  if (key === 'setor') return r.setor ? SETOR_LABEL[r.setor] : null;
  if (key === 'esfera') return r.esfera ? ESFERA_LABEL[r.esfera] : null;
  if (key === 'area') return r.area ? (rotuloArea(r.setor, r.area) ?? r.area) : null;
  if (key === 'porte') return r.porte || null;
  if (key === 'relacaoIA') return r.relacaoIA ? (RELACOES_IA.find((o) => o.id === r.relacaoIA)?.label ?? r.relacaoIA) : null;
  return null;
}

/** Uma linha por valor distinto do campo pedido, cada uma com sua própria agregação (e seu próprio K_MIN). */
export function compareBy(records: HistoricalRecord[], key: CompareKey): { grupo: string; agg: Agg }[] {
  const byGroup = new Map<string, HistoricalRecord[]>();
  for (const r of records) {
    const label = groupLabel(r, key);
    if (!label) continue;
    const lista = byGroup.get(label) ?? [];
    lista.push(r);
    byGroup.set(label, lista);
  }
  return [...byGroup.entries()]
    .map(([grupo, lista]) => ({ grupo, agg: aggregate(lista) }))
    .sort((a, b) => (b.agg.score ?? -1) - (a.agg.score ?? -1));
}

/**
 * `HistoricalRecord` guarda só os scores agregados por dimensão (score_gov,
 * score_tec...), não respostas por prática — não há como calcular "% Nulo" ou
 * "% Larga/Total" por prática a partir dele. Retorna sempre null; o bloco
 * "Práticas mais e menos adotadas" fica oculto na tela por causa disso.
 */
export function practiceRates(_records: HistoricalRecord[]): null {
  return null;
}

export interface InsightsContext {
  /** Nome do recorte atual, para a frase de dimensão mais baixa ("...do {recorte}"). */
  recorteLabel: string;
  /** UF selecionada (sigla) — presente só quando o usuário escolheu um estado. */
  uf?: string;
  nomeUf?: string;
  /** Agregado de todo o Brasil (sem filtro de UF), para comparar com o recorte do estado. */
  brasil?: Agg;
  /** Agregado por UF já calculado (byUf do recorte sem a UF aplicada), para o destaque geográfico. */
  porUf?: Record<string, Agg>;
  nomeEstado?: (uf: string) => string;
}

function fmt2(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Até 3 frases, nesta ordem de prioridade: dimensão mais baixa; dimensão mais
 * alta comparada ao Brasil (só com UF); destaque geográfico (só sem UF).
 * Nunca cita um grupo com n < K_MIN. Não existe "meta"/nível de referência na
 * metodologia oficial — as frases só comparam valores reais entre si (um
 * recorte com o Brasil, ou estados entre si), nunca com um alvo inventado.
 */
export function insights(rec: Agg, ctx: InsightsContext): string[] {
  const frases: string[] = [];
  if (rec.n < K_MIN || !rec.dims) return frases;

  const dimEntries = DIMENSION_IDS.map((id) => ({ id, v: rec.dims![id] }));
  const quem = ctx.uf && ctx.nomeUf ? ctx.nomeUf : ctx.recorteLabel;

  // 1. Dimensão mais baixa.
  const menor = dimEntries.reduce((a, b) => (b.v < a.v ? b : a));
  frases.push(`${DIMENSIONS[menor.id].shortName} é a dimensão mais baixa do ${quem}: **${fmt2(menor.v)}**.`);

  // 2. Dimensão mais alta — só com UF selecionada, comparando com o Brasil.
  if (ctx.uf && ctx.nomeUf && ctx.brasil?.dims) {
    const maior = dimEntries.reduce((a, b) => (b.v > a.v ? b : a));
    const brasilV = ctx.brasil.dims[maior.id];
    frases.push(`${DIMENSIONS[maior.id].shortName} é a dimensão mais alta do ${ctx.nomeUf}: **${fmt2(maior.v)}**, ${fmt2(maior.v - brasilV)} acima da média nacional.`);
  }

  // 3. Destaque geográfico — só sem UF selecionada.
  if (!ctx.uf && ctx.porUf && ctx.nomeEstado) {
    const candidatos = Object.entries(ctx.porUf).filter(([, agg]) => agg.n >= K_MIN && agg.score !== null);
    if (candidatos.length > 0) {
      const [uf, agg] = candidatos.reduce((a, b) => (b[1].score! > a[1].score! ? b : a));
      frases.push(`${ctx.nomeEstado(uf)} tem o maior score entre os estados com 5 ou mais avaliações (**${fmt2(agg.score!)}**).`);
    }
  }

  return frases.slice(0, 3);
}

/** true se acrescentar `{key: value}` aos filtros deixaria o recorte com menos de K_MIN avaliações. */
export function wouldBreakK(records: HistoricalRecord[], f: ObsFilters, key: keyof ObsFilters, value: string): boolean {
  const resultado = applyFilters(records, { ...f, [key]: value });
  return resultado.length < K_MIN;
}
