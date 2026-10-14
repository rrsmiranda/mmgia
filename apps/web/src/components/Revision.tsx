/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Eye, Info, X } from 'lucide-react';
import { ScoreLevel, LIST_PRACTICES, DimensionId, AssessmentMetadata } from '@mmgia/shared/types';
import { DIMENSION_WEIGHTS } from '@mmgia/shared/scoring';
import AnswerReview from './AnswerReview';
import {
  ActionBar,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DIMENSION_ORDER,
  DimensionTag,
  DsRoot,
  LevelBadge,
  Page,
  PageHeader,
  type Level,
} from '@mmgia/shared/design-system';

interface RevisionProps {
  answers: Record<string, ScoreLevel>;
  metadata: AssessmentMetadata;
  onGoToPractice: (dimensionId: DimensionId, index: number) => void;
  onGoBackToQuestionnaire: () => void;
  onConfirmAndGenerateResult: () => void;
  onViewReport?: () => void;
  /** Dimensão a abrir já na lista de conferência (ex.: voltando do Resultado para corrigir uma prática). */
  initialOpenDim?: DimensionId | null;
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
    risco: 'Neste nível, a organização opera em estado de total desconhecimento e descontrole quanto às atividades de IA. A ausência completa de governança expõe a organização a um nível de risco crítico. A proliferação de Shadow AI — o uso de ferramentas e sistemas de IA por funcionários sem aprovação ou supervisão formais — é inevitável, criando pontos cegos significativos para a segurança e a gestão.',
  },
  {
    lvl: 1,
    scoreRange: '0,5 a 1,0',
    title: 'Nível 1 — Inicial',
    desc: 'As práticas são ad hoc, reativas e dependentes de indivíduos. O sucesso em iniciativas de IA é imprevisível e ocorre apesar da ausência de processos formais, geralmente impulsionado por "heróis" organizacionais. Há uma conscientização da necessidade de práticas de governança de IA.',
    risco: 'No nível Inicial, a organização começa a ter bolsões de atividade de IA, mas de forma desorganizada. O nível de risco permanece crítico, pois não há uma abordagem sistemática para a gestão. A dependência de "heróis" cria um ponto único de falha; o conhecimento não é institucionalizado e se perde com a saída desses indivíduos.',
  },
  {
    lvl: 2,
    scoreRange: '1,0 a 1,5',
    title: 'Nível 2 — Gerenciado',
    desc: 'Práticas básicas de gestão de projetos e de supervisão são aplicadas às iniciativas de IA. Políticas e responsabilidades começam a ser definidas em nível de projeto ou de departamento, mas a aplicação ainda é inconsistente em toda a organização.',
    risco: 'Neste estágio, a governança é predominantemente reativa, sempre um passo atrás das capacidades tecnológicas. Embora existam práticas básicas de gestão, a sua aplicação inconsistente em silos organizacionais cria lacunas perigosas. O nível de risco é alto, pois a ausência de uma estrutura de governança centralizada e uniforme implica que as regras aplicadas a um projeto podem ser completamente diferentes das de outro projeto.',
  },
  {
    lvl: 3,
    scoreRange: '1,5 a 2,0',
    title: 'Nível 3 — Definido',
    desc: 'Processos de governança de IA são padronizados, documentados e disseminados em toda a organização, constituindo um "jeito organizacional" de fazer com IA. Há um entendimento comum sobre papéis, responsabilidades e procedimentos.',
    risco: 'O estabelecimento de processos padronizados e documentados reduz significativamente a ambiguidade e o caos dos níveis anteriores, reduzindo o risco para um nível moderado. A organização agora possui uma base sólida para a governança. No entanto, um risco fundamental neste estágio é a rigidez das regras estáticas perante a velocidade da evolução tecnológica.',
  },
  {
    lvl: 4,
    scoreRange: '2,0 a 2,5',
    title: 'Nível 4 — Gerenciado Quantitativamente',
    desc: 'A organização mede e controla o desempenho de seus processos de governança de IA por meio de métricas e dados estatísticos. O desempenho é previsível e os desvios são gerenciados proativamente.',
    risco: 'Neste nível, a governança deixa de basear-se em suposições e passa a ser orientada por dados, reduzindo o risco. O monitoramento contínuo substitui as revisões periódicas. O principal risco neste estágio é a complacência e o foco exclusivo em métricas numéricas simples que ignoram aspectos éticos complexos.',
  },
  {
    lvl: 5,
    scoreRange: '2,5 a 3,0',
    title: 'Nível 5 — Otimizado',
    desc: 'A organização foca na melhoria contínua e proativa dos processos de governança de IA. O feedback, tanto quantitativo quanto qualitativo, é utilizado para identificar oportunidades de inovação e refinar as práticas em um ciclo virtuoso.',
    risco: 'No nível mais alto de maturidade, a governança de IA se torna inteligente, adaptativa e totalmente integrada à estratégia de negócio, trazendo um exponencial diferencial competitivo. O risco residual é a de eventuais disrupções globais de regulação ou infraestrutura técnica onde reações refinadas demandam extrema flexibilidade.',
  },
];

export default function Revision({
  answers,
  metadata,
  onGoToPractice,
  onGoBackToQuestionnaire,
  onConfirmAndGenerateResult,
  onViewReport,
  initialOpenDim,
}: RevisionProps) {
  const [showDetails, setShowDetails] = useState(false);

  const overallUnansweredCount = LIST_PRACTICES.filter(p => !answers[p.id]).length;

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
              <Button variant="primary" icon={Eye} onClick={onViewReport}>
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
                <DataTable<{ id: DimensionId; weight: number }>
                  caption="Peso de cada dimensão no Score Global"
                  rowKey={(r) => r.id}
                  columns={[
                    { key: 'dim', header: 'Eixo', render: (r) => <DimensionTag dimension={r.id} /> },
                    { key: 'weight', header: 'Peso', numeric: true, render: (r) => `${Math.round(r.weight * 100)}%` },
                  ]}
                  rows={DIMENSION_ORDER.map((id) => ({ id, weight: DIMENSION_WEIGHTS[id] }))}
                />
              </div>

              <div className="mg-stack" style={{ marginTop: 24, gap: 12 }}>
                <h3 className="mg-title">O que significa cada nível de maturidade?</h3>
                {LEVEL_MEANINGS.map((item) => (
                  <Card key={item.lvl}>
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
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <div className="mg-stack" style={{ gap: 16 }}>
          {overallUnansweredCount > 0 && (
            <Banner tone="attention" title="Práticas em aberto encontradas">
              Identificamos <strong>{overallUnansweredCount} práticas sem resposta</strong> de um total de 45 diretrizes.
              Você pode prosseguir e registrar os resultados, mas as faltantes contarão como score zero (Nulo).
            </Banner>
          )}

          <AnswerReview answers={answers} onEditPractice={onGoToPractice} initialOpenDim={initialOpenDim} />
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

    </DsRoot>
  );
}
