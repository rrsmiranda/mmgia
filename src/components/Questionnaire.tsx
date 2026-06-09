/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuBookOpen,
  LuInfo,
  LuCircleCheck,
  LuLock,
  LuCompass,
  LuTriangleAlert,
  LuAward
} from 'react-icons/lu';

const ChevronLeft = LuChevronLeft as any;
const ChevronRight = LuChevronRight as any;
const BookOpen = LuBookOpen as any;
const Info = LuInfo as any;
const CheckCircle2 = LuCircleCheck as any;
const Lock = LuLock as any;
const Compass = LuCompass as any;
const AlertTriangle = LuTriangleAlert as any;
const Award = LuAward as any;
import { ScoreLevel, DIMENSIONS, LIST_PRACTICES, DimensionId } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface QuestionnaireProps {
  answers: Record<string, ScoreLevel>;
  onSaveAnswer: (practiceId: string, value: ScoreLevel) => void;
  onGoToRevision: () => void;
  onGoBackToOnboarding: () => void;
  theme?: 'light' | 'dark';
}

export default function Questionnaire({
  answers,
  onSaveAnswer,
  onGoToRevision,
  onGoBackToOnboarding,
  theme = 'light',
}: QuestionnaireProps) {
  const [activeDimension, setActiveDimension] = useState<DimensionId>('gov');
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [showEvidence, setShowEvidence] = useState(false);
  const [latestSavedId, setLatestSavedId] = useState<string | null>(null);

  // Filter practices to current active dimension
  const filteredPractices = LIST_PRACTICES.filter(p => p.dimensionId === activeDimension);
  const currentPractice = filteredPractices[currentPracticeIndex] || filteredPractices[0];
  const isLastDimensionAndPractice = activeDimension === 'eco' && currentPracticeIndex === filteredPractices.length - 1;

  // Auto scroll to top on practice change
  useEffect(() => {
    // No evidence collapse state needed
  }, [currentPractice?.id]);

  // Handle toast notification dismiss
  useEffect(() => {
    if (latestSavedId) {
      const timer = setTimeout(() => {
        setLatestSavedId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [latestSavedId]);

  // Overall calculations
  const totalPractices = LIST_PRACTICES.length;
  const totalAnswered = LIST_PRACTICES.filter(p => !!answers[p.id]).length;
  const progressPercent = Math.round((totalAnswered / totalPractices) * 100);

  // Calculate scores per dimension
  const getDimensionScore = (dimId: DimensionId) => {
    const dimPractices = LIST_PRACTICES.filter(p => p.dimensionId === dimId);
    const answered = dimPractices.filter(p => !!answers[p.id]);
    if (answered.length === 0) return 0.0;

    const sum = answered.reduce((acc, p) => {
      const val = answers[p.id];
      const weight = val === 'N' ? 0 : val === 'P' ? 1 : val === 'L' ? 2 : 3;
      return acc + weight;
    }, 0);

    return sum / answered.length; // Max score level: 3.00
  };

  // Calculate global score
  const getGlobalScore = () => {
    const answeredList = LIST_PRACTICES.filter(p => !!answers[p.id]);
    if (answeredList.length === 0) return 0.0;

    const sum = answeredList.reduce((acc, p) => {
      const val = answers[p.id];
      const weight = val === 'N' ? 0 : val === 'P' ? 1 : val === 'L' ? 2 : 3;
      return acc + weight;
    }, 0);

    return sum / answeredList.length;
  };

  const globalScore = getGlobalScore();

  const getMaturityLevelName = (score: number) => {
    if (score < 0.5) return 'Nível 1 · Iniciado';
    if (score < 1.5) return 'Nível 2 · Gerenciado';
    if (score < 2.3) return 'Nível 3 · Definido';
    if (score < 2.8) return 'Nível 4 · Quantificado';
    return 'Nível 5 · Otimizado';
  };

  const handleSelectLevel = (level: ScoreLevel) => {
    if (currentPractice) {
      onSaveAnswer(currentPractice.id, level);
      setLatestSavedId(currentPractice.id);

      // Auto advance after short delay for snappy UX
      setTimeout(() => {
        if (currentPracticeIndex < filteredPractices.length - 1) {
          setCurrentPracticeIndex(currentPracticeIndex + 1);
        } else {
          // If of this dimension, auto transition to next tab if needed, or guide to revision
          const keys: DimensionId[] = ['gov', 'tec', 'seg', 'edu', 'eco'];
          const currentTabIdx = keys.indexOf(activeDimension);
          if (currentTabIdx < keys.length - 1) {
            setActiveDimension(keys[currentTabIdx + 1]);
            setCurrentPracticeIndex(0);
          }
        }
      }, 150);
    }
  };

  const handlePrevPractice = () => {
    if (currentPracticeIndex > 0) {
      setCurrentPracticeIndex(currentPracticeIndex - 1);
    } else {
      const keys: DimensionId[] = ['gov', 'tec', 'seg', 'edu', 'eco'];
      const currentTabIdx = keys.indexOf(activeDimension);
      if (currentTabIdx > 0) {
        const prevDim = keys[currentTabIdx - 1];
        setActiveDimension(prevDim);
        const prevDimLength = LIST_PRACTICES.filter(p => p.dimensionId === prevDim).length;
        setCurrentPracticeIndex(prevDimLength - 1);
      }
    }
  };

  const handleNextPractice = () => {
    if (currentPracticeIndex < filteredPractices.length - 1) {
      setCurrentPracticeIndex(currentPracticeIndex + 1);
    } else {
      const keys: DimensionId[] = ['gov', 'tec', 'seg', 'edu', 'eco'];
      const currentTabIdx = keys.indexOf(activeDimension);
      if (currentTabIdx < keys.length - 1) {
        setActiveDimension(keys[currentTabIdx + 1]);
        setCurrentPracticeIndex(0);
      } else {
        onGoToRevision();
      }
    }
  };

  // Keyboard Shortcuts for Rapid Audit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      if (e.key === '1') {
        handleSelectLevel('N');
      } else if (e.key === '2') {
        handleSelectLevel('P');
      } else if (e.key === '3') {
        handleSelectLevel('L');
      } else if (e.key === '4') {
        handleSelectLevel('F');
      } else if (e.key === 'ArrowLeft') {
        handlePrevPractice();
      } else if (e.key === 'ArrowRight') {
        handleNextPractice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPracticeIndex, activeDimension, answers]);

  const getDimRespondedCount = (dimId: DimensionId) => {
    const list = LIST_PRACTICES.filter(p => p.dimensionId === dimId);
    return list.filter(p => !!answers[p.id]).length;
  };

  return (
    <div className={`min-h-screen pt-28 pb-20 px-6 font-sans select-none transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#0B1120] text-slate-100' : 'bg-[#F7F9FC] text-[#0F172A]'
    }`} id="assessment-questionnaire-root">
      
      {/* Painel de Operações e Progresso Geral do Diagnóstico */}
      <div className={`max-w-7xl mx-auto mb-8 border rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300 ${
        theme === 'dark' ? 'bg-[#141E30] border-slate-800/80' : 'bg-white border-slate-200/60'
      }`} id="unified-diagnostic-dashboard">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Progresso Geral (4 columns) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4 lg:border-r lg:border-slate-200/60 lg:dark:border-slate-800/80 lg:pr-6 text-left">
            <div>
              <span className="font-mono text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">
                Progresso Geral do Diagnóstico
              </span>
              <h3 className={`text-base font-extrabold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                {totalAnswered} de {totalPractices} práticas respondidas
              </h3>
              <p className="text-accent font-mono text-xs font-bold mt-0.5">{progressPercent}% concluído</p>
            </div>
            
            <div className="w-full">
              <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                ></motion.div>
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1.5 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Column 2: Consulte as Dimensões (5 columns) */}
          <div className="lg:col-span-5 space-y-4 lg:border-r lg:border-slate-200/60 lg:dark:border-slate-800/80 lg:px-6 text-left">
            <span className="font-mono text-[10px] uppercase font-black text-slate-400 tracking-wider block">
              Consulte as Dimensões do Diagnóstico
            </span>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" id="dimension-tabs">
              {(Object.keys(DIMENSIONS) as DimensionId[]).map((key) => {
                const info = DIMENSIONS[key];
                const isActive = activeDimension === key;
                const completedCount = getDimRespondedCount(key);
                
                return (
                  <motion.button
                    key={key}
                    onClick={() => {
                      setActiveDimension(key);
                      setCurrentPracticeIndex(0);
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative p-2 border rounded-xl flex flex-col items-center justify-center text-center transition-colors cursor-pointer min-h-[64px] overflow-hidden ${
                      isActive
                        ? 'border-transparent text-white font-extrabold'
                        : theme === 'dark'
                        ? 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                        : 'bg-white border-slate-200/60 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeDimensionBackground"
                        className="absolute inset-0 bg-[#1B98E0] z-0 rounded-xl shadow-md"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="font-extrabold text-[11px] truncate max-w-full leading-tight z-10">{info.shortName}</span>
                    <span className="font-mono text-[9px] uppercase mt-0.5 opacity-80 z-10">
                      {completedCount}/9
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Column 3: Acesso Rápido às Práticas (3 columns) */}
          <div className="lg:col-span-3 space-y-3 lg:pl-6 text-left flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">
                Acesso Rápido às Práticas
              </span>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Dimensão: <strong className="font-bold text-accent">{DIMENSIONS[activeDimension].shortName}</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1" id="practice-interactive-timeline">
              {filteredPractices.map((p, idx) => {
                const isCurrent = idx === currentPracticeIndex;
                const ans = answers[p.id];
                const isAnswered = !!ans;
                
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => setCurrentPracticeIndex(idx)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    className={`relative h-8 w-8 text-[11px] font-mono font-bold rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer shrink-0 overflow-visible ${
                      isCurrent
                        ? 'text-white border-transparent bg-[#1B98E0]'
                        : isAnswered
                        ? ans === 'N' ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40 shadow-sm'
                        : ans === 'P' ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/40 shadow-sm'
                        : ans === 'L' ? 'bg-blue-50 hover:bg-blue-100 text-[#006494] border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40 shadow-sm'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-[#50E5B5] dark:border-emerald-900/40 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border border-slate-200/60 dark:bg-slate-900/40 dark:text-slate-350 dark:border-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title={`Prática ${p.id}: ${p.name}`}
                  >
                    {isCurrent && (
                      <motion.div
                        layoutId="activePracticeDotBackground"
                        className="absolute inset-0 bg-[#1B98E0] z-0 rounded-lg shadow-md"
                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                      />
                    )}
                    <span className="z-10">{p.id.split('.')[1] || (idx + 1)}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto space-y-6">

          {/* ACTIVE PRACTICE MAIN CARD styled exactly like Progress Band */}
          {currentPractice && (
            <div className={`border rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative transition-colors duration-500 ${
              theme === 'dark' ? 'bg-[#141E30] border-slate-800/80' : 'bg-white border-slate-200/60'
            }`} id="active-practice-card">

              {/* Smooth Liquid Transition wrapping the core Practice content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPractice.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  {/* Header card labels */}
                  <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-800/80 pt-4" id="card-labels">
                    <span className={`font-mono text-[11px] uppercase px-3 py-1 rounded-full font-bold ${
                      theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      Prática {currentPractice.id}
                    </span>

                    <div className="flex items-center gap-2">
                       <span className="font-mono text-[10px] text-slate-400">Requisito para:</span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase text-white`} style={{ backgroundColor: DIMENSIONS[activeDimension].color }}>
                        Nível {currentPractice.level}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold font-sans tracking-tight leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                      {currentPractice.name}
                    </h3>
                    <p className={`text-sm leading-relaxed font-normal ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {currentPractice.description}
                    </p>
                  </div>

                  {/* Legal Alignment Pill */}
                  {currentPractice.legalReference && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono ${
                      theme === 'dark' ? 'bg-slate-900 text-accent border border-slate-800/80' : 'bg-[#E6F1FB] text-brand border border-[#185FA5]/20'
                    }`}>
                      <BookOpen className="w-3.5 h-3.5" />
                      Alinhamento: <strong className="font-bold">{currentPractice.legalReference}</strong>
                    </div>
                  )}

                  {/* Expected Evidence Block (Already Visible for superior UX) */}
                  <div className={`p-5 rounded-2xl border text-xs leading-relaxed transition-colors ${
                    theme === 'dark' 
                      ? 'bg-slate-900/50 border-slate-800 text-slate-210' 
                      : 'bg-slate-50 border-slate-250 text-slate-850'
                  }`} id="already-visible-evidence">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-accent shrink-0" />
                      <span className="font-bold font-mono text-accent uppercase text-[10px] tracking-wider">Evidências e Artefatos Sugeridos</span>
                    </div>
                    <p className="leading-relaxed font-normal font-sans text-xs">{currentPractice.evidence}</p>
                  </div>

                  {/* RESPONSE SCALE SELECTOR (NPLF SCALE) with Rich Descriptive Subtitles */}
                  <div className="space-y-3" id="nplf-selector">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Escolha o grau de conformidade atual de sua organização:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {[
                        { 
                          val: 'N', 
                          label: 'Nulo (N)', 
                          subtitle: 'Inexistente',
                          keyHint: '1',
                          desc: 'Sem ações ou planejamento formal.',
                          colorStyle: 'bg-red-50/70 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 hover:bg-red-100 hover:border-red-300', 
                          active: 'bg-red-650 border-red-650 text-white font-bold ring-2 ring-red-600/30 shadow-lg scale-102' 
                        },
                        { 
                          val: 'P', 
                          label: 'Parcial (P)', 
                          subtitle: 'Iniciado',
                          keyHint: '2',
                          desc: 'Planejado ou em ações piloto.',
                          colorStyle: 'bg-cyan-50/75 border-cyan-200 text-cyan-700 dark:bg-cyan-950/20 dark:border-cyan-900/40 dark:text-cyan-400 hover:bg-cyan-100 hover:border-cyan-300', 
                          active: 'bg-cyan-500 border-cyan-500 text-white font-bold ring-2 ring-cyan-500/30 shadow-lg scale-102' 
                        },
                        { 
                          val: 'L', 
                          label: 'Larga (L)', 
                          subtitle: 'Amplo',
                          keyHint: '3',
                          desc: 'Adoção ampla e regular.',
                          colorStyle: 'bg-blue-50/80 border-blue-200 text-[#006494] dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400 hover:bg-blue-100 hover:border-blue-300', 
                          active: 'bg-brand border-brand text-white font-bold ring-2 ring-brand/30 shadow-lg scale-102' 
                        },
                        { 
                          val: 'F', 
                          label: 'Total (F)', 
                          subtitle: 'Otimizado',
                          keyHint: '4',
                          desc: 'Totalmente adotado e medido.',
                          colorStyle: 'bg-emerald-50/70 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-100 hover:border-emerald-300', 
                          active: 'bg-emerald-600 border-emerald-600 text-white font-bold ring-2 ring-emerald-600/30 shadow-lg scale-102' 
                        },
                      ].map((btn) => {
                        const isSelected = answers[currentPractice.id] === btn.val;
                        return (
                          <motion.button
                            key={btn.val}
                            onClick={() => handleSelectLevel(btn.val as ScoreLevel)}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-colors duration-200 cursor-pointer min-h-[110px] group relative overflow-visible ${
                              isSelected ? btn.active : btn.colorStyle
                            }`}
                          >
                            <div className="w-full flex justify-between items-center z-10">
                              <span className="font-bold text-xs font-sans tracking-tight">{btn.label}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[8px] px-1.5 py-0.5 font-mono rounded border ${
                                  isSelected 
                                    ? 'bg-white/20 border-white/20 text-white font-bold' 
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm'
                                }`}>
                                  {btn.keyHint}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 font-mono font-bold rounded uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                  {btn.subtitle}
                                </span>
                              </div>
                            </div>
                            <p className={`text-[10.5px] mt-2 font-medium leading-normal transition-colors z-10 ${
                              isSelected ? 'text-white/95' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                            }`}>
                              {btn.desc}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                    
                    {/* Compact Keyboard Instruction Footing */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 transition-opacity duration-300 select-none pb-2 opacity-85">
                      <span className={`text-[10px] font-sans mr-1.5 ${theme === 'dark' ? 'text-slate-405' : 'text-slate-550'}`}>Atalhos rápidos de teclado:</span>
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded shadow-sm text-slate-600 dark:text-slate-400">1</kbd>
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded shadow-sm text-slate-600 dark:text-slate-400">2</kbd>
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded shadow-sm text-slate-600 dark:text-slate-400">3</kbd>
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded shadow-sm text-slate-600 dark:text-slate-400">4</kbd>
                      <span className={`text-[10px] font-sans ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>votar e avançar</span>
                      <span className="mx-1 text-slate-300 dark:text-slate-800">|</span>
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded shadow-sm text-slate-600 dark:text-slate-400">←</kbd>
                      <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded shadow-sm text-slate-600 dark:text-slate-400">→</kbd>
                      <span className={`text-[10px] font-sans ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>navegar</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

               {/* CARD BOTTOM NAVIGATION */}
              <div className={`border-t pt-6 flex justify-between items-center text-xs ${
                theme === 'dark' ? 'border-slate-800/80' : 'border-slate-200/60'
              }`} id="questionnaire-card-nav">
                <button
                  onClick={handlePrevPractice}
                  className={`flex items-center gap-1 font-semibold font-sans cursor-pointer py-2 ${
                    theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar Prática
                </button>

                <span className="font-mono text-slate-400">
                  Prática {currentPracticeIndex + 1} de {filteredPractices.length} nesta dimensão
                </span>

                <button
                  onClick={handleNextPractice}
                  className="flex items-center gap-1 font-semibold text-accent hover:text-accent-deep font-sans cursor-pointer py-2"
                >
                  {isLastDimensionAndPractice ? 'Finalizar Avaliação' : 'Continuar'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      {/* AUTO SAVE TOAST NOTIFICATION */}
      <AnimatePresence>
        {latestSavedId && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-150"
            id="save-toast"
          >
            <div className="bg-[#101828] text-white font-mono text-[11px] font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
              <motion.div
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CheckCircle2 className="w-4 h-4 text-[#12B76A]" />
              </motion.div>
              <span>Respostas salvas localmente com sucesso</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
