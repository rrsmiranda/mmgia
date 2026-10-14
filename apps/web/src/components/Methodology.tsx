/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calculator, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DIMENSIONS, LIST_PRACTICES, DimensionId } from '@mmgia/shared/types';
import { DIMENSION_WEIGHTS, getMaturityLevel } from '@mmgia/shared/scoring';
import {
  Banner,
  Card,
  CardBody,
  CardHeader,
  DIMENSION_ORDER,
  DataTable,
  DimensionTag,
  DsRoot,
  LegalBadge,
  LevelBadge,
  Page,
  RiskBadge,
  formatNumber,
  type Level,
} from '@mmgia/shared/design-system';

const MENU_ITEMS = [
  { id: 'sobre', label: 'Sobre o MMGIA' },
  { id: 'niveis', label: 'Níveis de maturidade' },
  { id: 'dimensoes', label: 'Dimensões (45 práticas)' },
  { id: 'calculo', label: 'Fórmula de cálculo' },
  { id: 'regulatorio', label: 'Fundamentação do modelo' },
  { id: 'privacidade', label: 'Arquitetura de privacidade' },
];

/**
 * As 6 linhas vêm de getMaturityLevel (scoring.ts), a mesma função que calcula o
 * resultado real de cada avaliação — não um texto hardcoded à parte. Um score
 * representativo (o meio de cada faixa) é usado só para "entrar" na faixa certa;
 * label, descrição e risco voltam exatamente como o motor de cálculo os define.
 */
const LEVELS: Level[] = [0, 1, 2, 3, 4, 5];
const SCORE_RANGES: Record<Level, string> = {
  0: '< 0,50',
  1: '0,50 a 0,99',
  2: '1,00 a 1,49',
  3: '1,50 a 1,99',
  4: '2,00 a 2,49',
  5: '≥ 2,50',
};
const LEVEL_MIDPOINTS: Record<Level, number> = { 0: 0.25, 1: 0.75, 2: 1.25, 3: 1.75, 4: 2.25, 5: 2.75 };
const LEVEL_ROWS = LEVELS.map((lvl) => ({ lvl, info: getMaturityLevel(LEVEL_MIDPOINTS[lvl]) }));

/**
 * Reproduz, sem adicionar nada, a única passagem do documento oficial do MMGIA sobre
 * fundamentação normativa (Parte I, Introdução) — o modelo não detalha essa relação
 * por artigo, cláusula ou prática.
 */
const FOUNDATION_GROUPS: { title: string; items: string[] }[] = [
  { title: 'Alinhamento estratégico', items: ['Estratégia Nacional de Inteligência Artificial (ENIA) 2026–2029'] },
  { title: 'Referenciais de maturidade', items: ['Modelo de maturidade de IA do MITRE', 'CMMI'] },
  { title: 'Normas e regulações incorporadas', items: ['AI Act da União Europeia', 'AI Risk Management Framework (NIST)', 'ISO/IEC 42001, 23894 e 38507', 'LGPD'] },
];

