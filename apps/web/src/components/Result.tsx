/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Check,
  Compass,
  Copy,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Printer,
  RotateCcw,
  X,
} from 'lucide-react';
import { ScoreLevel, DIMENSIONS, DimensionId, AssessmentMetadata } from '@mmgia/shared/types';
import { rotuloArea } from '@mmgia/shared/taxonomy';
import {
  DIMENSION_WEIGHTS,
  getAllDimensionScores,
  getGlobalScore,
  getMaturityLevel,
} from '@mmgia/shared/scoring';
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
  DIMENSION_ICONS,
  DIMENSION_ORDER,
  DimensionTag,
  DsRoot,
  LevelBadge,
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

/** item.dim no plano abaixo guarda o nome curto da dimensão (texto); este mapa acha o ícone correspondente. */
const SHORTNAME_TO_DIM_ID = Object.fromEntries(
  (Object.keys(DIMENSIONS) as DimensionId[]).map((id) => [DIMENSIONS[id].shortName, id])
) as Record<string, DimensionId>;

const ACTION_PLAN = [
  { step: '01', title: 'Formalização e Portarias Jurídicas', desc: 'Constituição do Comitê Ético e designação oficial do DPO (Encarregado de Privacidade) assumindo as chaves algorítmicas.', dim: 'Governança', effort: 'Baixo esforço', time: 'Semana 1-2' },
  { step: '02', title: 'Blindagem de Inputs e Letramento Básico', desc: 'Saneamento preventivo em requisições de prompts e disparos massivos de cartilhas de uso responsável para toda a corporação.', dim: 'Segurança', effort: 'Médio esforço', time: 'Semana 3-4' },
  { step: '03', title: 'Inventário Geral de Chaves e Engenhos de IA', desc: 'Centralização organizada de repositórios de dados no padrão JSON especificando o ciclo ativo e finalidade de modelos de treino.', dim: 'Inovação', effort: 'Médio esforço', time: 'Semana 5-6' },
  { step: '04', title: 'Simulacros Éticos de Ataque (Red Teaming)', desc: 'Recrutamento de equipe e workshops dedicados para teste de vazamentos algorítmicos voluntários e testes de viesses demográficos.', dim: 'Segurança', effort: 'Alto esforço', time: 'Mês 2' },
];

interface WeightRow {
  id: DimensionId;
  score: number;
  weight: number;
  contribution: number;
}

export default function Result({ answers, metadata, onRestart, onChangeTab, onViewReport, onEditPractice }: ResultProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(metadata.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Score Calculus (ver packages/shared/src/lib/scoring.ts — Passos 3-5 da metodologia oficial)
  const currentScores: Record<DimensionId, number> = getAllDimensionScores(answers);
  const globalScore = getGlobalScore(answers);
  const levelInfo = getMaturityLevel(globalScore);

  const areaLabel = rotuloArea(metadata.setor, metadata.area) ?? 'sua área de atuação';

  const weightRows: WeightRow[] = DIMENSION_ORDER.map((id) => ({
    id,
    score: currentScores[id],
    weight: DIMENSION_WEIGHTS[id],
    contribution: currentScores[id] * DIMENSION_WEIGHTS[id],
  }));

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
            Sua organização cumpre em caráter parcial ou pleno grande parte das práticas fundamentais de governança no grupo de <strong>{areaLabel}</strong>. Confira abaixo o mapeamento detalhado e as prioridades regulatórias.
          </p>
          <ActionBar inline>
            <Button variant="secondary" onInk icon={Info} onClick={() => setShowDetails((v) => !v)}>
              {showDetails ? 'Ocultar detalhamento' : 'Como minha média foi calculada?'}
            </Button>
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

        {showDetails && (
          <Card style={{ marginBottom: 24 }}>
            <CardHeader
              title="Memória de cálculo da média de maturidade ponderada"
              actions={<Button variant="ghost" size="sm" iconOnly icon={X} aria-label="Fechar memória de cálculo" onClick={() => setShowDetails(false)} />}
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

        <div style={{ marginBottom: 24 }}>
          <DimensionAnalysis answers={answers} onEditPractice={onEditPractice} />
        </div>

        {/* ACTION PLAN */}
        <Card style={{ marginBottom: 24 }} id="action-plan">
          <CardHeader title="Plano de implementação prática" />
          <CardBody>
            <p className="mg-small mg-muted" style={{ marginTop: -8, marginBottom: 16 }}>Mapeamento sequencial de rotinas voltadas para atingir robustez algorítmica.</p>
            <div className="mg-stack" style={{ gap: 12 }}>
              {ACTION_PLAN.map((item) => {
                const ItemDimIcon = DIMENSION_ICONS[SHORTNAME_TO_DIM_ID[item.dim]];
                return (
                <div key={item.step} className="mg-row" style={{ gap: 16, padding: 16, background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)', borderRadius: 'var(--radius-lg)', flexWrap: 'wrap' }}>
                  <span className="mg-code" style={{ fontSize: 16, width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'var(--brand)', color: 'var(--on-brand)', borderRadius: 'var(--radius-pill)', flexShrink: 0 }}>
                    {item.step}
                  </span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p className="mg-title">{item.title}</p>
                    <p className="mg-small mg-muted" style={{ marginTop: 2 }}>{item.desc}</p>
                  </div>
                  <div className="mg-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <span className="mg-code" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <ItemDimIcon className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--brand)' }} />
                      {item.dim}
                    </span>
                    <span className="mg-code">{item.effort}</span>
                    <span className="mg-code">{item.time}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

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
