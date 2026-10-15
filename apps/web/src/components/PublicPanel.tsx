/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Gauge, Info, Lock, X } from 'lucide-react';
import RadarChart, { type RadarAxis } from './RadarChart';
import { DimensionId, DIMENSIONS } from '@mmgia/shared/types';
import { getMaturityLevel } from '@mmgia/shared/scoring';
import { Agg, K_MIN, ObsFilters, insights } from '@mmgia/shared/observatory';
import {
  fetchAggregate,
  fetchByRegion,
  fetchByUf,
  fetchCompareBy,
  fetchFilterCounts,
  fetchLatestPeriodo,
  fetchLevelDistribution,
  fetchMonthly,
} from '@mmgia/shared/painelApi';
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
  BrazilMap,
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

export default function PublicPanel() {
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

  // ===== Dados — vêm sempre de painelApi.ts (RPCs no banco), nunca agregados aqui =====

  const emptyAgg: Agg = { n: 0, score: null, level: null, dims: null };
  const [totalNacional, setTotalNacional] = useState(0);
  const [atualizadoEm, setAtualizadoEm] = useState('—');
  const [scopedAgg, setScopedAgg] = useState<Agg>(emptyAgg);
  const [brasilAgg, setBrasilAgg] = useState<Agg>(emptyAgg);
  const [byUfAgg, setByUfAgg] = useState<Record<string, Agg>>({});
  const [byRegionAgg, setByRegionAgg] = useState<Record<string, Agg>>({});
  const [dist, setDist] = useState<number[] | null>(null);
  const [monthlyData, setMonthlyData] = useState<{ mes: string; n: number; score: number | null }[]>([]);
  const [filterCounts, setFilterCounts] = useState<Record<string, Record<string, number>>>({});
  const [compareRows, setCompareRows] = useState<{ grupo: string; agg: Agg; section?: string }[]>([]);

  // Constantes do Brasil inteiro (sem filtro nenhum) — buscadas uma única vez.
  useEffect(() => {
    fetchAggregate({}).then((a) => setTotalNacional(a.n));
    fetchLatestPeriodo().then((p) => setAtualizadoEm(p ?? '—'));
  }, []);

  // Recorte sem UF (base do mapa, dos filtros desabilitados e do "Brasil" de comparação).
  useEffect(() => {
    fetchByUf(filters).then(setByUfAgg);
    fetchByRegion(filters).then(setByRegionAgg);
    fetchAggregate(filters).then(setBrasilAgg);
    fetchFilterCounts(filters).then(setFilterCounts);
  }, [JSON.stringify(filters)]);

  // Recorte com UF (se houver) — o que o painel lateral do mapa, a distribuição por nível e a evolução mensal mostram.
  useEffect(() => {
    const scopeFilters = uf ? { ...filters, uf } : filters;
    fetchAggregate(scopeFilters).then(setScopedAgg);
    fetchLevelDistribution(scopeFilters).then(setDist);
    fetchMonthly(scopeFilters, 12).then(setMonthlyData);
  }, [JSON.stringify(filters), uf]);

  // Comparativos — depende também de qual aba de agrupamento está selecionada.
  useEffect(() => {
    const scopeFilters = uf ? { ...filters, uf } : filters;
    if (compareTab === 'setor_porte') {
      Promise.all([
        fetchCompareBy(scopeFilters, 'setor').then((rows) => rows.map((r) => ({ ...r, section: 'Setor' }))),
        fetchCompareBy(scopeFilters, 'porte').then((rows) => rows.map((r) => ({ ...r, section: 'Porte' }))),
      ]).then(([a, b]) => setCompareRows([...a, ...b]));
    } else {
      fetchCompareBy(scopeFilters, compareTab).then((rows) => setCompareRows(rows.map((r) => ({ ...r, section: undefined }))));
    }
  }, [JSON.stringify(filters), uf, compareTab]);

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

  const dimensaoMaisBaixa = useMemo(() => {
    if (!scopedAgg.dims) return null;
    return DIMENSION_ORDER.reduce((a, b) => (scopedAgg.dims![b] < scopedAgg.dims![a] ? b : a));
  }, [scopedAgg]);

  const estadosComDados = Object.values(byUfAgg).filter((a) => a.n > 0).length;

  // ===== Filtros =====

  const FILTER_COUNT_FIELD: Record<string, string> = { setor: 'setor', esfera: 'esfera', area: 'area', poder: 'poder', relacaoIA: 'relacao_ia', porte: 'porte' };

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
    const field = FILTER_COUNT_FIELD[key] ?? key;
    return (filterCounts[field]?.[value] ?? 0) < K_MIN;
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
              <Button variant="secondary" size="sm" icon={Info} onClick={() => setShowDetails(true)}>Como ler</Button>
            }
          />
          <p className="mg-obs-meta mg-small mg-muted">
            <span>{totalNacional} autoavaliações</span>
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
                  <span className="mg-obs-count"><b>{scopedAgg.n}</b> {scopedAgg.n === 1 ? 'avaliação' : 'avaliações'} neste recorte</span>
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
                      <span style={{ fontFamily: 'var(--mg-font-mono)', fontWeight: 800, fontSize: 36 }}>{formatNumber(scopedAgg.score)} <small style={{ fontSize: 16, color: 'var(--text-muted)' }}>/ 3</small></span>
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

          {/* EVOLUÇÃO + KPIS */}
          <div className="mg-grid mg-obs-evo" style={{ ['--cols-d' as string]: 'minmax(0,1.7fr) minmax(0,1fr)', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr' }}>
            <Card>
              <CardHeader title={`Evolução do score médio · ${uf ? nomeUf : label}`} />
              <CardBody>
                <TrendChart data={monthlyData} />
              </CardBody>
            </Card>

            <div className="mg-obs-kpicol">
              <KpiCard label="Score médio" value={scopedAgg.score !== null ? formatNumber(scopedAgg.score) : '—'} meta={scopedAgg.level !== null ? `Nível ${scopedAgg.level} · ${LEVEL_LABELS[scopedAgg.level as Level]}` : undefined} />
              <KpiCard label="Avaliações" value={scopedAgg.n} meta={uf ? undefined : `${estadosComDados} estados com dados`} />
              <KpiCard label="Dimensão mais baixa" value={dimensaoMaisBaixa ? <span className="mg-row" style={{ gap: 6 }}><DimensionTag dimension={dimensaoMaisBaixa} short /></span> : '—'}
                meta={dimensaoMaisBaixa && scopedAgg.dims ? formatNumber(scopedAgg.dims[dimensaoMaisBaixa]) : undefined} />
            </div>
          </div>

          {/* COMPARATIVOS — largura total, para o radar ter mais espaço */}
          <Card className="mg-obs-cmpcard">
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
              {scopedAgg.n < K_MIN ? (
                <p className="mg-small mg-muted">Este recorte tem menos de 5 avaliações. Amplie os filtros para ver os dados.</p>
              ) : (
                <CompareRadarPanel key={compareTab} rows={compareRows} />
              )}
            </CardBody>
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

interface CompareRow { grupo: string; agg: Agg; section?: string }

function CompareRadarPanel({ rows }: { rows: CompareRow[] }) {
  const withKey = rows.map((r) => ({ ...r, key: r.section ? `${r.section}:${r.grupo}` : r.grupo }));
  const selectable = withKey.filter((r) => r.agg.score !== null);

  const [picked, setPicked] = useState<string[]>(() => selectable.slice(0, 2).map((r) => r.key));

  if (withKey.length === 0) return <p className="mg-small mg-muted">Sem dados para este agrupamento.</p>;

  const togglePick = (key: string) => {
    setPicked((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length < 2) return [...prev, key];
      return [prev[1], key];
    });
  };

  const bySection = new Map<string, typeof withKey>();
  for (const r of withKey) {
    const sec = r.section ?? '';
    bySection.set(sec, [...(bySection.get(sec) ?? []), r]);
  }

  const selectedRows = picked
    .map((key) => withKey.find((r) => r.key === key))
    .filter((r): r is (typeof withKey)[number] => !!r && r.agg.dims !== null);

  return (
    <div>
      <div
        className="mg-obs-radarpick-sections"
        style={{ display: 'grid', gridTemplateColumns: bySection.size > 1 ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr', gap: '10px 24px', marginBottom: 12 }}
      >
        {[...bySection.entries()].map(([sec, items]) => (
          <div key={sec || 'all'}>
            {sec && <p className="mg-label" style={{ marginBottom: 6 }}>{sec}</p>}
            <div className="mg-obs-radarpick">
              {items.map((r) => {
                const disabled = r.agg.score === null;
                const on = picked.includes(r.key);
                return (
                  <button
                    key={r.key}
                    type="button"
                    className={cx('mg-obs-uf', on && 'is-on')}
                    disabled={disabled}
                    aria-pressed={on}
                    title={disabled ? 'Dados insuficientes · menos de 5 avaliações' : `${r.agg.n} avaliações`}
                    onClick={() => togglePick(r.key)}
                  >
                    {r.grupo} <b>{r.agg.n}</b>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedRows.length === 0 ? (
        <p className="mg-small mg-muted" style={{ marginTop: 8 }}>Selecione até dois grupos acima para comparar.</p>
      ) : (
        <div className="mg-obs-radargrid">
          {selectedRows.map((r) => <RadarGroupCard key={r.key} label={r.grupo} agg={r.agg} />)}
          {selectedRows.length === 1 && (
            <div className="mg-obs-radarcard mg-obs-radarcard--empty">
              <p className="mg-small mg-muted">Selecione outro grupo acima para comparar lado a lado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RadarGroupCard({ label, agg }: { label: string; agg: Agg }) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const axes: RadarAxis[] = DIMENSION_ORDER.map((id) => {
    const value = agg.dims![id];
    const level = getMaturityLevel(value);
    return {
      id,
      label: DIMENSIONS[id].shortName,
      sub: formatNumber(value),
      value,
      title: DIMENSIONS[id].name,
      detail: `${label} · Nível ${level.num} · ${LEVEL_LABELS[level.num]} · ${formatNumber(value)} / 3`,
      ariaLabel: `${DIMENSIONS[id].name} em ${label}: nível ${level.num}, ${LEVEL_LABELS[level.num]}, score ${formatNumber(value)} de 3`,
    };
  });
  return (
    <div className="mg-obs-radarcard">
      <div className="mg-obs-radarcard-head">
        <p className="mg-title" style={{ fontSize: 15 }}>
          {label} <span className="mg-small mg-muted" style={{ fontWeight: 400 }}>· {agg.n} {agg.n === 1 ? 'avaliação' : 'avaliações'}</span>
        </p>
      </div>
      <RadarChart
        axes={axes}
        highlightId={hoverId}
        onAxisHover={setHoverId}
        ariaLabel={`Radar de dimensões · ${label}`}
        size={320}
      />
      <div className="mg-row" style={{ justifyContent: 'center', gap: 8, marginTop: 4 }}>
        <span style={{ fontFamily: 'var(--mg-font-mono)', fontWeight: 800, fontSize: 20 }}>{formatNumber(agg.score!)}</span>
        <LevelBadge level={agg.level as Level} />
      </div>
    </div>
  );
}

function TrendChart({ data }: { data: { mes: string; n: number; score: number | null }[] }) {
  if (data.length === 0 || data.every((d) => d.n === 0)) {
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
            <circle key={`pt-${d.mes}`} cx={x(i)} cy={chartBottom} r="4" fill="var(--surface-raised)" stroke="var(--brand)" strokeWidth="2" role="img" aria-label={`${d.mes}: sem avaliações suficientes`} />
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

function levelRangeLabel(lvl: Level): string {
  const ranges: Record<Level, string> = { 0: '< 0,50', 1: '0,50–0,99', 2: '1,00–1,49', 3: '1,50–1,99', 4: '2,00–2,49', 5: '≥ 2,50' };
  return ranges[lvl];
}
