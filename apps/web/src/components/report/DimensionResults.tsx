/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DimensionId, Practice, ScoreLevel } from '@mmgia/shared/types';
import { DIMENSIONS, LIST_PRACTICES } from '@mmgia/shared/types';
import type { MaturityLevelInfo } from '@mmgia/shared/scoring';
import { DIMENSION_WEIGHTS, getOfficialPracticeCode } from '@mmgia/shared/scoring';
import { DimensionTag, LevelBadge, NplfBadge, DIMENSION_ORDER, formatNumber, type Level } from '@mmgia/shared/design-system';

interface DimensionResultsContentProps {
  globalScore: number;
  levelInfo: MaturityLevelInfo;
  dimensionScores: Record<DimensionId, number>;
  dimensionLevels: Record<DimensionId, MaturityLevelInfo>;
  answers: Record<string, ScoreLevel>;
}

const LEVELS = [1, 2, 3, 4, 5] as const;

export default function DimensionResultsContent({
  globalScore,
  levelInfo,
  dimensionScores,
  dimensionLevels,
  answers,
}: DimensionResultsContentProps) {
  const practicesByDimLevel = (dim: DimensionId, level: number): Practice[] =>
    LIST_PRACTICES.filter((p) => p.dimensionId === dim && p.level === level);

  return (
    <>
      <p className="rp-eyebrow">2 · Resultado por dimensão</p>
      <h1 className="rp-h1">Desempenho nas cinco dimensões</h1>
      <p>
        A tabela mostra o score de cada dimensão, o nível correspondente e sua contribuição para o score global,
        segundo os pesos do modelo. Os números seguem a escala de 0 a 3.
      </p>

      <table className="rp-table">
        <thead>
          <tr>
            <th scope="col">Dimensão</th>
            <th scope="col">Score</th>
            <th scope="col">Nível</th>
            <th scope="col">Peso</th>
            <th scope="col" className="num">Contribuição</th>
          </tr>
        </thead>
        <tbody>
          {DIMENSION_ORDER.map((dim) => {
            const weight = DIMENSION_WEIGHTS[dim];
            const score = dimensionScores[dim];
            const lvl = dimensionLevels[dim];
            return (
              <tr key={dim}>
                <td><DimensionTag dimension={dim} /></td>
                <td>{formatNumber(score)}</td>
                <td>
                  <span className="mg-row" style={{ gap: 6, display: 'inline-flex', alignItems: 'center' }}>
                    <LevelBadge level={lvl.num as Level} showLabel={false} /> {lvl.label}
                  </span>
                </td>
                <td>{Math.round(weight * 100)}%</td>
                <td className="num">{formatNumber(score * weight, 3)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Score global</td>
            <td>{formatNumber(globalScore)}</td>
            <td>
              <span className="mg-row" style={{ gap: 6, display: 'inline-flex', alignItems: 'center' }}>
                <LevelBadge level={levelInfo.num as Level} showLabel={false} /> {levelInfo.label}
              </span>
            </td>
            <td>100%</td>
            <td className="num">{formatNumber(globalScore, 3)}</td>
          </tr>
        </tfoot>
      </table>

      <h2 className="rp-h2">Respostas por nível de maturidade</h2>
      <p>
        Cada célula reúne as práticas daquele nível com a resposta informada. A leitura da esquerda para a direita
        mostra até onde a dimensão está consolidada: lacunas nos níveis iniciais pesam mais do que lacunas nos
        níveis avançados.
      </p>

      <table className="rp-table rp-matrix">
        <thead>
          <tr>
            <th scope="col">Dimensão</th>
            {LEVELS.map((lvl) => <th scope="col" key={lvl}>Nível {lvl}</th>)}
          </tr>
        </thead>
        <tbody>
          {DIMENSION_ORDER.map((dim) => (
            <tr key={dim}>
              <th scope="row"><DimensionTag dimension={dim} short /></th>
              {LEVELS.map((lvl) => (
                <td key={lvl}>
                  {practicesByDimLevel(dim, lvl).map((p) => {
                    const ans = answers[p.id];
                    return (
                      <span className="rp-chip" key={p.id}>
                        <span className="rp-mono">{getOfficialPracticeCode(p)}</span>
                        {ans ? <NplfBadge value={ans} /> : <span className="rp-small">—</span>}
                      </span>
                    );
                  })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mg-row rp-small" style={{ gap: 14, flexWrap: 'wrap' }}>
        <span className="rp-chip"><NplfBadge value="N" /> Nulo</span>
        <span className="rp-chip"><NplfBadge value="P" /> Parcial</span>
        <span className="rp-chip"><NplfBadge value="L" /> Larga</span>
        <span className="rp-chip"><NplfBadge value="F" /> Total</span>
      </div>
    </>
  );
}
