/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DimensionId, DIMENSIONS } from '@mmgia/shared/types';
import { DIMENSION_ORDER, SCORE_GOAL, SCORE_MAX, formatNumber } from '@mmgia/shared/design-system';

interface RadarChartProps {
  scores: Record<DimensionId, number>;
  benchmarkScores?: Record<DimensionId, number>;
}

export default function RadarChart({ scores, benchmarkScores }: RadarChartProps) {
  const width = 360;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 120;
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

  const labelPositions = DIMENSION_ORDER.map((dim, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const labelDistance = maxRadius + 30;
    return {
      dim,
      x: centerX + labelDistance * Math.cos(angle),
      y: centerY + labelDistance * Math.sin(angle),
    };
  });

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

          {/* Anel tracejado na meta (score 1,50) */}
          <polygon points={goalRingPoints} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 3" />

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

          {/* Benchmark polygon overlay (ilustrativo) */}
          {benchmarkScores && (
            <g>
              <polygon points={benchmarkPointsStr} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
              {DIMENSION_ORDER.map((dim, i) => {
                const { x, y } = getCoordinates(i, benchmarkScores[dim] || 0);
                return <circle key={`b-${dim}`} cx={x} cy={y} r="3.5" fill="var(--text-muted)" />;
              })}
            </g>
          )}

          {/* User score filled polygon */}
          <g>
            <polygon points={userPointsStr} fill="var(--brand-soft)" stroke="var(--brand-accent)" strokeWidth="2.5" />
            {DIMENSION_ORDER.map((dim, i) => {
              const { x, y } = getCoordinates(i, scores[dim] || 0);
              return (
                <g key={`u-${dim}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5.5"
                    fill={`var(--dim-${dim})`}
                    stroke="var(--surface-raised)"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:scale-125 transition-transform"
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
                </g>
              );
            })}
          </g>

          {/* Axis labels */}
          {labelPositions.map((pos, i) => {
            const metadata = DIMENSIONS[pos.dim];
            const alignment = i === 0 ? 'middle' : i === 1 || i === 2 ? 'start' : 'end';
            const verticalOffset = i === 0 ? -10 : i === 2 || i === 3 ? 15 : 0;
            const horizontalOffset = i === 1 ? 5 : i === 4 ? -5 : 0;

            return (
              <g key={pos.dim} transform={`translate(${pos.x + horizontalOffset}, ${pos.y + verticalOffset})`}>
                <text fill="var(--text)" fontSize="11" fontWeight="800" fontFamily="var(--mg-font-sans)" textAnchor={alignment}>
                  {metadata.shortName}
                </text>
                <text fill="var(--text-muted)" fontSize="8.5" fontFamily="var(--mg-font-mono)" textAnchor={alignment} y="12">
                  {metadata.id.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6" id="radar-legend">
        <div className="mg-row" style={{ gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--brand-accent)', display: 'inline-block' }} />
          <span className="mg-small">Sua organização</span>
        </div>
        {benchmarkScores && (
          <div className="mg-row" style={{ gap: 8 }}>
            <span style={{ width: 12, height: 0, borderTop: '2px dashed var(--text-muted)', display: 'inline-block' }} />
            <span className="mg-small mg-muted">Média grupo nacional (ilustrativo)</span>
          </div>
        )}
      </div>
    </div>
  );
}
