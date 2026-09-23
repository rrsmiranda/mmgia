/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Cpu,
  Database,
  FileText,
  GraduationCap,
  Github,
  Landmark,
  ListChecks,
  Monitor,
  Network,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { DIMENSION_WEIGHTS } from '@mmgia/shared/scoring';
import { DimensionId, DIMENSIONS } from '@mmgia/shared/types';
import {
  Button,
  Card,
  CardBody,
  DIMENSION_ORDER,
  DataTable,
  DimensionBars,
  DimensionTag,
  DsRoot,
  Field,
  Input,
  KpiCard,
  LevelBadge,
  Page,
  RiskBadge,
  formatNumber,
  type Level,
} from '@mmgia/shared/design-system';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onChangeTab: (tab: string) => void;
  theme: 'light' | 'dark';
}

const SAMPLE_SCORES: Record<DimensionId, number> = { gov: 2.1, tec: 1.7, seg: 1.9, edu: 1.5, eco: 1.4 };

const HOW_IT_WORKS = [
  { step: '01', icon: Building2, title: 'Contexto institucional', desc: 'Natureza jurídica, estado, setor e porte. Quatro perguntas objetivas — nenhuma de identidade.', tags: ['sem_nome', 'sem_cnpj', 'sem_email'] },
  { step: '02', icon: ListChecks, title: 'Avaliação guiada', desc: '45 práticas com escala NPLF: Nulo, Parcial, Larga e Total. O progresso fica salvo automaticamente no browser.', tags: [] },
  { step: '03', icon: BarChart3, title: 'Score e diagnóstico', desc: 'Nível de maturidade de 0 a 5, gaps priorizados e posicionamento frente ao benchmark do setor.', tags: [] },
  { step: '04', icon: FileText, title: 'Relatório PDF', desc: 'Gerado localmente no browser, em versão executiva ou técnica. Nenhum dado identificador é transmitido ao servidor.', tags: [] },
];

const ALIGNMENT_ROWS: { norma: string; artigos: string; dims: DimensionId[] }[] = [
  { norma: 'LGPD', artigos: 'Art. 20, 46, 50', dims: ['gov', 'seg'] },
  { norma: 'AI Act EU', artigos: 'Art. 6, 9, 14, 52', dims: ['seg', 'tec'] },
  { norma: 'ISO 42001', artigos: 'Cl. 4, 5, 6, 8, 10', dims: ['gov', 'tec'] },
  { norma: 'ENIA 2026', artigos: 'Eixos 1–7', dims: DIMENSION_ORDER as DimensionId[] },
  { norma: 'NIST AI RMF', artigos: 'Govern, Map, Measure', dims: ['gov', 'seg', 'eco'] },
];

const FAQ_DATA = [
  { q: 'A avaliação é realmente anônima?', a: 'Sim. O banco de dados não possui colunas para IP, nome, CNPJ ou e-mail. O middleware stripIdentity descarta headers identificadores antes que qualquer handler processe o request. É uma impossibilidade técnica, não uma promessa de política.' },
  { q: 'Quanto tempo leva para completar?', a: 'Entre 20 e 40 minutos, dependendo do conhecimento prévio sobre as práticas da organização. O progresso é salvo automaticamente no browser — você pode pausar e retomar a qualquer momento.' },
  { q: 'Preciso criar uma conta ou fazer login?', a: 'Não. A avaliação é iniciada sem cadastro. Ao final, você recebe um código único para editar sua avaliação depois — sem e-mail, sem senha.' },
  { q: 'O que acontece com os dados enviados?', a: 'Os scores são armazenados de forma anônima para compor o painel público de benchmark nacional. Nenhum dado permite identificar qual organização respondeu. Os dados são publicados sob licença CC BY 4.0.' },
  { q: 'A plataforma tem algum custo?', a: 'Não. A plataforma é gratuita, de código aberto (licença MIT) e mantida com custos operacionais próximos de zero usando Cloudflare Workers e Turso.' },
  { q: 'Posso editar minha avaliação depois?', a: 'Sim, usando o código de avaliação gerado ao final. Ele é a única forma de recuperar e editar — guarde-o em local seguro. Sem o código, não há recuperação, porque o sistema não pede e-mail.' },
];

