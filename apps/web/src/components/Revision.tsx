/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Award,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCheck2,
  HelpCircle,
  Info,
  Printer,
  X,
} from 'lucide-react';
import { ScoreLevel, DIMENSIONS, LIST_PRACTICES, DimensionId, AssessmentMetadata } from '@mmgia/shared/types';
import {
  DIMENSION_WEIGHTS,
  getAllDimensionLevels,
  getAllDimensionScores,
  getGlobalScore,
  getMaturityLevel,
  getPeerAverageGlobal,
} from '@mmgia/shared/scoring';
import RadarChart from './RadarChart';
import {
  ActionBar,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DIMENSION_ORDER,
  DimensionBars,
  DimensionTag,
  DsRoot,
  LevelBadge,
  NplfBadge,
  Page,
  PageHeader,
  RiskBadge,
  StatusBadge,
  formatNumber,
  type Level,
} from '@mmgia/shared/design-system';

interface RevisionProps {
  answers: Record<string, ScoreLevel>;
  metadata: AssessmentMetadata;
  onGoToPractice: (dimensionId: DimensionId, index: number) => void;
  onGoBackToQuestionnaire: () => void;
  onConfirmAndGenerateResult: () => void;
  onViewReport?: () => void;
  theme?: 'light' | 'dark';
}

/**
 * Descrições dos 6 níveis de maturidade exibidas na memória de cálculo desta tela.
 * Texto idêntico ao de getMaturityLevel (src/lib/scoring.ts) — não alterar.
 */
const LEVEL_MEANINGS: { lvl: Level; scoreRange: string; title: string; desc: string; risco: string }[] = [
  {
    lvl: 0,
    scoreRange: '0,0 a 0,5',
    title: 'Nível 0 — Inexistente',
    desc: 'A organização não possui, nem reconhece, a necessidade de práticas de governança de IA. As atividades são inexistentes, não documentadas ou realizadas de forma caótica, sem qualquer controle ou supervisão.',
    risco: 'Riscos críticos de segurança: o uso descontrolado de ferramentas (Shadow AI) gera vazamento inevitável de dados confidenciais e alta exposição civil por vieses e falhas cognitivas algorítmicas.',
  },
  {
    lvl: 1,
    scoreRange: '0,5 a 1,0',
    title: 'Nível 1 — Inicial',
    desc: 'As práticas são ad hoc, reativas e dependentes de indivíduos. O sucesso em iniciativas de IA é imprevisível e ocorre apesar da ausência de processos formais, geralmente impulsionado por "heróis" organizacionais. Há uma conscientização da necessidade de práticas de governança de IA.',
    risco: 'Ausência de testes formais de vieses demográficos, éticos ou segurança. Elevado risco de descontinuação repentina do conhecimento quando indivíduos-heróis chave se desligam das frentes internas.',
  },
  {
    lvl: 2,
    scoreRange: '1,0 a 1,5',
    title: 'Nível 2 — Gerenciado',
    desc: 'Práticas básicas de gestão de projetos e de supervisão são aplicadas às iniciativas de IA. Políticas e responsabilidades começam a ser definidas em nível de projeto ou de departamento, mas a aplicação ainda é inconsistente em toda a organização.',
    risco: 'Embora existam controles focais, a inconsistência gera ilhas de risco desconectadas. Cada iniciativa adota critérios próprios de segurança da informação, abrindo buracos estruturais de conformidade legal.',
  },
  {
    lvl: 3,
    scoreRange: '1,5 a 2,0',
    title: 'Nível 3 — Definido',
    desc: 'Processos de governança de IA são padronizados, documentados e disseminados em toda a organização, constituindo um "jeito organizacional" de fazer com IA. Há um entendimento comum sobre papéis, responsabilidades e procedimentos.',
    risco: 'O estabelecimento de processos padronizados e documentados reduz significativamente a ambiguidade e o risco organizacional para um patamar moderado. Há uma base de conformidade, mas o risco principal orbita em torno da rigidez dos processos.',
  },
  {
    lvl: 4,
    scoreRange: '2,0 a 2,5',
    title: 'Nível 4 — Gerenciado Quantitativamente',
    desc: 'A organização mede e controla o desempenho de seus processos de governança de IA por meio de métricas e dados estatísticos. O desempenho é previsível e os desvios são gerenciados proativamente.',
    risco: 'Monitoramento contínuo bem estruturado. O risco migra para o perigo da complacência e viés quantitativo: a equipe foca em métricas simplistas e negligencia as nuances qualitativas éticas e novidades de regulação.',
  },
  {
    lvl: 5,
    scoreRange: '2,5 a 3,0',
    title: 'Nível 5 — Otimizado',
    desc: 'A organização foca na melhoria contínua e proativa dos processos de governança de IA. O feedback, tanto quantitativo quanto qualitativo, é utilizado para identificar oportunidades de inovação e refinar as práticas em um ciclo virtuoso.',
    risco: 'A governança se torna adaptativa, ágil e diferencial competitivo forte. Riscos minimizados. O único desafio é evitar a complacência e manter o ritmo ativo de monitoramento em face às novas disrupções técnicas no cenário global.',
  },
];

