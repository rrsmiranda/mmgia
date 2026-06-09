/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LuShieldAlert,
  LuCircleCheck,
  LuBuilding2,
  LuBuilding,
  LuSchool,
  LuBriefcase,
  LuUsers,
  LuCompass,
  LuArrowRight,
  LuChevronLeft,
  LuLandmark,
  LuMap,
  LuLayoutGrid
} from 'react-icons/lu';

const ShieldAlert = LuShieldAlert as any;
const CheckCircle2 = LuCircleCheck as any;
const Building2 = LuBuilding2 as any;
const Building = LuBuilding as any;
const School = LuSchool as any;
const Briefcase = LuBriefcase as any;
const Users = LuUsers as any;
const Compass = LuCompass as any;
const ArrowRight = LuArrowRight as any;
const ChevronLeft = LuChevronLeft as any;
const Landmark = LuLandmark as any;
const MapIcon = LuMap as any;
const GridIcon = LuLayoutGrid as any;
import { AssessmentMetadata } from '../types';
import BrazilMap from './BrazilMap';

const STATE_TILES = [
  // Norte (Green theme)
  { uf: 'RR', col: 2, row: 1, region: 'Norte', name: 'Roraima', color: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' },
  { uf: 'AP', col: 4, row: 1, region: 'Norte', name: 'Amapá', color: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' },
  { uf: 'AM', col: 1, row: 2, region: 'Norte', name: 'Amazonas', color: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' },
  { uf: 'PA', col: 3, row: 2, region: 'Norte', name: 'Pará', color: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' },
  { uf: 'AC', col: 1, row: 3, region: 'Norte', name: 'Acre', color: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' },
  { uf: 'RO', col: 2, row: 3, region: 'Norte', name: 'Rondônia', color: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' },
  { uf: 'TO', col: 4, row: 3, region: 'Norte', name: 'Tocantins', color: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' },

  // Nordeste (Purple theme)
  { uf: 'MA', col: 5, row: 2, region: 'Nordeste', name: 'Maranhão', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },
  { uf: 'PI', col: 6, row: 2, region: 'Nordeste', name: 'Piauí', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },
  { uf: 'CE', col: 7, row: 2, region: 'Nordeste', name: 'Ceará', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },
  { uf: 'RN', col: 8, row: 2, region: 'Nordeste', name: 'Rio Grande do Norte', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },
  { uf: 'PB', col: 8, row: 3, region: 'Nordeste', name: 'Paraíba', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },
  { uf: 'PE', col: 7, row: 3, region: 'Nordeste', name: 'Pernambuco', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },
  { uf: 'AL', col: 8, row: 4, region: 'Nordeste', name: 'Alagoas', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },
  { uf: 'SE', col: 7, row: 4, region: 'Nordeste', name: 'Sergipe', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },
  { uf: 'BA', col: 6, row: 3, region: 'Nordeste', name: 'Bahia', color: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10' },

  // Centro-Oeste (Amber/Orange theme)
  { uf: 'MT', col: 3, row: 4, region: 'Centro-Oeste', name: 'Mato Grosso', color: 'border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10' },
  { uf: 'GO', col: 4, row: 4, region: 'Centro-Oeste', name: 'Goiás', color: 'border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10' },
  { uf: 'DF', col: 5, row: 4, region: 'Centro-Oeste', name: 'Distrito Federal', color: 'border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10' },
  { uf: 'MS', col: 3, row: 5, region: 'Centro-Oeste', name: 'Mato Grosso do Sul', color: 'border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10' },

  // Sudeste (Blue theme)
  { uf: 'MG', col: 5, row: 5, region: 'Sudeste', name: 'Minas Gerais', color: 'border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10' },
  { uf: 'ES', col: 6, row: 5, region: 'Sudeste', name: 'Espírito Santo', color: 'border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10' },
  { uf: 'SP', col: 4, row: 6, region: 'Sudeste', name: 'São Paulo', color: 'border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10' },
  { uf: 'RJ', col: 5, row: 6, region: 'Sudeste', name: 'Rio de Janeiro', color: 'border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10' },

  // Sul (Teal theme)
  { uf: 'PR', col: 3, row: 6, region: 'Sul', name: 'Paraná', color: 'border-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10' },
  { uf: 'SC', col: 3, row: 7, region: 'Sul', name: 'Santa Catarina', color: 'border-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10' },
  { uf: 'RS', col: 2, row: 7, region: 'Sul', name: 'Rio Grande do Sul', color: 'border-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10' },
];

interface OnboardingProps {
  onComplete: (metadata: AssessmentMetadata) => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function Onboarding({ onComplete, onCancel, theme = 'light' }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [natureza, setNatureza] = useState('');
  const [estado, setEstado] = useState('');
  const [setor, setSetor] = useState('');
  const [porte, setPorte] = useState('');
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [hoveredState, setHoveredState] = useState<typeof STATE_TILES[0] | null>(null);

  // Generate random code like "a3f8-2b91-4c7d"
  const generateUniqueCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segment = (len: number) => {
      let str = '';
      for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;
    };
    return `${segment(4)}-${segment(4)}-${segment(4)}`;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const code = generateUniqueCode();
      onComplete({
        natureza,
        estado,
        setor,
        porte,
        termosAceitos,
        code,
      });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  // Check step validation
  const isStepValid = () => {
    if (step === 1) return natureza !== '';
    if (step === 2) return estado !== '' && setor !== '';
    if (step === 3) return porte !== '' && termosAceitos;
    return false;
  };

  return (
    <div className={`min-h-screen pt-28 pb-20 px-6 font-sans select-none transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#0B1120] text-slate-100' : 'bg-[#F7F9FC] text-[#0F172A]'
    }`} id="onboarding-root">
      <div 
        id="onboarding-card"
        className={`max-w-4xl mx-auto border rounded-3xl p-8 md:p-12 transition-colors duration-500 ${
          theme === 'dark' ? 'bg-[#141E30] border-slate-800/80 shadow-2xl' : 'bg-white border-slate-200/60 shadow-sm'
        }`}
      >
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
            Configurar Organização
          </h2>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Personalize os parâmetros para obtermos grupos de benchmarking coerentes de forma anônima.
          </p>
        </div>

        {/* Horizontal Progress Timeline */}
        <div className="relative flex justify-between items-center max-w-md mx-auto mb-12 animate-fade-in" id="progress-timeline-wrapper">
          <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 -z-1 ${
            theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-200/60'
          }`}></div>
          
          {[1, 2, 3].map((num) => {
            const isActive = step === num;
            const isCompleted = step > num;

            return (
              <div key={num} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-all duration-300 ${
                    isActive
                      ? 'bg-accent text-white border-accent ring-4 ring-accent/10 font-bold'
                      : isCompleted
                      ? 'bg-brand text-white border-brand'
                      : theme === 'dark'
                      ? 'bg-slate-900 text-slate-500 border-slate-800/80'
                      : 'bg-white text-slate-400 border-slate-200/60'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : num}
                </div>
                <span className={`text-[9px] uppercase tracking-wider font-mono font-bold mt-2 ${
                  isActive ? 'text-accent' : isCompleted ? 'text-brand dark:text-[#185FA5]' : 'text-slate-400'
                }`}>
                  Etapa {num}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP WRAPPER WITH DIRECT MOTION TRANSITION AND SPRING TIMINGS */}
        <div className="relative min-h-[460px] pb-4 px-1">
          <AnimatePresence mode="wait">
            {/* STEP 1: NATUREZA */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="space-y-6"
                id="onboarding-step-1"
              >
                <h3 className={`text-lg font-bold tracking-tight text-center ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Qual é a natureza jurídica ou esfera da instituição?
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'Pública federal', desc: 'Ministérios, agências reguladoras ou autarquias de nível federal.', icon: Building2 },
                    { id: 'Pública estadual', desc: 'Secretarias de Estado, fundações ou autarquias estaduais.', icon: Building },
                    { id: 'Pública municipal', desc: 'Prefeituras, secretarias municipais ou autarquias locais.', icon: Landmark },
                    { id: 'Privada', desc: 'Empresas, startups, corporações independentes e comerciais.', icon: Briefcase },
                    { id: 'Terceiro setor', desc: 'Fundações privadas, ONGs, institutos ou associações de classe.', icon: Users },
                    { id: 'Academia', desc: 'Universidades públicas ou privadas, institutos de fomento e centros científicos.', icon: School },
                  ].map((card) => {
                    const isSelected = natureza === card.id;
                    return (
                      <motion.div
                        key={card.id}
                        onClick={() => setNatureza(card.id)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className={`p-5 rounded-2xl border text-left cursor-pointer relative overflow-hidden transition-colors ${
                          isSelected
                            ? 'border-accent bg-accent/5 ring-2 ring-accent/10 shadow-sm'
                            : theme === 'dark'
                            ? 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 text-white'
                            : 'border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 text-[#0F172A]'
                        }`}
                      >
                        {isSelected && (
                          <motion.div 
                            layoutId="naturezaActiveIndicator"
                            className="absolute top-3 right-3 text-accent"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                        )}
                        <div className={`p-2.5 rounded-xl w-fit mb-3 ${
                          isSelected 
                            ? 'bg-accent text-white' 
                            : theme === 'dark' 
                            ? 'bg-slate-800 text-slate-400' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <card.icon className="w-4.5 h-4.5" />
                        </div>
                        <h4 className={`font-bold text-sm font-sans ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>{card.id}</h4>
                        <p className={`text-[11px] leading-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{card.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: ESTADO E SETOR */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="space-y-8"
                id="onboarding-step-2"
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <h3 className={`text-base font-bold tracking-tight text-left ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                      1. Selecione o Estado (UF) de atuação principal
                    </h3>
                    
                    {/* View Switcher Controls */}
                    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setViewMode('map')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-sans cursor-pointer transition-all duration-200 ${
                          viewMode === 'map'
                            ? 'bg-white dark:bg-slate-800 text-accent shadow'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>Mapa Dinâmico</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-sans cursor-pointer transition-all duration-200 ${
                          viewMode === 'grid'
                            ? 'bg-white dark:bg-slate-800 text-accent shadow'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <GridIcon className="w-3.5 h-3.5" />
                        <span>Grade Rápida</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic State Details Banner */}
                  <div className={`p-4 rounded-2xl flex items-center justify-between transition-colors border text-xs min-h-[58px] ${
                    theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200/60 text-slate-600'
                  }`} id="state-detail-banner">
                    <div>
                      {hoveredState ? (
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-[#1B98E0] dark:text-[#1B98E0]">Região {hoveredState.region}</span>
                          <p className={`font-bold mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {hoveredState.name} ({hoveredState.uf})
                          </p>
                        </div>
                      ) : estado ? (
                        <div>
                          {(() => {
                            const sel = STATE_TILES.find(t => t.uf === estado);
                            return (
                              <>
                                <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-emerald-500 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  Selecionado
                                </span>
                                <p className={`font-bold mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-905'}`}>
                                  {sel ? `${sel.name} (${sel.uf}) — Região ${sel.region}` : `Estado: ${estado}`}
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="font-sans italic text-slate-400 dark:text-slate-500">
                          Nenhum estado selecionado. Clique no mapa ou na grade para marcar seu estado.
                        </div>
                      )}
                    </div>
                    
                    {estado && (
                      <span className="font-mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5 select-none animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmado
                      </span>
                    )}
                  </div>

                  {/* Interactive SVG Geographic Map */}
                  <div className="overflow-hidden relative py-2">
                    <AnimatePresence mode="wait">
                      {viewMode === 'map' ? (
                        <motion.div 
                          key="map-view"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          className="max-w-xl mx-auto" 
                          id="onboarding-geographic-map"
                        >
                          <BrazilMap
                            onSelectState={(uf) => setEstado(uf)}
                            selectedState={estado}
                            showHeatmap={false}
                            theme={theme}
                          />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="grid-view"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 max-w-2xl mx-auto" 
                          id="legacy-state-grid"
                        >
                          {UFS.map((uf) => {
                            const isSelected = estado === uf;
                            return (
                              <motion.button
                                key={uf}
                                type="button"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => setEstado(uf)}
                                className={`py-2 px-1 font-mono text-[10px] font-bold border transition-colors cursor-pointer rounded-lg ${
                                  isSelected
                                    ? 'bg-accent text-white border-accent font-black shadow-md'
                                    : theme === 'dark'
                                    ? 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {uf}
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className={`space-y-4 border-t pt-8 ${theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200/60'}`}>
                  <h3 className={`text-base font-bold tracking-tight text-center ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                    2. Selecione o Setor de atividade econômica
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      'Financeiro', 'Saúde', 'Gov. federal', 'Gov. estadual', 'Gov. municipal',
                      'Indústria', 'Tecnologia', 'Educação', 'Agronegócio', 'Outro'
                    ].map((sec) => {
                      const isSelected = setor === sec;
                      return (
                        <motion.button
                          key={sec}
                          onClick={() => setSetor(sec)}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className={`p-3 text-[11px] font-sans font-semibold border rounded-xl text-center transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-accent/5 text-accent border-accent ring-2 ring-accent/10 font-bold'
                              : theme === 'dark'
                              ? 'bg-slate-900/60 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850/80'
                              : 'bg-white text-slate-650 border-slate-200/60 hover:border-slate-350 hover:bg-slate-50'
                          }`}
                        >
                          {sec}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PORTE E PRIVACIDADE */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="space-y-8"
                id="onboarding-step-3"
              >
                <div className="space-y-4">
                  <h3 className={`text-base font-bold tracking-tight text-center ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                    Selecione o porte aproximado da organização (quantidade de colaboradores)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {[
                      { id: 'Micro', label: 'Micro (até 19)' },
                      { id: 'Pequena', label: 'Pequena (20–99)' },
                      { id: 'Média', label: 'Média (100–999)' },
                      { id: 'Grande', label: 'Grande (1.000+)' }
                    ].map((item) => {
                      const isSelected = porte === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => setPorte(item.id)}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className={`p-4 border rounded-xl text-center font-sans font-semibold text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-accent/5 text-accent border-accent ring-2 ring-accent/10 font-bold'
                              : theme === 'dark'
                              ? 'bg-slate-900/60 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                              : 'bg-white text-slate-650 border-slate-200/60 hover:border-slate-350 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy Panel Info Card */}
                <div className={`border rounded-3xl p-6 space-y-4 max-w-xl mx-auto ${
                  theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200/60'
                }`}>
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-accent">
                        Compromisso Anônimo de Privacidade
                      </h4>
                      <p className={`text-[11px] mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Garantimos total integridade de seus dados confidenciais de negócio. Não há dados sensíveis persistidos.
                      </p>
                    </div>
                  </div>

                  {/* Stored vs Never Stored List */}
                  <div className={`grid grid-cols-2 gap-4 text-[10px] font-mono border-t pt-4 ${
                    theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200/60'
                  }`}>
                    <div>
                      <span className="text-emerald-500 block font-bold mb-1.5">// DADOS GRAVADOS:</span>
                      <ul className={`space-y-1 list-disc pl-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                        <li>Natureza do Órgão</li>
                        <li>Estado Federativo (UF)</li>
                        <li>Setor Econômico</li>
                        <li>Porte da Organização</li>
                      </ul>
                    </div>
                    <div>
                      <span className="text-red-500 block font-bold mb-1.5">// NUNCA SOLICITADO:</span>
                      <ul className="space-y-1 text-slate-400">
                        <li className="line-through">E-mail Corporativo</li>
                        <li className="line-through">Nomes de Projetos</li>
                        <li className="line-through">Chaves de Sistemas</li>
                        <li className="line-through">Código CNPJ</li>
                      </ul>
                    </div>
                  </div>

                  <motion.label 
                    className="flex items-start gap-2.5 pt-2 cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                  >
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 rounded text-accent focus:ring-accent"
                    />
                    <span className={`text-[10px] leading-normal font-sans select-none ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Entendo e aceito que os dados inseridos serão utilizados de forma anônima e agregada para traçar o Painel Nacional de Maturidade em IA brasileiro.
                    </span>
                  </motion.label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions Row */}
        <div className={`mt-12 flex justify-between items-center border-t pt-6 ${
          theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200/60'
        }`}>
          <button
            onClick={handlePrev}
            className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
              theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex items-center gap-1.5 font-sans text-xs font-semibold px-6 py-3 shadow transition-all duration-200 cursor-pointer rounded-full ${
              isStepValid()
                ? 'bg-accent text-white hover:bg-accent-deep shadow-md active:scale-95'
                : theme === 'dark'
                ? 'bg-slate-900 border border-slate-800/80 text-slate-650 cursor-not-allowed shadow-none'
                : 'bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed shadow-none'
            }`}
          >
            {step === 3 ? 'Gerar Código & Iniciar' : 'Continuar'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
