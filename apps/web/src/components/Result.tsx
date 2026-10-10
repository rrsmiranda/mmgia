/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  Check,
  Compass,
  Copy,
  Eye,
  FileText,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { ScoreLevel, DIMENSIONS, DimensionId, AssessmentMetadata } from '@mmgia/shared/types';
import { rotuloArea } from '@mmgia/shared/taxonomy';
import {
  getAllDimensionScores,
  getGlobalScore,
  getLevelScores,
  getMaturityLevel,
} from '@mmgia/shared/scoring';
import { getGaps, getKeyFindings } from './report/ActionPlan';
import DimensionAnalysis from './DimensionAnalysis';
import PlexusBackground from './PlexusBackground';
import CountUp from './CountUp';
import {
  ActionBar,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DIMENSION_ORDER,
  DimensionTag,
  DsRoot,
  LevelBadge,
  NplfBadge,
  Page,
  RiskBadge,
  formatNumber,
  type Level,
} from '@mmgia/shared/design-system';

interface ResultProps {
  answers: Record<string, ScoreLevel>;
  metadata: AssessmentMetadata;
  onRestart: () => void;
  onChangeTab: (tab: string) => void;
  /** Abre o relatório executivo (ReportViewer). `print` já dispara o diálogo de impressão. */
  onViewReport: (options?: { print?: boolean }) => void;
  /** "Editar" numa prática: volta para a Revisão com a dimensão já aberta. */
  onEditPractice: (dim: DimensionId) => void;
  theme?: 'light' | 'dark';
}

interface LevelRow {
  id: DimensionId;
  scores: Record<1 | 2 | 3 | 4 | 5, number | null>;
}

type ResultTab = 'overview' | 'calc' | 'gaps';

const TABS: { id: ResultTab; label: string }[] = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'calc', label: 'Memória de cálculo' },
  { id: 'gaps', label: 'Lacunas priorizadas' },
];

const PRACTICE_LEVELS = [1, 2, 3, 4, 5] as const;
const PRIORITY_GAPS_SHOWN = 8;

