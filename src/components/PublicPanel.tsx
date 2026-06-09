/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Target } from 'lucide-react';
import {
  LuDownload,
  LuFilter,
  LuEye,
  LuTrendingUp,
  LuMapPin,
  LuFlame,
  LuChartLine,
  LuLayoutGrid,
  LuFileCheck2,
  LuDatabase
} from 'react-icons/lu';

const Download = LuDownload as any;
const Filter = LuFilter as any;
const Eye = LuEye as any;
const TrendingUp = LuTrendingUp as any;
const MapPin = LuMapPin as any;
const Flame = LuFlame as any;
const LineIcon = LuChartLine as any;
const Grid = LuLayoutGrid as any;
const FileCheck2 = LuFileCheck2 as any;
const Database = LuDatabase as any;
import BrazilMap from './BrazilMap';
import { DIMENSIONS, SEED_HISTORICAL_RECORDS, DimensionId } from '../types';

interface PublicPanelProps {
  onChangeTab: (tab: string) => void;
}

export default function PublicPanel({ onChangeTab }: PublicPanelProps) {
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [porteFilter, setPorteFilter] = useState('Todos');
  const [selectedUf, setSelectedUf] = useState<string>('DF');

  // SVG Line Chart coordinates for 12 months (mocked beautifully)
  const lineChartData = [
    { m: 'Jul25', score: 1.10 },
    { m: 'Ago25', score: 1.15 },
    { m: 'Set25', score: 1.18 },
    { m: 'Out25', score: 1.25 },
    { m: 'Nov25', score: 1.21 },
    { m: 'Dez25', score: 1.28 },
    { m: 'Jan26', score: 1.32 },
    { m: 'Fev26', score: 1.30 },
    { m: 'Mar26', score: 1.36 },
    { m: 'Abr26', score: 1.40 },
    { m: 'Mai26', score: 1.42 },
    { m: 'Jun26', score: 1.42 },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 px-6 font-sans select-none" id="public-panel-root">
      
      {/* 1. HEADER INFO & FILTERS */}
      <div className="max-w-7xl mx-auto mb-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6" id="public-panel-filters-bar">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400">dados_consolidados_br</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Painel Nacional de Maturidade em IA
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Dados agregados em tempo real obedecendo à k-anonimidade ≥ 5 (segurança de sigilo estatístico).
          </p>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto" id="filters-dropdowns">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Setor:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-transparent font-bold focus:outline-none focus:ring-0 text-slate-700 font-sans"
            >
              <option value="Todos">Todos</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Saúde">Saúde</option>
              <option value="Gov. federal">Gov. Federal</option>
              <option value="Tecnologia">Tecnologia</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-mono">
            <span className="text-slate-400">Porte:</span>
            <select
              value={porteFilter}
              onChange={(e) => setPorteFilter(e.target.value)}
              className="bg-transparent font-bold focus:outline-none focus:ring-0 text-slate-700 font-sans"
            >
              <option value="Todos">Todos</option>
              <option value="Micro">Micro</option>
              <option value="Pequena">Pequena</option>
              <option value="Média">Média</option>
              <option value="Grande">Grande</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE MAP */}
        <div className="lg:col-span-5 space-y-6">
          <BrazilMap 
            onSelectState={(uf) => setSelectedUf(uf)} 
            selectedState={selectedUf}
            theme="light"
          />

          <div className="bg-slate-950 text-slate-300 p-5 rounded-3xl" id="map-state-insights">
            <h4 className="font-mono text-[9px] uppercase font-bold text-brand-accent tracking-wider mb-2">dados_estado_foco</h4>
            <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-2xl text-xs">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-accent" />
                <strong className="text-white">{selectedUf}</strong>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {selectedUf === 'DF' ? '2.12 / 3.00 (Nível 3)' : selectedUf === 'SP' ? '1.89 / 3.00 (Nível 2)' : '1.38 / 3.00 (Nível 2)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal mt-3 font-light">
              Os índices mostram picos de letramento técnico e comitivas coordenadas de segurança sob conformidade com a LGPD.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: CORE DASHBOARD KPI & SUB-MODULES */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 3. KPI Counters block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="panel-kpis">
            {[
              { label: 'Score Médio Brasil', val: '1.42', highlight: 'text-brand-primary' },
              { label: 'Nível Modal', val: 'Nível 2', highlight: 'text-amber-600' },
              { label: 'Avaliações Ativas', val: '1.847', highlight: 'text-slate-900' },
              { label: 'Pilar Mais Crítico', val: 'Edu', highlight: 'text-red-500' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs text-center space-y-1">
                <span className="text-[32px] font-mono font-black tracking-tight block leading-none">{kpi.val}</span>
                <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-snug">{kpi.label}</span>
              </div>
            ))}
          </div>

          {/* 3. Insight Highlights Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="panel-advice">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-1 text-red-900">
              <span className="flex items-center gap-1 font-mono text-[9px] uppercase font-bold text-red-800">
                <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                Ponto Crítico
              </span>
              <p className="font-bold text-xs font-sans">Educação algorítmica: 1.10</p>
              <p className="text-[10px] text-red-700 leading-normal font-light">
                Servidores públicos e colaboradores registram baixas em imersões éticas formais.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-1 text-emerald-900">
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold text-emerald-800">
                <Star className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20 shrink-0" />
                Destaque Nacional
              </span>
              <p className="font-bold text-xs font-sans">Aspectos de Segurança: 1.52</p>
              <p className="text-[10px] text-emerald-700 leading-normal font-light">
                Iniciativas de proteção e adequação à LGPD puxam os índices para cima.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1 text-blue-900">
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold text-blue-800">
                <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Rumo ao Nível 3
              </span>
              <p className="font-bold text-xs font-sans">Diferença para Meta: 0.58 pts</p>
              <p className="text-[10px] text-blue-700 leading-normal font-light">
                Basta formalizar comitês e inventários estruturados nas organizações de nível 2.
              </p>
            </div>
          </div>

          {/* Dimension average score bars */}
          <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-4" id="panel-dimension-averages">
            <h4 className="text-sm font-semibold uppercase font-mono tracking-wider text-brand-primary">Médias Consolidadas por Pilar</h4>
            
            <div className="space-y-3.5">
              {(Object.keys(DIMENSIONS) as DimensionId[]).map((key) => {
                const info = DIMENSIONS[key];
                // mock average scores
                const score = key === 'gov' ? 1.34 : key === 'tec' ? 1.48 : key === 'seg' ? 1.52 : key === 'edu' ? 1.10 : 1.25;
                const percent = (score / 3) * 100;

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-slate-700">{info.name}</span>
                      <span className={info.textColor}>{score.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ backgroundColor: info.color, width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Beautiful SVG Historical Trend Line Chart */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4" id="panel-trend-chart">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2 text-brand-primary">
                <LineIcon className="w-5 h-5" />
                <h4 className="text-sm font-semibold uppercase font-mono tracking-wider">Evolução Histórica (12 Meses)</h4>
              </div>
              <span className="font-mono text-[9px] uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                Crescente (+14% YoY)
              </span>
            </div>

            {/* SVG Line representation */}
            <div className="relative py-4">
              <svg width="100%" height="110" viewBox="0 0 500 110" className="overflow-visible" id="trend-svg">
                {/* Score baseline guides */}
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeDasharray="3 3By" />
                <line x1="0" y1="56" x2="500" y2="56" stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeDasharray="3 3By" />
                <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeDasharray="3 3By" />

                {/* Score y label markers */}
                <text x="5" y="16" fill="rgba(0,0,0,0.25)" fontSize="7" fontFamily="monospace">3.0 (Otimizado)</text>
                <text x="5" y="52" fill="rgba(0,0,0,0.25)" fontSize="7" fontFamily="monospace">1.5 (Gerenciado)</text>
                <text x="5" y="88" fill="rgba(0,0,0,0.25)" fontSize="7" fontFamily="monospace">0.5 (Iniciado)</text>

                {/* Draw the line */}
                <path
                  d="M10,85 L50,82 L90,80 L130,75 L170,78 L210,72 L250,68 L290,70 L330,65 L370,61 L410,58 L450,58"
                  fill="none"
                  stroke="#1E3A8A"
                  strokeWidth="2.5"
                  className="stroke-linecap-round"
                />

                {/* Pulse dot on final coordinates */}
                <circle cx="450" cy="58" r="4.5" fill="#1D9E75" stroke="#FFFFFF" strokeWidth="1.5" className="animate-ping" />
                <circle cx="450" cy="58" r="4.5" fill="#1D9E75" stroke="#FFFFFF" strokeWidth="1.5" />

                {/* Tick months text */}
                {lineChartData.map((d, i) => (
                  <text
                    key={d.m}
                    x={10 + i * 40}
                    y="104"
                    fill="rgba(0,0,0,0.4)"
                    fontSize="7.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {d.m}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Sector Ratings Ranking Listing Table */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4" id="panel-sector-rank">
            <h4 className="text-sm font-semibold uppercase font-mono tracking-wider text-brand-primary flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Médias por Setor de Atuação
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px] text-slate-500">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold">
                    <th className="py-2.5">SETOR ECONÔMICO</th>
                    <th className="py-2.5 text-center">AMOSTRAS</th>
                    <th className="py-2.5 text-right font-black">SCORE PONDERADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { s: 'Tecnologia', c: '412', sc: 1.88, fill: 'bg-emerald-500' },
                    { s: 'Financeiro', c: '380', sc: 1.77, fill: 'bg-sky-500' },
                    { s: 'Governo Federal', c: '512', sc: 1.54, fill: 'bg-sky-500' },
                    { s: 'Educação', c: '185', sc: 1.35, fill: 'bg-amber-500' },
                    { s: 'Agronegócio', c: '110', sc: 1.12, fill: 'bg-amber-500' },
                    { s: 'Saúde', c: '144', sc: 1.08, fill: 'bg-red-500' },
                  ].map((row) => (
                    <tr key={row.s} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-sans font-semibold text-slate-800">{row.s}</td>
                      <td className="py-3 text-center">{row.c} avaliações</td>
                      <td className="py-3 text-right flex items-center justify-end gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${row.fill}`}></span>
                        <strong className="text-slate-900 font-bold">{row.sc.toFixed(2)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4" id="opendata-links">
              <p className="text-[10px] text-slate-400 font-mono">
                Deseja utilizar os microdados brutos? Baixe o dataset completo sob CC BY 4.0.
              </p>
              <button
                onClick={() => onChangeTab('opendata')}
                className="px-4.5 py-2.5 bg-brand-primary text-white hover:brightness-110 transition text-xs font-semibold tracking-wider font-sans cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Database className="w-4 h-4 text-brand-accent animate-pulse" />
                Acessar Área Open Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
