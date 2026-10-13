/**
 * MMGIA Design System — constantes e utilitários compartilhados.
 * O cálculo (score, nível, risco) continua em src/lib/scoring.ts: aqui só há apresentação.
 */
import type { DimensionId, ScoreLevel } from '../types';
import { getMaturityLevel } from '../lib/scoring';

export type Level = 0 | 1 | 2 | 3 | 4 | 5;
export type Status = 'good' | 'attention' | 'serious' | 'critical';

/** Ordem fixa das dimensões em toda a interface. */
export const DIMENSION_ORDER: readonly DimensionId[] = ['gov', 'tec', 'seg', 'edu', 'eco'];

export const LEVEL_LABELS: Record<Level, string> = {
  0: 'Inexistente',
  1: 'Inicial',
  2: 'Gerenciado',
  3: 'Definido',
  4: 'Gerenciado Quantitativamente',
  5: 'Otimizado',
};

/** Faixa de risco por nível — sempre exibida com ícone (StatusBadge). */
export const LEVEL_RISK: Record<Level, { status: Status; label: string }> = {
  0: { status: 'critical', label: 'Risco crítico' },
  1: { status: 'critical', label: 'Risco crítico / alto' },
  2: { status: 'serious', label: 'Risco alto' },
  3: { status: 'attention', label: 'Risco moderado' },
  4: { status: 'good', label: 'Risco baixo' },
  5: { status: 'good', label: 'Risco mínimo' },
};

export const NPLF: Record<ScoreLevel, { label: string; subtitle: string; description: string; value: number }> = {
  N: { label: 'Nulo', subtitle: 'Inexistente', description: 'Sem ações ou planejamento formal.', value: 0 },
  P: { label: 'Parcial', subtitle: 'Iniciado', description: 'Planejado ou em ações piloto.', value: 1 },
  L: { label: 'Larga', subtitle: 'Amplo', description: 'Adoção ampla e regular.', value: 2 },
  F: { label: 'Total', subtitle: 'Otimizado', description: 'Totalmente adotado e medido.', value: 3 },
};

/** Score máximo (escala NPLF 0–3) e score que marca o nível 3 (meta). */
export const SCORE_MAX = 3;
export const SCORE_GOAL = 1.5;

/** Nível 0–5 a partir do score 0–3, usando a mesma regra de scoring.ts. */
export function levelFromScore(score: number): Level {
  return getMaturityLevel(score).num as Level;
}

/** Número no formato brasileiro: 1,78 · 1.847. */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Junta classes ignorando valores falsos. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
