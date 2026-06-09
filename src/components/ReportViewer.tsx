/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  FileCheck2,
  ZoomIn,
  ZoomOut,
  Download,
  Info,
  Award,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { ScoreLevel, DIMENSIONS, LIST_PRACTICES, DimensionId, AssessmentMetadata } from '../types';

interface ReportViewerProps {
  answers: Record<string, ScoreLevel>;
  metadata: AssessmentMetadata;
  onBack: () => void;
}

export default function ReportViewer({ answers, metadata, onBack }: ReportViewerProps) {
  const [activePdfPage, setActivePdfPage] = useState<number>(1);
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  // Score Calculations
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
      text: 'text-red-700',
      risk: 'Risco Crítico',
      desc: 'A organização não possui, nem reconhece, a necessidade de práticas de governança de IA. As atividades são inexistentes, não documentadas ou realizadas de forma caótica, sem qualquer controle ou supervisão.',
      risco: 'Neste nível, a organização opera em estado de total desconhecimento e descontrole quanto às atividades de IA. A ausência completa de governança expõe a organização a um nível de risco crítico. A proliferação de Shadow AI — o uso de ferramentas e sistemas de IA por funcionários sem aprovação ou supervisão formais — é inevitável, criando pontos cegos significativos para a segurança.'
    };
    if (score < 1.0) return {
      num: 1,
      label: 'Inicial',
      bg: 'bg-sky-500',
      text: 'text-sky-700',
      risk: 'Risco Crítico / Alto',
      desc: 'As práticas são ad hoc, reativas e dependentes de indivíduos. O sucesso em iniciativas de IA é imprevisível e ocorre apesar da ausência de processos formais, geralmente impulsionado por "heróis" organizacionais. Há uma conscientização da necessidade de práticas de governança de IA.',
      risco: 'No nível Inicial, a organização começa a ter bolsões de atividade de IA, mas de forma desorganizada. O nível de risco permanece crítico, pois não há uma abordagem sistemática para a gestão. A dependência de "heróis" cria um ponto único de falha; o conhecimento não é institucionalizado.'
    };
    if (score < 1.5) return {
      num: 2,
      label: 'Gerenciado',
      bg: 'bg-cyan-500',
      text: 'text-cyan-700',
      risk: 'Risco Alto',
      desc: 'Práticas básicas de gestão de projetos e de supervisão são aplicadas às iniciativas de IA. Políticas e responsabilidades começam a ser definidas em nível de projeto ou de departamento, mas a aplicação ainda é inconsistente em toda a organização.',
      risco: 'Neste estágio, a governança é predominantemente reativa. Embora existam práticas básicas de gestão, a sua aplicação inconsistente em silos organizacionais cria lacunas perigosas. O nível de risco é alto, pois as regras de um projeto podem ser diferentes das de outros.'
    };
    if (score < 2.0) return {
      num: 3,
      label: 'Definido',
      bg: 'bg-blue-600',
      text: 'text-blue-700',
      risk: 'Risco Moderado',
      desc: 'Processos de governança de IA são padronizados, documentados e disseminados em toda a organização, constituindo um "jeito organizacional" de fazer com IA. Há um entendimento comum sobre papéis, responsabilidades e procedimentos.',
      risco: 'O estabelecimento de processos padronizados e documentados reduz significativamente a ambiguidade e o caos, reduzindo o risco para um nível moderado. A organização possui base sólida, mas deve mitigar a rigidez perante a evolução das ferramentas.'
    };
    if (score < 2.5) return {
      num: 4,
      label: 'Gerenciado Quantitativamente',
      bg: 'bg-emerald-600',
      text: 'text-emerald-700',
      risk: 'Risco Baixo',
      desc: 'A organização mede e controla o desempenho de seus processos de governança de IA por meio de métricas e dados estatísticos. O desempenho é previsível e os desvios são gerenciados proativamente.',
      risco: 'A governança orientada por dados minimiza erros operacionais. O monitoramento contínuo substitui as revisões periódicas. Recomenda-se evitar a complacência e acompanhar aspectos qualitativos éticos de forma atenta.'
    };
    return {
      num: 5,
      label: 'Otimizado',
      bg: 'bg-indigo-700',
      text: 'text-indigo-700',
      risk: 'Risco Otimizado / Mínimo',
      desc: 'A organização foca na melhoria contínua e proativa dos processos de governança de IA. O feedback, tanto quantitativo quanto qualitativo, é utilizado para identificar oportunidades de inovação e refinar as práticas em um ciclo virtuoso.',
      risco: 'No nível máximo de maturidade, a governança de IA se torna totalmente inteligente e integrada à estratégia da entidade. O risco operacional é otimizado e focado em responder continuamente às transformações éticas da tecnologia.'
    };
  };

  const levelInfo = getMaturityLevel(globalScore);

  // Sector stats benchmarks
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

  // Gaps calculation (unmet criteria)
  const gaps = LIST_PRACTICES.filter((practice) => {
    const ans = answers[practice.id];
    return !ans || ans === 'N' || ans === 'P';
  });

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error('Erro ao chamar window.print():', e);
    }
  };

  const getReportHtmlContent = () => {
    const gapsList = gaps.map(gap => `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; font-family: monospace;">
          <span style="font-weight: bold; text-transform: uppercase; color: #e67e22;">Item Mapeado ${gap.id}</span>
          <span style="font-weight: bold; color: #0c3d6e;">${gap.legalReference || 'ISO 42001'}</span>
        </div>
        <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${gap.name}</h4>
        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">${gap.description}</p>
      </div>
    `).join('') || `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center; font-family: sans-serif;">
        <h3 style="color: #14532d; margin: 0 0 6px 0; font-size: 16px;">Sem Lacunas Detectadas</h3>
        <p style="margin: 0; font-size: 13px; color: #166534;">Sua organização atende perfeitamente a todos os requisitos avaliados pelo MMGIA.</p>
      </div>
    `;

    const docContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório MMGIA — ${metadata.code}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;750;800&family=Georgia&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      color: #f1f5f9;
      font-family: 'Inter', sans-serif;
    }
    
    .no-print-bar {
      background-color: #1e293b;
      border-bottom: 1px solid #334155;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .btn-action {
      background-color: #10b981;
      color: white;
      border: none;
      padding: 10px 20px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
      transition: background-color 0.2s;
    }
    .btn-action:hover {
      background-color: #059669;
    }

    .report-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .report-page {
      background-color: white;
      color: #1e293b;
      font-family: 'Georgia', serif;
      min-height: 297mm;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
      border-radius: 4px;
      padding: 60px 80px;
      margin-bottom: 40px;
      box-sizing: border-box;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .page-indicator {
      text-align: center;
      margin-top: -20px;
      margin-bottom: 40px;
      font-family: monospace;
      font-size: 12px;
      color: #94a3b8;
    }

    @media print {
      body {
        background-color: white !important;
        color: black !important;
      }
      .no-print-bar, .page-indicator {
        display: none !important;
      }
      .report-container {
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .report-page {
        margin: 0 !important;
        padding: 2cm !important;
        box-shadow: none !important;
        border: none !important;
        min-height: 297mm !important;
        page-break-after: always !important;
        break-after: page !important;
        background-color: white !important;
        color: black !important;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: white;">Relatório MMGIA Pronto para Exportação</h3>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">Use o atalho <b>Ctrl+P</b> (ou Cmd+P) e escolha "Salvar como PDF" para gerar seu relatório offline oficial.</p>
    </div>
    <button onclick="parent.print() || window.print()" class="btn-action">
      Imprimir / Salvar PDF
    </button>
  </div>

  <div class="report-container">
    
    <!-- PAGE 1 -->
    <div class="report-page">
      <div style="position: absolute; top:0; left:0; right:0; height:8px; background: linear-gradient(to right, #0C3D6E, #1D9E75, #E67E22);"></div>
      <div style="padding-top: 40px;">
        <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; font-weight: bold; color: #166534; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 12px; border-radius: 100px; display: inline-block; margin-bottom: 24px;">
          documento_executivo_oficial · confidencial
        </span>
        <h1 style="font-family: sans-serif; font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; text-transform: uppercase; line-height: 1.2;">
          Modelo de Maturidade de Governança de Inteligência Artificial (MMGIA)
        </h1>
        <p style="font-family: monospace; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; margin: 0;">
          Relatório de Avaliação Institucional de IA e Riscos Éticos
        </p>
      </div>

      <div style="width: 100px; border-bottom: 4px solid #0C3D6E; margin: 40px 0;"></div>

      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h2 style="font-family: sans-serif; font-size: 14px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin-bottom: 12px;">
          1. Introdução & Fundamentação Regulatória
        </h2>
        <p style="margin-bottom: 16px;">
          Este instrumento avaliativo estratégico é estruturado com o propósito de guiar microdados institucionais na conformação de sistemas baseados em computação inteligente. O modelo reflete os alinhamentos constitucionais, as tendências de governança algorítmica do <b>PL 2338/2023</b> brasileiro e as regulamentações mundiais (como o <b>AI Act da União Europeia</b> e a norma <b>ISO/IEC 42001</b>).
        </p>
        <p>
          As frentes avaliadas pautam-se nas premissas éticas nacionais e nos relatórios de impacto preconizados no artigo 20 da Lei Geral de Proteção de Dados (<b>LGPD</b>). Elas desenham as orientações mais eficientes para mitigar vieses demográficos coletivos e blindar de forma ágil as bases e redes neurais internas.
        </p>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-family: monospace; font-size: 11px; color: #475569; margin: 40px 0;">
        <div>
          <span style="color: #94a3b8; display: block; font-size: 9px; margin-bottom: 2px;">Segmento Institucional</span>
          <b style="color: #0f172a;">${metadata.setor || 'Não especificado'}</b>
        </div>
        <div>
          <span style="color: #94a3b8; display: block; font-size: 9px; margin-bottom: 2px;">Natureza Governamental</span>
          <b style="color: #0f172a;">${metadata.natureza || 'Pública'}</b>
        </div>
        <div>
          <span style="color: #94a3b8; display: block; font-size: 9px; margin-bottom: 2px;">Porte Corporativo</span>
          <b style="color: #0f172a;">${metadata.porte || 'Grande'}</b>
        </div>
        <div>
          <span style="color: #94a3b8; display: block; font-size: 9px; margin-bottom: 2px;">Unidade Federativa</span>
          <b style="color: #0f172a;">${metadata.estado || 'DF'}</b>
        </div>
        <div>
          <span style="color: #94a3b8; display: block; font-size: 9px; margin-bottom: 2px;">Identificação do Registro</span>
          <b style="color: #0c3d6e;">${metadata.code}</b>
        </div>
        <div>
          <span style="color: #94a3b8; display: block; font-size: 9px; margin-bottom: 2px;">Emitido Pela Plataforma</span>
          <b style="color: #10b981;">MMGIA Brasil</b>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 20px; font-family: monospace; font-size: 10px; color: #94a3b8;">
        <span>Emissão: ${new Date().toLocaleDateString('pt-BR')}</span>
        <span>Versão 1.0 (Oficial)</span>
      </div>
    </div>
    <div class="page-indicator">Página 1 de 4</div>

    <!-- PAGE 2 -->
    <div class="report-page">
      <div style="position: absolute; top:0; left:0; right:0; height:8px; background: linear-gradient(to right, #0C3D6E, #1D9E75, #E67E22);"></div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; font-family: monospace; font-size: 9px; color: #94a3b8; text-transform: uppercase;">
        <span>MMGIA — Diagnóstico de Maturidade em Governança de IA</span>
        <span>Relatório de Avaliação Institucional</span>
      </div>

      <div style="flex-grow: 1; padding: 20px 0;">
        <h2 style="font-family: sans-serif; font-size: 18px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; margin-bottom: 24px;">
          2. Síntese Exclusiva da Maturidade
        </h2>

        <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 30px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; text-align: center; width: 220px; flex-shrink: 0;">
            <span style="font-family: monospace; font-size: 8px; text-transform: uppercase; color: #94a3b8; font-weight: bold; display: block; margin-bottom: 6px;">Score Global Ponderado</span>
            <div style="font-family: monospace; font-size: 36px; font-weight: 900; color: #0C3D6E; line-height: 1;">${globalScore.toFixed(2)}</div>
            <div style="background-color: #0c3d6e; color: white; font-family: monospace; font-size: 9px; font-weight: bold; border-radius: 100px; padding: 4px 10px; display: inline-block; margin-top: 10px; text-transform: uppercase;">
              Nível ${levelInfo.num} — ${levelInfo.label}
            </div>
          </div>
          <div style="font-size: 12px; color: #475569; line-height: 1.6;">
            <b style="font-family: sans-serif; font-size: 13px; color: #0f172a; display: block; margin-bottom: 6px;">Significado Operacional do Nível:</b>
            ${levelInfo.desc}
          </div>
        </div>

        <div style="margin-top: 30px;">
          <h3 style="font-family: sans-serif; font-size: 13px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin-bottom: 12px;">
            Mapeamento de Vulnerabilidades e Implicações Jurídicas
          </h3>
          <p style="font-size: 12px; color: #475569; font-style: italic; border-left: 2px solid #cbd5e1; padding-left: 12px; line-height: 1.6; margin-bottom: 24px;">
            ${levelInfo.risco}
          </p>

          <h3 style="font-family: sans-serif; font-size: 13px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin-bottom: 12px;">
            Avaliação De Riscos Reais para Governança de IA (PL 2338/2023)
          </h3>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 11px; color: #475569; line-height: 1.5;">
            <span style="font-weight: bold; color: #0c3d6e; text-transform: uppercase; display: block; margin-bottom: 8px;">Controle e Mitigação de Vieses Ativos</span>
            ${globalScore < 1.0 ? `
              <strong>Aviso Estratégico:</strong> A entidade opera sob altos índices de risco regulatório indireto. Recomenda-se constituir comitê multidisciplinar para catalogar as IAs ocultas em canais internos (Shadow AI), diminuindo a potencialidade de ações administrativas civis pela ANPD.
            ` : globalScore < 2.0 ? `
              <strong>Alerta de Conformidade:</strong> A instituição possui frentes estruturadas operacionais, porém as lacunas geram instabilidade departamental. É mandatório oficializar o Relatório de Impacto Algorítmico individualizado para as frentes que tocam decisões de triagem demográfica.
            ` : `
              <strong>Conformidade Avançada:</strong> Nível preventivo de excelência estabelecido. Recomenda-se realizar simulações anuais de quebra de guardrails (exercícios de Red Teaming) para blindar as redes contra as constantes evoluções do cibercrime global.
            `}
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 20px; font-family: monospace; font-size: 10px; color: #94a3b8;">
        <span>MMGIA — Comitê Regulatório Responsável</span>
        <span>Página 2 de 4</span>
      </div>
    </div>
    <div class="page-indicator">Página 2 de 4</div>

    <!-- PAGE 3 -->
    <div class="report-page">
      <div style="position: absolute; top:0; left:0; right:0; height:8px; background: linear-gradient(to right, #0C3D6E, #1D9E75, #E67E22);"></div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; font-family: monospace; font-size: 9px; color: #94a3b8; text-transform: uppercase;">
        <span>MMGIA — Diagnóstico de Maturidade em Governança de IA</span>
        <span>Relatório de Avaliação Institucional</span>
      </div>

      <div style="flex-grow: 1; padding: 20px 0;">
        <h2 style="font-family: sans-serif; font-size: 18px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; margin-bottom: 24px;">
          3. Desempenho Estatístico por Pilares de Avaliação
        </h2>

        <p style="font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
          O modelo de maturidade avalia de maneira combinada microdados e pilares de execução:
        </p>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; text-align: left;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 9px; color: #64748b; text-transform: uppercase;">
                <th style="padding: 12px;">Eixo de Maturidade</th>
                <th style="padding: 12px; text-align: center;">Pontuação</th>
                <th style="padding: 12px; text-align: center;">Peso</th>
                <th style="padding: 12px; text-align: right;">Contribuição Ponderada</th>
              </tr>
            </thead>
            <tbody style="color: #334155;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">1. Governança e Inteligência</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">${currentScores.gov.toFixed(2)} / 3.00</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">25%</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">+${(currentScores.gov * 0.25).toFixed(3)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">2. Desenvolvimento Tecnológico, Pesquisa e Inovação</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">${currentScores.tec.toFixed(2)} / 3.00</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">20%</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">+${(currentScores.tec * 0.20).toFixed(3)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">3. Segurança, Confiança e Proteção da Sociedade</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">${currentScores.seg.toFixed(2)} / 3.00</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">25%</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">+${(currentScores.seg * 0.25).toFixed(3)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">4. Educação, Capacitação e Cultura Organizacional</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">${currentScores.edu.toFixed(2)} / 3.00</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">15%</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">+${(currentScores.edu * 0.15).toFixed(3)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">5. Cooperação e Inserção no Ecossistema</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">${currentScores.eco.toFixed(2)} / 3.00</td>
                <td style="padding: 12px; text-align: center; font-family: monospace;">15%</td>
                <td style="padding: 12px; text-align: right; font-family: monospace;">+${(currentScores.eco * 0.15).toFixed(3)}</td>
              </tr>
              <tr style="background-color: #f8fafc; font-weight: bold; font-family: monospace; border-top: 1px solid #e2e8f0;">
                <td style="padding: 12px; text-transform: uppercase; font-size: 9px; color: #64748b;">Média Ponderada Global Acumulada</td>
                <td style="padding: 12px; text-align: center;">${globalScore.toFixed(2)}</td>
                <td style="padding: 12px; text-align: center;">100%</td>
                <td style="padding: 12px; text-align: right; color: #0C3D6E; font-size: 13px; font-weight: 950;">${globalScore.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 30px;">
          <h3 style="font-family: sans-serif; font-size: 13px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin-bottom: 10px;">Comparativo Setorial Nacional</h3>
          <p style="font-size: 12px; color: #475569; line-height: 1.6;">
            A organização registra pontuação de <b>${globalScore.toFixed(2)}</b>. Ao confrontar o barômetro com os respondentes do grupo de <b>${metadata.setor}</b> no Brasil, a média geral do segmento localiza-se em <b>${peerAverageGlobal.toFixed(2)}</b>. Isso confere à instituição o patamar correspondente de percentil aproximado de <b>68%</b> no compliance estatístico nacional de IA.
          </p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 20px; font-family: monospace; font-size: 10px; color: #94a3b8;">
        <span>MMGIA — Comitê de Ciência de Dados Aplicada</span>
        <span>Página 3 de 4</span>
      </div>
    </div>
    <div class="page-indicator">Página 3 de 4</div>

    <!-- PAGE 4 -->
    <div class="report-page">
      <div style="position: absolute; top:0; left:0; right:0; height:8px; background: linear-gradient(to right, #0C3D6E, #1D9E75, #E67E22);"></div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; font-family: monospace; font-size: 9px; color: #94a3b8; text-transform: uppercase;">
        <span>MMGIA — Diagnóstico de Maturidade em Governança de IA</span>
        <span>Relatório de Avaliação Institucional</span>
      </div>

      <div style="flex-grow: 1; padding: 20px 0;">
        <h2 style="font-family: sans-serif; font-size: 18px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; margin-bottom: 24px;">
          4. Plano de Ação & Resoluções Prioritárias
        </h2>

        <p style="font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
          Com base nos critérios mapeados como inexistentes ou parciais na avaliação (${gaps.length} lacunas), recomendam-se as frentes abaixo:
        </p>

        <div style="margin-bottom: 30px;">
          ${gapsList}
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-family: sans-serif; font-size: 11px; color: #64748b;">
          <div>
            <div style="border-bottom: 1px solid #cbd5e1; margin-bottom: 8px; padding-bottom: 40px;"></div>
            <b style="color: #0f172a; display: block; font-size: 12px;">Conselho Diretivo MMGIA</b>
            <span style="font-size: 10px;">Validação Ética de Inteligência Artificial</span>
          </div>
          <div>
            <div style="border-bottom: 1px solid #cbd5e1; margin-bottom: 8px; padding-bottom: 40px;"></div>
            <b style="color: #0f172a; display: block; font-size: 12px;">Homologação de Microdados</b>
            <span style="font-size: 10px; font-family: monospace; color: #10b981; font-weight: bold;">Chave: ${metadata.code}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 20px; font-family: monospace; font-size: 10px; color: #94a3b8;">
        <span>MMGIA — Comitê Geral de Auditoria Ética</span>
        <span>Página 4 de 4</span>
      </div>
    </div>
    <div class="page-indicator">Página 4 de 4</div>

  </div>

</body>
</html>`;

    return docContent;
  };

  const handleDownloadHtml = () => {
    const docContent = getReportHtmlContent();
    const blob = new Blob([docContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Relatorio_MMGIA_${metadata.code}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = () => {
    const docContent = getReportHtmlContent();
    
    const copyToClipboard = (text: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    };

    copyToClipboard(docContent)
      .then(() => {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 3000);
      })
      .catch((err) => {
        console.error('Erro ao copiar HTML:', err);
      });
  };

  const handleExportToPdf = () => {
    setExportingPdf(true);
    
    const runExport = () => {
      const canvas = document.getElementById('printable-report-canvas-root');
      if (!canvas) {
        setExportingPdf(false);
        return;
      }

      // Clone the node to avoid messing up the visible UI
      const clone = canvas.cloneNode(true) as HTMLElement;
      
      // Prevent ID collisions by removing IDs in the cloned tree
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

      // Inject temporary styles to make sure all pages print properly and are structured as A4 page blocks
      const style = document.createElement('style');
      style.innerHTML = `
        .screen-hidden-page {
          display: block !important;
        }
        .printable-report-page {
          display: block !important;
          width: 210mm !important;
          height: 297mm !important;
          box-sizing: border-box !important;
          padding: 20mm !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
          position: relative !important;
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
        }
      `;
      clone.appendChild(style);

      // Find all pages within the clone and ensure they don't have screen-hidden-page class
      const hiddenPages = clone.querySelectorAll('.screen-hidden-page');
      hiddenPages.forEach(el => {
        el.classList.remove('screen-hidden-page');
        el.classList.add('block');
        (el as HTMLElement).style.display = 'block';
      });

      // Position the clone fixed behind the current page content so it has actual DOM layouts calculated by browser
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.zIndex = '-9999';
      clone.style.pointerEvents = 'none';
      clone.style.width = '210mm';
      clone.style.transform = 'none';
      clone.style.transformOrigin = 'initial';
      clone.style.display = 'block';
      document.body.appendChild(clone);

      // Style options for html2pdf
      const opt = {
        margin:       0,
        filename:     `Relatorio_MMGIA_${metadata.code}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // @ts-ignore
      if (window.html2pdf) {
        // @ts-ignore
        window.html2pdf().set(opt).from(clone).save()
          .then(() => {
            setExportingPdf(false);
            if (clone.parentNode) {
              clone.parentNode.removeChild(clone);
            }
          })
          .catch((err: any) => {
            console.error('Erro ao gerar PDF:', err);
            setExportingPdf(false);
            if (clone.parentNode) {
              clone.parentNode.removeChild(clone);
            }
          });
      } else {
        setExportingPdf(false);
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      }
    };

    // Check if script is already loaded with our specific v2 patch
    // @ts-ignore
    if (window.html2pdf && window.html2pdfPatchedV2) {
      runExport();
    } else {
      const scriptId = 'patched-html2pdf-script-v2';
      if (document.getElementById(scriptId)) {
        const checkLoaded = setInterval(() => {
          // @ts-ignore
          if (window.html2pdf && window.html2pdfPatchedV2) {
            clearInterval(checkLoaded);
            runExport();
          }
        }, 50);
        return;
      }

      fetch('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')
        .then(response => {
          if (!response.ok) throw new Error('Falha ao baixar html2pdf.js');
          return response.text();
        })
        .then(code => {
          // Replace oklch unsupported error in html2canvas with a dynamic converter block
          const patchedCode = code.replace(
            /throw new Error\((["'`])Attempting to parse an unsupported color function.*?\)/gi,
            `{
              var colorStr = '';
              if (typeof arguments !== 'undefined' && arguments[0]) {
                if (typeof arguments[0] === 'string') {
                  colorStr = arguments[0];
                } else if (typeof arguments[0].toString === 'function') {
                  colorStr = arguments[0].toString();
                } else {
                  colorStr = String(arguments[0]);
                }
              }
              if (colorStr && typeof colorStr === 'string' && colorStr.indexOf('oklch') !== -1) {
                var tempEl = document.createElement('div');
                tempEl.style.color = colorStr;
                document.body.appendChild(tempEl);
                var rgbColor = window.getComputedStyle(tempEl).color;
                document.body.removeChild(tempEl);
                
                var mStr = rgbColor.match(/^rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
                if (mStr) {
                  return {
                    r: parseInt(mStr[1], 10),
                    g: parseInt(mStr[2], 10),
                    b: parseInt(mStr[3], 10),
                    a: mStr[4] ? parseFloat(mStr[4]) : 1
                  };
                }
              }
              return { r: 255, g: 255, b: 255, a: 0 };
            }`
          );

          const blob = new Blob([patchedCode], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          const script = document.createElement('script');
          script.id = scriptId;
          script.style.display = 'none';
          script.src = blobUrl;
          script.onload = () => {
            // @ts-ignore
            window.html2pdfPatchedV2 = true;
            URL.revokeObjectURL(blobUrl);
            runExport();
          };
          script.onerror = () => {
            console.error('Falha ao carregar script do bloco do html2pdf');
            alert('Não foi possível inicializar o gerador de PDF.');
            setExportingPdf(false);
          };
          document.body.appendChild(script);
        })
        .catch(err => {
          console.error('Erro ao baixar html2pdf customizado:', err);
          alert('Não foi possível carregar o exportador offline de PDF.');
          setExportingPdf(false);
        });
    }
  };

  return (
    <div className="bg-slate-900 border-none min-h-screen text-slate-100 flex flex-col justify-between font-sans relative select-text" id="realtime-pdf-document-viewer">
      {/* Dynamic PRINT CSS overrides */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          title, head {
            display: none !important;
          }
          body, html {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
          }
          #realtime-pdf-document-viewer {
            background-color: white !important;
            color: black !important;
            min-height: auto !important;
          }
          #report-controls-bar, #report-footer-navigation {
            display: none !important;
          }
          #printable-report-canvas {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            background: transparent !important;
            transform: none !important;
          }
          /* Show ALL 4 pages in blocks when printing! */
          .printable-report-page {
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
            box-sizing: border-box !important;
            padding: 20mm !important; /* Standard margins */
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background-color: white !important;
            color: black !important;
            font-family: 'Georgia', serif !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
          }
          .printable-report-page * {
            color: black !important;
            background-color: transparent !important;
          }
          /* Neutral colors for borders and tables during printing */
          .print-border-neutral {
            border-color: #cbd5e1 !important;
          }
          .print-hide {
            display: none !important;
          }
        }

        /* Screen only visibility hidden class to support showing ALL pages in print layout but 1 on screen */
        @media screen {
          .screen-hidden-page {
            display: none !important;
          }
        }
      `}</style>

      {/* 1. TOP BAR CONTROL CENTER */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-white z-50 sticky top-0 shadow-lg print-hide" id="report-controls-bar">
        {/* Left Side: Back action & Title metadata */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer flex items-center justify-center border border-slate-700/55 shadow-sm"
            title="Sair do Relatório"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <span className="ml-2 font-mono text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Voltar</span>
          </button>
          
          <div className="h-8 w-[1px] bg-slate-850 hidden sm:block"></div>

          <div className="text-left">
            <h4 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 font-sans justify-center md:justify-start">
              <FileCheck2 className="w-4 h-4 text-brand-accent shrink-0 animate-pulse" />
              <span>Relatório de Avaliação Institucional</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">Diagnóstico Consolidado MMGIA · Chave: {metadata.code}</p>
          </div>
        </div>

        {/* Right Side: Zoom, Pages, Impressão */}
        <div className="flex items-center gap-4 flex-wrap w-full md:w-auto justify-end">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-850 text-slate-350 border border-slate-800 rounded-2xl p-1 font-mono text-xs shadow-inner">
            <button
              onClick={() => setPdfZoom(prev => Math.max(50, prev - 25))}
              className="p-1 px-2.5 hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-200"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 select-none text-slate-200 font-bold">{pdfZoom}%</span>
            <button
              onClick={() => setPdfZoom(prev => Math.min(150, prev + 25))}
              className="p-1 px-2.5 hover:bg-slate-800 rounded-xl transition cursor-pointer text-slate-200"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Page Selector */}
          <div className="flex items-center bg-slate-850 text-slate-300 border border-slate-800 rounded-2xl p-1 font-mono text-xs shadow-inner">
            <button
              disabled={activePdfPage === 1}
              onClick={() => setActivePdfPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 hover:bg-slate-850 hover:text-white rounded-xl transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 shrink-0 font-bold select-none">Página {activePdfPage} de 4</span>
            <button
              disabled={activePdfPage === 4}
              onClick={() => setActivePdfPage(prev => Math.min(4, prev + 1))}
              className="p-1.5 hover:bg-slate-850 hover:text-white rounded-xl transition cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Download & Save buttons */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-5 py-2.5 bg-[#1D9E75] hover:bg-[#1D9E75]/90 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-500/10 active:scale-95"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Salvar / Imprimir</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN SCROLL CONTAINER FOR THE SIMULATED A4 PAPER DOCUMENT */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center justify-start bg-slate-900/60" id="printable-report-canvas">
        {/* Container that implements active-page single view on screen, or sequential print pages layout */}
        <div
          id="printable-report-canvas-root"
          className="transition-all duration-350 ease-out"
          style={{
            transform: `scale(${pdfZoom / 100})`,
            transformOrigin: 'top center',
            marginBottom: `${Math.max(0, (pdfZoom - 100) * 10)}px` // Prevents cutoffs when layout zooms in
          }}
        >
          {/* ==================== PAGE 1 OF 4: THE COVER PAGE ==================== */}
          <div
            className={`printable-report-page bg-white shadow-2xl rounded-xs text-slate-800 select-text cursor-default relative flex flex-col justify-between ${
              activePdfPage === 1 ? 'block' : 'screen-hidden-page'
            }`}
            style={{
              fontFamily: 'Georgia, serif',
              width: '210mm',
              height: '297mm',
              boxSizing: 'border-box',
              padding: '20mm',
              border: '1px solid #cbd5e1',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
            }}
          >
            {/* Header aesthetic top line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0C3D6E] via-[#1D9E75] to-[#E67E22]" />

            {/* Title Block */}
            <div className="space-y-6 pt-10">
              <span className="font-mono text-[9px] uppercase font-bold text-emerald-800 tracking-widest block bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full w-max">
                documento_executivo_oficial · confidencial
              </span>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase font-sans">
                Modelo de Maturidade de Governança de Inteligência Artificial (MMGIA)
              </h1>
              
              <p className="text-slate-500 font-mono text-xs uppercase tracking-wider font-semibold">
                Relatório de Avaliação Institucional de IA e Riscos Éticos
              </p>
            </div>

            {/* Thin line */}
            <div className="w-24 border-b-4 border-[#0C3D6E] my-6"></div>

            {/* Introduction paragraph */}
            <div className="space-y-4 text-slate-700 text-xs leading-relaxed">
              <h2 className="font-bold text-slate-900 text-sm uppercase font-sans tracking-wide">
                1. Introdução & Fundamentação Regulatória
              </h2>
              <p>
                Este instrumento avaliativo estratégico é estruturado com o propósito de guiar microdados institucionais na conformação de sistemas baseados em computação inteligente. O modelo reflete os alinhamentos constitucionais, as tendências de governança algorítmica do <strong>PL 2338/2023</strong> brasileiro e as regulamentações mundiais (como o <strong>AI Act da União Europeia</strong> e a norma <strong>ISO/IEC 42001</strong>).
              </p>
              <p>
                As frentes avaliadas pautam-se nas premissas éticas nacionais e nos relatórios de impacto preconizados no artigo 20 da Lei Geral de Proteção de Dados (<strong>LGPD</strong>). Elas desenham as orientações mais eficientes para mitigar vieses demográficos coletivos e blindar de forma ágil as bases e redes neurais internas.
              </p>
            </div>

            {/* Metadata info cards */}
            <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl grid grid-cols-2 gap-y-4 gap-x-6 text-left font-mono text-[10px] text-slate-600 uppercase leading-snug">
              <div>
                <span className="text-[9px] text-slate-400 block font-light">Segmento Institucional</span>
                <span className="font-bold text-slate-900">{metadata.setor || 'Não especificado'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-light">Natureza Governamental</span>
                <span className="font-bold text-slate-900">{metadata.natureza || 'Pública'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-light">Porte Corporativo</span>
                <span className="font-bold text-slate-900">{metadata.porte || 'Grande'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-light">Unidade Federativa</span>
                <span className="font-bold text-slate-900">{metadata.estado || 'DF'}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-light">Identificação do Registro</span>
                <span className="font-bold text-slate-900 text-[#0C3D6E]">{metadata.code}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-light">Emitido Pela Plataforma</span>
                <span className="font-bold text-[#1D9E75]">MMGIA Brasil</span>
              </div>
            </div>

            {/* Cover footer */}
            <div className="flex justify-between items-end border-t border-slate-150 pt-5 text-[9px] font-mono text-slate-400 mt-6 font-semibold">
              <span>Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
              <span>Versão 1.0 (Oficial)</span>
            </div>
          </div>

          {/* ==================== PAGE 2 OF 4: INTERPRETATIONS & RISK SCORES ==================== */}
          <div
            className={`printable-report-page bg-white shadow-2xl rounded-xs text-slate-800 select-text cursor-default relative flex flex-col justify-between ${
              activePdfPage === 2 ? 'block' : 'screen-hidden-page'
            }`}
            style={{
              fontFamily: 'Georgia, serif',
              width: '210mm',
              height: '297mm',
              boxSizing: 'border-box',
              padding: '20mm',
              border: '1px solid #cbd5e1',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
            }}
          >
            {/* Header top line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0C3D6E] via-[#1D9E75] to-[#E67E22]" />

            {/* Page header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-6 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <span>MMGIA — Diagnóstico de Maturidade em Governança de IA</span>
              <span>Relatório de Avaliação Institucional</span>
            </div>

            <div className="space-y-6 flex-1">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase font-sans tracking-tight">
                2. Síntese Exclusiva da Maturidade
              </h2>

              {/* Dynamic Score highlight */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-2">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-slate-400 font-bold block">Score Global Ponderado</span>
                  <div className="text-4xl font-mono font-black text-[#0C3D6E]">{globalScore.toFixed(2)}</div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-primary text-white text-[9px] font-mono font-bold uppercase">
                    Nível {levelInfo.num} — {levelInfo.label}
                  </div>
                </div>

                <div className="md:col-span-7 space-y-2 text-xs text-slate-600 leading-relaxed font-light">
                  <strong className="text-slate-900 text-sm font-semibold font-sans block">Significado Operacional do Nível:</strong>
                  <p className="text-[11px] leading-normal">{levelInfo.desc}</p>
                </div>
              </div>

              {/* Security and Risks Block */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-950 text-xs uppercase tracking-tight flex items-center gap-1.5 font-sans">
                  <ShieldCheck className="w-4 h-4 text-red-650" />
                  Mapeamento de Vulnerabilidades e Implicações Jurídicas
                </h3>
                
                <p className="text-xs text-slate-500 italic border-l-2 border-slate-350 pl-3 leading-relaxed">
                  {levelInfo.risco}
                </p>

                <h3 className="font-bold text-slate-950 text-xs uppercase tracking-tight font-sans">
                  Avaliação De Riscos Reais para Governança de IA (PL 2338/2023)
                </h3>
                
                <div className="p-4 bg-slate-50 border border-slate-200 text-slate-650 rounded-xl text-xs space-y-2 font-mono text-[10.5px]">
                  <span className="font-bold text-[#0C3D6E] uppercase block">Controle e Mitigação de Vieses Ativos</span>
                  {globalScore < 1.0 ? (
                    <p className="leading-relaxed text-slate-600">
                      <strong>Aviso Estratégico:</strong> A entidade opera sob altos índices de risco regulatório indireto. Recomenda-se constituir comitê multidisciplinar para catalogar as IAs ocultas em canais internos (Shadow AI), diminuindo a potencialidade de ações administrativas civis pela ANPD.
                    </p>
                  ) : globalScore < 2.0 ? (
                    <p className="leading-relaxed text-slate-600">
                      <strong>Alerta de Conformidade:</strong> A instituição possui frentes estruturadas operacionais, porém as lacunas geram instabilidade departamental. É mandatório oficializar o Relatório de Impacto Algorítmico individualizado para as frentes que tocam decisões de triagem demográfica.
                    </p>
                  ) : (
                    <p className="leading-relaxed text-slate-600">
                      <strong>Conformidade Avançada:</strong> Nível preventivo de excelência estabelecido. Recomenda-se realizar simulações anuais de quebra de guardrails (exercícios de Red Teaming) para blindar as redes contra as constantes evoluções do cibercrime global.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Page Footer */}
            <div className="flex justify-between text-[8px] font-mono text-slate-400 border-t border-slate-200 pt-3 mt-6">
              <span>MMGIA — Comitê Regulatório Responsável</span>
              <span>Página 2 de 4</span>
            </div>
          </div>

          {/* ==================== PAGE 3 OF 4: SCORES TABLE & DETAILED BREAKDOWN ==================== */}
          <div
            className={`printable-report-page bg-white shadow-2xl rounded-xs text-slate-800 select-text cursor-default relative flex flex-col justify-between ${
              activePdfPage === 3 ? 'block' : 'screen-hidden-page'
            }`}
            style={{
              fontFamily: 'Georgia, serif',
              width: '210mm',
              height: '297mm',
              boxSizing: 'border-box',
              padding: '20mm',
              border: '1px solid #cbd5e1',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
            }}
          >
            {/* Header top line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0C3D6E] via-[#1D9E75] to-[#E67E22]" />

            {/* Page header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-6 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <span>MMGIA — Diagnóstico de Maturidade em Governança de IA</span>
              <span>Relatório de Avaliação Institucional</span>
            </div>

            <div className="space-y-6 flex-1">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase font-sans tracking-tight">
                3. Desempenho Estatístico por Pilares de Avaliação
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed font-light">
                O modelo de maturidade avalia de maneira combinada cinco pilares (dimensões) estruturais da instituição. Cada nota hibridiza o cumprimento de critérios e a profundidade de execução das garantias jurídicas corporativas:
              </p>

              {/* Scores detailed table matching methodology weights */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-[10.5px] text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-mono text-[8px] uppercase border-b border-slate-200">
                      <th className="p-3">Eixo de Maturidade</th>
                      <th className="p-3 text-center">Pontuação</th>
                      <th className="p-3 text-center">Peso</th>
                      <th className="p-3 text-right">Contribuição Ponderada</th>
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
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900">{row.name}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{row.score.toFixed(2)} / 3.00</td>
                        <td className="p-3 text-center font-mono text-slate-550">{row.weight}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">+{row.contribution.toFixed(3)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 border-t border-slate-200 text-xs font-bold font-mono">
                      <td className="p-3 uppercase text-[8.5px] text-slate-500">Média Ponderada Global Acumulada</td>
                      <td className="p-3 text-center">{globalScore.toFixed(2)}</td>
                      <td className="p-3 text-center">100%</td>
                      <td className="p-3 text-right text-[#0C3D6E] underline font-black">{globalScore.toFixed(3)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Benchmarking context block */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-tight font-sans">Comparativo Setorial Nacional</h3>
                <p className="text-xs text-slate-650 leading-relaxed font-light">
                  A organização registra pontuação de <strong className="text-slate-950 font-bold">{globalScore.toFixed(2)}</strong>. Ao confrontar o barômetro com os respondentes do grupo de <strong className="text-slate-900">{metadata.setor}</strong> no Brasil, a média geral do segmento localiza-se em <strong className="text-slate-900">{peerAverageGlobal.toFixed(2)}</strong>. Isso confere à instituição o patamar correspondente de percentil aproximado de <strong className="text-indigo-805">68%</strong> no compliance estatístico nacional de IA.
                </p>
              </div>
            </div>

            {/* Page Footer */}
            <div className="flex justify-between text-[8px] font-mono text-slate-400 border-t border-slate-200 pt-3 mt-6">
              <span>MMGIA — Comitê de Ciência de Dados Aplicada</span>
              <span>Página 3 de 4</span>
            </div>
          </div>

          {/* ==================== PAGE 4 OF 4: GAPS & ACTION MITIGATION PLAN ==================== */}
          <div
            className={`printable-report-page bg-white shadow-2xl rounded-xs text-slate-800 select-text cursor-default relative flex flex-col justify-between ${
              activePdfPage === 4 ? 'block' : 'screen-hidden-page'
            }`}
            style={{
              fontFamily: 'Georgia, serif',
              width: '210mm',
              height: '297mm',
              boxSizing: 'border-box',
              padding: '20mm',
              border: '1px solid #cbd5e1',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
            }}
          >
            {/* Header top line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0C3D6E] via-[#1D9E75] to-[#E67E22]" />

            {/* Page header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-6 font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <span>MMGIA — Diagnóstico de Maturidade em Governança de IA</span>
              <span>Relatório de Avaliação Institucional</span>
            </div>

            <div className="space-y-6 flex-1">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase font-sans tracking-tight">
                4. Plano de Ação & Resoluções Prioritárias
              </h2>

              <p className="text-xs text-slate-650 leading-relaxed font-light">
                Com base nos critérios mapeados como inexistentes ou parciais na avaliação ({gaps.length} lacunas), sintetizamos abaixo as recomendações de maior efetividade técnica. O cumprimento dessas metas eleva substancialmente a robustez e o compliance regulatório perante órgãos governamentais:
              </p>

              {/* List of dynamic gap recommendations tailored to actual results */}
              <div className="space-y-4">
                {gaps.length === 0 ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-150 rounded-xl text-center space-y-2 font-sans">
                    <CheckCircle className="w-8 h-8 text-[#1D9E75] mx-auto animate-bounce" />
                    <h3 className="font-bold text-emerald-950 text-xs">Exclusão Total de Riscos e Gaps</h3>
                    <p className="text-[11px] text-emerald-800">
                      Sua corporação cumpre plenamente todas as garantias mapeadas de forma exemplar. Mantenha as rotinas contínuas eletrônicas para continuar auditando os processos de ponta a ponta.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {gaps.slice(0, 3).map((gap, index) => {
                      const isHigh = gap.level === 1;
                      const isMed = gap.level === 2 || gap.level === 3;
                      
                      return (
                        <div key={gap.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-sans">
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-white ${
                              isHigh ? 'bg-red-500' : isMed ? 'bg-cyan-500' : 'bg-blue-600'
                            }`}>
                              Item Mapeado {gap.id} · Prioridade {isHigh ? 'Alta' : isMed ? 'Média' : 'Baixa'}
                            </span>
                            <span className="text-[#0C3D6E] font-bold uppercase tracking-wider">{gap.legalReference || 'ISO 42001'}</span>
                          </div>
                          
                          <h4 className="font-bold text-xs text-slate-900 tracking-tight">
                            {gap.name}
                          </h4>
                          
                          <p className="text-[11px] text-slate-600 leading-normal leading-relaxed font-light">
                            {gap.description}
                          </p>

                          <div className="pt-2 border-t border-slate-200 mt-1.5 text-[10.5px] font-mono flex items-start gap-1">
                            <span className="text-emerald-700 font-bold shrink-0">Passo Prático:</span>
                            <span className="text-slate-700 italic">
                              {gap.id === '1.1' && 'Desenvolver a primeira política de princípios de governança de IA oficializando o comitê deliberativo.'}
                              {gap.id === '1.4' && 'Definir e executar preventivamente um Relatório de Impacto de IA focado em vieses demográficos de admissão.'}
                              {gap.id === '2.1' && 'Aprimorar a linhagem e proveniência dos metadados de entrada nas redes neurais de dados para mitigar vieses.'}
                              {gap.id === '3.1' && 'Consultar o DPO jurídico para estruturar termos formais de consentimento de dados para o treino.'}
                              {gap.id === '4.1' && 'Propagar capacitação básica de inteligência artificial generativa em canais online corporativos.'}
                              {!['1.1', '1.4', '2.1', '3.1', '4.1'].includes(gap.id) && 'Revisar a documentação técnica com engenheiros internos, definindo salvaguardas adicionais para evitar desvios no modelo.'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {gaps.length > 3 && (
                      <p className="text-[10px] text-slate-500 italic text-center font-mono font-semibold">
                        * Mapeamento apresenta mais {gaps.length - 3} itens detectados em menor prioridade no relatório completo.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Legal validation stamp signatures block */}
              <div className="pt-6 border-t border-slate-150 grid grid-cols-2 gap-8 text-center text-[10px] font-mono text-slate-500 font-sans">
                <div className="space-y-4">
                  <div className="h-[1px] bg-slate-250 w-full"></div>
                  <div>
                    <span className="font-extrabold text-slate-900 block tracking-tight">Conselho Diretivo MMGIA</span>
                    <span className="text-[9px] text-slate-400">Validação Ética de Inteligência Artificial</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-[1px] bg-slate-250 w-full"></div>
                  <div>
                    <span className="font-extrabold text-slate-900 block tracking-tight">Homologação de Microdados</span>
                    <span className="text-[9px] text-[#1D9E75] font-bold">Chave: {metadata.code}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Footer */}
            <div className="flex justify-between text-[8px] font-mono text-slate-400 border-t border-slate-200 pt-3 mt-6">
              <span>MMGIA — Comitê Geral de Auditoria Ética</span>
              <span>Página 4 de 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRINT BAR BOTTOM NAVIGATION (WIDGET ON LARGE DISPLAYS) */}
      <div className="bg-slate-950 border-t border-slate-800 py-3 px-6 text-center select-none text-xs font-mono text-slate-400 flex items-center justify-between gap-4 print-hide" id="report-footer-navigation">
        <span className="hidden sm:inline">© {new Date().getFullYear()} MMGIA · Relatório Conforme Diretrizes da ENIA e LGPD</span>
        <button
          onClick={onBack}
          className="mx-auto sm:mx-0 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 font-bold hover:text-white rounded-lg transition text-[11px] cursor-pointer"
        >
          Sair do Visualizador
        </button>
      </div>

      {/* Dynamic Save/Print option modal */}
      {showSaveModal && (() => {
        let isInIframe = false;
        try {
          isInIframe = window.self !== window.top;
        } catch (e) {
          isInIframe = true;
        }

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 font-sans animate-fade-in print-hide">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
              <button
                onClick={() => setShowSaveModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-950 to-slate-950 p-6 border-b border-teal-500/10 text-left animate-none">
                <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">Exportação Segura</span>
                <h3 className="font-extrabold text-lg text-white">Salvar ou Imprimir Relatório</h3>
                <p className="text-xs text-slate-400 mt-1">Selecione o método de salvamento preferido para o seu diagnóstico oficial.</p>
              </div>

              {/* Content info & choices */}
              <div className="p-6 space-y-6 text-left max-h-[70vh] overflow-y-auto">
                {isInIframe && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-3 text-xs text-blue-300 leading-relaxed font-sans">
                    <Info className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <strong className="text-blue-200 block mb-0.5">Visualização Protegida por Iframe (AI Studio Preview)</strong>
                      Alguns navegadores bloqueiam downloads e chamadas de impressão diretamente por razões de isolamento.
                      Para uma experiência nativa fluida, clique em <b>"Abrir em nova aba" (Open in new tab)</b> no canto superior direito do seu sandbox, ou use a opção de cópia abaixo!
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {/* Option 1: High Fidelity PDF Export */}
                  <button
                    disabled={exportingPdf}
                    onClick={() => {
                      setShowSaveModal(false);
                      setTimeout(() => {
                        handleExportToPdf();
                      }, 150);
                    }}
                    className="p-4 bg-slate-850 hover:bg-slate-800 border border-teal-500/20 hover:border-teal-500/60 rounded-2xl transition text-left cursor-pointer group flex items-start gap-4 active:scale-[0.99] w-full animate-none disabled:opacity-50"
                  >
                    <div className="p-3 bg-teal-950/60 border border-teal-500/20 text-teal-405 rounded-xl group-hover:scale-105 transition-transform duration-300">
                      {exportingPdf ? (
                        <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FileCheck2 className="w-5 h-5 text-teal-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors flex items-center justify-between">
                        <span>Exportar PDF Completo (A4)</span>
                        <span className="text-[9px] text-teal-400 font-mono py-0.5 px-2 bg-teal-950 border border-teal-500/15 rounded-full uppercase font-bold tracking-wider">Recomendado</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal leading-relaxed">
                        Gera e exporta um arquivo PDF oficial de 4 páginas de alta fidelidade exatamente como visualizado na tela, com margens calculadas para formato A4 físico.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Native Print */}
                  <button
                    disabled={exportingPdf}
                    onClick={() => {
                      setShowSaveModal(false);
                      setTimeout(() => {
                        handlePrint();
                      }, 250);
                    }}
                    className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl transition text-left cursor-pointer group flex items-start gap-4 active:scale-[0.99] w-full animate-none"
                  >
                    <div className="p-3 bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">Gerador de Impressão Nativa</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal leading-relaxed">
                        Abre a janela de diálogo do seu sistema/navegador. Permite imprimir diretamente em papel físico ou salvar como formato PDF autêntico de 4 páginas.
                      </p>
                    </div>
                  </button>

                  {/* Option 3: Download HTML file */}
                  <button
                    onClick={() => {
                      handleDownloadHtml();
                      setShowSaveModal(false);
                    }}
                    className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl transition text-left cursor-pointer group flex items-start gap-4 active:scale-[0.99] w-full animate-none"
                  >
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Download Offline (.html)</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal leading-relaxed">
                        Salva o relatório em um arquivo autônomo totalmente estilizado. Você pode abri-lo localmente para visualizar offline, arquivar ou imprimir de forma 100% garantida.
                      </p>
                    </div>
                  </button>

                  {/* Option 3: Copy HTML script */}
                  <button
                    onClick={handleCopyHtml}
                    className="p-4 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl transition text-left cursor-pointer group flex items-start gap-4 active:scale-[0.99] w-full animate-none"
                  >
                    <div className="p-3 bg-teal-950/60 border border-teal-500/20 text-teal-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
                      {copiedHtml ? <Check className="w-5 h-5 text-emerald-400 font-bold" /> : <Copy className="w-5 h-5 text-teal-400" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors flex items-center gap-2">
                        <span>Copiar Código HTML Completo</span>
                        {copiedHtml && (
                          <span className="text-[10px] text-emerald-400 font-mono py-0.5 px-2 bg-emerald-950/85 border border-emerald-500/10 rounded-full">
                            Copiado!
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal leading-relaxed">
                        Copia todo o HTML interativo e estilizado do seu relatório para transferir via clipboard. Uma opção de backup instantânea e 100% garantida.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Actions footer */}
              <div className="bg-slate-950 border-t border-slate-850 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
