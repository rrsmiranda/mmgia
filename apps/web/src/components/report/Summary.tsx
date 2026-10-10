/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DimensionId, Practice, ScoreLevel } from '@mmgia/shared/types';
import { DIMENSIONS, LIST_PRACTICES } from '@mmgia/shared/types';
import type { MaturityLevelInfo } from '@mmgia/shared/scoring';
import { DimensionBars, LevelBadge, RiskBadge, formatNumber, type Level } from '@mmgia/shared/design-system';
import { getKeyFindings } from './ActionPlan';

interface SummaryContentProps {
  globalScore: number;
  levelInfo: MaturityLevelInfo;
  dimensionScores: Record<DimensionId, number>;
  gaps: Practice[];
  answers: Record<string, ScoreLevel>;
}

export default function SummaryContent({ globalScore, levelInfo, dimensionScores, gaps, answers }: SummaryContentProps) {
  const { naoRespondidas, nulas, gapsIniciais, proximoNivel, maiorId, menorId, menorPesoPercent } =
    getKeyFindings(gaps, dimensionScores, levelInfo, answers);

  return (
    <>
      <p className="rp-eyebrow">1 · Sumário executivo</p>
      <h1 className="rp-h1">A organização está no nível {levelInfo.num} · {levelInfo.label}</h1>

      <div className="rp-score">
        <div>
          <p className="rp-label">Score global</p>
          <p className="rp-big">{formatNumber(globalScore)}<span>/ 3</span></p>
          <div className="mg-row" style={{ gap: 8, marginTop: 10 }}>
            <LevelBadge level={levelInfo.num as Level} />
            <RiskBadge level={levelInfo.num as Level} />
          </div>
        </div>
        <p>
          {levelInfo.desc} A dimensão mais desenvolvida é <strong>{DIMENSIONS[maiorId].name}</strong> ({formatNumber(dimensionScores[maiorId])});
          a que mais limita o resultado é <strong>{DIMENSIONS[menorId].name}</strong> ({formatNumber(dimensionScores[menorId])}).
        </p>
      </div>

      <h2 className="rp-h2">Score por dimensão</h2>
      <DimensionBars scores={dimensionScores} />
      <p className="rp-small">Escala de 0 a 3.</p>

      <h2 className="rp-h2">Principais conclusões</h2>
      <ul className="rp-list">
        <li>{gaps.length} das {LIST_PRACTICES.length} práticas estão inexistentes ou parciais (respostas N ou P).</li>
        {naoRespondidas > 0 && (
          <li>
            Dessas, <strong>{naoRespondidas}</strong> sem resposta e <strong>{nulas}</strong> Nulo — ambas valem zero
            no cálculo.
          </li>
        )}
        {levelInfo.num < 5 && (
          <li>
            {gapsIniciais} estão em níveis 1 a 3 — sustentam a consolidação do nível {proximoNivel}.
          </li>
        )}
        <li>
          Recomenda-se tratar primeiro {DIMENSIONS[menorId].name}: é a dimensão com menor score e peso de {menorPesoPercent}% no resultado global.
        </li>
      </ul>

      <h2 className="rp-h2">Como ler este relatório</h2>
      <p>
        O score de cada dimensão é a média dos scores de nível; o score global é a média ponderada das 5 dimensões.
        A metodologia completa está na seção 4.
      </p>
    </>
  );
}
