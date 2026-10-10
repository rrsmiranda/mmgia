/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Database, Gauge, Info, Lock, X } from 'lucide-react';
import BrazilMap from './BrazilMap';
import { DimensionId, DIMENSIONS, HistoricalRecord, SEED_HISTORICAL_RECORDS } from '@mmgia/shared/types';
import { getMaturityLevel } from '@mmgia/shared/scoring';
import {
  Agg,
  K_MIN,
  ObsFilters,
  applyFilters,
  byRegion,
  byUf,
  compareBy,
  insights,
  levelDistribution,
  monthly,
  wouldBreakK,
} from '@mmgia/shared/observatory';
import {
  AREAS_PRIVADAS,
  AREAS_PUBLICAS,
  AREAS_TERCEIRO,
  Area,
  Esfera,
  ESFERAS,
  Poder,
  REGIAO_POR_UF,
  RELACOES_IA,
  RelacaoIA,
  Regiao,
  Setor,
  SETORES,
  UF_NOMES,
  rotuloArea,
} from '@mmgia/shared/taxonomy';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DIMENSION_ICONS,
  DIMENSION_ORDER,
  DataTable,
  DimensionTag,
  DsRoot,
  Field,
  KpiCard,
  LEVEL_LABELS,
  LevelBadge,
  Page,
  PageHeader,
  RiskBadge,
  Segmented,
  Select,
  cx,
  formatNumber,
  type Column,
  type Level,
} from '@mmgia/shared/design-system';

interface PublicPanelProps {
  onChangeTab: (tab: string) => void;
}

type MapMetric = 'global' | DimensionId;
type Granularity = 'uf' | 'regiao';
type CompareTab = 'setor_porte' | 'esfera' | 'area' | 'relacaoIA';

const PODERES: { id: Poder; label: string }[] = [
  { id: 'executivo', label: 'Executivo' },
  { id: 'judiciario', label: 'Judiciário' },
  { id: 'legislativo', label: 'Legislativo' },
];
const PORTES = ['Micro', 'Pequena', 'Média', 'Grande'];

function areaOptionsFor(setor: Setor | undefined): { id: string; label: string }[] {
  if (setor === 'publico') return AREAS_PUBLICAS.map((a) => ({ id: a.id, label: a.label }));
  if (setor === 'privado') return AREAS_PRIVADAS.map((a) => ({ id: a.id, label: a.label }));
  if (setor === 'terceiro') return AREAS_TERCEIRO.map((a) => ({ id: a.id, label: a.label }));
  return [];
}

// ===== Estado <-> URL (seção 2 do prompt: compartilhável, sem poluir o histórico) =====

interface PanelState {
  filters: ObsFilters;
  uf: string | null;
  mapMetric: MapMetric;
  granularity: Granularity;
}

const FILTER_KEYS: (keyof ObsFilters)[] = ['setor', 'esfera', 'area', 'poder', 'relacaoIA', 'porte'];

function readUrlState(): PanelState {
  if (typeof window === 'undefined') return { filters: {}, uf: null, mapMetric: 'global', granularity: 'uf' };
  const params = new URLSearchParams(window.location.search);
  const filters: ObsFilters = {};
  for (const key of FILTER_KEYS) {
    const v = params.get(key);
    if (v) (filters as Record<string, string>)[key] = v;
  }
  const dim = params.get('dim');
  const mapMetric: MapMetric = dim && DIMENSION_ORDER.includes(dim as DimensionId) ? (dim as DimensionId) : 'global';
  return {
    filters,
    uf: params.get('uf'),
    mapMetric,
    granularity: params.get('g') === 'regiao' ? 'regiao' : 'uf',
  };
}

function writeUrlState(state: PanelState) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const v = state.filters[key];
    if (v) params.set(key, v);
  }
  if (state.uf) params.set('uf', state.uf);
  if (state.mapMetric !== 'global') params.set('dim', state.mapMetric);
  if (state.granularity !== 'uf') params.set('g', state.granularity);
  const qs = params.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

