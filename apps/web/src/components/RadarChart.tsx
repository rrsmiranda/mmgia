/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useReducedMotion } from 'motion/react';

export interface RadarAxis {
  id: string;
  /** Rótulo curto no eixo (nome curto da dimensão, ou código da prática). */
  label: string;
  /** Linha secundária no eixo (score, ou "L · 2"). */
  sub: string;
  /** 0 a 3. null = sem resposta (ponto vazado em zero). */
  value: number | null;
  /** Nome completo, usado na primeira linha do tooltip ("label · title"). */
  title: string;
  /** Segunda linha do tooltip. */
  detail: string;
  ariaLabel: string;
}

interface RadarChartProps {
  axes: RadarAxis[];
  /** Alinhado por índice a `axes`. Opcional — só na visão geral. */
  benchmark?: (number | null)[];
  /** Eixo em destaque (hover/foco), controlado pelo chamador. */
  highlightId?: string | null;
  onAxisHover?: (id: string | null) => void;
  onAxisClick?: (id: string) => void;
  ariaLabel: string;
}

const SIZE = 300;
const CENTER = SIZE / 2;
const MAX_RADIUS = 92;
const MAX_SCORE = 3;

export default function RadarChart({ axes, benchmark, highlightId, onAxisHover, onAxisClick, ariaLabel }: RadarChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const n = axes.length;

  const angleFor = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;

  const pointFor = (i: number, value: number) => {
    const v = Math.max(0, Math.min(value, MAX_SCORE));
    const r = (v / MAX_SCORE) * MAX_RADIUS;
    const angle = angleFor(i);
    return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
  };

  const ringAt = (ringValue: number) =>
    axes.map((_, i) => {
      const { x, y } = pointFor(i, ringValue);
      return `${x},${y}`;
    }).join(' ');

  const ringPoints = [1, 2, 3].map((value) => ({ value, points: ringAt(value) }));

  const userPoints = axes.map((axis, i) => pointFor(i, axis.value ?? 0));
  const userPointsStr = userPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const benchmarkPoints = benchmark ? axes.map((_, i) => pointFor(i, benchmark[i] ?? 0)) : null;
  const benchmarkPointsStr = benchmarkPoints ? benchmarkPoints.map((p) => `${p.x},${p.y}`).join(' ') : '';

  const labelDistance = MAX_RADIUS + 26;
  const labelPositions = axes.map((axis, i) => {
    const angle = angleFor(i);
    return { axis, x: CENTER + labelDistance * Math.cos(angle), y: CENTER + labelDistance * Math.sin(angle) };
  });

  const highlightIndex = highlightId ? axes.findIndex((a) => a.id === highlightId) : -1;
  const highlighted = highlightIndex >= 0 ? axes[highlightIndex] : null;
  const highlightPoint = highlightIndex >= 0 ? userPoints[highlightIndex] : null;

  return (
    <div className="mg-an-radar-wrap" style={{ position: 'relative', width: '100%', maxWidth: SIZE }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%"
        style={{ maxWidth: SIZE, overflow: 'visible', display: 'block', margin: '0 auto' }}
        role="img"
        aria-label={ariaLabel}
        className="mg-an-radar-svg"
      >
        {/* Grid rings em 1, 2 e 3 */}
        {ringPoints.map(({ value, points }) => (
          <g key={value}>
            <polygon points={points} fill="none" stroke="var(--surface-deep)" strokeWidth="1.5" />
            <text x={CENTER} y={CENTER - (value / MAX_SCORE) * MAX_RADIUS + 4} fill="var(--text-muted)" fontSize="9" fontFamily="var(--mg-font-mono)" textAnchor="middle">
              {value}
            </text>
          </g>
        ))}

        {/* Raios do grid */}
        {axes.map((axis, i) => {
          const outer = pointFor(i, MAX_SCORE);
          return <line key={axis.id} x1={CENTER} y1={CENTER} x2={outer.x} y2={outer.y} stroke="var(--surface-deep)" strokeWidth="1" strokeDasharray="2 2" />;
        })}

        {/* Benchmark (ilustrativo) */}
        {benchmarkPoints && (
          <g>
            <polygon points={benchmarkPointsStr} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 3" />
            {benchmarkPoints.map((p, i) => (
              <circle key={`b-${axes[i].id}`} cx={p.x} cy={p.y} r="3.5" fill="var(--text-muted)" />
            ))}
          </g>
        )}

        {/* Polígono da organização + pontos interativos */}
        <polygon points={userPointsStr} fill="var(--brand)" fillOpacity={0.14} stroke="var(--brand)" strokeWidth="2" />
        {axes.map((axis, i) => {
          const p = userPoints[i];
          const isHighlighted = axis.id === highlightId;
          const isUnanswered = axis.value === null;
          return (
            <g key={axis.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={14}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={axis.ariaLabel}
                className="mg-an-radar-hit"
                onMouseEnter={() => onAxisHover?.(axis.id)}
                onMouseLeave={() => onAxisHover?.(null)}
                onFocus={() => onAxisHover?.(axis.id)}
                onBlur={() => onAxisHover?.(null)}
                onClick={() => onAxisClick?.(axis.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAxisClick?.(axis.id);
                  }
                }}
                style={{ cursor: onAxisClick ? 'pointer' : 'default', outline: 'none' }}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={isHighlighted ? 7 : 4}
                fill={isUnanswered ? 'var(--surface-raised)' : 'var(--brand)'}
                stroke={isUnanswered ? 'var(--brand)' : 'var(--surface-raised)'}
                strokeWidth={isHighlighted ? 3 : 1.5}
                className="pointer-events-none"
                style={prefersReducedMotion ? undefined : { transition: 'r 150ms ease' }}
              />
            </g>
          );
        })}

        {/* Rótulos dos eixos */}
        {labelPositions.map(({ axis, x, y }) => {
          const isHighlighted = axis.id === highlightId;
          return (
            <g key={axis.id}>
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--mg-font-sans)" fontSize="12" fontWeight={isHighlighted ? 700 : 600} fill={isHighlighted ? 'var(--brand)' : 'var(--text)'}>
                {axis.label}
              </text>
              <text x={x} y={y + 15} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--mg-font-sans)" fontSize="12" fill="var(--text-muted)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {axis.sub}
              </text>
            </g>
          );
        })}
      </svg>

      {highlighted && highlightPoint && (
        <div className="mg-an-tip" style={{ left: `${(highlightPoint.x / SIZE) * 100}%`, top: `${(highlightPoint.y / SIZE) * 100}%` }}>
          <b>{highlighted.label} · {highlighted.title}</b>
          <span>{highlighted.detail}</span>
        </div>
      )}
    </div>
  );
}
