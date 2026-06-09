/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScoreLevel, DIMENSIONS, LIST_PRACTICES, DimensionId, AssessmentMetadata } from '../types';
import RadarChart from './RadarChart';
import {
  Copy,
  Check,
  CheckCircle,
  FileCheck2,
  XSquare,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
  Sparkles,
  ClipboardCheck,
  CircleCheck,
  HelpCircle,
  CircleX,
  Info,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckSquare,
  Printer,
  BookOpen,
  RefreshCw,
  Download,
  Compass
} from 'lucide-react';

const ChevronDownIcon = ChevronDown;
const ChevronUpIcon = ChevronUp;
const AlertTriangle = TriangleAlert;
const SparklesIcon = Sparkles;
const ClipboardCheckIcon = ClipboardCheck;
const CheckCircle2 = CircleCheck;
const FileCheckIcon = FileCheck2;
const XCircle = CircleX;

interface RevisionProps {
  answers: Record<string, ScoreLevel>;
  metadata: AssessmentMetadata;
  onGoToPractice: (dimensionId: DimensionId, index: number) => void;
  onGoBackToQuestionnaire: () => void;
  onConfirmAndGenerateResult: () => void;
  onViewReport?: () => void;
  theme?: 'light' | 'dark';
}

export default function Revision({
  answers,
  metadata,
  onGoToPractice,
  onGoBackToQuestionnaire,
  onConfirmAndGenerateResult,
  onViewReport,
  theme = 'light',
}: RevisionProps) {
  const [expandedDimension, setExpandedDimension] = useState<DimensionId | null>('gov');
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [activePdfPage, setActivePdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);

  const order: DimensionId[] = ['gov', 'tec', 'seg', 'edu', 'eco'];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(metadata.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check counts
  const getDimensionStats = (dimId: DimensionId) => {
    const dimPractices = LIST_PRACTICES.filter(p => p.dimensionId === dimId);
    const answered = dimPractices.filter(p => !!answers[p.id]);
    return {
      total: dimPractices.length,
      answered: answered.length,
      unanswered: dimPractices.length - answered.length,
    };
  };

  const getDimensionScore = (dimId: DimensionId) => {
    const dimPractices = LIST_PRACTICES.filter(p => p.dimensionId === dimId);
    const answered = dimPractices.filter(p => !!answers[p.id]);
    if (answered.length === 0) return 0.0;

    const sum = answered.reduce((acc, p) => {
      const val = answers[p.id];
      const weight = val === 'N' ? 0 : val === 'P' ? 1 : val === 'L' ? 2 : 3;
      return acc + weight;
    }, 0);

    return sum / answered.length;
  };

  const overallUnansweredCount = LIST_PRACTICES.filter(p => !answers[p.id]).length;

  const currentScores: Record<DimensionId, number> = {
    gov: getDimensionScore('gov'),
    tec: getDimensionScore('tec'),
    seg: getDimensionScore('seg'),
    edu: getDimensionScore('edu'),
    eco: getDimensionScore('eco'),
  };

  const getGlobalScore = () => {
    return (
      currentScores.gov * 0.25 +
      currentScores.tec * 0.20 +
      currentScores.seg * 0.25 +
      currentScores.edu * 0.15 +
      currentScores.eco * 0.15
    );
  };

  const globalScore = getGlobalScore();
  const progressPercentage = Math.round((globalScore / 3) * 100);

  const getMaturityLevel = (score: number) => {
    if (score < 0.5) return {
      num: 0,
      label: 'Inexistente',
      bg: 'bg-red-500',
      text: 'text-red-650',
      risk: 'Risco Crítico',
      desc: 'A organização não possui, nem reconhece, a necessidade de práticas de governança de IA. As atividades são inexistentes, não documentadas ou realizadas de forma caótica, sem qualquer controle ou supervisão.',
      risco: 'Neste nível, a organização opera em estado de total desconhecimento e descontrole quanto às atividades de IA. A ausência completa de governança expõe a organização a um nível de risco crítico. A proliferação de Shadow AI — o uso de ferramentas e sistemas de IA por funcionários sem aprovação ou supervisão formais — é inevitável, criando pontos cegos significativos para a segurança e a gestão.'
    };
    if (score < 1.0) return {
      num: 1,
      label: 'Inicial',
      bg: 'bg-sky-500',
      text: 'text-sky-650',
      risk: 'Risco Crítico / Alto',
      desc: 'As práticas são ad hoc, reativas e dependentes de indivíduos. O sucesso em initiatives de IA é imprevisível e ocorre apesar da ausência de processos formais, geralmente impulsionado por "heróis" organizacionais. Há uma conscientização da necessidade de práticas de governança de IA.',
      risco: 'No nível Inicial, a organização começa a ter bolsões de atividade de IA, mas de forma desorganizada. O nível de risco permanece crítico, pois não há uma abordagem sistemática para a gestão. A dependência de "heróis" cria um ponto único de falha; o conhecimento não é institucionalizado e se perde com a saída desses indivíduos.'
    };
    if (score < 1.5) return {
      num: 2,
      label: 'Gerenciado',
      bg: 'bg-cyan-500',
      text: 'text-cyan-650',
      risk: 'Risco Alto',
      desc: 'Práticas básicas de gestão de projetos e de supervisão são aplicadas às iniciativas de IA. Políticas e responsabilidades começam a ser definidas em nível de projeto ou de departamento, mas a aplicação ainda é inconsistente em toda a organização.',
      risco: 'Neste estágio, a governança é predominantemente reativa, sempre um passo atrás das capacidades tecnológicas. Embora existam práticas básicas de gestão, a sua aplicação inconsistente em silos organizacionais cria lacunas perigosas. O nível de risco é alto, pois a ausência de uma estrutura de governança centralizada e uniforme implica que as regras aplicadas a um projeto podem ser completamente diferentes das de outro projeto.'
    };
    if (score < 2.0) return {
      num: 3,
      label: 'Definido',
      bg: 'bg-blue-600',
      text: 'text-blue-650',
      risk: 'Risco Moderado',
      desc: 'Processos de governança de IA são padronizados, documentados e disseminados em toda a organização, constituindo um "jeito organizacional" de fazer com IA. Há um entendimento comum sobre papéis, responsabilidades e procedimentos.',
      risco: 'O estabelecimento de processos padronizados e documentados reduz significativamente a ambiguidade e o caos dos níveis anteriores, reduzindo o risco para um nível moderado. A organização agora possui uma base sólida para a governança. No entanto, um risco fundamental neste estágio é a rigidez das regras estáticas perante a velocidade da evolução tecnológica.'
    };
    if (score < 2.5) return {
      num: 4,
      label: 'Gerenciado Quantitativamente',
      bg: 'bg-emerald-600',
      text: 'text-emerald-650',
      risk: 'Risco Baixo',
      desc: 'A organização mede e controla o desempenho de seus processos de governança de IA por meio de métricas e dados estatísticos. O desempenho é previsível e os desvios são gerenciados proativamente.',
      risco: 'Neste nível, a governança deixa de basear-se em suposições e passa a ser orientada por dados, reduzindo o risco. O monitoramento contínuo substitui as revisões periódicas. O principal risco neste estágio é a complacência e o foco exclusivo em métricas numéricas simples que ignoram aspectos éticos complexos.'
    };
    return {
      num: 5,
      label: 'Otimizado',
      bg: 'bg-indigo-700',
      text: 'text-indigo-650',
      risk: 'Risco Otimizado / Mínimo',
      desc: 'A organização foca na melhoria contínua e proativa dos processos de governança de IA. O feedback, tanto quantitativo quanto qualitativo, é utilizado para identificar oportunidades de inovação e refinar as práticas em um ciclo virtuoso.',
      risco: 'No nível mais alto de maturidade, a governança de IA se torna inteligente, adaptativa e totalmente integrada à estratégia de negócio, trazendo um exponencial diferencial competitivo. O risco residual é a de eventuais disrupções globais de regulação ou infraestrutura técnica onde reações refinadas demandam extrema flexibilidade.'
    };
  };

  const levelInfo = getMaturityLevel(globalScore);

  const getSectorBenchmarks = (sector: string) => {
    const isSectorStrong = ['Financeiro', 'Tecnologia'].includes(sector);
    const scale = isSectorStrong ? 1.25 : 0.88;
    return {
      gov: 1.45 * scale,
      tec: 1.38 * scale,
      seg: 1.52 * scale,
      edu: 1.10 * scale,
      eco: 1.22 * scale,
    };
  };

  const sectorBenchmarks = getSectorBenchmarks(metadata.setor || 'Saúde');
  const peerAverageGlobal = (Object.values(sectorBenchmarks).reduce((a, b) => a + b, 0) / 5);

  const gaps = LIST_PRACTICES.filter((practice) => {
    const ans = answers[practice.id];
    return !ans || ans === 'N' || ans === 'P';
  });

  const getGapRecommendation = (id: string) => {
    const dict: Record<string, { action: string; effort: 'Baixo' | 'Médio' | 'Alto' }> = {
      '1.1': { action: 'Elaborar minuta inicial de termos éticos e encaminhar para aprovação da mesa diretiva.', effort: 'Baixo' },
      '1.2': { action: 'Vincular representantes jurídicos, de proteção de dados e TI para formalizar um Comitê via portaria.', effort: 'Médio' },
      '1.3': { action: 'Criar uma planilha simples compartilhada listando todo modelo em uso regulamentando o acesso.', effort: 'Baixo' },
      '1.4': { action: 'Proceder a testes sistemáticos de bias nos algoritmos de triagem que decidem concessão.', effort: 'Alto' },
      '1.5': { action: 'Adicionar parágrafo de responsabilidade civil algorítmica no plano interno de cargos técnicos.', effort: 'Médio' },
      '2.1': { action: 'Integrar relatórios logs automáticos no pipeline de treinamento para verificar a proveniência.', effort: 'Médio' },
      '2.2': { action: 'Criar scripts redundantes de higienização de nulos e duplicidades na esteira PostgreSQL.', effort: 'Baixo' },
      '3.1': { action: 'Rever as bases legais de consentimento com o DPO para evitar sanções e multas da ANPD.', effort: 'Médio' },
      '3.2': { action: 'Realizar blindagens sanitárias nos campos de entrada que recebem dados do cidadão em LLMs.', effort: 'Médio' },
      '4.1': { action: 'Cofinanciar as trilhas básicas online do Enap ou Senai para capacitação massiva da equipe.', effort: 'Baixo' },
      '4.2': { action: 'Iniciar imersões em conformação de vieses demográficos de IA para cientistas de dados.', effort: 'Médio' },
      '5.1': { action: 'Estruturar acordos de inovação aberta com entidades e laboratórios do ecossistema e prefeituras.', effort: 'Médio' },
      '5.2': { action: 'Formar repositório público de pesos seletivo para fins acadêmicos.', effort: 'Baixo' },
    };

    return dict[id] || { action: 'Readequar controles internos, reunindo documentação técnica e implementando revisões humanas contínuas.', effort: 'Médio' };
  };

  const getNplfBadge = (val?: ScoreLevel) => {
    if (!val) {
      return (
        <span className="font-mono text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 uppercase mb-1 dark:bg-slate-900/60 dark:border-slate-800/80 dark:text-slate-400">
          Não respondida
        </span>
      );
    }

    const dict = {
      N: { bg: 'bg-red-500', label: 'Nulo (N)' },
      P: { bg: 'bg-cyan-500', label: 'Parcial (P)' },
      L: { bg: 'bg-blue-600', label: 'Larga (L)' },
      F: { bg: 'bg-emerald-600', label: 'Total (F)' },
    };

    return (
      <span className={`font-mono text-[9px] font-bold text-white px-2 py-0.5 uppercase mb-1 ${dict[val].bg}`}>
        {dict[val].label}
      </span>
    );
  };

  const toggleAccordion = (id: DimensionId) => {
    setExpandedDimension(expandedDimension === id ? null : id);
  };

  return (
    <div className={`min-h-screen pt-28 pb-20 px-6 font-sans select-none transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#0B1120] text-slate-100' : 'bg-slate-50 text-[#0F172A]'
    }`} id="assessment-revision-root">
      
      {/* Header Info Banner */}
      <div className="max-w-7xl mx-auto mb-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className={`text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Revisão de Diagnóstico
            </h2>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Confirme se as respostas representam fielmente os artefatos institucionais de conformidade antes de computar o score.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-end shrink-0">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`px-4 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer shadow-xs ${
                theme === 'dark'
                  ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-slate-300'
                  : 'bg-slate-105 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              <Info className="w-4 h-4 text-brand-primary animate-pulse" />
              <span>{showDetails ? 'Ocultar Detalhes' : 'Como a média é calculada? Detalhes.'}</span>
            </button>

            <button
              onClick={() => { if (onViewReport) { onViewReport(); } else { setShowPdfViewer(true); setActivePdfPage(1); } }}
              className="px-4 py-2 bg-brand-primary hover:brightness-110 text-white rounded-xl font-mono text-[11px] uppercase tracking-wider transition-all font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>Visualizar Relatório Executivo (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED METHODOLOGY AND CALCULATION BREAKDOWN ACCORDION */}
      {showDetails && (
        <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md mb-8 space-y-8 animate-[fadeIn_0.3s_ease]" id="detailed-calculation-panel">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#0C3D6E] block font-sans">Cálculo e Metodologia Rigorosa — MMGIA</span>
              <h3 className="text-xl font-bold text-slate-900 font-sans mt-0.5">Memória de Cálculo da Média de Maturidade Ponderada Prévia</h3>
            </div>
            <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step Explanation */}
            <div className="space-y-6">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2 font-sans">
                <CheckSquare className="w-4 h-4 text-[#1D9E75]" />
                Passo a Passo do Modelo Matemático
              </h4>
              
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-sans">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-[#0C3D6E]"></div>
                  <strong className="text-slate-900 block font-sans">Passo 1: Escala de Classificação NPLF para Valor Numérico</strong>
                  Cada prática selecionada na avaliação herda um score objetivo na escala de maturidade ISO/IEC 33004:2015:
                  <div className="grid grid-cols-4 gap-2 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center text-[10px] font-mono">
                    <div className="p-1"><span className="font-bold text-red-500 block">Nulo (N)</span>0% a 15% · <span className="font-bold bg-red-105 inline-block px-1 rounded text-red-700">0</span></div>
                    <div className="p-1"><span className="font-bold text-cyan-600 block">Parcial (P)</span>&gt;15% a 50% · <span className="font-bold bg-cyan-100 inline-block px-1 rounded text-cyan-700 font-mono">1</span></div>
                    <div className="p-1"><span className="font-bold text-blue-500 block">Larga (L)</span>&gt;50% a 85% · <span className="font-bold bg-blue-100 inline-block px-1 rounded text-blue-700 font-mono">2</span></div>
                    <div className="p-1"><span className="font-bold text-emerald-600 block">Total (F)</span>&gt;85% a 100% · <span className="font-bold bg-emerald-100 inline-block px-1 rounded text-emerald-700 font-mono">3</span></div>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-[#0C3D6E]"></div>
                  <strong className="text-slate-900 block">Passo 2: Médias Niveladas e Notas do Pilar (Dimensão)</strong>
                  Calculamos o score de cada dimensão somando as notas de cada prática e dividindo pelo total de práticas mapeadas no pilar correspondente.
                </div>

                <div className="relative pl-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="absolute left-2 top-4 w-2 h-2 rounded-full bg-brand-accent"></div>
                  <strong className="text-slate-950 block text-xs font-sans">Passo 3: Média Ponderada Oficial</strong>
                  As 5 dimensões são ponderadas pelos pesos de importância estratégica estabelecidos na metodologia para compor o <strong className="text-brand-primary font-sans">Score Global Prévia (0.0 a 3.00)</strong>:
                  <div className="text-[11px] font-mono bg-white p-2.5 rounded-xl border border-slate-200/50 text-slate-800 space-y-1 mt-1">
                    <div className="flex justify-between"><span>* Governança (gov):</span> <span className="font-semibold text-slate-950">25% (Peso 0.25)</span></div>
                    <div className="flex justify-between"><span>* Tecnologia (tec):</span> <span className="font-semibold text-slate-950">20% (Peso 0.20)</span></div>
                    <div className="flex justify-between"><span>* Segurança (seg):</span> <span className="font-semibold text-slate-950">25% (Peso 0.25)</span></div>
                    <div className="flex justify-between"><span>* Educação (edu):</span> <span className="font-semibold text-slate-950">15% (Peso 0.15)</span></div>
                    <div className="flex justify-between"><span>* Ecossistema (eco):</span> <span className="font-semibold text-slate-950">15% (Peso 0.15)</span></div>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-[#0C3D6E]"></div>
                  <strong className="text-slate-900 block font-sans">Passo 4: Escala de Conversão para Nível de Maturidade</strong>
                  A pontuação ponderada final de 0.0 a 3.00 enquadra-se em um dos 6 níveis oficiais de maturidade descritos abaixo.
                </div>
              </div>
            </div>

            {/* Live Arithmetic Breakdown */}
            <div className="space-y-6">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <SparklesIcon className="w-4 h-4 text-brand-accent animate-pulse" />
                Matemática Aplicada ao Seu Diagnóstico Atual
              </h4>

              <div className="space-y-4 bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-inner">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#1D9E75] block font-bold">equacao_ponderada_ativa</span>
                
                {/* Visual equation terms */}
                <div className="space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Governança e Inteligência (gov):</span>
                    <span className="text-slate-100">{currentScores.gov.toFixed(2)} × 0.25 = <strong className="text-white">{(currentScores.gov * 0.25).toFixed(3)}</strong></span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Aspectos Tecnológicos (tec):</span>
                    <span className="text-slate-100">{currentScores.tec.toFixed(2)} × 0.20 = <strong className="text-white">{(currentScores.tec * 0.20).toFixed(3)}</strong></span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Segurança e Privacidade (seg):</span>
                    <span className="text-slate-100">{currentScores.seg.toFixed(2)} × 0.25 = <strong className="text-white">{(currentScores.seg * 0.25).toFixed(3)}</strong></span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Educação e Capacitação (edu):</span>
                    <span className="text-slate-100">{currentScores.edu.toFixed(2)} × 0.15 = <strong className="text-white">{(currentScores.edu * 0.15).toFixed(3)}</strong></span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Ecossistema e Parcerias (eco):</span>
                    <span className="text-slate-100">{currentScores.eco.toFixed(2)} × 0.15 = <strong className="text-white">{(currentScores.eco * 0.15).toFixed(3)}</strong></span>
                  </div>
                  
                  {/* Total row */}
                  <div className="flex justify-between pt-2.5 text-xs text-[#1D9E75] font-bold">
                    <span>Soma Contribuições Ponderadas:</span>
                    <span>{globalScore.toFixed(2)} / 3.00</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl text-[10.5px] text-slate-300 border border-slate-800/60 space-y-2 font-mono">
                  <div className="flex items-center gap-1.5 text-brand-accent">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>Maturidade: <strong>Nível {levelInfo.num} — {levelInfo.label}</strong></span>
                  </div>
                  <p className="font-light text-slate-400 leading-relaxed font-sans text-left">
                    Sua pontuação preliminar de <strong className="text-white font-mono">{globalScore.toFixed(2)}</strong> estabelece seu enquadramento de maturidade abaixo.
                  </p>
                </div>
              </div>

              {/* Range indicator */}
              <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50 space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Distribuição das Faixas Oficiais (MMGIA):</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                  <div className={`p-2 border rounded-xl ${globalScore < 0.5 ? 'border-red-400 bg-red-50 text-red-900 font-bold' : 'border-slate-200 bg-white'}`}>
                    <span className="block text-[9px] text-[#0C3D6E]">0.0 a 0.5</span> Nível 0 — Inexistente
                  </div>
                  <div className={`p-2 border rounded-xl ${globalScore >= 0.5 && globalScore < 1.0 ? 'border-sky-400 bg-sky-50 text-sky-950 font-bold' : 'border-slate-200 bg-white'}`}>
                    <span className="block text-[9px] text-[#0C3D6E]">0.5 a 1.0</span> Nível 1 — Inicial
                  </div>
                  <div className={`p-2 border rounded-xl ${globalScore >= 1.0 && globalScore < 1.5 ? 'border-cyan-400 bg-cyan-50 text-cyan-900 font-bold' : 'border-slate-200 bg-white'}`}>
                    <span className="block text-[9px] text-[#0C3D6E]">1.0 a 1.5</span> Nível 2 — Gerenciado
                  </div>
                  <div className={`p-2 border rounded-xl ${globalScore >= 1.5 && globalScore < 2.0 ? 'border-blue-400 bg-blue-50 text-blue-950 font-bold' : 'border-slate-200 bg-white'}`}>
                    <span className="block text-[9px] text-[#0C3D6E]">1.5 a 2.0</span> Nível 3 — Definido
                  </div>
                  <div className={`p-2 border rounded-xl ${globalScore >= 2.0 && globalScore < 2.5 ? 'border-emerald-400 bg-emerald-50 text-emerald-950 font-bold' : 'border-slate-200 bg-white'}`}>
                    <span className="block text-[9px] text-[#0C3D6E]">2.0 a 2.5</span> Nível 4 — Quantitativo
                  </div>
                  <div className={`p-2 border rounded-xl ${globalScore >= 2.5 ? 'border-indigo-400 bg-indigo-50 text-indigo-950 font-bold' : 'border-slate-200 bg-white'}`}>
                    <span className="block text-[9px] text-[#0C3D6E]">2.5 a 3.0</span> Nível 5 — Otimizado
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Detailed meanings cards list */}
          <div className="border border-slate-100 p-6 rounded-3xl bg-slate-50/50 space-y-4">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5 font-sans">
              <HelpCircle className="w-4 h-4 text-brand-primary" />
              O Que Significa Cada Score de Nível de Maturidade?
            </h4>
            
            <div className="grid grid-cols-1 gap-4 font-sans">
              {[
                {
                  lvl: 0,
                  scoreRange: '0.0 a 0.5',
                  title: 'Nível 0 — Inexistente',
                  desc: 'A organização não possui, nem reconhece, a necessidade de práticas de governança de IA. As atividades são inexistentes, não documentadas ou realizadas de forma caótica, sem qualquer controle ou supervisão.',
                  risco: 'Riscos críticos de segurança: o uso descontrolado de ferramentas (Shadow AI) gera vazamento inevitável de dados confidenciais e alta exposição civil por vieses e falhas cognitivas algorítmicas.'
                },
                {
                  lvl: 1,
                  scoreRange: '0.5 a 1.0',
                  title: 'Nível 1 — Inicial',
                  desc: 'As práticas são ad hoc, reativas e dependentes de indivíduos. O sucesso em iniciativas de IA é imprevisível e ocorre apesar da ausência de processos formais, geralmente impulsionado por "heróis" organizacionais. Há uma conscientização da necessidade de práticas de governança de IA.',
                  risco: 'Ausência de testes formais de vieses demográficos, éticos ou segurança. Elevado risco de descontinuação repentina do conhecimento quando indivíduos-heróis chave se desligam das frentes internas.'
                },
                {
                  lvl: 2,
                  scoreRange: '1.0 a 1.5',
                  title: 'Nível 2 — Gerenciado',
                  desc: 'Práticas básicas de gestão de projetos e de supervisão são aplicadas às iniciativas de IA. Políticas e responsabilidades começam a ser definidas em nível de projeto ou de departamento, mas a aplicação ainda é inconsistente em toda a organização.',
                  risco: 'Embora existam controles focais, a inconsistência gera ilhas de risco desconectadas. Cada iniciativa adota critérios próprios de segurança da informação, abrindo buracos estruturais de conformidade legal.'
                },
                {
                  lvl: 3,
                  scoreRange: '1.5 a 2.0',
                  title: 'Nível 3 — Definido',
                  desc: 'Processos de governança de IA são padronizados, documentados e disseminados em toda a organização, constituindo um "jeito organizacional" de fazer com IA. Há um entendimento comum sobre papéis, responsabilidades e procedimentos.',
                  risco: 'O estabelecimento de processos padronizados e documentados reduz significativamente a ambiguidade e o risco organizacional para um patamar moderado. Há uma base de conformidade, mas o risco principal orbita em torno da rigidez dos processos.'
                },
                {
                  lvl: 4,
                  scoreRange: '2.0 a 2.5',
                  title: 'Nível 4 — Gerenciado Quantitativamente',
                  desc: 'A organização mede e controla o desempenho de seus processos de governança de IA por meio de métricas e dados estatísticos. O desempenho é previsível e os desvios são gerenciados proativamente.',
                  risco: 'Monitoramento contínuo bem estruturado. O risco migra para o perigo da complacência e viés quantitativo: a equipe foca em métricas simplistas e negligencia as nuances qualitativas éticas e novidades de regulação.'
                },
                {
                  lvl: 5,
                  scoreRange: '2.5 a 3.0',
                  title: 'Nível 5 — Otimizado',
                  desc: 'A organização foca na melhoria contínua e proativa dos processos de governança de IA. O feedback, tanto quantitativo quanto qualitativo, é utilizado para identificar oportunidades de inovação e refinar as práticas em um ciclo virtuoso.',
                  risco: 'A governança se torna adaptativa, ágil e diferencial competitivo forte. Riscos minimizados. O único desafio é evitar a complacência e manter o ritmo ativo de monitoramento em face às novas disrupções técnicas no cenário global.'
                }
              ].map((item) => {
                const isSelected = levelInfo.num === item.lvl;
                return (
                  <div
                    key={item.lvl}
                    className={`p-4 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'bg-[#E6F1FB] border-blue-250 text-blue-950 ring-2 ring-[#0C3D6E]/10'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          item.lvl === 0 ? 'bg-red-500' :
                          item.lvl === 1 ? 'bg-sky-500' :
                          item.lvl === 2 ? 'bg-cyan-500' :
                          item.lvl === 3 ? 'bg-blue-600' :
                          item.lvl === 4 ? 'bg-emerald-600' : 'bg-indigo-700'
                        }`}></div>
                        <span className="font-bold text-slate-900 text-xs font-sans tracking-tight">{item.title}</span>
                      </div>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-semibold">Score: {item.scoreRange}</span>
                    </div>
                    <p className="mt-2 text-slate-700 leading-relaxed font-light">{item.desc}</p>
                    <p className="mt-1.5 text-slate-500 italic border-l-2 border-slate-200 pl-2 leading-normal"><strong>Implicações e Riscos:</strong> {item.risco}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FAQ STYLE ACCORDION OF DIMENSIONS */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Missing Questions Warning banner */}
          {overallUnansweredCount > 0 && (
            <div className={`border rounded-3xl p-5 flex items-start gap-3.5 ${
              theme === 'dark' ? 'bg-cyan-950/20 border-cyan-900/40 text-cyan-300' : 'bg-cyan-50 border-cyan-100 text-cyan-900'
            }`} id="revision-warning-banner">
              <AlertTriangle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Práticas em Aberto Encontradas</h4>
                <p className="text-[11px] font-light leading-relaxed">
                  Detector local identificou <strong className="font-bold">{overallUnansweredCount} práticas sem resposta</strong> de um total de 45 diretrizes. Você pode prosseguir e registrar os resultados, mas as faltantes contarão como score zero (Nulo).
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3" id="revision-accordions">
            {order.map((key) => {
              const info = DIMENSIONS[key];
              const stats = getDimensionStats(key);
              const score = getDimensionScore(key);
              const isExpanded = expandedDimension === key;

              return (
                <div
                  key={key}
                  className={`border rounded-3xl overflow-hidden transition-all shadow-sm ${
                    theme === 'dark' ? 'bg-[#141E30] border-slate-800/80 text-white' : 'bg-white border-slate-200/60 text-[#0F172A]'
                  }`}
                  id={`accordion-block-${key}`}
                >
                  {/* Header tab line clickable */}
                  <div
                    onClick={() => toggleAccordion(key)}
                    className={`p-5 flex justify-between items-center cursor-pointer transition select-none ${
                      theme === 'dark' ? 'hover:bg-slate-900/60' : 'hover:bg-slate-105'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }}></div>
                      <h3 className={`font-bold text-sm font-sans tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                        {info.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-slate-400">
                        {stats.answered}/{stats.total} respondidas
                      </span>
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                        theme === 'dark' ? 'text-slate-300 bg-slate-900/60 border border-slate-800/80' : 'text-slate-800 bg-slate-100'
                      }`}>
                        Score: {score.toFixed(2)}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Accordion Expanded rows */}
                  {isExpanded && (
                    <div className={`border-t p-5 space-y-3 divide-y ${
                      theme === 'dark'
                        ? 'border-slate-800/80 bg-slate-900/30 divide-slate-800/80 text-slate-100'
                        : 'border-slate-100/60 bg-slate-50/50 divide-slate-150 text-[#0F172A]'
                    }`} id={`accordion-expanded-${key}`}>
                      {LIST_PRACTICES.filter(p => p.dimensionId === key).map((practice, index) => {
                        const scoreChoice = answers[practice.id];
                        const isAnswered = !!scoreChoice;

                        return (
                          <div
                            key={practice.id}
                            className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 max-w-xl text-left">
                              <span className="font-mono text-[10px] text-slate-400 block font-bold">
                                PRÁTICA {practice.id} (Requisito Nível {practice.level})
                              </span>
                              <p className={`font-sans font-bold leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                {practice.name}
                              </p>
                              <p className={`font-sans font-light leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-530'}`}>
                                {practice.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2.5 self-start sm:self-center">
                              {getNplfBadge(scoreChoice)}
                              
                              <button
                                onClick={() => onGoToPractice(key, index)}
                                className="font-sans text-[10px] font-semibold text-brand-primary hover:underline"
                              >
                                {isAnswered ? 'Alterar' : 'Responder'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY RADAR CHART VISUALIZATION */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`border rounded-3xl p-6 shadow-sm space-y-6 lg:sticky lg:top-24 ${
            theme === 'dark' ? 'bg-[#141E30] border-slate-800/80' : 'bg-white border-slate-200/60 shadow-sm'
          }`} id="revision-radar-sidebar">
            <RadarChart scores={currentScores} />
            
            <div className={`p-4 border rounded-2xl flex items-center gap-3 text-[11px] font-light text-left ${
              theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80 text-slate-300' : 'bg-blue-50/50 border border-[#185FA5]/10 text-slate-650'
            }`}>
              <ClipboardCheck className={`w-5 h-5 shrink-0 ${theme === 'dark' ? 'text-accent' : 'text-brand-primary'}`} />
              <p className="leading-relaxed">
                As notas variam de <strong>0 a 3</strong>. Uma média alta em uma dimensão atesta a plenitude de auditoria estruturada nesta vertical.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FIXED BAR (CALL TO ACTION ACCENT BAND) */}
      <div className="mt-12 bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6" id="revision-bottom-band">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-bold text-sm text-white">Pronto para submeter?</h3>
          <p className="text-xs text-slate-400 font-light font-sans">
            Com as respostas conferidas, você autoriza o cálculo estatístico do seu nível e emissão de diretrizes.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onGoBackToQuestionnaire}
            className="flex-1 md:flex-initial text-center py-3 px-6 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold uppercase font-mono tracking-wider cursor-pointer"
          >
            ← Voltar e Corrigir
          </button>
          
          <button
            onClick={onConfirmAndGenerateResult}
            className="flex-1 md:flex-initial text-center py-3.5 px-8 bg-brand-accent hover:bg-emerald-600 transition text-slate-950 text-xs font-bold uppercase font-mono tracking-wider cursor-pointer font-sans"
          >
            Confirmar e Ver Resultado →
          </button>
        </div>
      </div>

      {/* INTERACTIVE PDF VIEWER OVERLAY MODAL */}
      {showPdfViewer && (
        <div className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-md flex flex-col justify-between font-sans select-none" id="realtime-pdf-document-viewer">
          {/* Viewer Top bar controls */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-white font-sans pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0C3D6E]/10 border border-[#0C3D6E] text-[#1D9E75] rounded-xl flex items-center justify-center">
                <FileCheckIcon className="w-5 h-5 text-brand-accent animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm tracking-tight text-white font-sans">Visualizador do Relatório Executivo Prévio (Rascunho)</h4>
                <p className="text-[10px] text-slate-400 font-mono">Governança e Gestão de IA — MMGIA</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Pagination controls */}
              <div className="flex items-center bg-slate-800 rounded-2xl p-1 font-mono text-xs text-white">
                <button
                  disabled={activePdfPage === 1}
                  onClick={() => setActivePdfPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 hover:bg-slate-700 rounded-xl transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-slate-900 rounded-lg shrink-0">Página {activePdfPage} de 4</span>
                <button
                  disabled={activePdfPage === 4}
                  onClick={() => setActivePdfPage(prev => Math.min(4, prev + 1))}
                  className="px-3 py-1.5 hover:bg-slate-700 rounded-xl transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom controls */}
              <div className="hidden sm:flex items-center bg-slate-800 rounded-2xl p-1 font-mono text-xs">
                <button
                  onClick={() => setPdfZoom(prev => Math.max(75, prev - 25))}
                  className="px-2.5 py-1.5 hover:bg-slate-700 rounded-xl transition cursor-pointer text-white"
                  title="Diminuir Zoom"
                >
                  -
                </button>
                <span className="px-2 text-slate-300">{pdfZoom}%</span>
                <button
                  onClick={() => setPdfZoom(prev => Math.min(150, prev + 25))}
                  className="px-2.5 py-1.5 hover:bg-slate-700 rounded-xl transition cursor-pointer text-white"
                  title="Aumentar Zoom"
                >
                  +
                </button>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-brand-accent hover:brightness-110 text-white text-xs font-bold font-sans rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>Salvar / Imprimir PDF</span>
              </button>

              <button
                onClick={() => setShowPdfViewer(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer animate-[fadeIn_0.2s_ease]"
                title="Fechar Relatório"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Central PDF Canvas Page */}
          <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-slate-950/40 pointer-events-auto" id="pdf-scroller-canvas">
            <div
              className="bg-white shadow-2xl border border-slate-300 rounded-xs p-10 md:p-14 text-slate-800 relative select-text cursor-default max-w-[800px] w-full transition-all duration-300"
              style={{
                fontFamily: 'Georgia, serif',
                minHeight: '1000px',
                transform: `scale(${pdfZoom / 100})`,
                transformOrigin: 'center center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
              }}
            >
              {/* Header colored bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0C3D6E] via-[#1D9E75] to-[#E67E22]" />

              {/* Header on pages 2, 3, 4 */}
              {activePdfPage > 1 && (
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-8 font-mono text-[9px] uppercase tracking-wider text-slate-400 leading-normal">
                  <span>MMGIA — Diagnóstico de Maturidade em Governança de IA</span>
                  <span>Relatório de Avaliação Institucional de IA</span>
                </div>
              )}

              {/* Page 1 Content: Cover Page */}
              {activePdfPage === 1 && (
                <div className="flex flex-col justify-between h-full pt-12 pb-10 font-sans text-left space-y-12">
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#1D9E75] tracking-widest block bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full w-max">
                      documento_executivo_previo · confidencial
                    </span>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase font-sans">
                      Modelo de Maturidade em Governança de Inteligência Artificial (MMGIA)
                    </h3>
                    <p className="text-slate-500 font-light font-mono text-xs uppercase tracking-wider">
                      Relatório Executivo de Maturidade Regulatória e Metodológica
                    </p>
                  </div>

                  <hr className="border-[#0C3D6E] border-2 w-28" />

                  <div className="space-y-4 text-slate-600 font-sans text-xs leading-relaxed">
                    <h4 className="font-bold text-slate-900 text-sm uppercase">1. Introdução & Fundamentação</h4>
                    <p className="font-light text-justify">
                      Este Modelo de Maturidade em Governança de Inteligência Artificial (MMGIA) é um instrumento estratégico projetado para auxiliar organizações públicas e privadas a mensurar, avaliar e aprimorar sua capacidade de desenvolver, adotar, operar e governar soluções de Inteligência Artificial (IA) de forma ética, responsável, segura, legal e eficaz.
                    </p>
                    <p className="font-light text-justify">
                      Alinhado à Estratégia Nacional de Inteligência Artificial (ENIA) 2026-2029, o modelo serve como um roteiro para a recomendação e transformação, permitindo que as instituições analisem seu estado atual, identifiquem lacunas e planejem uma evolução estruturada sustentável de seus algoritmos.
                    </p>
                  </div>

                  {/* Metadata block */}
                  <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl text-left grid grid-cols-2 gap-4 font-mono text-[10px] text-slate-600 uppercase leading-snug">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-light">Entidade</span>
                      <span className="font-bold text-slate-900">Mapeamento Anônimo</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-light">Segmento de Atuação</span>
                      <span className="font-bold text-slate-900 text-slate-800">{metadata.setor || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-light">Natureza Governamental</span>
                      <span className="font-bold text-slate-900">{metadata.natureza || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-light">Porte Organizacional</span>
                      <span className="font-bold text-slate-900">{metadata.porte || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-light">Local / Estado</span>
                      <span className="font-bold text-slate-900">{metadata.estado || 'DF'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-light">Chave Segurança</span>
                      <span className="font-bold text-slate-900 text-[#0C3D6E]">{metadata.code || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-150 pt-6 text-[9px] font-mono text-slate-400">
                    <span>Emissão: 08 de Junho de 2026</span>
                    <span>Versão 1.0 (Oficial)</span>
                  </div>
                </div>
              )}

              {/* Page 2 Content: Methodology, meaning of current score */}
              {activePdfPage === 2 && (
                <div className="space-y-6 font-sans text-left">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2.5 uppercase font-sans">
                    2. Resumo Qualitativo de Maturidade Regulatória
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="bg-[#E6F1FB] border border-blue-200 p-5 rounded-2xl text-center space-y-2">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Média Ponderada MMGIA</span>
                      <div className="text-4xl font-mono font-black text-[#0C3D6E]">{globalScore.toFixed(2)} / 3.00</div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary text-white text-[9.5px] font-mono font-bold uppercaseScale">
                        Nível {levelInfo.num} — {levelInfo.label}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 leading-relaxed font-light">
                      <strong className="text-slate-900 block font-medium">Interpretação Baseada na Metodologia:</strong>
                      <p className="text-[11px] leading-normal text-justify">{levelInfo.desc}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Implicações Práticas & Riscos Mapeados</h4>
                    <p className="text-xs text-slate-500 italic border-l-2 border-slate-300 pl-3 leading-relaxed text-justify">
                      {levelInfo.risco}
                    </p>

                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Alinhamento aos Marcos Globais</h4>
                    <p className="text-xs text-slate-650 leading-relaxed font-light text-justify">
                      Este resultado valida o estado técnico e de conformidade do modelo com as imposições futuras do <strong>PL 2338/2023</strong> (Marco de IA no Congresso Brasileiro), da Lei Geral de Proteção de Dados (<strong>LGPD</strong>), de diretrizes internacionais de design ético (<strong>AI Act da União Europeia</strong>), e com as práticas integradas e unificadas das normas <strong>ISO/IEC 42001</strong>.
                    </p>

                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl font-mono text-[10px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-950 uppercase tracking-wider block text-[9px] text-[#0C3D6E] pb-0.5">Mapeamento Geral de Riscos</span>
                      {globalScore < 1.0 ? (
                        <p>A entidade opera com risco regulatório Crítico. Requer instituição imediata de políticas básicas regulatórias e criação de um Comitê Focal para evitar processos e incidentes relacionados à Shadow IA.</p>
                      ) : globalScore < 2.0 ? (
                        <p>A entidade opera em nível de risco Moderado. Possui processos definidos, porém com inconsistências pontuais de execução departamental. Vital instituir o Relatório de Impacto de IA.</p>
                      ) : (
                        <p>A entidade atinge excelente conformidade regulatória ativa, com riscos residuais mínimos. Recomenda-se manter rotinas periódicas de simulação (Red Teaming) e auditorias de transparência.</p>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-12 right-12 flex justify-between text-[8px] font-mono text-slate-400 border-t border-slate-150 pt-3">
                    <span>MMGIA — Comitê Técnico Informativo</span>
                    <span>Página 2 de 3</span>
                  </div>
                </div>
              )}

              {/* Page 3 Content: Matrix scores, Dimension scores, Benchmarking */}
              {activePdfPage === 3 && (
                <div className="space-y-5 font-sans text-left">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2.5 uppercase font-sans">
                    3. Detalhamento dos Eixos por Média de Importância
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    O cálculo do Score Global ponderado converge o desempenho das práticas de cada pilar de acordo com os seguintes pesos de importância estratégica fundamentados na metodologia oficial:
                  </p>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm text-left">
                    <table className="w-full border-collapse text-[11px] text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-mono text-[8px] uppercase border-b border-slate-200">
                          <th className="p-2.5">Eixo de Maturidade</th>
                          <th className="p-2.5 text-center">Score Obtido</th>
                          <th className="p-2.5 text-center">Peso</th>
                          <th className="p-2.5 text-right flex-1">Contribuição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {[
                          { name: '1. Governança e Inteligência', score: currentScores.gov, weight: '25%', contribution: (currentScores.gov * 0.25) },
                          { name: '2. Desenvolvimento Tecnológico, Pesquisa e Inovação', score: currentScores.tec, weight: '20%', contribution: (currentScores.tec * 0.20) },
                          { name: '3. Segurança, Confiança e Proteção da Sociedade', score: currentScores.seg, weight: '25%', contribution: (currentScores.seg * 0.25) },
                          { name: '4. Educação, Capacitação e Cultura Organizacional', score: currentScores.edu, weight: '15%', contribution: (currentScores.edu * 0.15) },
                          { name: '5. Cooperação e Inserção no Ecossistema', score: currentScores.eco, weight: '15%', contribution: (currentScores.eco * 0.15) },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40">
                            <td className="p-2.5 font-medium text-slate-900">{row.name}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-slate-700">{row.score.toFixed(2)}</td>
                            <td className="p-2.5 text-center font-mono text-slate-500">{row.weight}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-800">+{row.contribution.toFixed(3)}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                          <td className="p-2.5 font-mono text-[9px] uppercase">Score Global Prévia (Total)</td>
                          <td className="p-2.5 text-center font-mono font-black" colSpan={2}>
                            {globalScore.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-brand-primary font-black underline">
                            {globalScore.toFixed(3)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase">Comparativos de Grupo (Setor: {metadata.setor})</h4>
                    <p className="text-xs text-slate-650 font-light leading-normal leading-relaxed text-justify">
                      Sua pontuação ponderada final é de <strong>{globalScore.toFixed(2)}</strong>, enquanto o benchmark da média do segmento ativo no Brasil indica um índice de referência nacional de comumente <strong>{peerAverageGlobal.toFixed(2)}</strong>.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed font-sans">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <strong className="text-slate-900 text-[11px] block font-semibold">Conformidade do Setor</strong>
                        <span className="text-[11px] text-slate-600 block mt-0.5">A organização encontra-se em patamar <strong className="text-emerald-700">{globalScore >= peerAverageGlobal ? 'Vantajoso / Acima da Média' : 'De Atenção / Ajustes Prioritários'}</strong> comparada aos órgãos do grupo.</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <strong className="text-slate-900 text-[11px] block font-semibold">Distância para a Meta Técnica</strong>
                        <span className="text-[11px] text-slate-600 block mt-0.5">Déficit da meta de maturidade padrão (Nível 3 definido com score 2.00) fixado em <strong className={globalScore >= 2.0 ? 'text-emerald-700' : 'text-red-600'}>{(globalScore - 2.0).toFixed(2)}</strong> pontos.</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-12 right-12 flex justify-between text-[8px] font-mono text-slate-400 border-t border-slate-150 pt-3">
                    <span>MMGIA — Comitê Técnico Informativo</span>
                    <span>Página 3 de 4</span>
                  </div>
                </div>
              )}

              {/* Page 4 Content: Roadmaps, Gap resolutions & sign block */}
              {activePdfPage === 4 && (
                <div className="space-y-6 font-sans text-left">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2.5 uppercase font-sans">
                    4. Recomendações Críticas e Assinaturas
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    Mapeamos recomendações de impacto na escala de maturidade. Tratam-se de ações proativas para sanar canais e práticas de conformidade preliminarmente incipientes (Nulo ou Parcial):
                  </p>

                  <div className="space-y-3 font-sans text-xs">
                    {(gaps.length > 0 ? gaps : LIST_PRACTICES.filter(p => p.level <= 2)).slice(0, 3).map((gap, i) => {
                      const rec = getGapRecommendation(gap.id);
                      return (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-150 rounded-xl font-sans text-left">
                          <div className="flex justify-between items-center text-[9px] font-mono mb-1 leading-none">
                            <span className="font-bold text-[#0C3D6E]">Prática {gap.id} — {gap.name}</span>
                            <span className="text-red-500 uppercase font-bold text-[8px]">Alta Prioridade</span>
                          </div>
                          <p className="text-slate-600 text-[10.5px] leading-normal font-sans italic text-left">
                            <strong>Ação Implementação:</strong> {rec.action}
                          </p>
                          <span className="text-[8.5px] text-slate-400 font-mono block mt-1">Eixo: {DIMENSIONS[gap.dimensionId].shortName} · Esforço Operacional: {rec.effort}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <h4 className="font-bold text-slate-900 text-xs font-sans uppercase">Diretrizes Práticas Finais</h4>
                    <p className="text-xs text-slate-650 leading-relaxed font-light mt-1 text-justify">
                      A conformidade regulatória plena dar-se-á com a instituição robusta do <strong>Comitê de IA</strong> formalizado nos diários oficiais municipais, estaduais ou feeds internos, promovendo a transparência, mitigando alucinações cognitivas graves de algoritmos generativos e garantindo as auditorias de explicabilidade perante o cidadão em consonância com o PL 2338/2023.
                    </p>
                  </div>

                  {/* Representative signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-10 text-center text-[10px] font-mono leading-snug">
                    <div className="space-y-1">
                      <div className="border-t border-slate-300 pt-1 text-slate-700 font-bold">Comitê de Governança de IA</div>
                      <span className="text-slate-400 font-light text-[8.5px]">Representante Técnico Integrado MMGIA</span>
                    </div>
                    <div className="space-y-1">
                      <div className="border-t border-slate-300 pt-1 text-slate-700 font-bold">Encarregado de Proteção de Dados (DPO)</div>
                      <span className="text-slate-400 font-light text-[8.5px]">Compliance e Proteção Regulatória da LGPD</span>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-12 right-12 flex justify-between text-[8px] font-mono text-slate-400 border-t border-slate-150 pt-3">
                    <span>Comissão de Ética MMGIA 2026</span>
                    <span>Página 4 de 4</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom controller helper text */}
          <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 text-center text-[10px] font-mono text-slate-400 leading-normal">
            <span>Este visualizador interativo simula fielmente as páginas de exportação física do relatório rascunho em formato A4. Utilize o botão "Salvar / Imprimir PDF" para salvar como arquivo PDF de forma permanente.</span>
          </div>
        </div>
      )}
    </div>
  );
}
