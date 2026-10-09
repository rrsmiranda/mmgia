/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DimensionId, Practice, ScoreLevel } from '@mmgia/shared/types';
import { DIMENSIONS, LIST_PRACTICES } from '@mmgia/shared/types';
import type { MaturityLevelInfo } from '@mmgia/shared/scoring';
import { DIMENSION_WEIGHTS } from '@mmgia/shared/scoring';
import { DimensionBars, LevelBadge, RiskBadge, DIMENSION_ORDER, formatNumber, type Level } from '@mmgia/shared/design-system';

interface SummaryContentProps {
  globalScore: number;
  levelInfo: MaturityLevelInfo;
  dimensionScores: Record<DimensionId, number>;
  gaps: Practice[];
  answers: Record<string, ScoreLevel>;
}

export default function SummaryContent({ globalScore, levelInfo, dimensionScores, gaps, answers }: SummaryContentProps) {
  const sortedDims = [...DIMENSION_ORDER].sort((a, b) => dimensionScores[b] - dimensionScores[a]);
  const maiorId = sortedDims[0];
  const menorId = sortedDims[sortedDims.length - 1];

  const gapsIniciais = gaps.filter((g) => g.level <= 3).length;
  const proximoNivel = levelInfo.num + 1;
  const naoRespondidas = gaps.filter((g) => !answers[g.id]).length;
  const nulas = gaps.filter((g) => answers[g.id] === 'N').length;

  const menorPeso = Math.round(DIMENSION_WEIGHTS[menorId] * 100);

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
      <p className="rp-small">Meta de referência: nível 3 · Definido (1,50). Escala de 0 a 3.</p>

      <h2 className="rp-h2">Principais conclusões</h2>
      <ul className="rp-list">
        <li>{gaps.length} das {LIST_PRACTICES.length} práticas estão inexistentes ou parciais (respostas N ou P).</li>
        {naoRespondidas > 0 && (
          <li>
            Dessas, <strong>{naoRespondidas}</strong> não tiveram resposta registrada e <strong>{nulas}</strong> foram
            avaliadas como Nulo. Ambas contam como zero no cálculo, mas significam coisas diferentes: a primeira é
            ausência de registro; a segunda é ausência de prática já constatada pela organização.
          </li>
        )}
        {levelInfo.num < 5 && (
          <li>
            {gapsIniciais} dessas lacunas estão em práticas dos níveis 1 a 3 — são as que sustentam a consolidação do nível {proximoNivel}.
          </li>
        )}
        <li>
          Recomenda-se tratar primeiro {DIMENSIONS[menorId].name}: é a dimensão com menor score e peso de {menorPeso}% no resultado global.
        </li>
      </ul>

      <h2 className="rp-h2">Como ler este relatório</h2>
      <p>
        O score de cada dimensão é a média dos scores dos seus níveis (1 a 5); o score de cada nível é a média das
        respostas das suas práticas, em que Nulo vale 0, Parcial 1, Larga 2 e Total 3. O score global é a média
        ponderada das cinco dimensões. A metodologia completa está na seção 4.
      </p>
    </>
  );
}
