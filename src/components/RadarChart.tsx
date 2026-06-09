/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DimensionId, DIMENSIONS } from '../types';

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
  const maxScore = 3.0;

  // Ordered list of dimensions for pentagon rotation
  const order: DimensionId[] = ['gov', 'tec', 'seg', 'edu', 'eco'];

  const getCoordinates = (index: number, score: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const value = Math.max(0, Math.min(score, maxScore)); // bound score 0-3
    const radius = (value / maxScore) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // Build grid boundaries (pentagon rings at 1, 2, and 3 scores)
  const ringPoints = [1.0, 2.0, 3.0].map((ringValue) => {
    return order.map((_, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const radius = (ringValue / maxScore) * maxRadius;
      return `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`;
    }).join(' ');
  });

  // Build paths for values
  const userPointsStr = order
    .map((dim, i) => {
      const { x, y } = getCoordinates(i, scores[dim] || 0);
      return `${x},${y}`;
    })
    .join(' ');

  const benchmarkPointsStr = benchmarkScores
    ? order
        .map((dim, i) => {
          const { x, y } = getCoordinates(i, benchmarkScores[dim] || 0);
          return `${x},${y}`;
        })
        .join(' ')
    : '';

  // Calculate coordinates for grid axis labels
  const labelPositions = order.map((dim, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const labelDistance = maxRadius + 30; // offset outwards
    return {
      dim,
      x: centerX + labelDistance * Math.cos(angle),
      y: centerY + labelDistance * Math.sin(angle),
    };
  });

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-3xl" id="radar-chart-container">
      <div className="mb-4 text-center">
        <h4 className="text-sm font-semibold uppercase font-mono tracking-wider text-brand-accent">
          Radar de Maturidade por Dimensão
        </h4>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Pentágono de preenchimento relativo de 0.00 a 3.00
        </p>
      </div>

      <div className="relative">
        <svg width={width} height={height} className="overflow-visible mx-auto" id="radar-svg">
          {/* Grid Pentagons */}
          {ringPoints.map((points, index) => {
            const val = index + 1;
            return (
              <g key={val}>
                <polygon
                  points={points}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="1.5"
                />
                {/* Score label text on grid */}
                <text
                  x={centerX}
                  y={centerY - (val / maxScore) * maxRadius + 4}
                  fill="rgba(255, 255, 255, 0.3)"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Grid Axes Spokes */}
          {order.map((_, i) => {
            const outerCoord = getCoordinates(i, maxScore);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={outerCoord.x}
                y2={outerCoord.y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Benchmark polygon overlay if defined */}
          {benchmarkScores && (
            <g>
              <polygon
                points={benchmarkPointsStr}
                fill="rgba(29, 158, 117, 0.06)"
                stroke="#1D9E75"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Highlight vertices */}
              {order.map((dim, i) => {
                const { x, y } = getCoordinates(i, benchmarkScores[dim] || 0);
                return (
                  <circle
                    key={`b-${dim}`}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#1D9E75"
                    stroke="#1D9E75"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          )}

          {/* User Score Filled Polygon */}
          <g>
            <polygon
              points={userPointsStr}
              fill="rgba(24, 95, 165, 0.28)"
              stroke="#2563EB"
              strokeWidth="2.5"
            />
            {/* Highlight vertices */}
            {order.map((dim, i) => {
              const { x, y } = getCoordinates(i, scores[dim] || 0);
              const metadata = DIMENSIONS[dim];
              return (
                <g key={`u-${dim}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5.5"
                    fill={metadata.color}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:scale-125 transition-transform"
                  />
                  {/* Score annotation directly by dot */}
                  <text
                    x={x}
                    y={y - 8}
                    fill="#FFFFFF"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow"
                  >
                    {(scores[dim] || 0).toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Axis Labels */}
          {labelPositions.map((pos, i) => {
            const metadata = DIMENSIONS[pos.dim];
            const alignment =
              i === 0
                ? 'middle'
                : i === 1 || i === 2
                ? 'start'
                : 'end';

            const verticalOffset = i === 0 ? -10 : i === 2 || i === 3 ? 15 : 0;
            const horizontalOffset = i === 1 ? 5 : i === 4 ? -5 : 0;

            return (
              <g key={pos.dim} transform={`translate(${pos.x + horizontalOffset}, ${pos.y + verticalOffset})`}>
                <text
                  fill="#F8FAFC"
                  fontSize="11"
                  fontWeight="800"
                  fontFamily="sans-serif"
                  textAnchor={alignment}
                >
                  {metadata.shortName}
                </text>
                <text
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor={alignment}
                  y="12"
                >
                  {metadata.id.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Block */}
      <div className="mt-4 flex gap-6 text-[10px] uppercase font-mono font-bold tracking-wider" id="radar-legend">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-600 outline outline-1 outline-white"></span>
          <span className="text-slate-300">Sua Organização</span>
        </div>
        {benchmarkScores && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-t border-dashed border-[#1D9E75] inline-block"></span>
            <span className="text-brand-accent">Média Grupo Nacional</span>
          </div>
        )}
      </div>
    </div>
  );
}
