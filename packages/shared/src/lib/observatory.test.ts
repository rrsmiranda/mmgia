/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import type { HistoricalRecord } from '../types';
import { K_MIN, aggregate, applyFilters, wouldBreakK } from './observatory';

function rec(overrides: Partial<HistoricalRecord> & { score_global: number }): HistoricalRecord {
  return {
    id: `r-${Math.random()}`,
    periodo: 'Jun/2026',
    taxonomiaVersao: 2,
    setor: 'publico',
    estado: 'DF',
    regiao: 'Centro-Oeste',
    porte: 'Grande',
    score_gov: overrides.score_global,
    score_tec: overrides.score_global,
    score_seg: overrides.score_global,
    score_edu: overrides.score_global,
    score_eco: overrides.score_global,
    ...overrides,
  };
}

describe('aggregate', () => {
  it('retorna score/level/dims null quando o grupo tem menos de K_MIN registros', () => {
    const records = [1.0, 1.2, 1.4, 1.6].map((s) => rec({ score_global: s }));
    const agg = aggregate(records);
    expect(agg.n).toBe(4);
    expect(agg.score).toBeNull();
    expect(agg.level).toBeNull();
    expect(agg.dims).toBeNull();
  });

  it('calcula o score médio quando o grupo atinge K_MIN registros', () => {
    const records = [1.0, 1.2, 1.4, 1.6, 1.8].map((s) => rec({ score_global: s }));
    const agg = aggregate(records);
    expect(agg.n).toBe(5);
    expect(agg.score).toBeCloseTo(1.4, 5);
    expect(agg.level).not.toBeNull();
    expect(agg.dims).not.toBeNull();
  });

  it('K_MIN é 5', () => {
    expect(K_MIN).toBe(5);
  });

  describe('fronteiras de nível (mesma tabela de getMaturityLevel)', () => {
    const casos: [number, number][] = [
      [0.49, 0], [0.50, 1],
      [0.99, 1], [1.00, 2],
      [1.49, 2], [1.50, 3],
      [1.99, 3], [2.00, 4],
      [2.49, 4], [2.50, 5],
    ];
    it.each(casos)('score %f → nível %i', (score, nivel) => {
      const records = Array.from({ length: K_MIN }, () => rec({ score_global: score }));
      expect(aggregate(records).level).toBe(nivel);
    });
  });
});

describe('applyFilters', () => {
  const records = [
    rec({ score_global: 1.5, setor: 'publico', estado: 'DF', porte: 'Grande' }),
    rec({ score_global: 1.2, setor: 'privado', estado: 'SP', porte: 'Média' }),
    rec({ score_global: 1.8, setor: 'publico', estado: 'SP', porte: 'Pequena' }),
  ];

  it('filtra por um único campo', () => {
    expect(applyFilters(records, { setor: 'publico' })).toHaveLength(2);
  });

  it('combina múltiplos filtros', () => {
    expect(applyFilters(records, { setor: 'publico', uf: 'SP' })).toHaveLength(1);
  });

  it('sem filtros devolve tudo', () => {
    expect(applyFilters(records, {})).toHaveLength(3);
  });
});

describe('wouldBreakK', () => {
  it('é true quando o filtro deixaria menos de K_MIN avaliações', () => {
    const records = [
      ...Array.from({ length: 6 }, () => rec({ score_global: 1.5, setor: 'publico' })),
      ...Array.from({ length: 2 }, () => rec({ score_global: 1.5, setor: 'privado' })),
    ];
    expect(wouldBreakK(records, {}, 'setor', 'privado')).toBe(true);
    expect(wouldBreakK(records, {}, 'setor', 'publico')).toBe(false);
  });
});
