/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calculator, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DIMENSIONS, LIST_PRACTICES, DimensionId } from '@mmgia/shared/types';
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
  Page,
  formatNumber,
} from '@mmgia/shared/design-system';

const MENU_ITEMS = [
  { id: 'sobre', label: 'Sobre o MMGIA' },
  { id: 'niveis', label: 'Níveis de maturidade' },
  { id: 'dimensoes', label: 'Dimensões (45 práticas)' },
  { id: 'calculo', label: 'Fórmula de cálculo' },
  { id: 'regulatorio', label: 'Alinhamento regulatório' },
  { id: 'privacidade', label: 'Arquitetura de privacidade' },
];

interface LevelRow { num: string; label: string; desc: string; risk: string; status: 'critical' | 'attention' | 'good' }
const LEVEL_ROWS: LevelRow[] = [
  { num: 'Nível 1', label: 'Iniciado', desc: 'Práticas executadas de maneira ad-hoc, informal e dispersa, sem registro ou salvaguardas formalizadas.', risk: 'Risco alto', status: 'critical' },
  { num: 'Nível 2', label: 'Gerenciado', desc: 'Políticas e comitês de ética já encontram-se estruturados. Inventários em andamento e relatórios de evidências em andamento.', risk: 'Risco moderado', status: 'attention' },
  { num: 'Nível 3', label: 'Definido', desc: 'Processos padronizados e documentados em conformidade legal com a LGPD e termos ISO. Metas estabelecidas e cobradas.', risk: 'Risco controlado', status: 'attention' },
  { num: 'Nível 4', label: 'Quantificado', desc: 'Métricas exatas de bias e drift de dados monitoradas em tempo real por painéis operatórios automáticos.', risk: 'Risco baixo', status: 'good' },
  { num: 'Nível 5', label: 'Otimizado', desc: 'Plena auditoria terceirizada com reciclagem periódica de modelos e contribuições ativas no ecossistema de dados abertos.', risk: 'Mínimo / altamente seguro', status: 'good' },
];

