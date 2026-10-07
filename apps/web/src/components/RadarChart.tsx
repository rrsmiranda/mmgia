/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { DimensionId, DIMENSIONS } from '@mmgia/shared/types';
import { getMaturityLevel } from '@mmgia/shared/scoring';
import { DIMENSION_ORDER, SCORE_GOAL, SCORE_MAX, formatNumber, LevelBadge, type Level } from '@mmgia/shared/design-system';

interface RadarChartProps {
  scores: Record<DimensionId, number>;
  benchmarkScores?: Record<DimensionId, number>;
}

export default function RadarChart({ scores, benchmarkScores }: RadarChartProps) {
  const [hovered, setHovered] = useState<DimensionId | null>(null);

  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 125;
  const maxScore = SCORE_MAX;

  const getCoordinates = (index: number, score: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const value = Math.max(0, Math.min(score, maxScore)); // bound score 0-3
    const radius = (value / maxScore) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const ringAt = (ringValue: number) =>
    DIMENSION_ORDER.map((_, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const radius = (ringValue / maxScore) * maxRadius;
      return `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`;
    }).join(' ');

  // Grid rings at 1, 2 e 3; anel tracejado adicional na meta (1,50)
  const ringPoints = [1.0, 2.0, 3.0].map((ringValue) => ({ value: ringValue, points: ringAt(ringValue) }));
  const goalRingPoints = ringAt(SCORE_GOAL);

  const userPointsStr = DIMENSION_ORDER
    .map((dim, i) => {
      const { x, y } = getCoordinates(i, scores[dim] || 0);
      return `${x},${y}`;
    })
    .join(' ');

  const benchmarkPointsStr = benchmarkScores
    ? DIMENSION_ORDER
        .map((dim, i) => {
          const { x, y } = getCoordinates(i, benchmarkScores[dim] || 0);
          return `${x},${y}`;
        })
        .join(' ')
    : '';

  // Sigla no eixo (GOV, TEC...); o nome completo de cada dimensão vira legenda, abaixo do gráfico.
  const labelPositions = DIMENSION_ORDER.map((dim, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const labelDistance = maxRadius + 16;
    return {
      dim,
      i,
      x: centerX + labelDistance * Math.cos(angle),
      y: centerY + labelDistance * Math.sin(angle),
    };
  });

  // Posição do balão de resumo: acima do ponto, exceto no eixo do topo (index 0),
  // onde viraria para fora do canvas — ali o balão abre para baixo. Ancoragem
  // horizontal segue o lado do pentágono (esquerda/direita/centro) para não
  // estourar a borda do gráfico.
  const tooltipPlacement = (i: number) => {
    if (i === 0) return { translateX: '-50%', translateY: '12px' };
    if (i === 1 || i === 2) return { translateX: '-6px', translateY: '-100%' };
    return { translateX: 'calc(-100% + 6px)', translateY: '-100%' };
  };

  const hoveredInfo = hovered ? getMaturityLevel(scores[hovered] || 0) : null;
  const hoveredPoint = hovered ? getCoordinates(DIMENSION_ORDER.indexOf(hovered), scores[hovered] || 0) : null;

  return (
    <div className="flex flex-col items-center justify-center" id="radar-chart-container">
      <div className="mb-4 text-center">
        <h4 className="mg-title">Radar de maturidade por dimensão</h4>
        <p className="mg-small mg-muted" style={{ marginTop: 2 }}>
          Pentágono de preenchimento relativo de {formatNumber(0)} a {formatNumber(maxScore)}
        </p>
      </div>

      <div className="relative">
        <svg width={width} height={height} className="overflow-visible mx-auto" id="radar-svg">
          {/* Grid rings */}
          {ringPoints.map(({ value, points }) => (
            <g key={value}>
              <polygon points={points} fill="none" stroke="var(--surface-deep)" strokeWidth="1.5" />
              <text
                x={centerX}
                y={centerY - (value / maxScore) * maxRadius + 4}
                fill="var(--text-muted)"
                fontSize="9"
                fontFamily="var(--mg-font-mono)"
                textAnchor="middle"
              >
                {formatNumber(value, 1)}
              </text>
            </g>
          ))}

          {/* Anel pontilhado na meta (score 1,50) — traço fino, distinto do tracejado da média do grupo */}
          <polygon points={goalRingPoints} fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 3" />

          {/* Grid axis spokes */}
          {DIMENSION_ORDER.map((_, i) => {
            const outerCoord = getCoordinates(i, maxScore);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={outerCoord.x}
                y2={outerCoord.y}
                stroke="var(--surface-deep)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Benchmark polygon overlay (ilustrativo) — tracejado mais longo que o da meta, para diferenciar os dois */}
          {benchmarkScores && (
            <g>
              <polygon points={benchmarkPointsStr} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 3" />
              {DIMENSION_ORDER.map((dim, i) => {
                const { x, y } = getCoordinates(i, benchmarkScores[dim] || 0);
                return <circle key={`b-${dim}`} cx={x} cy={y} r="3.5" fill="var(--text-muted)" />;
              })}
            </g>
          )}

          {/* User score filled polygon */}
          <g>
            <polygon points={userPointsStr} fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="2.5" />
            {DIMENSION_ORDER.map((dim, i) => {
              const { x, y } = getCoordinates(i, scores[dim] || 0);
              const isHovered = hovered === dim;
              return (
                <g key={`u-${dim}`}>
                  {/* Fundo sólido atrás do valor: legível mesmo sobre o anel da meta ou os raios do grid */}
                  <rect
                    x={x - 15}
                    y={y - 25}
                    width={30}
                    height={14}
                    rx={4}
                    fill="var(--surface-raised)"
                    className="pointer-events-none"
                  />
                  <text
                    x={x}
                    y={y - 8}
                    fill="var(--text)"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="var(--mg-font-mono)"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {formatNumber(scores[dim] || 0)}
                  </text>
                  {/* Área de toque maior que o ponto visível, para facilitar o hover */}
                  <circle
                    cx={x}
                    cy={y}
                    r="11"
                    fill="transparent"
                    onMouseEnter={() => setHovered(dim)}
                    onMouseLeave={() => setHovered((prev) => (prev === dim ? null : prev))}
                    style={{ cursor: 'default' }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7.5 : 5.5}
                    fill="var(--brand)"
                    stroke="var(--surface-raised)"
                    strokeWidth="1.5"
                    className="pointer-events-none"
                    style={{ transition: 'r 150ms ease' }}
                  />
                </g>
              );
            })}
          </g>

          {/* Axis labels: só a sigla (GOV, TEC...); o nome completo está na legenda abaixo */}
          {labelPositions.map((pos) => {
            const alignment = pos.i === 0 ? 'middle' : pos.i === 1 || pos.i === 2 ? 'start' : 'end';
            return (
              <text
                key={pos.dim}
                x={pos.x}
                y={pos.y}
                fill="var(--text-muted)"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--mg-font-mono)"
                textAnchor={alignment}
                dominantBaseline="middle"
              >
                {pos.dim.toUpperCase()}
              </text>
            );
          })}
        </svg>

        {/* Balão de resumo do eixo sob o ponteiro */}
        {hovered && hoveredInfo && hoveredPoint && (
          <div
            className="mg-radar-tip"
            style={{
              left: hoveredPoint.x,
              top: hoveredPoint.y,
              transform: `translate(${tooltipPlacement(DIMENSION_ORDER.indexOf(hovered)).translateX}, ${tooltipPlacement(DIMENSION_ORDER.indexOf(hovered)).translateY})`,
            }}
          >
            <p className="mg-radar-tip-title">{DIMENSIONS[hovered].name}</p>
            <div className="mg-row" style={{ gap: 8, marginTop: 6 }}>
              <LevelBadge level={hoveredInfo.num as Level} />
              <span className="mg-code">{formatNumber(scores[hovered] || 0)} / 3</span>
            </div>
          </div>
        )}
      </div>

      {/* Legenda: nome completo de cada dimensão (siglas do gráfico) + série e meta */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2" id="radar-dim-legend">
        {DIMENSION_ORDER.map((dim) => (
          <div className="mg-row" style={{ gap: 6 }} key={dim}>
            <span
              aria-hidden="true"
              style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--dim-${dim})`, display: 'inline-block', flex: 'none' }}
            />
            <span className="mg-small mg-muted">{DIMENSIONS[dim].shortName}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-6" id="radar-legend">
        <div className="mg-row" style={{ gap: 8 }}>
          <span style={{ width: 12, height: 0, borderTop: '2.5px solid var(--brand)', display: 'inline-block' }} />
          <span className="mg-small">Sua organização</span>
        </div>
        <div className="mg-row" style={{ gap: 8 }}>
          <span style={{ width: 12, height: 0, borderTop: '1.5px dotted var(--text-muted)', display: 'inline-block' }} />
          <span className="mg-small mg-muted">Meta · {formatNumber(SCORE_GOAL, 2)}</span>
        </div>
        {benchmarkScores && (
          <div className="mg-row" style={{ gap: 8 }}>
            <span style={{ width: 12, height: 0, borderTop: '1.5px dashed var(--text-muted)', display: 'inline-block' }} />
            <span className="mg-small mg-muted">Média do grupo (ilustrativo)</span>
          </div>
        )}
      </div>
    </div>
  );
}