export default function Result({ answers, metadata, onRestart, onChangeTab, onViewReport, onEditPractice }: ResultProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>('overview');
  const prefersReducedMotion = useReducedMotion();
  const tabPanelRef = useRef<HTMLDivElement | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(metadata.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (tab: ResultTab) => {
    setActiveTab(tab);
    tabPanelRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  // Score Calculus (ver packages/shared/src/lib/scoring.ts — Passos 3-5 da metodologia oficial)
  const currentScores: Record<DimensionId, number> = getAllDimensionScores(answers);
  const globalScore = getGlobalScore(answers);
  const levelInfo = getMaturityLevel(globalScore);

  const areaLabel = rotuloArea(metadata.setor, metadata.area) ?? 'sua área de atuação';

  const levelRows: LevelRow[] = DIMENSION_ORDER.map((id) => ({
    id,
    scores: getLevelScores(id, answers),
  }));

  // Mesmas lacunas e conclusões do relatório PDF (report/ActionPlan.tsx e report/Summary.tsx) —
  // uma só função de origem, para que os números nunca divirjam entre tela e PDF.
  const gaps = getGaps(answers);
  const findings = getKeyFindings(gaps, currentScores, levelInfo, answers);
  const topGaps = gaps.slice(0, PRIORITY_GAPS_SHOWN);

  return (
    <DsRoot>
      <Page>
        {/* SCORE HERO */}
        <section className="mg-hero" style={{ borderRadius: 'var(--radius-xl)', padding: '48px 32px', textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden' }} id="result-hero-box">
          <PlexusBackground />
          <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="mg-eyebrow">Diagnóstico finalizado · Score Global MMGIA</p>
          <div style={{ position: 'relative', display: 'inline-block', margin: '16px 0' }}>
            <span
              className="mg-ring-spin"
              aria-hidden="true"
              style={{ position: 'absolute', inset: -18, border: '2px dashed var(--on-ink-accent)', opacity: 0.3, borderRadius: 'var(--radius-pill)' }}
            />
            <p style={{ position: 'relative', fontFamily: 'var(--mg-font-mono)', fontWeight: 800, fontSize: 64, lineHeight: 1, margin: 0 }}>
              <CountUp value={globalScore} decimals={2} formatter={(n) => formatNumber(n)} /> <span style={{ fontSize: 28, opacity: 0.7 }}>/ 3</span>
            </p>
          </div>
          <div className="mg-row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <LevelBadge level={levelInfo.num as Level} />
            <RiskBadge level={levelInfo.num as Level} />
          </div>
          <p className="mg-lead" style={{ maxWidth: 640, margin: '16px auto 0' }}>
            {levelInfo.desc} Resultado calculado para o grupo de <strong>{areaLabel}</strong> — explore as abas abaixo para o detalhamento completo.
          </p>
          <ActionBar inline>
            <Button
              variant="primary"
              onInk
              icon={Eye}
              onClick={() => onViewReport()}
            >
              Visualizar relatório executivo
            </Button>
          </ActionBar>
          </div>
        </section>

        {/* ABAS — cada seção troca de conteúdo no lugar, sem rolar a tela toda */}
        <div className="mg-row" role="tablist" aria-label="Seções do diagnóstico" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              size="sm"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* RECOVERY CODE */}
        <Card style={{ marginBottom: 24 }} id="code-recovery-card">
          <div className="mg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="mg-title">Seu código exclusivo de recuperação</p>
              <p className="mg-small mg-muted" style={{ marginTop: 4 }}>
                Esta é a única chave que permite editar ou relançar as respostas registradas de forma segura. Guarde bem.
              </p>
            </div>
            <div className="mg-row" style={{ gap: 12 }}>
              <span className="mg-code" style={{ fontSize: 16, padding: '12px 20px', background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)', borderRadius: 'var(--radius-lg)' }}>
                {metadata.code}
              </span>
              <Button variant="secondary" iconOnly icon={copied ? Check : Copy} aria-label="Copiar código" onClick={handleCopyCode} />
            </div>
          </div>
        </Card>

        <div ref={tabPanelRef} style={{ scrollMarginTop: 96, marginBottom: 24 }}>
          {activeTab === 'overview' && (
            <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
              {/* PRINCIPAIS CONCLUSÕES — mesmos números do PDF (report/Summary.tsx), via getKeyFindings.
                  Junto da Visão geral (não isolada): são 4 frases, pouco conteúdo para uma aba própria,
                  e funcionam como introdução antes do radar/lista por dimensão logo abaixo. */}
              <Card style={{ marginBottom: 24 }}>
                <CardHeader title="Principais conclusões" />
                <CardBody>
                  <ul className="mg-stack" style={{ gap: 8, paddingLeft: 18, listStyle: 'disc' }}>
                    <li>{findings.totalGaps} das {findings.totalPractices} práticas estão inexistentes ou parciais (respostas N ou P).</li>
                    {findings.naoRespondidas > 0 && (
                      <li>
                        Dessas, <strong>{findings.naoRespondidas}</strong> sem resposta e <strong>{findings.nulas}</strong> Nulo
                        — ambas valem zero no cálculo.
                      </li>
                    )}
                    {levelInfo.num < 5 && (
                      <li>
                        {findings.gapsIniciais} estão em níveis 1 a 3 — sustentam a consolidação do nível {findings.proximoNivel}.
                      </li>
                    )}
                    <li>
                      Recomenda-se tratar primeiro <strong>{DIMENSIONS[findings.menorId].name}</strong>: é a dimensão com menor
                      score e peso de {findings.menorPesoPercent}% no resultado global.
                    </li>
                  </ul>
                </CardBody>
              </Card>

              {/* VISÃO GERAL — radar das 5 dimensões, com peso e contribuição de cada uma na lista abaixo */}
              <DimensionAnalysis answers={answers} onEditPractice={onEditPractice} />
            </div>
          )}

          {activeTab === 'calc' && (
            <div role="tabpanel" id="tabpanel-calc" aria-labelledby="tab-calc">
              {/* MEMÓRIA DE CÁLCULO — só a matriz dimensão × nível; peso e contribuição já aparecem na aba Visão geral */}
              <Card>
                <CardHeader title="Score por nível de maturidade" />
                <CardBody>
                  <DataTable<LevelRow>
                    caption="Score por nível de maturidade — média das práticas respondidas em cada nível"
                    rowKey={(r) => r.id}
                    columns={[
                      { key: 'dim', header: 'Dimensão', render: (r) => <DimensionTag dimension={r.id} /> },
                      ...PRACTICE_LEVELS.map((lvl) => ({
                        key: `lvl${lvl}`,
                        header: `Nível ${lvl}`,
                        numeric: true,
                        render: (r: LevelRow) => (r.scores[lvl] !== null ? formatNumber(r.scores[lvl]!) : '—'),
                      })),
                    ]}
                    rows={levelRows}
                  />
                  <p className="mg-small mg-muted" style={{ marginTop: 8 }}>
                    Cada célula é a média das práticas respondidas naquele nível — a base do score de cada dimensão
                    (que, ponderado pelo peso de cada eixo, chega ao Score Global do topo da página). Peso e
                    contribuição de cada dimensão estão na aba Visão geral. "—" indica nível sem nenhuma prática
                    respondida.
                  </p>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'gaps' && (
            <div role="tabpanel" id="tabpanel-gaps" aria-labelledby="tab-gaps">
              {/* LACUNAS PRIORIZADAS — mesma ordenação do plano de ação do PDF (report/ActionPlan.tsx), via getGaps */}
              <Card flush>
                <CardHeader title="Lacunas priorizadas" />
                <>
                  {gaps.length === 0 ? (
                    <p className="mg-small mg-muted" style={{ padding: 'var(--space-5)' }}>
                      Nenhuma lacuna identificada — todas as práticas foram respondidas como Larga (L) ou Total (F).
                    </p>
                  ) : (
                    <>
                      {topGaps.map((practice) => {
                        const answer = answers[practice.id];
                        return (
                          <button
                            key={practice.id}
                            type="button"
                            className="mg-acc-item mg-an-row"
                            style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, borderBottom: '1px solid var(--surface-deep)', cursor: 'pointer' }}
                            onClick={() => onEditPractice(practice.dimensionId)}
                          >
                            <span className="mg-code">{practice.id}</span>
                            <div style={{ minWidth: 0 }}>
                              <p className="mg-title" style={{ fontSize: 14 }}>{practice.name}</p>
                              <p className="mg-small mg-muted" style={{ marginTop: 2 }}>{practice.evidence}</p>
                            </div>
                            <span className="mg-an-legal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                              <DimensionTag dimension={practice.dimensionId} short />
                              <span className="mg-small mg-muted">Nível {practice.level}</span>
                              {answer ? <NplfBadge value={answer} /> : <span className="mg-small mg-muted">Sem resposta</span>}
                            </span>
                          </button>
                        );
                      })}
                      {gaps.length > topGaps.length && (
                        <p className="mg-small mg-muted" style={{ padding: 'var(--space-5)' }}>
                          +{gaps.length - topGaps.length} lacunas adicionais —{' '}
                          <button
                            type="button"
                            onClick={() => handleTabChange('overview')}
                            style={{ background: 'none', border: 0, padding: 0, color: 'var(--brand)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                          >
                            veja o detalhamento completo por dimensão na Visão geral
                          </button>.
                        </p>
                      )}
                    </>
                  )}
                </>
              </Card>
            </div>
          )}
        </div>

        {/* EXPORT ACTIONS — os dois primeiros abrem o mesmo relatório executivo (ReportViewer). */}
        <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(4,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 12 }} id="action-buttons-row">
          <Button variant="primary" icon={FileText} onClick={() => onViewReport()}>Visualizar &amp; exportar PDF</Button>
          <Button variant="primary" icon={Printer} onClick={() => onViewReport({ print: true })}>Imprimir relatório</Button>
          <Button variant="secondary" icon={Compass} onClick={() => onChangeTab('mapa')}>Ver painel geral</Button>
          <Button variant="ghost" icon={RotateCcw} onClick={onRestart}>Novo diagnóstico</Button>
        </div>
      </Page>
    </DsRoot>
  );
}
