/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LuSun, LuMoon, LuInfo, LuMap } from 'react-icons/lu';
import brazilMapData from '@svg-maps/brazil';

export interface StateData {
  uf: string;
  name: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  score: number;
  count: number;
}

// Map scores geographically
const STATE_SCORES: Record<string, StateData> = {
  SP: { uf: 'SP', name: 'São Paulo', region: 'Sudeste', score: 1.89, count: 540 },
  RJ: { uf: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste', score: 1.68, count: 220 },
  MG: { uf: 'MG', name: 'Minas Gerais', region: 'Sudeste', score: 1.45, count: 180 },
  ES: { uf: 'ES', name: 'Espírito Santo', region: 'Sudeste', score: 1.32, count: 45 },
  PR: { uf: 'PR', name: 'Paraná', region: 'Sul', score: 1.58, count: 98 },
  SC: { uf: 'SC', name: 'Santa Catarina', region: 'Sul', score: 1.62, count: 70 },
  RS: { uf: 'RS', name: 'Rio Grande do Sul', region: 'Sul', score: 1.48, count: 110 },
  DF: { uf: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste', score: 2.12, count: 95 },
  GO: { uf: 'GO', name: 'Goiás', region: 'Centro-Oeste', score: 1.28, count: 52 },
  MT: { uf: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste', score: 1.15, count: 32 },
  MS: { uf: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste', score: 1.22, count: 28 },
  BA: { uf: 'BA', name: 'Bahia', region: 'Nordeste', score: 1.38, count: 114 },
  PE: { uf: 'PE', name: 'Pernambuco', region: 'Nordeste', score: 1.42, count: 85 },
  CE: { uf: 'CE', name: 'Ceará', region: 'Nordeste', score: 1.35, count: 65 },
  RN: { uf: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste', score: 1.25, count: 30 },
  PB: { uf: 'PB', name: 'Paraíba', region: 'Nordeste', score: 1.40, count: 28 },
  AL: { uf: 'AL', name: 'Alagoas', region: 'Nordeste', score: 1.08, count: 15 },
  SE: { uf: 'SE', name: 'Sergipe', region: 'Nordeste', score: 1.12, count: 12 },
  PI: { uf: 'PI', name: 'Piauí', region: 'Nordeste', score: 1.18, count: 18 },
  MA: { uf: 'MA', name: 'Maranhão', region: 'Nordeste', score: 1.02, count: 22 },
  AM: { uf: 'AM', name: 'Amazonas', region: 'Norte', score: 1.11, count: 35 },
  PA: { uf: 'PA', name: 'Pará', region: 'Norte', score: 1.05, count: 42 },
  TO: { uf: 'TO', name: 'Tocantins', region: 'Norte', score: 1.18, count: 15 },
  RO: { uf: 'RO', name: 'Rondônia', region: 'Norte', score: 0.95, count: 10 },
  RR: { uf: 'RR', name: 'Roraima', region: 'Norte', score: 0.88, count: 6 },
  AP: { uf: 'AP', name: 'Amapá', region: 'Norte', score: 0.92, count: 8 },
  AC: { uf: 'AC', name: 'Acre', region: 'Norte', score: 0.85, count: 5 },
};

interface BrazilMapProps {
  onSelectState?: (uf: string) => void;
  selectedState?: string;
  showHeatmap?: boolean;
  theme?: 'light' | 'dark';
}

export default function BrazilMap({
  onSelectState,
  selectedState = '',
  showHeatmap = true,
  theme: propTheme,
}: BrazilMapProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (propTheme) {
      setTheme(propTheme);
    }
  }, [propTheme]);

  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse state scores and assign colors for Heatmap Mode
  const getStateFillColor = (uf: string, isHovered: boolean, isSelected: boolean) => {
    const ufUpper = uf.toUpperCase();
    const stateData = STATE_SCORES[ufUpper];
    
    if (!showHeatmap) {
      if (isSelected) {
        return theme === 'dark' ? '#10B981' : '#0F6E56'; // Emerald
      }
      if (isHovered) {
        return theme === 'dark' ? '#334155' : '#E2E8F0'; // Styled gray
      }
      return theme === 'dark' ? '#1E293B' : '#F1F5F9'; // neutral background
    }

    // Heatmap Mode - custom color scale based on maturity score (0.0 to 3.0)
    if (!stateData) {
      return theme === 'dark' ? '#1E293B' : '#F1F5F9';
    }

    const score = stateData.score;

    if (isSelected) {
      return theme === 'dark' ? '#10B981' : '#14B8A6'; // Active Highlight
    }

    if (theme === 'dark') {
      if (score >= 2.0) {
        return isHovered ? '#047857' : '#064E3B'; // Dark Emerald
      }
      if (score >= 1.5) {
        return isHovered ? '#0369A1' : '#0C4A6E'; // Sky / Navy
      }
      if (score >= 1.0) {
        return isHovered ? '#B45309' : '#78350F'; // Orange / Amber
      }
      return isHovered ? '#475569' : '#334155'; // Muted Slate
    } else {
      if (score >= 2.0) {
        return isHovered ? '#D1FAE5' : '#A7F3D0'; // Mint Greens
      }
      if (score >= 1.5) {
        return isHovered ? '#E0F2FE' : '#BAE6FD'; // Light Sky Blues
      }
      if (score >= 1.0) {
        return isHovered ? '#FEF3C7' : '#FDE68A'; // Warm Ambers
      }
      return isHovered ? '#F1F5F9' : '#E2E8F0'; // Warm Grays
    }
  };

  const getStrokeColor = (uf: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) {
      return theme === 'dark' ? '#FBBF24' : '#D97706'; // Gold Border
    }
    if (isHovered) {
      return theme === 'dark' ? '#FFFFFF' : '#0F172A';
    }
    return theme === 'dark' ? '#0F172A' : '#FFFFFF'; // Clean separate borders
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top - 15,
      });
    }
  };

  const handleStateClick = (uf: string) => {
    if (onSelectState) {
      onSelectState(uf.toUpperCase());
    }
  };

  const selectedUfUpper = selectedState.toUpperCase();

  // Order locations so hovered / selected paths are drawn last, ensuring their borders render on top of others perfectly.
  const orderedLocations = useMemo(() => {
    const locations = [...brazilMapData.locations];
    return locations.sort((a, b) => {
      const aId = a.id.toUpperCase();
      const bId = b.id.toUpperCase();
      const aHovered = hoveredLocation?.toUpperCase() === aId;
      const bHovered = hoveredLocation?.toUpperCase() === bId;
      const aSelected = selectedUfUpper === aId;
      const bSelected = selectedUfUpper === bId;

      if (aSelected && !bSelected) return 1;
      if (!aSelected && bSelected) return -1;
      if (aHovered && !bHovered) return 1;
      if (!aHovered && bHovered) return -1;
      return 0;
    });
  }, [hoveredLocation, selectedUfUpper]);

  // Safe cast icons
  const SunIcon = LuSun as any;
  const MoonIcon = LuMoon as any;
  const InfoIcon = LuInfo as any;
  const MapIcon = LuMap as any;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className={`relative w-full overflow-hidden p-6 rounded-3xl border transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-white shadow-2xl'
          : 'bg-white border-slate-100 text-slate-900 shadow-xl'
      }`}
      id="brazil-map-container"
    >
      {/* Title Header with Switch */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-20">
        <div>
          <h4
            className={`text-sm font-semibold uppercase font-mono tracking-wider flex items-center gap-1.5 ${
              theme === 'dark' ? 'text-emerald-400' : 'text-brand-primary'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-ping inline-block ${
                theme === 'dark' ? 'bg-emerald-400' : 'bg-brand-primary'
              }`}
            ></span>
            Mapeamento Interativo de IA
          </h4>
          <p
            className={`text-xs font-sans mt-0.5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Clique no mapa para filtrar ou marcar seu estado de atuação e analisar o cenário de conformidade.
          </p>
        </div>

        {/* Toggle Theme Preview Control */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span
            className={`font-mono text-[10px] uppercase font-bold tracking-wider ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Modo Preview:
          </span>
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Alternar Tema de Preview"
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Claro</span>
              </>
            ) : (
              <>
                <MoonIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Escuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Styled Interactive SVG Map Frame */}
      <div
        className={`relative w-full aspect-[1/1] sm:aspect-[1.1/1] rounded-2xl overflow-hidden shadow-inner border transition-colors duration-500 ${
          theme === 'dark' ? 'bg-[#0F172A] border-slate-800' : 'bg-[#F8FAFC] border-slate-200/50'
        }`}
      >
        <svg
          viewBox={brazilMapData.viewBox}
          className="w-full h-full p-4 pointer-events-auto select-none"
          preserveAspectRatio="xMidYMid meet"
          id="brazil-svg-map"
        >
          {orderedLocations.map((loc) => {
            const uf = loc.id.toUpperCase();
            const isSelected = selectedUfUpper === uf;
            const isHovered = hoveredLocation === loc.id;
            const fillColor = getStateFillColor(loc.id, isHovered, isSelected);
            const strokeColor = getStrokeColor(loc.id, isHovered, isSelected);
            const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.0;

            return (
              <motion.path
                key={loc.id}
                d={loc.path}
                name={loc.name}
                id={`state-path-${loc.id}`}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                onHoverStart={() => setHoveredLocation(loc.id)}
                onHoverEnd={() => setHoveredLocation(null)}
                onClick={() => handleStateClick(loc.id)}
                className="cursor-pointer"
                animate={{
                  fill: fillColor,
                  stroke: strokeColor,
                  strokeWidth: strokeWidth,
                  filter: isHovered 
                    ? (theme === 'dark' 
                        ? 'brightness(1.22) drop-shadow(0px 4px 12px rgba(16, 185, 129, 0.4))' 
                        : 'brightness(1.06) drop-shadow(0px 3px 8px rgba(15, 110, 86, 0.25))')
                    : 'brightness(1) drop-shadow(0px 0px 0px rgba(0,0,0,0))'
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
              />
            );
          })}
        </svg>

        {/* Hover Popup Tooltip Overlay */}
        <AnimatePresence>
          {hoveredLocation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                top: tooltipPos.y,
                left: tooltipPos.x,
              }}
              className="pointer-events-none bg-slate-950/95 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md z-30 font-sans max-w-[240px]"
            >
              {(() => {
                const ufUpper = hoveredLocation.toUpperCase();
                const info = STATE_SCORES[ufUpper];
                const stateDataFromMap = brazilMapData.locations.find((l) => l.id === hoveredLocation);
                const stateName = stateDataFromMap ? stateDataFromMap.name : ufUpper;

                return (
                  <div>
                    <div className="flex justify-between items-center mb-1.5 border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-xs text-white tracking-wide">
                        {stateName} ({ufUpper})
                      </span>
                      {info && (
                        <span className="text-[9px] uppercase font-mono tracking-wider font-semibold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {info.region}
                        </span>
                      )}
                    </div>
                    {showHeatmap && info ? (
                      <div className="space-y-1 font-mono text-[10.5px] text-slate-300">
                        <p className="flex justify-between gap-4">
                          <span>Índice Maturidade:</span>
                          <span className="font-bold text-emerald-400">{info.score.toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span>Amostras Coletadas:</span>
                          <span className="font-bold text-white">{info.count}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span>Nível Progresso:</span>
                          <span className="font-bold text-amber-400">
                            {info.score < 1.0
                              ? 'Iniciado'
                              : info.score < 1.5
                              ? 'Gerenciado'
                              : info.score < 2.0
                              ? 'Definido'
                              : 'Otimizado'}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-300 leading-normal font-sans">
                        Selecione {stateName} para registrar-se no Diagnóstico Nacional.
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Legend */}
      <div
        className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 border-t pt-4 border-slate-100 dark:border-slate-800"
        id="map-legend"
      >
        {showHeatmap ? (
          <div className="flex flex-wrap gap-4 text-[10px] font-medium font-mono justify-center sm:justify-start">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-700"></span>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                Otimizado (&ge; 2.0)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-700"></span>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                Definido (1.5 - 2.0)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-700"></span>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                Gerenciado (1.0 - 1.5)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-600"></span>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                Iniciado (&lt; 1.0)
              </span>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 text-[10.5px] font-medium font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 shadow border border-white"></span>
              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                Estado Selecionado
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 italic">
          <InfoIcon className="w-3" />
          <span>Framer Motion &amp; SVG Map Brasil integrado</span>
        </div>
      </div>
    </div>
  );
}
