/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HistoricalRecord } from '../types';
import type { AreaPublica } from './taxonomy';

/** Campos de classificação que podem compor uma chave de agregação. */
export type DimensaoClassificacao = 'setor' | 'esfera' | 'area' | 'estado' | 'porte';

/** Ordem fixa de "subida de nível" quando um grupo não atinge k. */
const ORDEM_SUBIDA: DimensaoClassificacao[] = ['area', 'esfera', 'estado', 'porte'];

/** Áreas públicas, só na esfera federal, que nunca podem ser exibidas por UF. */
const AREAS_SIGILOSAS_FEDERAL: AreaPublica[] = ['justica', 'legislativo', 'regulacao'];

export interface GrupoAgregado {
  /** Valores das dimensões que sobraram na chave do grupo, após eventual subida de nível. */
  chave: Partial<Record<DimensaoClassificacao | 'regiao', string>>;
  amostras: number;
  scoreMedio: number;
}

export interface ResultadoAgregacao {
  grupos: GrupoAgregado[];
  /** Avaliações que ficaram de fora por não atingirem k mesmo após subir todos os níveis. */
  registrosSuprimidos: number;
}

function registroSigiloso(r: HistoricalRecord): boolean {
  return r.setor === 'publico' && r.esfera === 'federal' && !!r.area && AREAS_SIGILOSAS_FEDERAL.includes(r.area as AreaPublica);
}

function montarChave(registro: HistoricalRecord, campos: DimensaoClassificacao[], nivel: number): Partial<Record<DimensaoClassificacao | 'regiao', string>> {
  const subiu = new Set(ORDEM_SUBIDA.slice(0, nivel));
  const chave: Partial<Record<DimensaoClassificacao | 'regiao', string>> = {};

  for (const campo of campos) {
    if (campo === 'area') { if (!subiu.has('area')) chave.area = registro.area; continue; }
    if (campo === 'esfera') { if (!subiu.has('esfera')) chave.esfera = registro.esfera; continue; }
    if (campo === 'porte') { if (!subiu.has('porte')) chave.porte = registro.porte; continue; }
    if (campo === 'estado') {
      if (subiu.has('estado') || registroSigiloso(registro)) chave.regiao = registro.regiao;
      else chave.estado = registro.estado;
      continue;
    }
    chave.setor = registro.setor || undefined;
  }

  // Remove chaves undefined para não poluir o agrupamento (ex.: área ausente em registros "outro").
  for (const k of Object.keys(chave) as (keyof typeof chave)[]) {
    if (chave[k] === undefined) delete chave[k];
  }
  return chave;
}

function chaveParaString(chave: Partial<Record<string, string>>): string {
  return Object.entries(chave)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('|');
}

/**
 * Agrega registros com k-anonimato (k=5 por padrão): grupos com menos de k
 * avaliações sobem de nível — area some em favor de (setor+esfera), depois
 * esfera some em favor de setor, depois estado vira região, depois porte
 * some — até atingir k ou esgotar as subidas, quando o grupo é suprimido
 * (não exibido). Áreas federais sigilosas (justiça, legislativo, regulação)
 * nunca aparecem por UF, independentemente do tamanho do grupo. No máximo 3
 * dimensões de classificação são usadas por linha.
 */
export function agregarComAnonimato(
  registros: HistoricalRecord[],
  dimensoesSolicitadas: DimensaoClassificacao[],
  k = 5,
): ResultadoAgregacao {
  const dimensoes = dimensoesSolicitadas.slice(0, 3);
  const gruposFinais: GrupoAgregado[] = [];
  let suprimidos = 0;
  let pendentes = registros;

  for (let nivel = 0; nivel <= ORDEM_SUBIDA.length; nivel++) {
    if (pendentes.length === 0) break;
    const buckets = new Map<string, HistoricalRecord[]>();
    for (const r of pendentes) {
      const chaveStr = chaveParaString(montarChave(r, dimensoes, nivel));
      const lista = buckets.get(chaveStr) ?? [];
      lista.push(r);
      buckets.set(chaveStr, lista);
    }

    const ehUltimoNivel = nivel === ORDEM_SUBIDA.length;
    const proximosPendentes: HistoricalRecord[] = [];
    for (const lista of buckets.values()) {
      if (lista.length >= k) {
        const chave = montarChave(lista[0], dimensoes, nivel);
        const scoreMedio = lista.reduce((acc, r) => acc + r.score_global, 0) / lista.length;
        gruposFinais.push({ chave, amostras: lista.length, scoreMedio });
      } else if (!ehUltimoNivel) {
        proximosPendentes.push(...lista);
      } else {
        suprimidos += lista.length;
      }
    }
    pendentes = proximosPendentes;
  }

  return { grupos: gruposFinais.sort((a, b) => b.scoreMedio - a.scoreMedio), registrosSuprimidos: suprimidos };
}

/** Mensagem padrão para grupos suprimidos por k-anonimato. */
export const MENSAGEM_DADOS_INSUFICIENTES = 'Dados insuficientes para exibir com segurança (menos de 5 avaliações).';