interface WeightRow {
  id: DimensionId;
  score: number;
  weight: number;
  contribution: number;
}

export default function Revision({
  answers,
  metadata,
  onGoToPractice,
  onGoBackToQuestionnaire,
  onConfirmAndGenerateResult,
  onViewReport,
}: RevisionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [activePdfPage, setActivePdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);

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

  const overallUnansweredCount = LIST_PRACTICES.filter(p => !answers[p.id]).length;

  // Score Calculus (ver packages/shared/src/lib/scoring.ts — Passos 3-5 da metodologia oficial)
  const currentScores: Record<DimensionId, number> = getAllDimensionScores(answers);
  const globalScore = getGlobalScore(answers);
  const levelInfo = getMaturityLevel(globalScore);
  const dimensionLevels = getAllDimensionLevels(answers);

  const peerAverageGlobal = getPeerAverageGlobal(metadata.setor || 'Saúde');

  const weightRows: WeightRow[] = DIMENSION_ORDER.map((id) => ({
    id,
    score: currentScores[id],
    weight: DIMENSION_WEIGHTS[id],
    contribution: currentScores[id] * DIMENSION_WEIGHTS[id],
  }));

  const gaps = LIST_PRACTICES.filter((practice) => {
    const ans = answers[practice.id];
    return !ans || ans === 'N' || ans === 'P';
  });

  const getGapRecommendation = (id: string): { action: string; effort: 'Baixo' | 'Médio' | 'Alto' } => {
    const practice = LIST_PRACTICES.find(p => p.id === id);
    if (!practice) {
      return { action: 'Readequar controles internos, reunindo documentação técnica e implementando revisões humanas contínuas.', effort: 'Médio' };
    }
    const effort: 'Baixo' | 'Médio' | 'Alto' = practice.level <= 2 ? 'Baixo' : practice.level === 3 ? 'Médio' : 'Alto';
    return { action: practice.criterion, effort };
  };

  return (
    <DsRoot>
      <Page>
        <PageHeader
          eyebrow="Antes de calcular o score"
          title="Revisão de diagnóstico"
          description="Confirme se as respostas representam fielmente os artefatos institucionais de conformidade antes de computar o score."
          actions={
            <ActionBar inline>
              <Button variant="secondary" icon={Info} onClick={() => setShowDetails((v) => !v)}>
                {showDetails ? 'Ocultar memória de cálculo' : 'Como a média é calculada?'}
              </Button>
              <Button
                variant="primary"
                icon={Eye}
                onClick={() => { if (onViewReport) { onViewReport(); } else { setShowPdfViewer(true); setActivePdfPage(1); } }}
              >
                Visualizar relatório executivo
              </Button>
            </ActionBar>
          }
        />

        {showDetails && (
          <Card style={{ marginBottom: 24 }}>
            <CardHeader
              title="Memória de cálculo da média de maturidade ponderada"
              actions={
                <Button variant="ghost" size="sm" iconOnly icon={X} aria-label="Fechar memória de cálculo" onClick={() => setShowDetails(false)} />
              }
            />
            <CardBody>
              <p className="mg-lead">
                Passo 1 — cada prática respondida herda o valor da escala NPLF (Nulo = 0, Parcial = 1, Larga = 2, Total = 3).
                Passo 2 — o score de cada dimensão é a média dos níveis de prática respondidos dentro dela.
                Passo 3 — as 5 dimensões são ponderadas pelos pesos oficiais abaixo para compor o Score Global (0 a 3).
              </p>

              <div style={{ marginTop: 20 }}>
                <DataTable<WeightRow>
                  caption="Contribuição de cada dimensão para o Score Global"
                  rowKey={(r) => r.id}
                  columns={[
                    { key: 'dim', header: 'Eixo', render: (r) => <DimensionTag dimension={r.id} /> },
                    { key: 'score', header: 'Score', numeric: true, render: (r) => formatNumber(r.score) },
                    { key: 'weight', header: 'Peso', numeric: true, render: (r) => `${Math.round(r.weight * 100)}%` },
                    { key: 'contrib', header: 'Contribuição', numeric: true, render: (r) => formatNumber(r.contribution, 3) },
                  ]}
                  rows={weightRows}
                />
              </div>

              <div className="mg-row" style={{ gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                <span className="mg-code">Score Global: {formatNumber(globalScore)} / 3</span>
                <LevelBadge level={levelInfo.num as Level} />
                <RiskBadge level={levelInfo.num as Level} />
              </div>
              <p className="mg-small mg-muted" style={{ marginTop: 8 }}>{levelInfo.desc}</p>

              <div className="mg-stack" style={{ marginTop: 24, gap: 12 }}>
                <h3 className="mg-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HelpCircle className="mg-ico mg-ico-sm" aria-hidden="true" />
                  O que significa cada nível de maturidade?
                </h3>
                {LEVEL_MEANINGS.map((item) => {
                  const isSelected = levelInfo.num === item.lvl;
                  return (
                    <Card key={item.lvl} style={isSelected ? { boxShadow: '0 0 0 3px var(--brand-soft)', borderColor: 'var(--brand)' } : undefined}>
                      <div className="mg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div className="mg-row" style={{ gap: 8 }}>
                          <LevelBadge level={item.lvl} showLabel={false} />
                          <span className="mg-title">{item.title}</span>
                        </div>
                        <span className="mg-code">Score {item.scoreRange}</span>
                      </div>
                      <p className="mg-small" style={{ marginTop: 8 }}>{item.desc}</p>
                      <p className="mg-small mg-muted" style={{ marginTop: 6, borderLeft: '2px solid var(--surface-deep)', paddingLeft: 8 }}>
                        <strong>Implicações e riscos:</strong> {item.risco}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 380px', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 32, alignItems: 'start' }}>
          {/* LEFT COLUMN: ACCORDION OF DIMENSIONS */}
          <div className="mg-stack" style={{ gap: 16 }}>
            {overallUnansweredCount > 0 && (
              <Banner tone="attention" title="Práticas em aberto encontradas">
                Identificamos <strong>{overallUnansweredCount} práticas sem resposta</strong> de um total de 45 diretrizes.
                Você pode prosseguir e registrar os resultados, mas as faltantes contarão como score zero (Nulo).
              </Banner>
            )}

            <div className="mg-stack" id="revision-accordions" style={{ gap: 12 }}>
              {DIMENSION_ORDER.map((key) => {
                const stats = getDimensionStats(key);
                const score = currentScores[key];
                const dimLevel = dimensionLevels[key];

                return (
                  <details key={key} className="mg-acc" open={key === 'gov'} id={`accordion-block-${key}`}>
                    <summary>
                      <DimensionTag dimension={key} />
                      <span className="mg-code">{stats.answered}/{stats.total} respondidas</span>
                      <span className="mg-spacer" />
                      <LevelBadge level={dimLevel.num as Level} />
                      <span className="mg-code">{formatNumber(score)} / 3</span>
                      <ChevronDown className="chev mg-ico mg-ico-sm" aria-hidden="true" />
                    </summary>

                    {LIST_PRACTICES.filter(p => p.dimensionId === key).map((practice, index) => {
                      const scoreChoice = answers[practice.id];
                      const isAnswered = !!scoreChoice;

                      return (
                        <div key={practice.id} className="mg-acc-item">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="mg-code">Prática {practice.id} · nível {practice.level}</span>
                            <p className="mg-title" style={{ marginTop: 4 }}>{practice.name}</p>
                            <p className="mg-small mg-muted" style={{ marginTop: 2 }}>{practice.description}</p>
                          </div>

                          <div className="mg-row" style={{ gap: 10, flexShrink: 0 }}>
                            {isAnswered ? <NplfBadge value={scoreChoice} /> : <span className="mg-small mg-muted">Não respondida</span>}
                            <Button variant="ghost" size="sm" onClick={() => onGoToPractice(key, index)}>
                              {isAnswered ? 'Editar' : 'Responder'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </details>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: RADAR (DESKTOP) / DIMENSION BARS (MOBILE) */}
          <div className="mg-stack" style={{ gap: 16 }} id="revision-radar-sidebar">
            <Card>
              <div className="mg-only-desktop">
                <RadarChart scores={currentScores} />
              </div>
              <div className="mg-only-mobile">
                <DimensionBars scores={currentScores} />
              </div>
              <div style={{ marginTop: 16 }}>
                <Banner tone="info" title="Escala de 0 a 3">
                  Uma média alta em uma dimensão atesta a plenitude de auditoria estruturada nesta vertical.
                </Banner>
              </div>
            </Card>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION */}
        <Card style={{ marginTop: 32 }}>
          <div className="mg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="mg-title">Pronto para submeter?</p>
              <p className="mg-small mg-muted" style={{ marginTop: 4 }}>
                Com as respostas conferidas, você autoriza o cálculo estatístico do seu nível e a emissão de diretrizes.
              </p>
            </div>
            <ActionBar inline>
              <Button variant="ghost" onClick={onGoBackToQuestionnaire}>Voltar e corrigir</Button>
              <Button variant="primary" onClick={onConfirmAndGenerateResult}>Confirmar e ver resultado</Button>
            </ActionBar>
          </div>
        </Card>
      </Page>

      {/* INTERACTIVE PDF VIEWER OVERLAY */}
      {showPdfViewer && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--ink)' }} id="realtime-pdf-document-viewer">
          {/* Toolbar */}
          <div
            className="mg-row"
            style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: '16px 24px', borderBottom: '1px solid var(--ink-raised)' }}
          >
            <div className="mg-row" style={{ gap: 12 }}>
              <FileCheck2 className="mg-ico" aria-hidden="true" style={{ color: 'var(--on-ink-accent)' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-ink)' }}>Relatório executivo (rascunho)</p>
                <p className="mg-code" style={{ color: 'var(--on-ink-muted)' }}>Governança e gestão de IA — MMGIA</p>
              </div>
            </div>

            <div className="mg-row" style={{ gap: 16, flexWrap: 'wrap' }}>
              <div className="mg-row" style={{ gap: 4 }}>
                <Button variant="ghost" onInk size="sm" iconOnly icon={ChevronLeft} aria-label="Página anterior" disabled={activePdfPage === 1} onClick={() => setActivePdfPage((p) => Math.max(1, p - 1))} />
                <span className="mg-code" style={{ color: 'var(--on-ink)' }}>Página {activePdfPage} de 4</span>
                <Button variant="ghost" onInk size="sm" iconOnly icon={ChevronRight} aria-label="Próxima página" disabled={activePdfPage === 4} onClick={() => setActivePdfPage((p) => Math.min(4, p + 1))} />
              </div>

              <div className="mg-row" style={{ gap: 4 }}>
                <Button variant="ghost" onInk size="sm" onClick={() => setPdfZoom((z) => Math.max(75, z - 25))} aria-label="Diminuir zoom">−</Button>
                <span className="mg-code" style={{ color: 'var(--on-ink)' }}>{pdfZoom}%</span>
                <Button variant="ghost" onInk size="sm" onClick={() => setPdfZoom((z) => Math.min(150, z + 25))} aria-label="Aumentar zoom">+</Button>
              </div>

              <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>Salvar / imprimir PDF</Button>
              <Button variant="ghost" onInk size="sm" iconOnly icon={X} aria-label="Fechar relatório" onClick={() => setShowPdfViewer(false)} />
            </div>
          </div>

          {/* Page canvas */}
          <div className="flex-1 overflow-auto flex justify-center" style={{ padding: 32 }} id="pdf-scroller-canvas">
            <div
              className="w-full max-w-[800px] relative"
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text)',
                fontFamily: 'Georgia, serif',
                minHeight: 1000,
                padding: '56px 64px',
                transform: `scale(${pdfZoom / 100})`,
                transformOrigin: 'top center',
                boxShadow: 'var(--shadow-modal)',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'var(--brand)' }} />

              {activePdfPage > 1 && (
                <div className="flex justify-between items-center mb-8 pb-2" style={{ borderBottom: '1px solid var(--surface-deep)' }}>
                  <span className="mg-code">MMGIA — Diagnóstico de Maturidade em Governança de IA</span>
                  <span className="mg-code">Relatório de Avaliação Institucional de IA</span>
                </div>
              )}

              {/* Page 1: Cover */}
              {activePdfPage === 1 && (
                <div className="flex flex-col justify-between font-sans text-left" style={{ gap: 40 }}>
                  <div className="space-y-4">
                    <StatusBadge status="good">Documento executivo prévio · confidencial</StatusBadge>
                    <h3 className="text-3xl font-extrabold tracking-tight leading-tight uppercase mt-3" style={{ color: 'var(--text)' }}>
                      Modelo de Maturidade em Governança de Inteligência Artificial (MMGIA)
                    </h3>
                    <p className="mg-code" style={{ textTransform: 'uppercase' }}>Relatório Executivo de Maturidade Regulatória e Metodológica</p>
                  </div>

                  <hr style={{ border: 0, borderTop: '2px solid var(--brand)', width: 112 }} />

                  <div className="space-y-4 text-xs leading-relaxed mg-lead">
                    <h4 className="font-bold text-sm uppercase" style={{ color: 'var(--text)' }}>1. Introdução & Fundamentação</h4>
                    <p className="text-justify">
                      Este Modelo de Maturidade em Governança de Inteligência Artificial (MMGIA) é um instrumento estratégico projetado para auxiliar organizações públicas e privadas a mensurar, avaliar e aprimorar sua capacidade de desenvolver, adotar, operar e governar soluções de Inteligência Artificial (IA) de forma ética, responsável, segura, legal e eficaz.
                    </p>
                    <p className="text-justify">
                      Alinhado à Estratégia Nacional de Inteligência Artificial (ENIA) 2026-2029, o modelo serve como um roteiro para a recomendação e transformação, permitindo que as instituições analisem seu estado atual, identifiquem lacunas e planejem uma evolução estruturada sustentável de seus algoritmos.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)' }}>
                    <div>
                      <span className="mg-code block">Entidade</span>
                      <span className="mg-title">Mapeamento Anônimo</span>
                    </div>
                    <div>
                      <span className="mg-code block">Segmento de Atuação</span>
                      <span className="mg-title">{metadata.setor || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="mg-code block">Natureza Governamental</span>
                      <span className="mg-title">{metadata.natureza || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="mg-code block">Porte Organizacional</span>
                      <span className="mg-title">{metadata.porte || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="mg-code block">Local / Estado</span>
                      <span className="mg-title">{metadata.estado || 'DF'}</span>
                    </div>
                    <div>
                      <span className="mg-code block">Chave Segurança</span>
                      <span className="mg-title" style={{ color: 'var(--brand)' }}>{metadata.code || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-6" style={{ borderTop: '1px solid var(--surface-deep)' }}>
                    <span className="mg-code">Emissão: 08 de Junho de 2026</span>
                    <span className="mg-code">Versão 1.0 (Oficial)</span>
                  </div>
                </div>
              )}

              {/* Page 2: Methodology summary */}
              {activePdfPage === 2 && (
                <div className="space-y-6 font-sans text-left">
                  <h3 className="text-xl font-bold uppercase pb-2.5" style={{ color: 'var(--text)', borderBottom: '1px solid var(--surface-deep)' }}>
                    2. Resumo Qualitativo de Maturidade Regulatória
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="p-5 rounded-2xl text-center space-y-2" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)' }}>
                      <span className="mg-code block">Média Ponderada MMGIA</span>
                      <div className="text-4xl font-black" style={{ fontFamily: 'var(--mg-font-mono)', color: 'var(--brand)' }}>{formatNumber(globalScore)} / 3,00</div>
                      <LevelBadge level={levelInfo.num as Level} />
                    </div>

                    <div className="space-y-1 text-xs leading-relaxed mg-lead">
                      <strong style={{ color: 'var(--text)' }} className="block font-medium">Interpretação Baseada na Metodologia:</strong>
                      <p className="text-justify leading-normal">{levelInfo.desc}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-tight" style={{ color: 'var(--text)' }}>Implicações Práticas & Riscos Mapeados</h4>
                    <p className="text-xs italic pl-3 leading-relaxed text-justify mg-lead" style={{ borderLeft: '2px solid var(--surface-deep)' }}>
                      {levelInfo.risco}
                    </p>

                    <h4 className="font-bold text-xs uppercase tracking-tight" style={{ color: 'var(--text)' }}>Alinhamento aos Marcos Globais</h4>
                    <p className="text-xs leading-relaxed text-justify mg-lead">
                      Este resultado valida o estado técnico e de conformidade do modelo com as imposições futuras do <strong>PL 2338/2023</strong> (Marco de IA no Congresso Brasileiro), da Lei Geral de Proteção de Dados (<strong>LGPD</strong>), de diretrizes internacionais de design ético (<strong>AI Act da União Europeia</strong>), e com as práticas integradas e unificadas das normas <strong>ISO/IEC 42001</strong>.
                    </p>

                    <div className="p-4 rounded-xl space-y-1" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)' }}>
                      <span className="mg-code block" style={{ textTransform: 'uppercase' }}>Mapeamento Geral de Riscos</span>
                      {globalScore < 1.0 ? (
                        <p className="mg-small">A entidade opera com risco regulatório Crítico. Requer instituição imediata de políticas básicas regulatórias e criação de um Comitê Focal para evitar processos e incidentes relacionados à Shadow IA.</p>
                      ) : globalScore < 2.0 ? (
                        <p className="mg-small">A entidade opera em nível de risco Moderado. Possui processos definidos, porém com inconsistências pontuais de execução departamental. Vital instituir o Relatório de Impacto de IA.</p>
                      ) : (
                        <p className="mg-small">A entidade atinge excelente conformidade regulatória ativa, com riscos residuais mínimos. Recomenda-se manter rotinas periódicas de simulação (Red Teaming) e auditorias de transparência.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 3: Matrix scores, dimension scores, benchmarking */}
              {activePdfPage === 3 && (
                <div className="space-y-5 font-sans text-left">
                  <h3 className="text-xl font-bold uppercase pb-2.5" style={{ color: 'var(--text)', borderBottom: '1px solid var(--surface-deep)' }}>
                    3. Detalhamento dos Eixos por Média de Importância
                  </h3>

                  <p className="text-xs leading-relaxed mg-lead">
                    O cálculo do Score Global ponderado converge o desempenho das práticas de cada pilar de acordo com os seguintes pesos de importância estratégica fundamentados na metodologia oficial:
                  </p>

                  <DataTable<WeightRow & { name: string }>
                    caption="Score, peso e contribuição por eixo de maturidade"
                    rowKey={(r) => r.id}
                    columns={[
                      { key: 'name', header: 'Eixo de Maturidade', render: (r) => r.name },
                      { key: 'score', header: 'Score Obtido', numeric: true, render: (r) => formatNumber(r.score) },
                      { key: 'weight', header: 'Peso', numeric: true, render: (r) => `${Math.round(r.weight * 100)}%` },
                      { key: 'contrib', header: 'Contribuição', numeric: true, render: (r) => `+${formatNumber(r.contribution, 3)}` },
                    ]}
                    rows={[
                      { ...weightRows[0], name: '1. Governança e Arcabouço Regulatório' },
                      { ...weightRows[1], name: '2. Desenvolvimento Tecnológico, Pesquisa e Inovação' },
                      { ...weightRows[2], name: '3. Segurança, Confiança e Proteção da Sociedade' },
                      { ...weightRows[3], name: '4. Educação, Capacitação e Cultura Organizacional' },
                      { ...weightRows[4], name: '5. Cooperação e Inserção no Ecossistema' },
                    ]}
                  />

                  <p className="mg-code">Score Global Prévia (Total): {formatNumber(globalScore)} / 3,00</p>

                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-xs uppercase" style={{ color: 'var(--text)' }}>Comparativos de Grupo (Setor: {metadata.setor})</h4>
                    <p className="text-xs leading-relaxed text-justify mg-lead">
                      Sua pontuação ponderada final é de <strong>{formatNumber(globalScore)}</strong>, enquanto o benchmark ilustrativo da média do segmento ativo no Brasil indica um índice de referência nacional de comumente <strong>{formatNumber(peerAverageGlobal)}</strong>.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed font-sans">
                      <div className="p-3 rounded-xl" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)' }}>
                        <strong className="text-[11px] block font-semibold" style={{ color: 'var(--text)' }}>Conformidade do Setor</strong>
                        <span className="text-[11px] block mt-0.5 mg-muted">
                          A organização encontra-se em patamar {' '}
                          <StatusBadge status={globalScore >= peerAverageGlobal ? 'good' : 'attention'}>
                            {globalScore >= peerAverageGlobal ? 'Vantajoso / Acima da Média' : 'De Atenção / Ajustes Prioritários'}
                          </StatusBadge>
                          {' '}comparada aos órgãos do grupo.
                        </span>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)' }}>
                        <strong className="text-[11px] block font-semibold" style={{ color: 'var(--text)' }}>Distância para a Meta Técnica</strong>
                        <span className="text-[11px] block mt-0.5 mg-muted">
                          Déficit da meta de maturidade padrão (Nível 3 definido com score 2,00) fixado em <strong>{formatNumber(globalScore - 2.0)}</strong> pontos.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 4: Roadmaps, gap resolutions & signatures */}
              {activePdfPage === 4 && (
                <div className="space-y-6 font-sans text-left">
                  <h3 className="text-xl font-bold uppercase pb-2.5" style={{ color: 'var(--text)', borderBottom: '1px solid var(--surface-deep)' }}>
                    4. Recomendações Críticas e Assinaturas
                  </h3>

                  <p className="text-xs leading-relaxed mg-lead">
                    Mapeamos recomendações de impacto na escala de maturidade. Tratam-se de ações proativas para sanar canais e práticas de conformidade preliminarmente incipientes (Nulo ou Parcial):
                  </p>

                  <div className="space-y-3 font-sans text-xs">
                    {(gaps.length > 0 ? gaps : LIST_PRACTICES.filter(p => p.level <= 2)).slice(0, 3).map((gap, i) => {
                      const rec = getGapRecommendation(gap.id);
                      return (
                        <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)' }}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="mg-code" style={{ color: 'var(--brand)' }}>Prática {gap.id} — {gap.name}</span>
                            <StatusBadge status="critical">Alta prioridade</StatusBadge>
                          </div>
                          <p className="text-[10.5px] leading-normal italic mg-muted">
                            <strong>Ação Implementação:</strong> {rec.action}
                          </p>
                          <span className="mg-code block mt-1">Eixo: {DIMENSIONS[gap.dimensionId].shortName} · Esforço Operacional: {rec.effort}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <h4 className="font-bold text-xs uppercase" style={{ color: 'var(--text)' }}>Diretrizes Práticas Finais</h4>
                    <p className="text-xs leading-relaxed mt-1 text-justify mg-lead">
                      A conformidade regulatória plena dar-se-á com a instituição robusta do <strong>Comitê de IA</strong> formalizado nos diários oficiais municipais, estaduais ou feeds internos, promovendo a transparência, mitigando alucinações cognitivas graves de algoritmos generativos e garantindo as auditorias de explicabilidade perante o cidadão em consonância com o PL 2338/2023.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-10 text-center leading-snug">
                    <div className="space-y-1">
                      <div className="pt-1 font-bold" style={{ borderTop: '1px solid var(--surface-deep)', color: 'var(--text)' }}>Comitê de Governança de IA</div>
                      <span className="mg-code">Representante Técnico Integrado MMGIA</span>
                    </div>
                    <div className="space-y-1">
                      <div className="pt-1 font-bold" style={{ borderTop: '1px solid var(--surface-deep)', color: 'var(--text)' }}>Encarregado de Proteção de Dados (DPO)</div>
                      <span className="mg-code">Compliance e Proteção Regulatória da LGPD</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-3 mt-10" style={{ borderTop: '1px solid var(--surface-deep)' }}>
                <span className="mg-code">MMGIA — Comitê Técnico Informativo</span>
                <span className="mg-code">Página {activePdfPage} de 4</span>
              </div>
            </div>
          </div>

          {/* Footer helper text */}
          <div className="text-center py-4" style={{ borderTop: '1px solid var(--ink-raised)' }}>
            <span className="mg-code" style={{ color: 'var(--on-ink-muted)' }}>
              Este visualizador interativo simula fielmente as páginas de exportação física do relatório rascunho em formato A4. Utilize o botão "Salvar / imprimir PDF" para salvar como arquivo PDF de forma permanente.
            </span>
          </div>
        </div>
      )}
    </DsRoot>
  );
}