export default function Methodology() {
  const [activeSection, setActiveSection] = useState('niveis');
  const [expandedDim, setExpandedDim] = useState<DimensionId | null>('gov');

  const handleMenuClick = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <DsRoot>
      <Page>
        <div className="mg-grid" style={{ ['--cols-d' as string]: '260px 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 32, alignItems: 'start' }}>
          {/* NAV RAIL */}
          <nav aria-label="Índice metodológico" className="mg-only-desktop" style={{ position: 'sticky', top: 96 }}>
            <Card>
              <p className="mg-eyebrow">Índice metodológico</p>
              <ul className="mg-stack" style={{ gap: 4, marginTop: 12, listStyle: 'none', padding: 0 }}>
                {MENU_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item.id)}
                      className="mg-btn mg-btn--ghost mg-method-navbtn"
                      style={{ width: '100%', justifyContent: 'flex-start', ...(activeSection === item.id ? { background: 'var(--brand)', color: 'var(--on-brand)' } : {}) }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </nav>

          {/* CONTEÚDO */}
          <div className="mg-stack" style={{ gap: 32 }}>
            <div>
              <p className="mg-eyebrow">Metodologia oficial</p>
              <h1 className="mg-h1" style={{ marginTop: 8, fontSize: 'var(--font-size-scale-up-06)' }}>Modelo de Maturidade em Governança de IA (MMGIA)</h1>
              <p className="mg-lead" style={{ marginTop: 8 }}>
                Mapeamento de maturidade organizacional alinhado à Estratégia Nacional de Inteligência Artificial (ENIA 2026–2029).
              </p>
            </div>

            {/* SOBRE */}
            <Card as="section" id="sobre" style={{ scrollMarginTop: 96 }}>
              <CardHeader title="O que é o MMGIA?" />
              <CardBody>
                <p className="mg-small mg-muted">
                  O MMGIA é um modelo de autoavaliação gratuito e anônimo que ajuda organizações brasileiras a medir sua
                  maturidade em governança de inteligência artificial, alinhado à Estratégia Nacional de Inteligência
                  Artificial (ENIA 2026–2029). A avaliação cobre 45 práticas distribuídas em 5 dimensões; o resultado
                  aponta em quais delas a organização está mais atrasada e o que fazer para evoluir.
                </p>
                <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(2,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--surface-deep)' }}>
                  <div className="mg-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircle2 className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--status-good)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="mg-title">Sem cadastro</p>
                      <p className="mg-small mg-muted" style={{ marginTop: 2 }}>Sem login, nome, CNPJ ou e-mail. O score é calculado inteiramente no seu navegador.</p>
                    </div>
                  </div>
                  <div className="mg-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircle2 className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--status-good)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="mg-title">Com base legal</p>
                      <p className="mg-small mg-muted" style={{ marginTop: 2 }}>Práticas relacionadas, quando cabível, a LGPD, ISO/IEC 42001 e AI Act da União Europeia.</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* NÍVEIS */}
            <Card as="section" id="niveis" style={{ scrollMarginTop: 96 }}>
              <CardHeader title="Os 6 níveis de maturidade" />
              <CardBody>
                <p className="mg-small mg-muted" style={{ marginTop: -8, marginBottom: 16 }}>
                  O score global (0 a 3) é convertido em um nível de maturidade (0 a 5); cada nível tem um risco
                  associado, descrito no documento oficial do MMGIA.
                </p>
                <div className="mg-lvltable">
                  <DataTable<{ lvl: Level; info: ReturnType<typeof getMaturityLevel> }>
                    caption="Níveis de maturidade, faixa de score, descrição e risco associado"
                    rowKey={(r) => String(r.lvl)}
                    columns={[
                      { key: 'lvl', header: 'Nível', render: (r) => <LevelBadge level={r.lvl} /> },
                      { key: 'range', header: 'Faixa de score', render: (r) => SCORE_RANGES[r.lvl] },
                      { key: 'desc', header: 'Descrição', render: (r) => r.info.desc },
                      { key: 'risk', header: 'Risco associado', render: (r) => <RiskBadge level={r.lvl} /> },
                    ]}
                    rows={LEVEL_ROWS}
                  />
                </div>
              </CardBody>
            </Card>

            {/* DIMENSÕES */}
            <Card as="section" id="dimensoes" style={{ scrollMarginTop: 96 }} flush>
              <div style={{ padding: 'var(--space-6)', paddingBottom: 0 }}>
                <p className="mg-title">Dimensões e práticas mapeadas</p>
                <p className="mg-small mg-muted" style={{ marginTop: 8 }}>
                  Expanda os painéis dos 5 pilares para visualizar os direcionamentos técnicos e as prioridades de nível correspondentes.
                </p>
              </div>

              <div className="mg-stack" style={{ gap: 12, padding: 'var(--space-6)' }} id="methodology-accordions">
                {(DIMENSION_ORDER as DimensionId[]).map((key) => (
                  <details key={key} className="mg-acc" open={key === 'gov'}>
                    <summary>
                      <DimensionTag dimension={key} />
                      <span className="chev" aria-hidden="true">▾</span>
                    </summary>
                    {LIST_PRACTICES.filter((p) => p.dimensionId === key).map((p) => (
                      <div key={p.id} className="mg-acc-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <div className="mg-row" style={{ justifyContent: 'space-between' }}>
                          <span className="mg-code">Prática {p.id} · nível {p.level}</span>
                          {p.legalReference && <LegalBadge>{p.legalReference}</LegalBadge>}
                        </div>
                        <p className="mg-title" style={{ marginTop: 6 }}>{p.name}</p>
                        <p className="mg-small mg-muted" style={{ marginTop: 4 }}>{p.description}</p>
                        <div className="mg-practice-meta">
                          <div>
                            <p className="mg-eyebrow">Critério de verificação</p>
                            <p className="mg-small" style={{ marginTop: 4 }}>{p.criterion}</p>
                          </div>
                          <div>
                            <p className="mg-eyebrow">Artefato chave</p>
                            <p className="mg-small mg-muted" style={{ marginTop: 4 }}>{p.evidence}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </details>
                ))}
              </div>
            </Card>

            {/* CÁLCULO */}
            <Card as="section" id="calculo" style={{ scrollMarginTop: 96 }}>
              <CardHeader title={<span className="mg-row" style={{ gap: 8 }}><Calculator className="mg-ico mg-ico-sm" aria-hidden="true" />Fórmula de cálculo do score</span>} />
              <CardBody>
                <p className="mg-small mg-muted">
                  O score de cada nível (1 a 5) é a média das práticas respondidas naquele nível. O score de cada
                  dimensão é a média dos scores de nível que tiveram ao menos uma prática respondida — níveis sem
                  nenhuma resposta não entram na média. O score global é a média ponderada das 5 dimensões, segundo
                  os pesos do modelo.
                </p>

                <div style={{ marginTop: 16, padding: 24, background: 'var(--ink)', color: 'var(--on-ink)', borderRadius: 'var(--radius-lg)' }} id="math-formula-box">
                  <p className="mg-code" style={{ color: 'var(--on-ink-muted)' }}>// equação de cálculo geral</p>
                  <div style={{ marginTop: 12, padding: 16, background: 'var(--ink-raised)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 800 }}>
                    Score Global = Σ (Score Dimensão × Peso Dimensão)
                  </div>
                  <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(5,1fr)', ['--cols-t' as string]: 'repeat(3,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)', gap: 8, marginTop: 12 }}>
                    {(DIMENSION_ORDER as DimensionId[]).map((id) => (
                      <div key={id} className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)', color: 'var(--on-ink)' }}>
                        {DIMENSIONS[id].shortName} = {Math.round(DIMENSION_WEIGHTS[id] * 100)}%
                      </div>
                    ))}
                  </div>
                  <p className="mg-small" style={{ marginTop: 16, color: 'var(--on-ink-muted)' }}>Onde as respostas na escala NPLF correspondem aos seguintes pesos numéricos:</p>
                  <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(4,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)', gap: 8, marginTop: 12 }}>
                    <div className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)', color: 'var(--on-ink)' }}>Nulo (N) = {formatNumber(0)}</div>
                    <div className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)', color: 'var(--on-ink)' }}>Parcial (P) = {formatNumber(1)}</div>
                    <div className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)', color: 'var(--on-ink)' }}>Larga (L) = {formatNumber(2)}</div>
                    <div className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)', color: 'var(--on-ink)' }}>Total (F) = {formatNumber(3)}</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* REGULATÓRIO */}
            <Card as="section" id="regulatorio" style={{ scrollMarginTop: 96 }}>
              <CardHeader title="Fundamentação do modelo" />
              <CardBody>
                <p className="mg-small mg-muted" style={{ marginTop: -8, marginBottom: 16 }}>
                  O documento oficial descreve a fundamentação do modelo em termos gerais, sem detalhar essa relação
                  por artigo, cláusula ou prática: o MMGIA é alinhado à ENIA, fundamentado em referenciais de
                  maturidade de mercado e incorpora requisitos e diretrizes de normas e regulações essenciais. Quando
                  uma prática específica tem referência normativa direta, o relatório da avaliação mostra essa
                  citação ao lado dela.
                </p>
                <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 16 }}>
                  {FOUNDATION_GROUPS.map((group) => (
                    <Card key={group.title}>
                      <p className="mg-label">{group.title}</p>
                      <ul className="mg-stack" style={{ gap: 4, marginTop: 8, paddingLeft: 18, listStyle: 'disc' }}>
                        {group.items.map((item) => <li key={item} className="mg-small">{item}</li>)}
                      </ul>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* PRIVACIDADE */}
            <Card as="section" id="privacidade" style={{ scrollMarginTop: 96 }}>
              <CardHeader title={<span className="mg-row" style={{ gap: 8 }}><ShieldCheck className="mg-ico mg-ico-sm" aria-hidden="true" />Arquitetura de privacidade</span>} />
              <CardBody>
                <p className="mg-small mg-muted">
                  O score é calculado inteiramente no seu navegador — nenhuma resposta é enviada a um servidor. As
                  respostas ficam salvas no armazenamento local do navegador, associadas ao código de avaliação gerado
                  ao final; é esse código, e não login ou e-mail, que permite editar a avaliação depois.
                </p>
                <div style={{ marginTop: 16 }}>
                  <Banner tone="good" title="Sem dados que identifiquem a organização">
                    Os dados agregados do painel público nunca incluem nome da organização, CNPJ, e-mail ou IP — essas
                    informações não são coletadas em nenhuma etapa da avaliação.
                  </Banner>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Page>
    </DsRoot>
  );
}