const NEWS_ITEMS = [
  { tag: 'Regulação · 08 jun 2026', title: 'Marco Legal da IA avança no Senado com foco em governança de risco', source: 'Agência Senado' },
  { tag: 'Internacional · 07 jun 2026', title: 'UE publica diretrizes do AI Act para sistemas de alto risco', source: 'Reuters' },
  { tag: 'Pesquisa · 05 jun 2026', title: 'Estudo mapeia maturidade em IA de 200 órgãos públicos brasileiros', source: 'FGV' },
];

/** Cabeçalho de seção interna da landing (h2 — o único <h1> da página é o do hero). */
function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div style={{ maxWidth: 680 }}>
      <p className="mg-eyebrow">{eyebrow}</p>
      <h2 className="mg-h2" style={{ marginTop: 12 }}>{title}</h2>
      {description && <p className="mg-lead" style={{ marginTop: 12 }}>{description}</p>}
    </div>
  );
}

export default function LandingPage({ onStartOnboarding, onChangeTab }: LandingPageProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  return (
    <DsRoot>
      {/* HERO */}
      <section className="mg-hero" id="home-hero">
        <Page>
          <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 40, alignItems: 'center', paddingBlock: 64 }}>
            <div>
              <p className="mg-eyebrow">Modelo de maturidade em IA · ENIA 2026–2029</p>
              <h1 className="mg-h1" style={{ marginTop: 12, fontSize: 'var(--font-size-scale-up-09)' }}>
                Avalie a governança de IA com rigor, privacidade e ação.
              </h1>
              <p className="mg-lead" style={{ marginTop: 16, maxWidth: 560 }}>
                Diagnóstico gratuito e anônimo em 5 dimensões, 45 práticas e 6 níveis de maturidade. O score é calculado no seu navegador — sem cadastro, sem identificação e com relatório PDF ao final.
              </p>
              <div className="mg-row" style={{ gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                <Button variant="primary" size="lg" onInk onClick={onStartOnboarding}>Iniciar avaliação</Button>
                <Button variant="secondary" size="lg" onInk onClick={() => { const el = document.getElementById('metodologia'); el?.scrollIntoView({ behavior: 'smooth' }); }}>Ver metodologia</Button>
              </div>
              <p className="mg-small" style={{ marginTop: 24, color: 'var(--on-ink-muted)' }}>
                <strong style={{ color: 'var(--on-ink)' }}>1.847</strong> avaliações · 27 estados · <strong style={{ color: 'var(--on-ink)' }}>100%</strong> gratuito
              </p>
            </div>

            <Card large>
              <p className="mg-eyebrow">Exemplo ilustrativo</p>
              <div className="mg-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                <span style={{ fontFamily: 'var(--mg-font-mono)', fontSize: 40, fontWeight: 800 }}>{formatNumber(1.72)} <small style={{ fontSize: 18, opacity: 0.6 }}>/ 3</small></span>
                <LevelBadge level={3 as Level} />
              </div>
              <div style={{ marginTop: 16 }}>
                <DimensionBars scores={SAMPLE_SCORES} goal />
              </div>
              <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: 'repeat(3,1fr)', ['--cols-m' as string]: 'repeat(3,1fr)', gap: 8, marginTop: 20 }}>
                <div style={{ textAlign: 'center', padding: 10, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)' }}>
                  <span className="mg-code" style={{ display: 'block', fontSize: 18 }}>45</span>
                  <span className="mg-small mg-muted">práticas</span>
                </div>
                <div style={{ textAlign: 'center', padding: 10, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)' }}>
                  <span className="mg-code" style={{ display: 'block', fontSize: 18 }}>5</span>
                  <span className="mg-small mg-muted">dimensões</span>
                </div>
                <div style={{ textAlign: 'center', padding: 10, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)' }}>
                  <span className="mg-code" style={{ display: 'block', fontSize: 18 }}>6</span>
                  <span className="mg-small mg-muted">níveis</span>
                </div>
              </div>
            </Card>
          </div>
        </Page>
      </section>

      {/* STATS STRIP */}
      <Page>
        <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(4,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)', gap: 12, marginTop: -40, position: 'relative', zIndex: 1 }} id="stats-banner">
          <KpiCard label="Avaliações" value="1.847" />
          <KpiCard label="Práticas" value="45" />
          <KpiCard label="Dimensões" value="5" />
          <KpiCard label="Gratuito" value="100%" />
        </div>
      </Page>

      {/* COMO FUNCIONA */}
      <section id="como" style={{ paddingBlock: 80 }}>
        <Page>
          <SectionHeader
            eyebrow="Como funciona"
            title="Da primeira pergunta ao relatório em 30 minutos."
            description="O fluxo foi desenhado como uma jornada operacional: contexto mínimo, avaliação guiada, score local e relatório exportável. O objetivo é transformar maturidade em decisões, não em burocracia."
          />
          <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(4,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 32 }}>
            {HOW_IT_WORKS.map((item) => (
              <Card key={item.step}>
                <div className="mg-row" style={{ justifyContent: 'space-between' }}>
                  <span className="mg-code" style={{ fontSize: 28, color: 'var(--text-muted)' }}>{item.step}</span>
                  <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand)', color: 'var(--on-brand)' }}>
                    <item.icon className="mg-ico" aria-hidden="true" />
                  </span>
                </div>
                <p className="mg-title" style={{ marginTop: 16 }}>{item.title}</p>
                <p className="mg-small mg-muted" style={{ marginTop: 8 }}>{item.desc}</p>
                {item.tags.length > 0 && (
                  <div className="mg-row" style={{ gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    {item.tags.map((tag) => <span key={tag} className="mg-code" style={{ background: 'var(--surface-sunken)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>{tag}</span>)}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Page>
      </section>

      {/* DIMENSÕES */}
      <section id="dimensoes" style={{ paddingBlock: 80, background: 'var(--surface-raised)' }}>
        <Page>
          <SectionHeader
            eyebrow="Dimensões avaliadas"
            title="5 dimensões, 45 práticas, 6 níveis."
            description="A maturidade é observada por um conjunto balanceado de governança, tecnologia, confiança, cultura e cooperação."
          />
          <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 32 }}>
            {(DIMENSION_ORDER as DimensionId[]).map((id) => {
              const d = DIMENSIONS[id];
              return (
                <Card key={id}>
                  <DimensionTag dimension={id} short />
                  <p className="mg-title" style={{ marginTop: 12 }}>{d.name}</p>
                  <p className="mg-small mg-muted" style={{ marginTop: 8 }}>{d.description}</p>
                  <div className="mg-row" style={{ gap: 8, marginTop: 16 }}>
                    <span className="mg-code">{Math.round(DIMENSION_WEIGHTS[id] * 100)}%</span>
                    <span className="mg-code mg-muted">9 práticas</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </Page>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" style={{ paddingBlock: 80 }}>
        <Page>
          <SectionHeader eyebrow="Serviços" title="O que a plataforma entrega." description="Uma base prática para equipes públicas, privadas e do terceiro setor medirem governança de IA e priorizarem evolução." />
          <div className="mg-stack" style={{ gap: 16, marginTop: 32 }}>
            <Card large>
              <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 320px', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 24, alignItems: 'center' }}>
                <div>
                  <span style={{ display: 'grid', placeItems: 'center', width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--brand)', color: 'var(--on-brand)' }}>
                    <ListChecks className="mg-ico" aria-hidden="true" />
                  </span>
                  <p className="mg-h3" style={{ marginTop: 20 }}>Avaliação institucional</p>
                  <p className="mg-small mg-muted" style={{ marginTop: 8 }}>Diagnóstico completo das práticas de IA, mapeando riscos e oportunidades em 5 dimensões com peso calibrado.</p>
                </div>
                <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: 'repeat(3,1fr)', ['--cols-m' as string]: 'repeat(3,1fr)', gap: 8 }}>
                  <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)' }}>
                    <span className="mg-code" style={{ display: 'block', fontSize: 22 }}>5</span>
                    <span className="mg-small mg-muted">dimensões</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)' }}>
                    <span className="mg-code" style={{ display: 'block', fontSize: 22 }}>45</span>
                    <span className="mg-small mg-muted">práticas</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)' }}>
                    <span className="mg-code" style={{ display: 'block', fontSize: 22 }}>6</span>
                    <span className="mg-small mg-muted">níveis</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(2,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 16 }}>
              <Card>
                <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand-accent)', color: 'var(--on-accent)' }}>
                  <Scale className="mg-ico" aria-hidden="true" />
                </span>
                <p className="mg-title" style={{ marginTop: 16 }}>Alinhamento regulatório</p>
                <p className="mg-small mg-muted" style={{ marginTop: 8 }}>Cada prática correlacionada com LGPD, AI Act, ISO 42001 e ENIA.</p>
              </Card>
              <Card>
                <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand)', color: 'var(--on-brand)' }}>
                  <FileText className="mg-ico" aria-hidden="true" />
                </span>
                <p className="mg-title" style={{ marginTop: 16 }}>Relatório e plano de ação</p>
                <p className="mg-small mg-muted" style={{ marginTop: 8 }}>PDF com gaps priorizados, benchmark do setor e práticas para o próximo nível.</p>
              </Card>
            </div>
          </div>
        </Page>
      </section>

      {/* PRIVACIDADE */}
      <section id="privacidade" className="mg-hero" style={{ paddingBlock: 80 }}>
        <Page>
          <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 40, alignItems: 'center' }}>
            <Card large style={{ background: 'var(--ink-raised)', border: '1px solid var(--ink-raised)' }}>
              <p className="mg-code" style={{ color: 'var(--on-ink-muted)' }}>POST /v1/submissions</p>
              <div style={{ marginTop: 16, fontFamily: 'var(--mg-font-mono)', fontSize: 13, lineHeight: 2, color: 'var(--on-ink)' }}>
                <div style={{ color: 'var(--on-ink-muted)' }}>// dados armazenados</div>
                <div>"natureza": <span style={{ color: 'var(--status-good-text)' }}>"publica_estadual"</span></div>
                <div>"estado": <span style={{ color: 'var(--status-good-text)' }}>"GO"</span></div>
                <div>"setor": <span style={{ color: 'var(--status-good-text)' }}>"saude"</span></div>
                <div>"score_global": <span style={{ color: 'var(--status-good-text)' }}>1.82</span></div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ink-raised)', color: 'var(--on-ink-muted)' }}>// nunca coletado</div>
                <div style={{ opacity: 0.6 }}>"ip_address": <span style={{ color: 'var(--status-critical-text)', textDecoration: 'line-through' }}>203.0.113.42</span></div>
                <div style={{ opacity: 0.6 }}>"cnpj": <span style={{ color: 'var(--status-critical-text)', textDecoration: 'line-through' }}>"12.345.678/0001"</span></div>
                <div style={{ opacity: 0.6 }}>"email": <span style={{ color: 'var(--status-critical-text)', textDecoration: 'line-through' }}>"gestor@org.br"</span></div>
              </div>
            </Card>

            <div>
              <p className="mg-eyebrow">Privacidade por design</p>
              <h2 className="mg-h2" style={{ marginTop: 12 }}>Sua organização nunca é identificada.</h2>
              <p className="mg-lead" style={{ marginTop: 12 }}>A arquitetura torna a identificação tecnicamente impossível. Não é uma promessa de política — é uma limitação estrutural do sistema.</p>
              <div className="mg-stack" style={{ gap: 12, marginTop: 24 }}>
                {[
                  { icon: Monitor, title: 'Cálculo no browser', desc: 'Scoring roda localmente. Servidor recebe apenas números finais.' },
                  { icon: Database, title: 'Banco sem identidade', desc: 'Sem coluna de IP, nome ou CNPJ. k-anonimidade ≥ 5.' },
                  { icon: Github, title: 'Código aberto', desc: 'Qualquer equipe pode verificar no GitHub.' },
                ].map((item) => (
                  <div key={item.title} className="mg-row" style={{ gap: 16, padding: 16, background: 'var(--ink-raised)', borderRadius: 'var(--radius-lg)' }}>
                    <item.icon className="mg-ico" aria-hidden="true" style={{ flexShrink: 0, color: 'var(--on-ink-accent)' }} />
                    <div>
                      <p style={{ fontWeight: 700 }}>{item.title}</p>
                      <p className="mg-small" style={{ marginTop: 2, color: 'var(--on-ink-muted)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Page>
      </section>

      {/* METODOLOGIA */}
      <section id="metodologia" style={{ paddingBlock: 80 }}>
        <Page>
          <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <p className="mg-eyebrow">Metodologia</p>
              <h2 className="mg-h2" style={{ marginTop: 12 }}>Score ponderado por eixo estratégico.</h2>
              <p className="mg-lead" style={{ marginTop: 12 }}>O score global é a média ponderada dos scores das 5 dimensões, onde cada dimensão é a média das respostas NPLF das suas 9 práticas.</p>
              <ul className="mg-stack" style={{ gap: 12, marginTop: 24, listStyle: 'none', padding: 0 }}>
                <li className="mg-row" style={{ gap: 10, alignItems: 'flex-start' }}><Check className="mg-ico mg-ico-sm" style={{ color: 'var(--status-good)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" /><span className="mg-small">Escala NPLF: Nulo (0), Parcial (1), Larga (2), Total (3).</span></li>
                <li className="mg-row" style={{ gap: 10, alignItems: 'flex-start' }}><Check className="mg-ico mg-ico-sm" style={{ color: 'var(--status-good)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" /><span className="mg-small">Pesos diferenciados por dimensão: gov 25%, tec 20%, seg 25%, edu 15%, eco 15%.</span></li>
                <li className="mg-row" style={{ gap: 10, alignItems: 'flex-start' }}><Check className="mg-ico mg-ico-sm" style={{ color: 'var(--status-good)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" /><span className="mg-small">Alinhado ao CMMI, ISO 33001 e frameworks de maturidade consolidados.</span></li>
              </ul>
            </div>

            <Card large>
              <p className="mg-code">Fórmula do score global</p>
              <div style={{ marginTop: 16, padding: 20, background: 'var(--ink)', color: 'var(--on-ink)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <p className="mg-small" style={{ color: 'var(--on-ink-muted)' }}>Score Global =</p>
                <p style={{ marginTop: 8, fontFamily: 'var(--mg-font-mono)', fontWeight: 800, color: 'var(--on-ink-accent)' }}>Σ (peso_d × média_NPLF_d)</p>
                <p className="mg-code" style={{ marginTop: 8, color: 'var(--on-ink-muted)' }}>d ∈ {'{gov, tec, seg, edu, eco}'}</p>
              </div>
              <div className="mg-stack" style={{ gap: 8, marginTop: 20 }}>
                <div className="mg-row" style={{ justifyContent: 'space-between', padding: '10px 16px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}><span className="mg-code">gov × 0,25</span><span className="mg-code" style={{ fontWeight: 800 }}>0,525</span></div>
                <div className="mg-row" style={{ justifyContent: 'space-between', padding: '10px 16px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}><span className="mg-code">tec × 0,20</span><span className="mg-code" style={{ fontWeight: 800 }}>0,320</span></div>
                <div className="mg-row" style={{ justifyContent: 'space-between', padding: '10px 16px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}><span className="mg-code">seg × 0,25</span><span className="mg-code" style={{ fontWeight: 800 }}>0,475</span></div>
                <div className="mg-row" style={{ justifyContent: 'space-between', padding: '10px 16px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}><span className="mg-code">edu × 0,15</span><span className="mg-code" style={{ fontWeight: 800 }}>0,225</span></div>
                <div className="mg-row" style={{ justifyContent: 'space-between', padding: '10px 16px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}><span className="mg-code">eco × 0,15</span><span className="mg-code" style={{ fontWeight: 800 }}>0,210</span></div>
                <div className="mg-row" style={{ justifyContent: 'space-between', padding: '14px 16px', background: 'var(--brand)', color: 'var(--on-brand)', borderRadius: 'var(--radius-md)' }}><strong>Score global</strong><strong>1,755</strong></div>
              </div>
            </Card>
          </div>
        </Page>
      </section>

      {/* ALINHAMENTO REGULATÓRIO */}
      <section style={{ paddingBlock: 80, background: 'var(--surface-raised)' }}>
        <Page>
          <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <p className="mg-eyebrow">Alinhamento regulatório</p>
              <h2 className="mg-h2" style={{ marginTop: 12 }}>Alinhamento com 5 marcos normativos.</h2>
              <p className="mg-lead" style={{ marginTop: 12 }}>Cada uma das 45 práticas é mapeada para artigos e cláusulas específicos das normas aplicáveis. O relatório mostra onde a organização está conforme e onde precisa evoluir.</p>
            </div>
            <DataTable
              caption="Normas alinhadas ao modelo e dimensões correspondentes"
              rowKey={(r) => r.norma}
              columns={[
                { key: 'norma', header: 'Norma', render: (r) => <strong>{r.norma}</strong> },
                { key: 'artigos', header: 'Artigos/cláusulas', render: (r) => r.artigos },
                { key: 'dims', header: 'Dimensões', render: (r) => (
                  <div className="mg-row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    {r.dims.map((d) => <DimensionTag key={d} dimension={d} short />)}
                  </div>
                ) },
              ]}
              rows={ALIGNMENT_ROWS}
            />
          </div>
        </Page>
      </section>

      {/* NÍVEIS */}
      <section style={{ paddingBlock: 80 }}>
        <Page>
          <SectionHeader eyebrow="Escala de maturidade" title="6 níveis, do inexistente ao otimizado." />
          <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(6,1fr)', ['--cols-t' as string]: 'repeat(3,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)', gap: 12, marginTop: 32 }}>
            {[0, 1, 2, 3, 4, 5].map((lvl) => (
              <Card key={lvl} style={{ textAlign: 'center' }}>
                <LevelBadge level={lvl as Level} showLabel={false} />
                <p className="mg-title" style={{ marginTop: 12 }}>{['Inexistente', 'Inicial', 'Gerenciado', 'Definido', 'Quantitativo', 'Otimizado'][lvl]}</p>
                <p className="mg-code" style={{ marginTop: 4 }}>{[`0,0–0,5`, `0,5–1,0`, `1,0–1,5`, `1,5–2,0`, `2,0–2,5`, `2,5–3,0`][lvl]}</p>
                <div style={{ marginTop: 8 }}><RiskBadge level={lvl as Level} /></div>
              </Card>
            ))}
          </div>
        </Page>
      </section>

      {/* PAINEL PÚBLICO CTA */}
      <section id="painel" className="mg-hero" style={{ paddingBlock: 56 }}>
        <Page>
          <div className="mg-row" style={{ justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 640 }}>
              <p className="mg-eyebrow">Dados agregados e anonimizados</p>
              <h2 className="mg-h2" style={{ marginTop: 12 }}>Acompanhe a evolução da maturidade em IA no Brasil.</h2>
              <p className="mg-lead" style={{ marginTop: 12 }}>Visualize tendências por estado, setor e porte sem comprometer a privacidade das organizações respondentes.</p>
            </div>
            <Button variant="primary" size="lg" onInk onClick={() => onChangeTab('mapa')}>Ver painel público</Button>
          </div>
        </Page>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ paddingBlock: 80, background: 'var(--surface-raised)' }}>
        <Page>
          <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 1.4fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 40 }}>
            <div>
              <p className="mg-eyebrow">Perguntas frequentes</p>
              <h2 className="mg-h2" style={{ marginTop: 12 }}>Dúvidas sobre a avaliação.</h2>
              <p className="mg-lead" style={{ marginTop: 12 }}>Respostas rápidas para quem precisa aplicar a avaliação com segurança, transparência e autonomia.</p>
            </div>
            <div className="mg-stack" style={{ gap: 12 }}>
              {FAQ_DATA.map((faq) => (
                <details key={faq.q} className="mg-acc">
                  <summary>
                    <span style={{ flex: 1 }}>{faq.q}</span>
                    <span className="chev" aria-hidden="true">+</span>
                  </summary>
                  <p className="mg-small mg-muted" style={{ padding: '16px 20px' }}>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Page>
      </section>

      {/* NOTÍCIAS */}
      <section id="noticias" style={{ paddingBlock: 80 }}>
        <Page>
          <div className="mg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
            <div>
              <p className="mg-eyebrow">Notícias</p>
              <h2 className="mg-h2" style={{ marginTop: 12 }}>IA no Brasil e no mundo.</h2>
            </div>
            <Button variant="ghost" iconRight={ArrowRight} onClick={() => onChangeTab('mapa')}>Ver todas</Button>
          </div>

          <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 32 }}>
            {NEWS_ITEMS.map((item) => (
              <Card key={item.title}>
                <span className="mg-code">{item.tag}</span>
                <p className="mg-title" style={{ marginTop: 12 }}>{item.title}</p>
                <div className="mg-row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
                  <span className="mg-small mg-muted">{item.source}</span>
                  <span className="mg-small" style={{ color: 'var(--brand)', fontWeight: 700 }}>ler na fonte ↗</span>
                </div>
              </Card>
            ))}
          </div>
        </Page>
      </section>

      {/* RODAPÉ */}
      <footer className="mg-footer">
        <div>
          <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(4,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 32 }}>
            <div>
              <a href="#" className="mg-logo" onClick={(e) => e.preventDefault()}>
                <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--brand)', color: 'var(--on-brand)', fontWeight: 800 }}>M</span>
                <span className="mg-logo-word"><b>MMGIA</b></span>
              </a>
              <p className="mg-small" style={{ marginTop: 16, color: 'var(--on-ink-muted)' }}>Ferramenta de código aberto para medir a maturidade em governança de IA no Brasil.</p>
            </div>

            <div>
              <h4>Plataforma</h4>
              <button onClick={onStartOnboarding} className="mg-footer-btn">Iniciar diagnóstico</button>
              <button onClick={() => onChangeTab('mapa')} className="mg-footer-btn">Painel público</button>
              <a href="#metodologia">Metodologia</a>
              <button onClick={() => onChangeTab('opendata')} className="mg-footer-btn">Open data</button>
            </div>

            <div>
              <h4>Recursos</h4>
              <a href="#dimensoes">As 5 dimensões</a>
              <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
              <a href="#como">Como funciona</a>
              <a href="#privacidade">Privacidade</a>
            </div>

            <div>
              <h4>Newsletter</h4>
              <p className="mg-small" style={{ marginBottom: 12, color: 'var(--on-ink-muted)' }}>Atualizações sobre governança de IA.</p>
              <Field label="E-mail">
                {({ id }) => (
                  <div className="mg-row" style={{ gap: 8 }}>
                    <Input id={id} type="email" placeholder="seu@email.com" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} />
                    <Button variant="primary" onInk onClick={() => alert('Cadastro de newsletter demonstrativo realizado com sucesso!')}>OK</Button>
                  </div>
                )}
              </Field>
            </div>
          </div>

          <div className="mg-footer-bottom">
            <span>© 2026 MMGIA · Código aberto</span>
            <div className="mg-row" style={{ gap: 8 }}>
              <span className="mg-code" style={{ border: '1px solid var(--ink-raised)', padding: '2px 10px', borderRadius: 'var(--radius-sm)' }}>MIT</span>
              <span className="mg-code" style={{ border: '1px solid var(--ink-raised)', padding: '2px 10px', borderRadius: 'var(--radius-sm)' }}>CC BY 4.0</span>
              <span className="mg-code" style={{ border: '1px solid var(--ink-raised)', padding: '2px 10px', borderRadius: 'var(--radius-sm)' }}>ENIA 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </DsRoot>
  );
}