interface RegRow { n: string; art: string; desc: string }
const REGULATORY_ROWS: RegRow[] = [
  { n: 'LGPD (Lei 13.709)', art: 'Art. 20, 37 e 46', desc: 'Direito a explicações de decisões 100% automatizadas, obrigatoriedade de relatórios de impacto e dever de criptografar checkpoints.' },
  { n: 'PL 2338/2023 IA', art: 'Artigo 8º, 12 e 15', desc: 'Atribuição civil objetiva ao poluidor algorítmico, análise prévia de disparidades e Red Teaming de ataques.' },
  { n: 'ISO/IEC 42001', art: 'Cláusula 5, 6, 8 e 9', desc: 'Desenvolvimento do Sistema de Gestão de IA integrado e auditoria independente periódica.' },
  { n: 'NIST AI RMF 1.0', art: 'Framework Core 1.0', desc: 'Metodologias de gerenciamento de riscos organizando o mapeamento, identificação operacional e governança ética.' },
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
                      className="mg-btn mg-btn--ghost"
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
                  O MMGIA é uma régua de conformidade autoaplicável formulada com o intuito de democratizar a governança ética e cibernética de sistemas algorítmicos. O modelo serve de diagnóstico preventivo guiando equipes na formulação de portarias jurídicas e de blindagens contra vieses.
                </p>
                <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(2,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--surface-deep)' }}>
                  <div className="mg-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircle2 className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--status-good)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="mg-title">Autoavaliação direta</p>
                      <p className="mg-small mg-muted" style={{ marginTop: 2 }}>Cálculos locais efetuados e processados instantaneamente dentro do seu navegador.</p>
                    </div>
                  </div>
                  <div className="mg-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircle2 className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--status-good)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="mg-title">Alinhamento legislativo</p>
                      <p className="mg-small mg-muted" style={{ marginTop: 2 }}>Referenciais que cruzam artigos da LGPD do Brasil e principais normativas ISO/IEC europeias.</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* NÍVEIS */}
            <Card as="section" id="niveis" style={{ scrollMarginTop: 96 }}>
              <CardHeader title="Os 5 níveis de maturidade" />
              <CardBody>
                <p className="mg-small mg-muted" style={{ marginTop: -8, marginBottom: 16 }}>
                  As pontuações consolidadas categorizam a instituição dentro de uma métrica de responsabilidade civil algorítmica dividida em 5 estágios.
                </p>
                <DataTable<LevelRow>
                  caption="Níveis de maturidade, descrição operacional e risco estimado"
                  rowKey={(r) => r.num}
                  columns={[
                    { key: 'num', header: 'Nível', render: (r) => <strong>{r.num}</strong> },
                    { key: 'label', header: 'Nome', render: (r) => r.label },
                    { key: 'desc', header: 'Descrição operacional', render: (r) => r.desc },
                    { key: 'risk', header: 'Risco estimado', render: (r) => <span className={`mg-badge mg-badge--${r.status}`}>{r.risk}</span> },
                  ]}
                  rows={LEVEL_ROWS}
                />
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
                        <p className="mg-small" style={{ marginTop: 8 }}><strong>Critério de verificação:</strong> {p.criterion}</p>
                        <p className="mg-small mg-muted" style={{ marginTop: 4 }}><strong>Artefato chave:</strong> {p.evidence}</p>
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
                  O score final global do MMGIA é calculado por meio de médias ponderadas. Primeiro, é calculada a média simples de cada uma das 5 dimensões com base nas práticas respondidas (as práticas não respondidas recebem peso zero).
                </p>

                <div style={{ marginTop: 16, padding: 24, background: 'var(--ink)', color: 'var(--on-ink)', borderRadius: 'var(--radius-lg)' }} id="math-formula-box">
                  <p className="mg-code" style={{ color: 'var(--on-ink-muted)' }}>// equação de cálculo geral</p>
                  <div style={{ marginTop: 12, padding: 16, background: 'var(--ink-raised)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 800 }}>
                    Score Global = (Média_Gov + Média_Tec + Média_Seg + Média_Edu + Média_Eco) / 5
                  </div>
                  <p className="mg-small" style={{ marginTop: 16, color: 'var(--on-ink-muted)' }}>Onde as respostas na escala NPLF correspondem aos seguintes pesos numéricos:</p>
                  <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(4,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)', gap: 8, marginTop: 12 }}>
                    <div className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)' }}>Nulo (N) = {formatNumber(0)}</div>
                    <div className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)' }}>Parcial (P) = {formatNumber(1)}</div>
                    <div className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)' }}>Larga (L) = {formatNumber(2)}</div>
                    <div className="mg-code" style={{ padding: 10, textAlign: 'center', border: '1px solid var(--ink-raised)', borderRadius: 'var(--radius-sm)' }}>Total (F) = {formatNumber(3)}</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* REGULATÓRIO */}
            <Card as="section" id="regulatorio" style={{ scrollMarginTop: 96 }}>
              <CardHeader title="Alinhamento regulatório trilateral" />
              <CardBody>
                <p className="mg-small mg-muted" style={{ marginTop: -8, marginBottom: 16 }}>
                  O MMGIA foi construído sob a correspondência cruzada de normas legais vigentes no Brasil e marcos internacionais recomendados de conformidade.
                </p>
                <DataTable<RegRow>
                  caption="Normas, artigos e impacto no modelo"
                  rowKey={(r) => r.n}
                  columns={[
                    { key: 'n', header: 'Norma / marco', render: (r) => <strong>{r.n}</strong> },
                    { key: 'art', header: 'Artigos / cláusulas', render: (r) => <span className="mg-code">{r.art}</span> },
                    { key: 'desc', header: 'Impacto e relação de interface', render: (r) => r.desc },
                  ]}
                  rows={REGULATORY_ROWS}
                />
              </CardBody>
            </Card>

            {/* PRIVACIDADE */}
            <Card as="section" id="privacidade" style={{ scrollMarginTop: 96 }}>
              <CardHeader title={<span className="mg-row" style={{ gap: 8 }}><ShieldCheck className="mg-ico mg-ico-sm" aria-hidden="true" />Arquitetura de privacidade</span>} />
              <CardBody>
                <p className="mg-small mg-muted">
                  Todos os diagnósticos e seleções de conformidade de práticas são processados de forma isolada do servidor por padrão. O código hash de sessão é a única chave que vincula os itens em local storage.
                </p>
                <div style={{ marginTop: 16 }}>
                  <Banner tone="good" title="Sem microdados identificáveis">
                    Os microdados agregados jamais exportam nomes de prefeituras, e-mails das equipes ou coordenadas lógicas confidenciais de banco de dados.
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
