/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Copy,
  Check,
  CheckCircle,
  FileText,
  TrendingUp,
  Download,
  RotateCcw,
  RefreshCw,
  Compass,
  AlertOctagon,
  Sparkles,
  Search,
  BookOpen,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckSquare,
  Printer,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Shield,
  FileCheck,
  Eye
} from 'lucide-react';

const CheckCircle2 = CheckCircle;
const ListTodo = CheckSquare;

import { ScoreLevel, DIMENSIONS, LIST_PRACTICES, DimensionId, AssessmentMetadata } from '../types';
import RadarChart from './RadarChart';

interface ResultProps {
  answers: Record<string, ScoreLevel>;
  metadata: AssessmentMetadata;
  onRestart: () => void;
  onChangeTab: (tab: string) => void;
  onViewReport?: () => void;
  theme?: 'light' | 'dark';
}

export default function Result({ answers, metadata, onRestart, onChangeTab, onViewReport, theme = 'light' }: ResultProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [gapFilter, setGapFilter] = useState<string>('todas');
  const [showDetails, setShowDetails] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [activePdfPage, setActivePdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(metadata.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Score Calculus
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

  // Weighted score according to page 27 and 28 of methodology
  const getGlobalScore = () => {
    const govScore = getDimensionScore('gov');
    const tecScore = getDimensionScore('tec');
    const segScore = getDimensionScore('seg');
    const eduScore = getDimensionScore('edu');
    const ecoScore = getDimensionScore('eco');

    return (
      govScore * 0.25 +
      tecScore * 0.20 +
      segScore * 0.25 +
      eduScore * 0.15 +
      ecoScore * 0.15
    );
  };

  const globalScore = getGlobalScore();
  const progressPercentage = Math.round((globalScore / 3) * 100);

  // Exact levels and interpretations from pg 2, 3 and 28 of the methodology
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
      desc: 'As práticas são ad hoc, reativas e dependentes de indivíduos. O sucesso em iniciativas de IA é imprevisível e ocorre apesar da ausência de processos formais, geralmente impulsionado por "heróis" organizacionais. Há uma conscientização da necessidade de práticas de governança de IA.',
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

  // peer average coordinates based on sectoral metadata
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

  const currentScores: Record<DimensionId, number> = {
    gov: getDimensionScore('gov'),
    tec: getDimensionScore('tec'),
    seg: getDimensionScore('seg'),
    edu: getDimensionScore('edu'),
    eco: getDimensionScore('eco'),
  };

  // Identify gaps: practices with 'N' or 'P' score levels
  const gaps = LIST_PRACTICES.filter((practice) => {
    const ans = answers[practice.id];
    return !ans || ans === 'N' || ans === 'P';
  });

  const filteredGaps = gapFilter === 'todas'
    ? gaps
    : gaps.filter(g => g.dimensionId === gapFilter);

  // Generate tactical recommendations
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

  // Mock download dispatches
  const triggerDownload = (type: string) => {
    setDownloadingType(type);
    setTimeout(() => {
      setDownloadingType(null);
      window.print();
    }, 1800);
  };

  return (
    <div className={`min-h-screen pt-28 pb-20 px-6 font-sans select-none transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#0B1120] text-slate-100' : 'bg-slate-50 text-[#0F172A]'
    }`} id="assessment-result-root">
      
      {/* 2. SCORE HERO */}
      <section className="max-w-7xl mx-auto bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl mb-8 relative" id="result-hero-box">
        {/* Layer 1: Vector light glows */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px]"></div>
        </div>

        <div className="p-8 md:p-12 text-center space-y-6 relative z-1 max-w-2xl mx-auto" id="hero-score-content">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#1D9E75] block">
            diagnóstico_finalizado · score_global_mmgia
          </span>

          <h3 className="text-6xl md:text-7xl font-mono font-black text-white drop-shadow-md">
            {globalScore.toFixed(2)}
          </h3>

          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-brand-accent transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3" id="badge-line">
            <span className="px-3.5 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10.5px] tracking-wider uppercase">
              Score: {progressPercentage}% Ponderado
            </span>
            <span className="px-3.5 py-1 bg-brand-accent/25 text-brand-accent border border-brand-accent/25 rounded-full font-mono text-[10.5px] tracking-wider uppercase font-bold">
              {levelInfo.label} (Nível {levelInfo.num})
            </span>
            <span className="px-3.5 py-1 bg-red-500/10 text-red-400 border border-red-500/10 rounded-full font-mono text-[10.5px] tracking-wider uppercase">
              {levelInfo.risk}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-light">
            Sua organização cumpre em caráter parcial ou pleno grande parte das práticas fundamentais estruturadas de governança no setor de <strong className="text-white">{metadata.setor}</strong>. Confira abaixo o mapeamento detalhado e as prioridades regulatórias.
          </p>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-mono text-[11px] uppercase tracking-wider transition-all border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <Info className="w-4 h-4 text-brand-accent animate-pulse" />
              <span>{showDetails ? 'Ocultar Detalhamento Ponderado' : 'Como minha média foi calculada? Detalhar.'}</span>
            </button>

            <button
              onClick={() => { if (onViewReport) { onViewReport(); } else { setShowPdfViewer(true); setActivePdfPage(1); } }}
              className="px-5 py-2.5 bg-brand-accent hover:brightness-110 text-white rounded-2xl font-mono text-[11px] uppercase tracking-wider transition-all font-bold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>Visualizar Relatório Executivo (PDF)</span>
            </button>
          </div>
        </div>
      </section>

      {/* DETAILED METHODOLOGY AND CALCULATION BREAKDOWN ACCORDION */}
      {showDetails && (
        <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md mb-8 space-y-8 animate-[fadeIn_0.3s_ease]" id="detailed-calculation-panel">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#0C3D6E] block">Cálculo e Metodologia Rigorosa — MMGIA</span>
              <h3 className="text-xl font-bold text-slate-900 font-sans mt-0.5">Memória de Cálculo da Média de Maturidade Ponderada</h3>
            </div>
            <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step Explanation */}
            <div className="space-y-6">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
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
                  Calculamos o score da dimensão somando as notas de cada prática e dividindo pelo total de práticas mapeadas no pilar correspondente.
                </div>

                <div className="relative pl-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="absolute left-2 top-4 w-2 h-2 rounded-full bg-brand-accent"></div>
                  <strong className="text-slate-950 block text-xs">Passo 3: Média Ponderada Oficial</strong>
                  As 5 dimensões são ponderadas pelos pesos de importância estratégica estabelecidos na metodologia (GGIA) para compor o <strong className="text-brand-primary">Score Global (0.0 a 3.00)</strong>:
                  <div className="text-[11px] font-mono bg-white p-2.5 rounded-xl border border-slate-200/50 text-slate-850 space-y-1 mt-1">
                    <div className="flex justify-between"><span>* Governança (gov):</span> <span className="font-semibold text-slate-950">25% (Peso 0.25)</span></div>
                    <div className="flex justify-between"><span>* Tecnologia (tec):</span> <span className="font-semibold text-slate-950">20% (Peso 0.20)</span></div>
                    <div className="flex justify-between"><span>* Segurança (seg):</span> <span className="font-semibold text-slate-950">25% (Peso 0.25)</span></div>
                    <div className="flex justify-between"><span>* Educação (edu):</span> <span className="font-semibold text-slate-950">15% (Peso 0.15)</span></div>
                    <div className="flex justify-between"><span>* Ecossistema (eco):</span> <span className="font-semibold text-slate-950">15% (Peso 0.15)</span></div>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-[#0C3D6E]"></div>
                  <strong className="text-slate-900 block">Passo 4: Escala de Conversão para Nível de Maturidade</strong>
                  A pontuação ponderada final de 0.0 a 3.00 enquadra-se em um dos 6 níveis oficiais de maturidade descritos abaixo.
                </div>
              </div>
            </div>

            {/* Live Arithmetic Breakdown */}
            <div className="space-y-6">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
                Matemática Aplicada ao Seu Diagnóstico
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

                <div className="bg-slate-950 p-4 rounded-xl text-[10.5px] text-slate-350 border border-slate-800/60 space-y-2 font-mono">
                  <div className="flex items-center gap-1.5 text-brand-accent">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>Maturidade: <strong>Nível {levelInfo.num} — {levelInfo.label}</strong></span>
                  </div>
                  <p className="font-light text-slate-450 leading-relaxed">
                    Sua pontuação ponderada de <strong className="text-white">{globalScore.toFixed(2)}</strong> estabelece seu ranqueamento conforme a metodologia.
                  </p>
                </div>
              </div>

              {/* Range indicator */}
              <div className="border border-slate-150 p-4 rounded-2xl bg-slate-50 space-y-2">
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
                  <div className={`p-2 border rounded-xl ${globalScore >= 2.0 && globalScore < 2.5 ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 bg-white'}`}>
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
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand-primary" />
              O Que Significa Cada Score de Nível de Maturidade?
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
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
                    className={`p-4 rounded-2xl border transition-all ${
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
                    <p className="mt-1.5 text-slate-500 italic border-l-2 border-slate-200 pl-2 mt-1.5 leading-normal"><strong>Implicações e Riscos:</strong> {item.risco}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. RECOVERY CODE BOX */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mb-8" id="code-recovery-card">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-sm font-sans font-bold text-slate-900">Seu Código Exclusivo de Recuperação</h4>
          <p className="text-xs text-slate-400 leading-normal font-sans">
            Esta é a única chave que permite editar ou relançar as respostas registradas de forma segura. Guarde bem.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 font-mono text-sm tracking-wider font-bold text-slate-800 w-full md:w-auto text-center">
            {metadata.code}
          </div>
          <button
            onClick={handleCopyCode}
            className="p-3.5 bg-brand-primary text-white hover:brightness-110 active:scale-95 transition rounded-2xl cursor-pointer"
            title="Copiar código"
          >
            {copied ? <Check className="w-5 h-5 text-brand-accent animate-pulse" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 font-sans">
        
        {/* 3. DIMENSION SCORES DETAIL (LEFT) */}
        <div className={`lg:col-span-7 border rounded-3xl p-6 shadow-sm space-y-6 ${
          theme === 'dark' ? 'bg-[#141E30] border-slate-800/80 text-white' : 'bg-white border-slate-250 text-[#0F172A]'
        }`} id="dimension-scorebars">
          <div>
            <h4 className="text-sm font-semibold uppercase font-mono tracking-wider text-brand-primary">Scores por Pilar de Maturidade</h4>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              As colunas demonstram o desempenho setorial comparado à meta de excelência regulatória (Maturidade Nível 3).
            </p>
          </div>

          <div className="space-y-4" id="scores-detail-list">
            {(Object.keys(DIMENSIONS) as DimensionId[]).map((key) => {
              const info = DIMENSIONS[key];
              const score = currentScores[key];
              const percent = (score / 3) * 100;

              return (
                <div key={key} className="space-y-1.5 flex flex-col">
                  <div className="flex justify-between items-center text-xs font-mono font-bold">
                    <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{info.name}</span>
                    <span className={info.textColor}>
                      {score.toFixed(2)} <span className="text-slate-400 font-light">/ 3.00</span>
                    </span>
                  </div>
                  {/* Progress Bar Container with red target marks at 2.00 (Level 3 defined) */}
                  <div className={`h-3 rounded-full relative overflow-hidden flex items-center ${
                    theme === 'dark' ? 'bg-slate-800/60' : 'bg-slate-100'
                  }`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: info.color,
                        width: `${percent}%`,
                      }}
                    ></div>
                    {/* Tick for Nível 3 defined threshold (2.00 is 66.6% width) */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 border-r-2 border-red-500 border-dashed z-5"
                      style={{ left: '66.6%' }}
                      title="Meta Nível 3 (Definido)"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`pt-2 border-t flex items-center gap-2 text-[10px] text-slate-400 font-mono ${
            theme === 'dark' ? 'border-slate-800/80' : 'border-slate-100'
          }`}>
            <span className="w-1.5 h-3 bg-red-500 border-r border-dashed inline-block"></span>
            <span>A linha vermelha pontilhada representa a meta recomendada de excelência (Nível 3 - Definido) para o setor público.</span>
          </div>
        </div>

        {/* 4. RADAR CHART & BENCHMARKS (RIGHT) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <RadarChart scores={currentScores} benchmarkScores={sectorBenchmarks} />

          {/* Benchmark Indicators */}
          <div className={`border rounded-3xl p-6 shadow-sm space-y-4 flex-1 flex flex-col justify-between ${
            theme === 'dark' ? 'bg-[#141E30] border-slate-800/80' : 'bg-white border-slate-250 shadow-sm'
          }`} id="group-benchmark-panel">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-brand-primary block">
                peer_group_benchmarking
              </span>
              <h4 className={`text-base font-bold tracking-tight mt-1 font-sans ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Grupo Comparativo: {metadata.setor} · {metadata.porte}
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center" id="benchmark-numbers">
              <div className={`p-3 border rounded-2xl ${
                theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className={`text-lg font-mono font-bold ${theme === 'dark' ? 'text-brand-accent' : 'text-[#0C3D6E]'}`}>{globalScore.toFixed(2)}</span>
                <span className="text-[8px] uppercase font-mono text-slate-400 block mt-1 animate-pulse">Seu Score</span>
              </div>
              <div className={`p-3 border rounded-2xl ${
                theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className={`text-lg font-mono font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-705'}`}>{peerAverageGlobal.toFixed(2)}</span>
                <span className="text-[8px] uppercase font-mono text-slate-400 block mt-1">Média Peer</span>
              </div>
              <div className={`p-3 border rounded-2xl ${
                theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className="text-lg font-mono font-bold text-[#1D9E75]">2.71</span>
                <span className="text-[8px] uppercase font-mono text-slate-400 block mt-1">Melhor Score</span>
              </div>
            </div>

            <div className={`p-4 border rounded-2xl text-xs space-y-1 ${
              theme === 'dark' ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50/50 border border-emerald-100/50 text-slate-650'
            }`}>
              <p className={`font-semibold font-sans ${theme === 'dark' ? 'text-emerald-250' : 'text-emerald-950'}`}>Percentil de Maturidade: 68%</p>
              <p className={`text-[11px] leading-normal ${theme === 'dark' ? 'text-emerald-300/80' : 'text-emerald-700'}`}>
                Sua organização está acima de 68% dos respondentes do grupo econômico de {metadata.setor} em todo o Brasil.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. GAP ANALYSIS AND RECOMMENDATIONS */}
      <section className={`border rounded-3xl p-8 shadow-sm mb-8 font-sans ${
        theme === 'dark' ? 'bg-[#141E30] border-slate-800/80 text-white' : 'bg-white border-slate-250 shadow-sm'
      }`} id="gap-analysis-module">
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b pb-6 ${
          theme === 'dark' ? 'border-slate-800/80' : 'border-slate-150'
        }`}>
          <div className="space-y-1">
            <h3 className={`text-xl font-extrabold tracking-tight font-sans ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
              Análise de Lacunas Regulatórias (Gaps)
            </h3>
            <p className={`text-xs font-sans ${theme === 'dark' ? 'text-slate-400' : 'text-slate-520'}`}>
              Diretrizes onde o diagnóstico constatou conformidade "Nulo" ou "Parcial", priorizadas por complexidade operacional e requisitos de nível.
            </p>
          </div>

          {/* Filter dimension pills */}
          <div className="flex flex-wrap gap-1.5" id="gap-filters" font-sans="true">
            <button
              onClick={() => setGapFilter('todas')}
              className={`px-3 py-1 text-[10px] font-mono uppercase font-bold rounded-full border cursor-pointer transition ${
                gapFilter === 'todas'
                  ? (theme === 'dark' ? 'bg-[#185FA5] text-white border-transparent shadow' : 'bg-slate-950 text-white border-slate-950 shadow-sm')
                  : (theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-500 border-slate-150 hover:border-slate-250')
              }`}
            >
              Todas ({gaps.length})
            </button>
            {Object.keys(DIMENSIONS).map((key) => {
              const info = DIMENSIONS[key as DimensionId];
              const count = gaps.filter(g => g.dimensionId === key).length;
              return (
                <button
                  key={key}
                  disabled={count === 0}
                  onClick={() => setGapFilter(key)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase font-bold rounded-full border cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed ${
                    gapFilter === key
                      ? (theme === 'dark' ? 'bg-[#185FA5] text-white border-transparent shadow' : 'text-white border-slate-950 bg-slate-950 shadow-sm')
                      : (theme === 'dark' ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850' : 'bg-white text-slate-600 border-slate-150 hover:border-slate-250')
                  }`}
                >
                  {info.shortName} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Gap cards grid list */}
        {filteredGaps.length === 0 ? (
          <div className="text-center py-12 max-w-sm mx-auto space-y-2 font-sans">
            <CheckCircle className="w-12 h-12 text-[#124234] mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-sm">Nenhum Gap Crítico Identificado</h4>
            <p className="text-xs text-slate-400">
              Sua conformidade é larga ou total em todas as práticas filtradas! Parabéns por manter o compliance elevado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans" id="gap-cards-list">
            {filteredGaps.slice(0, 6).map((gap) => {
              const rec = getGapRecommendation(gap.id);
              const isHighPriority = gap.level === 1;
              const isMediumPriority = gap.level === 2 || gap.level === 3;

              return (
                <div
                  key={gap.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between space-y-4 ${
                    theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80 text-white' : 'bg-slate-50 border-slate-150 text-[#0F172A]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center" id={`gap-badges-${gap.id}`}>
                      <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase text-white ${
                        isHighPriority ? 'bg-red-500' : isMediumPriority ? 'bg-cyan-500' : 'bg-blue-600'
                      }`}>
                        Prioridade {isHighPriority ? 'Alta' : isMediumPriority ? 'Média' : 'Baixa'}
                      </span>

                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                        theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {DIMENSIONS[gap.dimensionId].shortName}
                      </span>
                    </div>

                    <h4 className={`font-bold text-sm font-sans tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                      Prática {gap.id} — {gap.name}
                    </h4>

                    <p className={`text-xs leading-normal font-light ${theme === 'dark' ? 'text-slate-400' : 'text-slate-505'}`}>
                      {gap.description}
                    </p>
                  </div>

                  <div className={`p-4 border rounded-xl space-y-2 ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-805 text-slate-300' : 'bg-white border-slate-100 text-[#0F172A]'
                  }`}>
                    <span className="text-[10px] font-mono uppercase font-bold text-brand-primary block tracking-wider">Ação Recomendada:</span>
                    <p className={`text-xs italic font-mono leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-650'}`}>
                      {rec.action}
                    </p>
                    <div className={`flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1.5 border-t ${
                      theme === 'dark' ? 'border-slate-800/60' : 'border-slate-50'
                    }`}>
                      <span>Esforço: <strong className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-600'}`}>{rec.effort}</strong></span>
                      {gap.legalReference && (
                        <span className="flex items-center gap-0.5 text-brand-accent font-bold">
                          <BookOpen className="w-3 h-3" />
                          {gap.legalReference}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. MOCK ACTION PLAN TIMESHEET */}
      <section className={`border rounded-3xl p-8 shadow-sm mb-8 ${
        theme === 'dark' ? 'bg-[#141E30] border-slate-800/80 text-white' : 'bg-white border-slate-250 shadow-sm text-[#0F172A]'
      }`} id="action-plan">
        <div className="space-y-1 mb-8 pt-1">
          <h3 className={`text-lg font-bold tracking-tight font-sans ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Plano de Implementação Prática</h3>
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Mapeamento sequencial de rotinas voltadas para atingir robustez algorítmica.</p>
        </div>

        <div className="space-y-4 font-sans">
          {[
            { step: '01', title: 'Formalização e Portarias Jurídicas', desc: 'Constituição do Comitê Ético e designação oficial do DPO (Encarregado de Privacidade) assumindo as chaves algorítmicas.', dim: 'Governança', effort: 'Baixo esforço', time: 'Semana 1-2' },
            { step: '02', title: 'Blindagem de Inputs e Letramento Básico', desc: 'Saneamento preventivo em requisições de prompts e disparos massivos de cartilhas de uso responsible para toda a corporação.', dim: 'Segurança', effort: 'Médio esforço', time: 'Semana 3-4' },
            { step: '03', title: 'Inventário Geral de Chaves e Engenhos de IA', desc: 'Centralização organizada de repositórios de dados no padrão JSON especificando o ciclo ativo e finalidade de modelos de treino.', dim: 'Tecnologia', effort: 'Médio esforço', time: 'Semana 5-6' },
            { step: '04', title: 'Simulacros Éticos de Ataque (Red Teaming)', desc: 'Recrutamento de equipe e workshops dedicados para teste de vazamentos algorítmicos voluntários e testes de viesses demográficos.', dim: 'Segurança', effort: 'Alto esforço', time: 'Mês 2' }
          ].map((item, index) => (
            <div
              key={item.step}
              className={`p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border ${
                theme === 'dark' ? 'bg-[#0B1120] border-slate-800/80' : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center font-mono font-bold text-sm shrink-0">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h4 className={`font-bold text-sm font-sans tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>{item.title}</h4>
                  <p className={`text-xs leading-normal max-w-2xl font-sans font-light ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start md:self-center text-[10px] font-mono">
                <span className={`px-2.5 py-0.5 rounded-full ${
                  theme === 'dark' ? 'bg-slate-900 border border-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>{item.dim}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                  theme === 'dark' ? 'bg-[#185FA5]/20 text-accent' : 'bg-blue-50 text-brand-primary'
                }`}>{item.effort}</span>
                <span className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. EXPORT ACTIONS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-sans" id="action-buttons-row">
        
        <button
          onClick={() => { setShowPdfViewer(true); setActivePdfPage(1); }}
          className="py-4 bg-brand-primary text-white font-sans text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          Visualizar & Exportar PDF
        </button>

        <button
          onClick={() => triggerDownload('tecnico')}
          disabled={downloadingType !== null}
          className="py-4 bg-brand-accent text-white font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-sans"
        >
          {downloadingType === 'tecnico' ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Imprimir Relatório Técnico
        </button>

        <button
          onClick={() => onChangeTab('mapa')}
          className={`py-4 border font-sans text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#141E30] hover:bg-slate-800 border-slate-800/80 text-white hover:text-white'
              : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-brand-primary" />
          Ver Painel Geral
        </button>

        <button
          onClick={onRestart}
          className={`py-4 bg-transparent font-sans text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-511 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Novo Diagnóstico
        </button>
      </div>

      {/* DOWNLOAD IN PROGRESS MODAL TOAST */}
      {downloadingType && (
        <div className="fixed inset-0 z-200 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center px-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-4 max-w-sm shadow-2xl">
            <RefreshCw className="w-10 h-10 text-brand-primary mx-auto animate-spin" />
            <h4 className="font-bold text-slate-900 font-sans text-sm">Compilando Relatório PDF...</h4>
            <p className="text-xs text-slate-400 font-mono">
              Injetando dados de benchmarking, gráficos setoriais e notas de {metadata.estado}...
            </p>
          </div>
        </div>
      )}

      {/* INTERACTIVE PDF VIEWER OVERLAY MODAL */}
      {showPdfViewer && (
        <div className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-md flex flex-col justify-between font-sans" id="realtime-pdf-document-viewer">
          {/* Viewer Top bar controls */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-white font-sans">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0C3D6E]/10 border border-[#0C3D6E] text-[#1D9E75] rounded-xl flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-brand-accent animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm tracking-tight text-white font-sans">Visualizador do Relatório Executivo Oficial</h4>
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
                className="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Fechar Relatório"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Central PDF Canvas Page */}
          <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-slate-950/40" id="pdf-scroller-canvas">
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
                      documento_executivo_oficial · confidencial
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
                    <p className="font-light">
                      Este Modelo de Maturidade em Governança de Inteligência Artificial (MMGIA) é um instrumento estratégico projetado para auxiliar organizações públicas e privadas a mensurar, avaliar e aprimorar sua capacidade de desenvolver, adotar, operar e governar soluções de Inteligência Artificial (IA) de forma ética, responsável, segura, legal e eficaz.
                    </p>
                    <p className="font-light">
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
                      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Média Ponderada Oficial MMGIA</span>
                      <div className="text-4xl font-mono font-black text-[#0C3D6E]">{globalScore.toFixed(2)} / 3.00</div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary text-white text-[9.5px] font-mono font-bold uppercase">
                        Nível {levelInfo.num} — {levelInfo.label}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 leading-relaxed font-light">
                      <strong className="text-slate-900 block font-medium">Interpretação Baseada na Metodologia:</strong>
                      <p className="text-[11px] leading-normal">{levelInfo.desc}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Implicações Práticas & Riscos Mapeados</h4>
                    <p className="text-xs text-slate-500 italic border-l-2 border-slate-300 pl-3 leading-relaxed">
                      {levelInfo.risco}
                    </p>

                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-tight">Alinhamento aos Marcos Globais</h4>
                    <p className="text-xs text-slate-650 leading-relaxed font-light">
                      Este resultado valida o estado técnico e de conformidade do modelo com as imposições futuras do <strong>PL 2338/2023</strong> (Marco de IA no Congresso Brasileiro), da Lei Geral de Proteção de Dados (<strong>LGPD</strong>), de diretrizes internacionais de design ético (<strong>AI Act da União Europeia</strong>), e com as práticas integradas e unificadas das normas <strong>ISO/IEC 42001</strong>.
                    </p>

                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl font-mono text-[10px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-950 uppercase tracking-wider block text-[9px] text-[#0C3D6E] pb-0.5">Mapeamento Geral de Riscos</span>
                      {globalScore < 1.0 ? (
                        <p>A entidade opera com risco regulatório Crítico. Requer instituição imediata de políticas básicas regulatórias e criação de um Comitê Focal para evitar processos e incidentes relacionados à Shadow AI.</p>
                      ) : globalScore < 2.0 ? (
                        <p>A entidade opera em nível de risco Moderado. Possui processos definidos, porém com inconsistências pontuais de execução departamental. Vital instituir o Relatório de Impacto de IA.</p>
                      ) : (
                        <p>A entidade atinge excelente conformidade regulatória ativa, com riscos residuais mínimos. Recomenda-se manter rotinas periódicas de simulação (Red Teaming) e auditorias de transparência.</p>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-12 right-12 flex justify-between text-[8px] font-mono text-slate-400 border-t border-slate-150 pt-3">
                    <span>MMGIA — Comitê Técnico Informativo</span>
                    <span>Página 2 de 4</span>
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
                          <td className="p-2.5 font-mono text-[9px] uppercase">Score Global Final Regido (Total)</td>
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
                    <p className="text-xs text-slate-650 font-light leading-normal leading-relaxed">
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
                    Mapeamos recomendações de impacto na escala de maturidade. Tratam-se de ações proativas para sanar canais e práticas diagnosticadas com conformidade incipiente (Nulo ou Parcial):
                  </p>

                  <div className="space-y-3 font-sans text-xs">
                    {(filteredGaps.length > 0 ? filteredGaps : LIST_PRACTICES.filter(p => p.level <= 2)).slice(0, 3).map((gap, i) => {
                      const rec = getGapRecommendation(gap.id);
                      return (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-150 rounded-xl font-sans text-left">
                          <div className="flex justify-between items-center text-[9px] font-mono mb-1 leading-none">
                            <span className="font-bold text-[#0C3D6E]">Prática {gap.id} — {gap.name}</span>
                            <span className="text-red-500 uppercase font-bold text-[8px]">Alta Prioridade</span>
                          </div>
                          <p className="text-slate-600 text-[10.5px] leading-normal font-sans italic">
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
          <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 text-center text-[10px] font-mono text-slate-450 leading-normal">
            <span>Este visualizador interativo simula fielmente as páginas de exportação física do relatório MMGIA em formato A4. Utilize o botão "Salvar / Imprimir PDF" para salvar como arquivo PDF no seu computador ou celular de forma permanente.</span>
          </div>
        </div>
      )}
    </div>
  );
}
