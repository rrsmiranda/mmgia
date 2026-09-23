/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Database, LineChart, LayoutGrid, MapPin } from 'lucide-react';
import BrazilMap from './BrazilMap';
import { DimensionId } from '@mmgia/shared/types';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DimensionBars,
  Field,
  InsightCard,
  KpiCard,
  Page,
  DsRoot,
  Select,
  formatNumber,
} from '@mmgia/shared/design-system';

interface PublicPanelProps {
  onChangeTab: (tab: string) => void;
}

// Médias mockadas — dado ilustrativo até o painel ter volume real de submissões agregadas.
const DIMENSION_AVERAGES: Record<DimensionId, number> = { gov: 1.34, tec: 1.48, seg: 1.52, edu: 1.10, eco: 1.25 };

const TREND_DATA = [
  { m: 'Jul25', score: 1.10 }, { m: 'Ago25', score: 1.15 }, { m: 'Set25', score: 1.18 }, { m: 'Out25', score: 1.25 },
  { m: 'Nov25', score: 1.21 }, { m: 'Dez25', score: 1.28 }, { m: 'Jan26', score: 1.32 }, { m: 'Fev26', score: 1.30 },
  { m: 'Mar26', score: 1.36 }, { m: 'Abr26', score: 1.40 }, { m: 'Mai26', score: 1.42 }, { m: 'Jun26', score: 1.42 },
];

interface SectorRow { setor: string; amostras: number; score: number }
const SECTOR_RANKING: SectorRow[] = [
  { setor: 'Tecnologia', amostras: 412, score: 1.88 },
  { setor: 'Financeiro', amostras: 380, score: 1.77 },
  { setor: 'Governo Federal', amostras: 512, score: 1.54 },
  { setor: 'Educação', amostras: 185, score: 1.35 },
  { setor: 'Agronegócio', amostras: 110, score: 1.12 },
  { setor: 'Saúde', amostras: 144, score: 1.08 },
];

function scoreStatus(score: number) {
  if (score >= 1.6) return 'var(--status-good)';
  if (score >= 1.3) return 'var(--status-attention)';
  return 'var(--status-critical)';
}