function metricAgg(agg: Agg, metric: MapMetric): { score: number | null; level: number | null; n: number } {
  if (agg.score === null || agg.dims === null) return { score: null, level: null, n: agg.n };
  if (metric === 'global') return { score: agg.score, level: agg.level, n: agg.n };
  const v = agg.dims[metric];
  return { score: v, level: getMaturityLevel(v).num, n: agg.n };
}

function recorteLabel(filters: ObsFilters): string {
  const parts: string[] = [];
  if (filters.setor) parts.push(SETORES.find((s) => s.id === filters.setor)?.label ?? filters.setor);
  if (filters.esfera) parts.push(ESFERAS.find((e) => e.id === filters.esfera)?.label ?? filters.esfera);
  if (filters.area) parts.push(rotuloArea(filters.setor ?? '', filters.area) ?? filters.area);
  if (filters.poder) parts.push(PODERES.find((p) => p.id === filters.poder)?.label ?? filters.poder);
  if (filters.relacaoIA) parts.push(RELACOES_IA.find((r) => r.id === filters.relacaoIA)?.label ?? filters.relacaoIA);
  if (filters.porte) parts.push(filters.porte);
  return parts.length > 0 ? parts.join(' · ') : 'Brasil';
}

export default function PublicPanel({ onChangeTab }: PublicPanelProps) {
  const initial = useMemo(readUrlState, []);
  const [filters, setFilters] = useState<ObsFilters>(initial.filters);
  const [uf, setUf] = useState<string | null>(initial.uf);
  const [mapMetric, setMapMetric] = useState<MapMetric>(initial.mapMetric);
  const [granularity, setGranularity] = useState<Granularity>(initial.granularity);
  const [showDetails, setShowDetails] = useState(false);
  const [compareTab, setCompareTab] = useState<CompareTab>('setor_porte');

  useEffect(() => {
    writeUrlState({ filters, uf, mapMetric, granularity });
  }, [filters, uf, mapMetric, granularity]);

  // ===== Dados — todo número vem de observatory.ts, nunca calculado aqui =====

  const allRecords = SEED_HISTORICAL_RECORDS;
  const filteredNoUf = useMemo(() => applyFilters(allRecords, filters), [filters]);
  const scopedRecords = useMemo(() => (uf ? applyFilters(filteredNoUf, { uf }) : filteredNoUf), [filteredNoUf, uf]);

  const scopedAgg = useMemo(() => (uf ? aggregateUfScope(filteredNoUf, uf) : aggregateAll(filteredNoUf)), [filteredNoUf, uf]);
  const brasilAgg = useMemo(() => aggregateAll(filteredNoUf), [filteredNoUf]);

  const byUfAgg = useMemo(() => byUf(filteredNoUf), [filteredNoUf]);
  const byRegionAgg = useMemo(() => byRegion(filteredNoUf), [filteredNoUf]);

  const mapData = useMemo(() => {
    const out: Record<string, { score: number | null; level: number | null; n: number }> = {};
    for (const code of Object.keys(byUfAgg)) {
      const base = granularity === 'uf' ? byUfAgg[code] : byRegionAgg[REGIAO_POR_UF[code]];
      out[code] = metricAgg(base, mapMetric);
    }
    return out;
  }, [byUfAgg, byRegionAgg, granularity, mapMetric]);

  const ufsInsuficientes = Object.values(byUfAgg).filter((a) => a.score === null).length;
  const showLowDataWarning = granularity === 'uf' && !uf && ufsInsuficientes > 13;

  const label = recorteLabel(filters);
  const nomeUf = uf ? UF_NOMES[uf] : undefined;
  const regiaoUf = uf ? REGIAO_POR_UF[uf] : undefined;

  const frasesInsights = useMemo(() => {
    return insights(scopedAgg, {
      recorteLabel: label,
      uf: uf ?? undefined,
      nomeUf,
      brasil: brasilAgg,
      porUf: byUfAgg,
      nomeEstado: (code) => UF_NOMES[code] ?? code,
    });
  }, [scopedAgg, label, uf, nomeUf, brasilAgg, byUfAgg]);

  const dist = levelDistribution(scopedRecords);

  const dimensaoMaisBaixa = useMemo(() => {
    if (!scopedAgg.dims) return null;
    return DIMENSION_ORDER.reduce((a, b) => (scopedAgg.dims![b] < scopedAgg.dims![a] ? b : a));
  }, [scopedAgg]);

  const estadosComDados = Object.values(byUfAgg).filter((a) => a.n > 0).length;

  // ===== Filtros =====

  const handleFilterChange = (key: keyof ObsFilters, value: string) => {
    setFilters((f) => {
      const next = { ...f };
      if (value) (next as Record<string, string>)[key] = value;
      else delete next[key];
      if (key === 'setor') {
        delete next.esfera;
        delete next.area;
        delete next.poder;
      }
      return next;
    });
  };

  const optionDisabled = (key: keyof ObsFilters, value: string): boolean => {
    const base = { ...filters };
    delete base[key];
    return wouldBreakK(allRecords, base, key, value);
  };

  const removeFilter = (key: keyof ObsFilters) => {
    setFilters((f) => {
      const next = { ...f };
      delete next[key];
      if (key === 'setor') {
        delete next.esfera;
        delete next.area;
        delete next.poder;
      }
      return next;
    });
  };

  const clearAll = () => {
    setFilters({});
    setUf(null);
  };

  const activeChips: { key: keyof ObsFilters; label: string }[] = [];
  if (filters.setor) activeChips.push({ key: 'setor', label: SETORES.find((s) => s.id === filters.setor)!.label });
  if (filters.esfera) activeChips.push({ key: 'esfera', label: ESFERAS.find((e) => e.id === filters.esfera)!.label });
  if (filters.area) activeChips.push({ key: 'area', label: rotuloArea(filters.setor ?? '', filters.area) ?? filters.area });
  if (filters.poder) activeChips.push({ key: 'poder', label: PODERES.find((p) => p.id === filters.poder)!.label });
  if (filters.relacaoIA) activeChips.push({ key: 'relacaoIA', label: RELACOES_IA.find((r) => r.id === filters.relacaoIA)!.label });
  if (filters.porte) activeChips.push({ key: 'porte', label: filters.porte });

  const hasAnyFilter = activeChips.length > 0 || !!uf;

  // ===== Cabeçalho =====

  const atualizadoEm = useMemo(() => latestPeriodo(allRecords), [allRecords]);

  return (
    <DsRoot>
      <Page>
        <div className="mg-obs">
          {/* CABEÇALHO */}
          <PageHeader
            eyebrow="Dados consolidados · Brasil"
            title="Observatório Nacional de Maturidade em Governança de IA"
            description="Como as organizações brasileiras se autoavaliam em governança de inteligência artificial. Dados agregados e anônimos."
            actions={
              <div className="mg-row" style={{ gap: 8, flexShrink: 0 }}>
                <Button variant="secondary" size="sm" icon={Info} onClick={() => setShowDetails(true)}>Como ler</Button>
                <Button variant="secondary" size="sm" icon={Database} onClick={() => onChangeTab('opendata')}>Dados abertos</Button>
              </div>
            }
          />
          <p className="mg-obs-meta mg-small mg-muted">
            <span>{allRecords.length} autoavaliações</span>
            <span>·</span>
            <span>Atualizado em {atualizadoEm}</span>
            <span>·</span>
            <span>Autoavaliação: não constitui certificação</span>
          </p>

          {/* FILTROS */}
          <Card className="mg-obs-filters">
            <div className="mg-obs-fgrid">
              <FilterSelect label="Setor" value={filters.setor ?? ''} onChange={(v) => handleFilterChange('setor', v)}
                options={SETORES.map((s) => ({ id: s.id, label: s.label }))} optionDisabled={(v) => optionDisabled('setor', v)} />
              <FilterSelect label="Esfera" value={filters.esfera ?? ''} onChange={(v) => handleFilterChange('esfera', v)}
                disabled={filters.setor !== 'publico'}
                options={ESFERAS.map((e) => ({ id: e.id, label: e.label }))} optionDisabled={(v) => optionDisabled('esfera', v)} />
              <FilterSelect label="Área" value={filters.area ?? ''} onChange={(v) => handleFilterChange('area', v)}
                disabled={!filters.setor || filters.setor === 'outro'}
                options={areaOptionsFor(filters.setor)} optionDisabled={(v) => optionDisabled('area', v)} />
              <FilterSelect label="Poder" value={filters.poder ?? ''} onChange={(v) => handleFilterChange('poder', v)}
                disabled={filters.setor !== 'publico'}
                options={PODERES.map((p) => ({ id: p.id, label: p.label }))} optionDisabled={(v) => optionDisabled('poder', v)} />
              <FilterSelect label="Relação com IA" value={filters.relacaoIA ?? ''} onChange={(v) => handleFilterChange('relacaoIA', v)}
                options={RELACOES_IA.map((r) => ({ id: r.id, label: r.label }))} optionDisabled={(v) => optionDisabled('relacaoIA', v)} />
              <FilterSelect label="Porte" value={filters.porte ?? ''} onChange={(v) => handleFilterChange('porte', v)}
                options={PORTES.map((p) => ({ id: p, label: p }))} optionDisabled={(v) => optionDisabled('porte', v)} />
            </div>

            <div className="mg-obs-frow">
              {hasAnyFilter ? (
                <>
                  {activeChips.map((c) => (
                    <span className="mg-obs-chip" key={c.key}>
                      {c.label}
                      <button type="button" aria-label={`Remover filtro ${c.label}`} onClick={() => removeFilter(c.key)}><X size={14} aria-hidden="true" /></button>
                    </span>
                  ))}
                  {uf && (
                    <span className="mg-obs-chip">
                      Estado: {UF_NOMES[uf] ?? uf}
                      <button type="button" aria-label="Remover filtro de estado" onClick={() => setUf(null)}><X size={14} aria-hidden="true" /></button>
                    </span>
                  )}
                  <button type="button" className="mg-obs-count" style={{ background: 'none', border: 0, cursor: 'pointer', textDecoration: 'underline', color: 'var(--brand)' }} onClick={clearAll}>Limpar filtros</button>
                  <span className="mg-spacer" />
                  <span className="mg-obs-count"><b>{scopedRecords.length}</b> {scopedRecords.length === 1 ? 'avaliação' : 'avaliações'} neste recorte</span>
                </>
              ) : (
                <span className="mg-small mg-muted">Nenhum filtro aplicado. Clique num estado do mapa para filtrar a página.</span>
              )}
            </div>
          </Card>

          {/* MAPA */}
          <Card className="mg-obs-mapsec">
            <div className="mg-obs-mhead">
              <div>
                <p className="mg-eyebrow">Mapa interativo</p>
                <h2 className="mg-h3" style={{ marginTop: 4 }}>Maturidade por estado</h2>
              </div>
              <div className="mg-row" style={{ gap: 12, flexWrap: 'wrap' }}>
                <Segmented<MapMetric>
                  label="Métrica do mapa"
                  value={mapMetric}
                  onChange={setMapMetric}
                  options={[
                    { value: 'global', label: 'Score global', icon: Gauge },
                    ...DIMENSION_ORDER.map((id) => ({ value: id, label: DIMENSIONS[id].shortName, icon: DIMENSION_ICONS[id] })),
                  ]}
                />
                <Segmented<Granularity>
                  label="Granularidade do mapa"
                  value={granularity}
                  onChange={setGranularity}
                  options={[{ value: 'uf', label: 'Estados' }, { value: 'regiao', label: 'Regiões' }]}
                />
              </div>
            </div>

            {showLowDataWarning && (
              <div className="mg-row" style={{ gap: 10, alignItems: 'center', padding: '10px 14px', marginBottom: 16, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-deep)' }}>
                <Lock className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
                <span className="mg-small mg-muted">Poucos dados por estado neste recorte.</span>
                <Button variant="ghost" size="sm" onClick={() => setGranularity('regiao')}>Ver por região?</Button>
              </div>
            )}

            <div className="mg-obs-mgrid">
              <BrazilMap mode="heatmap" data={mapData} selectedUf={uf} onSelectUf={setUf} metricLabel={mapMetric === 'global' ? 'Score global' : DIMENSIONS[mapMetric].shortName} />

              <div className="mg-obs-panel" aria-live="polite">
                {uf ? (
                  <nav className="mg-an-crumb" aria-label="Navegação do recorte">
                    <a href="#" onClick={(e) => { e.preventDefault(); setUf(null); }}>Brasil</a>
                    {regiaoUf && <> › <span>{regiaoUf}</span></>}
                    {' › '}<span aria-current="page">{nomeUf}</span>
                    <Button variant="ghost" size="sm" iconOnly icon={X} aria-label="Limpar estado selecionado" onClick={() => setUf(null)} style={{ marginLeft: 8 }} />
                  </nav>
                ) : (
                  <p className="mg-eyebrow">Recorte atual</p>
                )}
                <p className="mg-title" style={{ marginTop: uf ? 8 : 4, fontSize: 20 }}>{uf ? `${nomeUf} (${uf})` : label}</p>

                {scopedAgg.score !== null && scopedAgg.level !== null ? (
                  <>
                    <div className="mg-row" style={{ gap: 12, alignItems: 'baseline', marginTop: 8 }}>
                      <span style={{ fontFamily: 'var(--mg-font-mono)', fontWeight: 800, fontSize: 36 }}>{formatNumber(scopedAgg.score)} <small style={{ fontSize: 16, opacity: 0.6 }}>/ 3</small></span>
                      <LevelBadge level={scopedAgg.level as Level} />
                    </div>
                    <p className="mg-small mg-muted" style={{ marginTop: 4 }}>{scopedAgg.n} autoavaliações · {getMaturityLevel(scopedAgg.score).risk}</p>

                    <p className="mg-label" style={{ marginTop: 20 }}>Dimensões</p>
                    <div className="mg-bars" style={{ marginTop: 8 }}>
                      {DIMENSION_ORDER.map((id) => (
                        <DimensionBarRow key={id} id={id} value={scopedAgg.dims![id]} brasilValue={uf ? brasilAgg.dims?.[id] ?? null : null} />
                      ))}
                    </div>
                    {uf && <p className="mg-obs-leg2"><span className="r" /> Brasil</p>}

                    {dist && (
                      <>
                        <p className="mg-label" style={{ marginTop: 20 }}>Organizações por nível</p>
                        <div className="mg-obs-stack" style={{ marginTop: 8 }}>
                          {dist.map((pct, lvl) => <span key={lvl} style={{ width: `${pct}%`, background: `var(--level-${lvl})` }} />)}
                        </div>
                        <ul className="mg-obs-distlist">
                          {dist.map((pct, lvl) => (
                            <li key={lvl}>
                              <i style={{ background: `var(--level-${lvl})` }} />
                              {lvl} · {LEVEL_LABELS[lvl as Level]}
                              <b>{formatNumber(pct, 0)}%</b>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {frasesInsights.length > 0 && (
                      <>
                        <p className="mg-label" style={{ marginTop: 20 }}>O que os dados mostram</p>
                        <ul className="mg-obs-ins" style={{ marginTop: 8 }}>
                          {frasesInsights.map((frase) => (
                            <li key={frase}>
                              <Info className="mg-ico mg-ico-sm" aria-hidden="true" />
                              <span dangerouslySetInnerHTML={{ __html: frase.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                            </li>
                          ))}
                        </ul>
                        <p className="mg-small mg-muted" style={{ marginTop: 8 }}>Frases geradas automaticamente a partir dos dados agregados.</p>
                      </>
                    )}
                  </>
                ) : (
                  <p className="mg-small mg-muted" style={{ marginTop: 12 }}>Dados insuficientes · menos de 5 avaliações neste recorte.</p>
                )}
              </div>
            </div>
          </Card>

          {/* KPIS */}
          <div className="mg-grid mg-obs-kpis" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)' }}>
            <KpiCard label="Score médio" value={scopedAgg.score !== null ? formatNumber(scopedAgg.score) : '—'} meta={scopedAgg.level !== null ? `Nível ${scopedAgg.level} · ${LEVEL_LABELS[scopedAgg.level as Level]}` : undefined} />
            <KpiCard label="Avaliações" value={scopedAgg.n} meta={uf ? undefined : `${estadosComDados} estados com dados`} />
            <KpiCard label="Dimensão mais baixa" value={dimensaoMaisBaixa ? <span className="mg-row" style={{ gap: 6 }}><DimensionTag dimension={dimensaoMaisBaixa} short /></span> : '—'}
              meta={dimensaoMaisBaixa && scopedAgg.dims ? formatNumber(scopedAgg.dims[dimensaoMaisBaixa]) : undefined} />
          </div>

          {/* EVOLUÇÃO + COMPARATIVOS */}
          <div className="mg-grid mg-obs-2" style={{ ['--cols-d' as string]: 'minmax(0,1.1fr) minmax(0,1fr)', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr' }}>
            <Card>
              <CardHeader title={`Evolução do score médio · ${uf ? nomeUf : label}`} />
              <CardBody>
                <TrendChart records={scopedRecords} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Comparativos" actions={
                <Segmented<CompareTab>
                  label="Agrupar comparativos por"
                  value={compareTab}
                  onChange={setCompareTab}
                  options={[
                    { value: 'setor_porte', label: 'Setor e porte' },
                    { value: 'esfera', label: 'Esfera' },
                    { value: 'area', label: 'Área' },
                    { value: 'relacaoIA', label: 'Relação com IA' },
                  ]}
                />
              } />
              <CardBody>
                {scopedRecords.length < K_MIN ? (
                  <p className="mg-small mg-muted">Este recorte tem menos de 5 avaliações. Amplie os filtros para ver os dados.</p>
                ) : compareTab === 'setor_porte' ? (
                  <div className="mg-obs-cmpgrid">
                    <div>
                      <p className="mg-label">Setor</p>
                      <CompareList rows={compareBy(scopedRecords, 'setor')} />
                    </div>
                    <div>
                      <p className="mg-label">Porte</p>
                      <CompareList rows={compareBy(scopedRecords, 'porte')} />
                    </div>
                  </div>
                ) : (
                  <CompareList rows={compareBy(scopedRecords, compareTab)} />
                )}
              </CardBody>
            </Card>
          </div>

          {/* DADOS ABERTOS */}
          <Card style={{ marginBottom: 24 }}>
            <div className="mg-row" style={{ gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div className="mg-row" style={{ gap: 16 }}>
                <Database className="mg-ico" aria-hidden="true" style={{ color: 'var(--brand)' }} />
                <p className="mg-small mg-muted">Baixe a base anonimizada em CSV ou JSON, sob licença CC BY 4.0. Grupos com menos de 5 avaliações já vêm agregados.</p>
              </div>
              <Button variant="primary" icon={Database} onClick={() => onChangeTab('opendata')}>Acessar</Button>
            </div>
          </Card>

          {/* COMO LER */}
          <details className="mg-obs-how mg-card" open={showDetails} onToggle={(e) => setShowDetails(e.currentTarget.open)}>
            <summary>
              <Info className="mg-ico" aria-hidden="true" />
              <span className="mg-title">Como ler este painel</span>
              <ChevronDown className="chev mg-ico mg-ico-sm" aria-hidden="true" />
            </summary>
            <div className="mg-obs-howbody">
              <div>
                <p className="mg-small">
                  Cada prática é respondida numa escala NPLF (Nulo = 0, Parcial = 1, Larga = 2, Total = 3). O score de cada
                  dimensão é a média das práticas respondidas; o score global é a média ponderada das 5 dimensões.
                </p>
                <p className="mg-small" style={{ marginTop: 12 }}>
                  Por sigilo estatístico, nenhum grupo — estado, região, setor, porte, mês ou qualquer combinação de filtros —
                  aparece com menos de 5 avaliações. Esses casos mostram "Dados insuficientes" no lugar do número.
                </p>
              </div>
              <ul className="mg-obs-lv">
                {([0, 1, 2, 3, 4, 5] as Level[]).map((lvl) => (
                  <li key={lvl}>
                    <LevelBadge level={lvl} />
                    <span className="mg-small mg-muted">{levelRangeLabel(lvl)}</span>
                    <RiskBadge level={lvl} />
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </Page>
    </DsRoot>
  );
}

// ===== Subcomponentes locais =====

function FilterSelect({ label, value, onChange, options, optionDisabled, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { id: string; label: string }[]; optionDisabled: (v: string) => boolean; disabled?: boolean;
}) {
  return (
    <Field label={label}>
      {({ id }) => (
        <Select id={id} className="mg-select--sm" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          <option value="">Todos</option>
          {options.map((o) => (
            <option key={o.id} value={o.id} disabled={optionDisabled(o.id)}>
              {o.label}{optionDisabled(o.id) ? ' · dados insuficientes' : ''}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}

function DimensionBarRow({ id, value, brasilValue }: { id: DimensionId; value: number; brasilValue: number | null }) {
  const pct = Math.min(100, (value / 3) * 100);
  const brasilPct = brasilValue !== null ? Math.min(100, (brasilValue / 3) * 100) : null;
  return (
    <div className="mg-bars-row">
      <DimensionTag dimension={id} short />
      <span className="v">{formatNumber(value)}</span>
      <div className="mg-bar" role="img" aria-label={`${DIMENSIONS[id].shortName}: ${formatNumber(value)} de 3`}>
        <span className="mg-bar-fill" style={{ width: `${pct}%`, background: 'var(--brand)' }} />
        {brasilPct !== null && <span className="mg-obs-ref" style={{ left: `${brasilPct}%` }} aria-hidden="true" />}
      </div>
    </div>
  );
}

function CompareList({ rows }: { rows: { grupo: string; agg: Agg }[] }) {
  if (rows.length === 0) return <p className="mg-small mg-muted">Sem dados para este agrupamento.</p>;
  return (
    <ul className="mg-obs-cmp">
      {rows.map(({ grupo, agg }) => (
        <li key={grupo}>
          <span className="nm">{grupo}<small>{agg.n} {agg.n === 1 ? 'avaliação' : 'avaliações'}</small></span>
          {agg.score !== null ? (
            <>
              <div className="mg-obs-dot">
                <div className="t" />
                <div className="d" style={{ left: `${Math.min(100, (agg.score / 3) * 100)}%` }} />
              </div>
              <b>{formatNumber(agg.score)}</b>
            </>
          ) : (
            <span className="mg-obs-na mg-small mg-muted">
              <Lock size={14} aria-hidden="true" />
              Dados insuficientes · menos de 5 avaliações
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function TrendChart({ records }: { records: HistoricalRecord[] }) {
  const data = monthly(records, 12);
  if (data.every((d) => d.n === 0)) {
    return <p className="mg-small mg-muted">Sem avaliações nos últimos 12 meses para este recorte.</p>;
  }

  const W = 500, H = 130;
  const chartTop = 10, chartBottom = 90;
  const maxN = Math.max(1, ...data.map((d) => d.n));
  const stepX = (W - 20) / (data.length - 1);
  const x = (i: number) => 10 + i * stepX;
  const scoreY = (score: number) => chartTop + (1 - score / 3) * (chartBottom - chartTop);

  // Um segmento de linha por trecho contínuo de meses com score — quebra nos pontos nulos.
  const paths: string[] = [];
  let seg: string[] = [];
  data.forEach((d, i) => {
    if (d.score === null) {
      if (seg.length > 1) paths.push(seg.join(' '));
      seg = [];
      return;
    }
    seg.push(`${i === 0 || seg.length === 0 ? 'M' : 'L'}${x(i)},${scoreY(d.score)}`);
  });
  if (seg.length > 1) paths.push(seg.join(' '));

  const lastWithValue = [...data].reverse().find((d) => d.score !== null);
  const lastIndex = lastWithValue ? data.indexOf(lastWithValue) : -1;

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }} role="img" aria-label="Evolução do score médio nos últimos 12 meses">
        <line x1="10" y1={chartBottom} x2={W - 10} y2={chartBottom} stroke="var(--surface-deep)" strokeWidth="1" />
        <line x1="10" y1={chartTop} x2={W - 10} y2={chartTop} stroke="var(--surface-deep)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="12" y={chartTop + 8} fill="var(--text-muted)" fontSize="7" fontFamily="var(--mg-font-mono)">3,0</text>
        <text x="12" y={chartBottom - 2} fill="var(--text-muted)" fontSize="7" fontFamily="var(--mg-font-mono)">0,0</text>

        {data.map((d, i) => {
          const barH = (d.n / maxN) * 14;
          return <rect key={`bar-${d.mes}`} x={x(i) - 4} y={100 - barH} width={8} height={barH} fill="var(--surface-deep)" />;
        })}

        {paths.map((p, i) => <path key={i} d={p} fill="none" stroke="var(--brand)" strokeWidth="2.5" />)}

        {data.map((d, i) =>
          d.score === null ? (
            <circle key={`pt-${d.mes}`} cx={x(i)} cy={chartBottom} r="4" fill="var(--surface-raised)" stroke="var(--brand)" strokeWidth="2" aria-label={`${d.mes}: sem avaliações suficientes`} />
          ) : (
            <circle key={`pt-${d.mes}`} cx={x(i)} cy={scoreY(d.score)} r={i === lastIndex ? 4.5 : 3} fill={i === lastIndex ? 'var(--brand-accent)' : 'var(--brand)'} stroke="var(--surface-raised)" strokeWidth="1.5" />
          )
        )}
        {lastWithValue && lastIndex >= 0 && (
          <text x={x(lastIndex)} y={scoreY(lastWithValue.score!) - 10} fill="var(--text)" fontSize="9" fontWeight={700} textAnchor="middle" fontFamily="var(--mg-font-mono)">{formatNumber(lastWithValue.score!)}</text>
        )}

        {data.map((d, i) => (
          <text key={`lb-${d.mes}`} x={x(i)} y={H - 4} fill="var(--text-muted)" fontSize="7.5" fontFamily="var(--mg-font-mono)" textAnchor="middle">{d.mes}</text>
        ))}
      </svg>
      <div className="mg-row" style={{ gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
        <span className="mg-row" style={{ gap: 6 }}><span className="mg-obs-k d" /><span className="mg-small mg-muted">Score médio</span></span>
        <span className="mg-row" style={{ gap: 6 }}><span className="mg-obs-k bar" style={{ width: 10, height: 10 }} /><span className="mg-small mg-muted">Avaliações no mês</span></span>
        <span className="mg-row" style={{ gap: 6 }}><span className="mg-obs-k hollow" /><span className="mg-small mg-muted">Mês com menos de 5 avaliações</span></span>
      </div>
    </>
  );
}

// ===== Funções auxiliares locais =====

function aggregateAll(records: HistoricalRecord[]): Agg {
  return aggregateRecords(records);
}

function aggregateUfScope(filteredNoUf: HistoricalRecord[], uf: string): Agg {
  return aggregateRecords(applyFilters(filteredNoUf, { uf }));
}

function aggregateRecords(records: HistoricalRecord[]): Agg {
  const n = records.length;
  if (n < K_MIN) return { n, score: null, level: null, dims: null };
  const score = records.reduce((acc, r) => acc + r.score_global, 0) / n;
  const dims = DIMENSION_ORDER.reduce((acc, id) => {
    acc[id] = records.reduce((sum, r) => sum + dimScoreOf(r, id), 0) / n;
    return acc;
  }, {} as Record<DimensionId, number>);
  return { n, score, level: getMaturityLevel(score).num, dims };
}

function dimScoreOf(r: HistoricalRecord, id: DimensionId): number {
  switch (id) {
    case 'gov': return r.score_gov;
    case 'tec': return r.score_tec;
    case 'seg': return r.score_seg;
    case 'edu': return r.score_edu;
    case 'eco': return r.score_eco;
  }
}

function latestPeriodo(records: HistoricalRecord[]): string {
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  let best: { mes: number; ano: number; label: string } | null = null;
  for (const r of records) {
    const [mesStr, anoStr] = r.periodo.split('/');
    const mes = MESES.indexOf(mesStr);
    const ano = Number(anoStr);
    if (mes < 0 || !Number.isFinite(ano)) continue;
    if (!best || ano * 12 + mes > best.ano * 12 + best.mes) best = { mes, ano, label: r.periodo };
  }
  return best?.label ?? '—';
}

function levelRangeLabel(lvl: Level): string {
  const ranges: Record<Level, string> = { 0: '< 0,50', 1: '0,50–0,99', 2: '1,00–1,49', 3: '1,50–1,99', 4: '2,00–2,49', 5: '≥ 2,50' };
  return ranges[lvl];
}