export default function PublicPanel({ onChangeTab }: PublicPanelProps) {
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [porteFilter, setPorteFilter] = useState('Todos');
  const [selectedUf, setSelectedUf] = useState<string>('DF');

  const ufScoreLabel = selectedUf === 'DF' ? '2,12 / 3 (Nível 3)' : selectedUf === 'SP' ? '1,89 / 3 (Nível 2)' : '1,38 / 3 (Nível 2)';

  return (
    <DsRoot>
      <Page>
        {/* FILTROS */}
        <Card style={{ marginBottom: 24 }} id="public-panel-filters-bar">
          <div className="mg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="mg-eyebrow">Dados consolidados · Brasil</p>
              <h1 className="mg-h3" style={{ marginTop: 4 }}>Painel Nacional de Maturidade em IA</h1>
              <p className="mg-small mg-muted" style={{ marginTop: 4 }}>
                Dados agregados obedecendo à k-anonimidade ≥ 5 (sigilo estatístico).
              </p>
            </div>

            <div className="mg-row" style={{ gap: 12, flexWrap: 'wrap' }} id="filters-dropdowns">
              <Field label="Setor">
                {({ id }) => (
                  <Select id={id} value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Gov. federal">Gov. federal</option>
                    <option value="Tecnologia">Tecnologia</option>
                  </Select>
                )}
              </Field>
              <Field label="Porte">
                {({ id }) => (
                  <Select id={id} value={porteFilter} onChange={(e) => setPorteFilter(e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option value="Micro">Micro</option>
                    <option value="Pequena">Pequena</option>
                    <option value="Média">Média</option>
                    <option value="Grande">Grande</option>
                  </Select>
                )}
              </Field>
            </div>
          </div>
        </Card>

        <div className="mg-grid" style={{ ['--cols-d' as string]: '420px 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 24, alignItems: 'start' }}>
          {/* MAPA */}
          <div className="mg-stack" style={{ gap: 16 }}>
            <BrazilMap onSelectState={(uf) => setSelectedUf(uf)} selectedState={selectedUf} theme="light" />

            <Card style={{ background: 'var(--ink)', color: 'var(--on-ink)' }} id="map-state-insights">
              <p className="mg-eyebrow" style={{ color: 'var(--on-ink-accent)' }}>Dados do estado em foco</p>
              <div className="mg-row" style={{ justifyContent: 'space-between', marginTop: 12, padding: 12, background: 'var(--ink-raised)', borderRadius: 'var(--radius-lg)' }}>
                <span className="mg-row" style={{ gap: 8 }}>
                  <MapPin className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--on-ink-accent)' }} />
                  <strong>{selectedUf}</strong>
                </span>
                <span className="mg-code" style={{ color: 'var(--on-ink-accent)', fontWeight: 700 }}>{ufScoreLabel}</span>
              </div>
              <p className="mg-small" style={{ marginTop: 12, color: 'var(--on-ink-muted)' }}>
                Os índices mostram picos de letramento técnico e comitivas coordenadas de segurança sob conformidade com a LGPD.
              </p>
            </Card>
          </div>

          {/* PAINEL PRINCIPAL */}
          <div className="mg-stack" style={{ gap: 24 }}>
            <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(4,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)', gap: 12 }} id="panel-kpis">
              <KpiCard label="Score médio Brasil" value={formatNumber(1.42)} />
              <KpiCard label="Nível modal" value="Nível 2" />
              <KpiCard label="Avaliações ativas" value="1.847" />
              <KpiCard label="Pilar mais crítico" value="Edu" />
            </div>

            <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: 'repeat(3,1fr)', ['--cols-m' as string]: '1fr', gap: 12 }} id="panel-advice">
              <InsightCard status="critical" label="Ponto crítico" title="Educação algorítmica: 1,10">
                Servidores públicos e colaboradores registram baixas em imersões éticas formais.
              </InsightCard>
              <InsightCard status="good" label="Destaque nacional" title="Aspectos de segurança: 1,52">
                Iniciativas de proteção e adequação à LGPD puxam os índices para cima.
              </InsightCard>
              <InsightCard status="attention" label="Rumo ao Nível 3" title="Diferença para meta: 0,58 pts">
                Basta formalizar comitês e inventários estruturados nas organizações de nível 2.
              </InsightCard>
            </div>

            <Card id="panel-dimension-averages">
              <CardHeader title="Médias consolidadas por pilar" />
              <CardBody>
                <DimensionBars scores={DIMENSION_AVERAGES} goal />
              </CardBody>
            </Card>

            <Card id="panel-trend-chart">
              <CardHeader
                title={<span className="mg-row" style={{ gap: 8 }}><LineChart className="mg-ico mg-ico-sm" aria-hidden="true" />Evolução histórica (12 meses)</span>}
                actions={<span className="mg-badge mg-badge--good">Crescente (+14% AoA)</span>}
              />
              <CardBody>
                <svg width="100%" height="110" viewBox="0 0 500 110" className="overflow-visible" id="trend-svg">
                  <line x1="0" y1="90" x2="500" y2="90" stroke="var(--surface-deep)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="56" x2="500" y2="56" stroke="var(--surface-deep)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="20" x2="500" y2="20" stroke="var(--surface-deep)" strokeWidth="1" strokeDasharray="3 3" />

                  <text x="5" y="16" fill="var(--text-muted)" fontSize="7" fontFamily="var(--mg-font-mono)">3,0 (Otimizado)</text>
                  <text x="5" y="52" fill="var(--text-muted)" fontSize="7" fontFamily="var(--mg-font-mono)">1,5 (Gerenciado)</text>
                  <text x="5" y="88" fill="var(--text-muted)" fontSize="7" fontFamily="var(--mg-font-mono)">0,5 (Iniciado)</text>

                  <path
                    d="M10,85 L50,82 L90,80 L130,75 L170,78 L210,72 L250,68 L290,70 L330,65 L370,61 L410,58 L450,58"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="2.5"
                  />
                  <circle cx="450" cy="58" r="4.5" fill="var(--brand-accent)" stroke="var(--surface-raised)" strokeWidth="1.5" />

                  {TREND_DATA.map((d, i) => (
                    <text key={d.m} x={10 + i * 40} y="104" fill="var(--text-muted)" fontSize="7.5" fontFamily="var(--mg-font-mono)" textAnchor="middle">
                      {d.m}
                    </text>
                  ))}
                </svg>
              </CardBody>
            </Card>

            <Card id="panel-sector-rank">
              <CardHeader title={<span className="mg-row" style={{ gap: 8 }}><LayoutGrid className="mg-ico mg-ico-sm" aria-hidden="true" />Médias por setor de atuação</span>} />
              <CardBody>
                <DataTable<SectorRow>
                  caption="Score ponderado médio por setor econômico"
                  rowKey={(r) => r.setor}
                  columns={[
                    { key: 'setor', header: 'Setor econômico', render: (r) => r.setor },
                    { key: 'amostras', header: 'Amostras', numeric: true, render: (r) => `${r.amostras} avaliações` },
                    { key: 'score', header: 'Score ponderado', numeric: true, render: (r) => (
                      <span className="mg-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                        <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-pill)', background: scoreStatus(r.score), display: 'inline-block' }} />
                        <strong>{formatNumber(r.score)}</strong>
                      </span>
                    ) },
                  ]}
                  rows={SECTOR_RANKING}
                />

                <div className="mg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--surface-deep)' }} id="opendata-links">
                  <p className="mg-small mg-muted">Deseja utilizar os microdados brutos? Baixe o dataset completo sob CC BY 4.0.</p>
                  <Button variant="primary" icon={Database} onClick={() => onChangeTab('opendata')}>Acessar área Open Data</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Page>
    </DsRoot>
  );
}
