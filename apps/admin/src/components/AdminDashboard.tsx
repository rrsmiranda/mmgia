/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  LogOut,
  Map as MapIcon,
  Newspaper,
  Plus,
  Search,
  Star,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  AdminUser,
  SEED_ADMIN_USERS,
  HistoricalRecord,
  SEED_HISTORICAL_RECORDS,
  NewsItem,
  SEED_NEWS,
  DIMENSIONS,
  DimensionId,
} from '@mmgia/shared/types';
import {
  Area,
  AreaPrivada,
  areasPublicasPara,
  AREAS_PRIVADAS,
  AREAS_TERCEIRO,
  classificacaoValida,
  descreverClassificacao,
  Esfera,
  ESFERAS,
  Setor,
  SETORES,
} from '@mmgia/shared/taxonomy';
import { aggregate, byUf, levelDistribution, monthly } from '@mmgia/shared/observatory';
import { getMaturityLevel } from '@mmgia/shared/scoring';
import {
  Badge,
  BrazilMap,
  Button,
  Card,
  CardHeader,
  CardBody,
  DataTable,
  DIMENSION_ORDER,
  DimensionBars,
  DimensionTag,
  DsRoot,
  Field,
  Input,
  KpiCard,
  LEVEL_LABELS,
  LevelBadge,
  PageHeader,
  Segmented,
  Select,
  StatusBadge,
  Textarea,
  formatNumber,
  type Level,
} from '@mmgia/shared/design-system';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
}

type Tab = 'dados' | 'mapa' | 'abertos' | 'usuarios' | 'noticias' | 'legal';

const NAV_SECTIONS: { label: string; items: { tab: Tab; label: string; icon: typeof Database; count?: number }[] }[] = [
  { label: 'Geral', items: [
    { tab: 'dados', label: 'Gestão de dados', icon: Database },
    { tab: 'mapa', label: 'Mapa nacional', icon: MapIcon },
    { tab: 'abertos', label: 'Dados abertos', icon: Download },
  ] },
  { label: 'Conteúdo', items: [
    { tab: 'noticias', label: 'Curadoria notícias', icon: Newspaper, count: 12 },
    { tab: 'legal', label: 'Base legal', icon: BookOpen },
  ] },
  { label: 'Administração', items: [{ tab: 'usuarios', label: 'Gestão de usuários', icon: Users }] },
];

/** Colunas exportadas em Dados abertos — mesmas da tabela de Gestão de dados, sem os
 * campos internos de fluxo administrativo (taxonomiaVersao, revisar). Nenhuma coluna de
 * identidade: os "id" são códigos anônimos (av1, av2…), nunca nome da organização. */
const OPEN_DATA_COLUMNS: { key: keyof HistoricalRecord; header: string; desc: string }[] = [
  { key: 'id', header: 'id', desc: 'Código anônimo da avaliação — nunca o nome da organização.' },
  { key: 'periodo', header: 'periodo', desc: 'Mês/ano de referência da avaliação.' },
  { key: 'setor', header: 'setor', desc: 'publico, privado, terceiro ou outro.' },
  { key: 'esfera', header: 'esfera', desc: 'Federal, estadual ou municipal (só setor público).' },
  { key: 'area', header: 'area', desc: 'Área de atuação da organização.' },
  { key: 'regiao', header: 'regiao', desc: 'Região geográfica, derivada do estado.' },
  { key: 'estado', header: 'uf', desc: 'Unidade federativa (UF).' },
  { key: 'porte', header: 'porte', desc: 'Micro, Pequena, Média ou Grande.' },
  { key: 'score_global', header: 'score_global', desc: 'Score global (0 a 3), média ponderada das 5 dimensões.' },
  { key: 'score_gov', header: 'score_governanca', desc: 'Score da dimensão Governança e Arcabouço Regulatório.' },
  { key: 'score_tec', header: 'score_inovacao', desc: 'Score da dimensão Desenvolvimento Tecnológico, Pesquisa e Inovação.' },
  { key: 'score_seg', header: 'score_seguranca', desc: 'Score da dimensão Segurança, Confiança e Proteção da Sociedade.' },
  { key: 'score_edu', header: 'score_educacao', desc: 'Score da dimensão Educação, Capacitação e Cultura Organizacional.' },
  { key: 'score_eco', header: 'score_ecossistema', desc: 'Score da dimensão Cooperação e Inserção no Ecossistema.' },
];

function csvEscape(value: unknown): string {
  if (value === undefined || value === null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function recordsToCsv(records: HistoricalRecord[]): string {
  const header = OPEN_DATA_COLUMNS.map((c) => c.header).join(',');
  const rows = records.map((r) => OPEN_DATA_COLUMNS.map((c) => csvEscape(r[c.key])).join(','));
  return [header, ...rows].join('\n');
}

function recordsToJson(records: HistoricalRecord[]): string {
  const data = records.map((r) => Object.fromEntries(OPEN_DATA_COLUMNS.map((c) => [c.header, r[c.key] ?? null])));
  return JSON.stringify(data, null, 2);
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const SAMPLE_LEGAL_REFS = [
  { code: 'Prática 1.1', name: 'Consciência Regulatória', norm: 'LGPD Art. 50', ex: 'Boas práticas e governança no tratamento de dados.' },
  { code: 'Prática 1.1', name: 'Consciência Regulatória', norm: 'ISO/IEC 42001 Cláusula 5', ex: 'Liderança e comprometimento da alta direção.' },
];

export default function AdminDashboard({ adminEmail, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dados');
  const [notifications, setNotifications] = useState(3);

  // Tab 1: Gestão de dados
  const [historicalRecords, setHistoricalRecords] = useState<HistoricalRecord[]>(SEED_HISTORICAL_RECORDS);
  const [searchCode, setSearchCode] = useState('');
  const [sectorFilter, setSectorFilter] = useState<Setor | 'Todos'>('Todos');
  const [revisarFilter, setRevisarFilter] = useState<'Todos' | 'Sim'>('Todos');
  const [reclassifyRecord, setReclassifyRecord] = useState<HistoricalRecord | null>(null);
  const [reclassifySetor, setReclassifySetor] = useState<Setor | ''>('');
  const [reclassifyEsfera, setReclassifyEsfera] = useState<Esfera | undefined>(undefined);
  const [reclassifyArea, setReclassifyArea] = useState<Area | undefined>(undefined);
  const [reclassifyAtividade, setReclassifyAtividade] = useState<AreaPrivada | undefined>(undefined);

  // Tab Mapa nacional
  const [selectedMapUf, setSelectedMapUf] = useState<string | null>(null);

  // Tab 2: Gestão de usuários
  const [usersList, setUsersList] = useState<AdminUser[]>(SEED_ADMIN_USERS);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'super_admin' | 'gestor' | 'leitor'>('gestor');

  // Tab 3: Curadoria notícias
  const [curatedNewsList, setCuratedNewsList] = useState<NewsItem[]>(SEED_NEWS);
  const [activeCurationFilter, setActiveCurationFilter] = useState<'pendentes' | 'aprovadas'>('pendentes');

  // Tab 4: Base legal
  const [expandedLegalDim, setExpandedLegalDim] = useState<DimensionId | null>('gov');
  const [showAddRefModal, setShowAddRefModal] = useState(false);
  const [addRefForm, setAddRefForm] = useState({ practiceId: '1.1', norm: 'LGPD', article: 'Artigo 20', desc: 'Direito à revisão manual de decisões automatizadas.' });

  const handleAddUser = (e: FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser: AdminUser = {
      id: `u${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Ativo',
      lastLogin: 'Nunca logou',
    };

    setUsersList([...usersList, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const handleDeactivateUser = (id: string) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u));
  };

  const handleApproveNews = (id: string, approve: boolean) => {
    if (approve) {
      setCuratedNewsList(curatedNewsList.map(n => n.id === id ? { ...n, featured: !n.featured } : n));
    } else {
      setCuratedNewsList(curatedNewsList.filter(n => n.id !== id));
    }
  };

  const handleAddLegalRef = (e: FormEvent) => {
    e.preventDefault();
    setShowAddRefModal(false);
    alert(`Referência de conformidade integrada com sucesso à prática ${addRefForm.practiceId}!`);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir permanentemente este registro anonimizado do painel nacional?')) {
      setHistoricalRecords(historicalRecords.filter(r => r.id !== id));
    }
  };

  const filteredRecords = historicalRecords.filter((rec) => {
    const matchesSearch = rec.id.toLowerCase().includes(searchCode.toLowerCase()) ||
                          rec.estado.toLowerCase().includes(searchCode.toLowerCase());
    const matchesSector = sectorFilter === 'Todos' || rec.setor === sectorFilter;
    const matchesRevisar = revisarFilter === 'Todos' || rec.revisar === true;
    return matchesSearch && matchesSector && matchesRevisar;
  });

  // Mesmas funções de agregação do Painel Público (packages/shared/lib/observatory.ts) — um só
  // lugar calcula score médio/distribuição, para os números nunca divergirem entre as duas telas.
  // nationalAgg nunca reflete os filtros (é "nacional" por definição); os painéis abaixo da
  // tabela usam dataAgg/dataDist, que reagem aos filtros aplicados pelo admin.
  const nationalAgg = aggregate(historicalRecords);
  const dataAgg = aggregate(filteredRecords);
  const dataDist = levelDistribution(filteredRecords);
  const ufsComDados = new Set(historicalRecords.map((r) => r.estado)).size;
  const avaliacoesMesRecente = monthly(historicalRecords, 1)[0]?.n ?? 0;

  // Tab Mapa nacional — mesma agregação por UF do Painel Público (byUf), então o mapa do
  // admin nunca mostra um número diferente do que o público já vê para o mesmo estado.
  const ufData = byUf(historicalRecords);
  const selectedUfAgg = selectedMapUf ? ufData[selectedMapUf] : null;
  const mapRecorteAgg = selectedMapUf ? selectedUfAgg : nationalAgg;
  const mapRecorteLabel = selectedMapUf ?? 'Brasil';

  // Tab Dados abertos — exporta o mesmo recorte filtrado de Gestão de dados.
  const dataIso = new Date().toISOString().slice(0, 10);
  const handleExportCsv = () => downloadFile(recordsToCsv(filteredRecords), `mmgia-dados-abertos-${dataIso}.csv`, 'text/csv;charset=utf-8;');
  const handleExportJson = () => downloadFile(recordsToJson(filteredRecords), `mmgia-dados-abertos-${dataIso}.json`, 'application/json');

  const openReclassify = (rec: HistoricalRecord) => {
    setReclassifyRecord(rec);
    setReclassifySetor(rec.setor);
    setReclassifyEsfera(rec.esfera);
    setReclassifyArea(rec.area);
    setReclassifyAtividade(rec.atividadeEstatal);
  };

  const handleSaveReclassify = (e: FormEvent) => {
    e.preventDefault();
    if (!reclassifyRecord || reclassifySetor === '') return;
    setHistoricalRecords(historicalRecords.map((r) => r.id === reclassifyRecord.id ? {
      ...r,
      setor: reclassifySetor,
      esfera: reclassifySetor === 'publico' ? reclassifyEsfera : undefined,
      area: reclassifyArea,
      atividadeEstatal: reclassifyArea === 'estatal' ? reclassifyAtividade : undefined,
      revisar: undefined,
    } : r));
    setReclassifyRecord(null);
  };

  return (
    <DsRoot>
      <div className="mg-admin" id="admin-panel-root">
        <aside className="mg-sidebar" id="admin-sidebar">
          <a href="#" className="mg-logo" onClick={(e) => e.preventDefault()}>
            <span style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--brand)', color: 'var(--on-brand)', fontWeight: 800, fontSize: 13 }}>M</span>
            <span className="mg-logo-word"><b>MMGIA</b><span>cpanel</span></span>
          </a>

          <nav style={{ flex: 1 }}>
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="mg-side-sec">{section.label}</p>
                {section.items.map((item) => (
                  <button
                    key={item.tab}
                    type="button"
                    className="mg-side-item"
                    style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit' }}
                    aria-current={activeTab === item.tab ? 'page' : undefined}
                    onClick={() => setActiveTab(item.tab)}
                  >
                    <item.icon className="mg-ico mg-ico-sm" aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.count !== undefined && <span className="mg-side-count">{item.count}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="mg-side-foot">
            <div className="mg-side-user">
              <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 'var(--radius-pill)', background: 'var(--brand-accent)', color: 'var(--on-accent)', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>JC</span>
              <div className="who">
                <b>Júlia Costa</b>
                <span>super_admin</span>
              </div>
            </div>
            <button type="button" className="mg-side-exit" onClick={onLogout}>
              <LogOut className="mg-ico mg-ico-sm" aria-hidden="true" />
              Sair do painel
            </button>
          </div>
        </aside>

        <div className="mg-admin-col">
          <header className="mg-topbar" id="admin-topbar">
            <div className="mg-row mg-code" style={{ gap: 8 }}>
              <span>admin</span>
              <span>/</span>
              <strong style={{ color: 'var(--text)' }}>{activeTab}</strong>
            </div>
            <div className="mg-spacer" />
            <button type="button" className="mg-iconbtn" style={{ position: 'relative' }} onClick={() => setNotifications(0)} aria-label="Notificações">
              <Bell className="mg-ico mg-ico-sm" aria-hidden="true" />
              {notifications > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--status-critical)' }} />
              )}
            </button>
            <span className="mg-small mg-muted" style={{ whiteSpace: 'nowrap' }}>
              Sessão de e-mail: <strong style={{ color: 'var(--text)' }}>{adminEmail}</strong>
            </span>
          </header>

          <main className="mg-admin-main">
            {/* TAB 1: GESTÃO DE DADOS */}
            {activeTab === 'dados' && (
              <div id="tab-dados-root">
                <PageHeader
                  level="h1"
                  title="Registros de avaliação"
                  description="Filtragem e exclusão direta de diagnósticos agregados."
                  actions={
                    <div className="mg-row" style={{ gap: 8 }}>
                      <Button variant="secondary">Exportar PDF</Button>
                      <Button variant="primary">Exportar Excel</Button>
                    </div>
                  }
                />

                <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(4,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)', gap: 12, marginTop: 24 }} id="dados-kpi-row">
                  <KpiCard label="Avaliados total" value={historicalRecords.length.toLocaleString('pt-BR')} unit="registros" />
                  <KpiCard label="Média nacional score" value={nationalAgg.score !== null ? formatNumber(nationalAgg.score) : '—'} unit="/ 3,00" />
                  <KpiCard label="Avaliações no último mês" value={avaliacoesMesRecente} unit="registradas" />
                  <KpiCard label="Estados mapeados" value={`${ufsComDados} de 27`} unit="UFs" />
                </div>

                <div className="mg-row" style={{ gap: 12, flexWrap: 'wrap', marginTop: 24 }} id="dados-filter-rail">
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <Field label="Buscar">
                      {({ id }) => (
                        <Input id={id} icon={Search} value={searchCode} onChange={(e) => setSearchCode(e.target.value)} placeholder="Pesquisar por ID parcial ou estado (UF)..." />
                      )}
                    </Field>
                  </div>
                  <Field label="Setor">
                    {({ id }) => (
                      <Select id={id} value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value as Setor | 'Todos')}>
                        <option value="Todos">Todos</option>
                        {SETORES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </Select>
                    )}
                  </Field>
                  <Field label="Classificação">
                    {({ id }) => (
                      <Select id={id} value={revisarFilter} onChange={(e) => setRevisarFilter(e.target.value as 'Todos' | 'Sim')}>
                        <option value="Todos">Todos os registros</option>
                        <option value="Sim">A revisar</option>
                      </Select>
                    )}
                  </Field>
                </div>

                {(sectorFilter !== 'Todos' || revisarFilter !== 'Todos' || searchCode !== '') && (
                  <p className="mg-small mg-muted" style={{ marginTop: 16 }}>Os painéis abaixo refletem os filtros aplicados ({filteredRecords.length} de {historicalRecords.length} registros).</p>
                )}

                <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 12 }} id="dados-analytics-row">
                  <Card>
                    <CardHeader title="Score médio por dimensão" />
                    <CardBody>
                      {dataAgg.dims ? (
                        <DimensionBars scores={dataAgg.dims} />
                      ) : (
                        <p className="mg-small mg-muted">Menos de 5 registros no recorte atual — sem média para exibir.</p>
                      )}
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title="Distribuição por nível" />
                    <CardBody>
                      {dataDist ? (
                        <>
                          <div className="mg-obs-stack">
                            {dataDist.map((pct, lvl) => (
                              <span key={lvl} style={{ width: `${pct}%`, background: `var(--level-${lvl})` }} />
                            ))}
                          </div>
                          <ul className="mg-obs-distlist" style={{ marginTop: 12 }}>
                            {dataDist.map((pct, lvl) => (
                              <li key={lvl}>
                                <i style={{ background: `var(--level-${lvl})` }} />
                                {lvl} · {LEVEL_LABELS[lvl as Level]}
                                <b>{formatNumber(pct, 0)}%</b>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="mg-small mg-muted">Menos de 5 registros no recorte atual — sem distribuição para exibir.</p>
                      )}
                    </CardBody>
                  </Card>
                </div>

                <div style={{ marginTop: 24 }} id="evaluations-table-card">
                  <DataTable<HistoricalRecord>
                    caption="Registros de avaliação com score e ações"
                    rowKey={(r) => r.id}
                    columns={[
                      { key: 'id', header: 'ID sessão', render: (r) => <span className="mg-code" style={{ fontWeight: 700 }}>{r.id}</span> },
                      { key: 'classificacao', header: 'Setor · Esfera · Área', render: (r) => (
                        <span className="mg-row" style={{ gap: 6 }}>
                          {descreverClassificacao(r) || 'N/A'}
                          {r.revisar && <StatusBadge status="attention">A revisar</StatusBadge>}
                        </span>
                      ) },
                      { key: 'estado', header: 'UF', render: (r) => r.estado },
                      { key: 'porte', header: 'Porte', render: (r) => r.porte },
                      { key: 'score', header: 'Score', numeric: true, render: (r) => <strong>{formatNumber(r.score_global)}</strong> },
                      { key: 'nivel', header: 'Maturidade', render: (r) => <LevelBadge level={getMaturityLevel(r.score_global).num as Level} /> },
                      { key: 'acoes', header: 'Ações', render: (r) => (
                        <div className="mg-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                          {r.revisar && <Button variant="secondary" size="sm" onClick={() => openReclassify(r)}>Reclassificar</Button>}
                          <Button variant="danger" size="sm" iconOnly icon={Trash2} aria-label="Excluir diagnóstico" onClick={() => handleDeleteRecord(r.id)} />
                        </div>
                      ) },
                    ]}
                    rows={filteredRecords}
                  />
                </div>

                {reclassifyRecord && (
                  <div className="mg-scrim" style={{ position: 'fixed' }} id="reclassify-modal">
                    <form onSubmit={handleSaveReclassify} className="mg-modal" id="reclassify-form">
                      <div className="mg-modal-head">
                        <p className="mg-title">Reclassificar {reclassifyRecord.id}</p>
                      </div>
                      <div className="mg-modal-body">
                        <Field label="Setor">
                          {({ id }) => (
                            <Select id={id} value={reclassifySetor} onChange={(e) => { setReclassifySetor(e.target.value as Setor); setReclassifyEsfera(undefined); setReclassifyArea(undefined); setReclassifyAtividade(undefined); }}>
                              <option value="">Selecione…</option>
                              {SETORES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </Select>
                          )}
                        </Field>
                        {reclassifySetor === 'publico' && (
                          <Field label="Esfera">
                            {({ id }) => (
                              <Select id={id} value={reclassifyEsfera ?? ''} onChange={(e) => { setReclassifyEsfera(e.target.value as Esfera); setReclassifyArea(undefined); }}>
                                <option value="">Selecione…</option>
                                {ESFERAS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                              </Select>
                            )}
                          </Field>
                        )}
                        {reclassifySetor !== '' && reclassifySetor !== 'outro' && (reclassifySetor !== 'publico' || reclassifyEsfera) && (
                          <Field label="Área">
                            {({ id }) => (
                              <Select id={id} value={reclassifyArea ?? ''} onChange={(e) => { setReclassifyArea(e.target.value as Area); setReclassifyAtividade(undefined); }}>
                                <option value="">Selecione…</option>
                                {(reclassifySetor === 'publico' ? areasPublicasPara(reclassifyEsfera as Esfera)
                                  : reclassifySetor === 'privado' ? AREAS_PRIVADAS
                                  : AREAS_TERCEIRO).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                              </Select>
                            )}
                          </Field>
                        )}
                        {reclassifyArea === 'estatal' && (
                          <Field label="Atividade principal da empresa">
                            {({ id }) => (
                              <Select id={id} value={reclassifyAtividade ?? ''} onChange={(e) => setReclassifyAtividade(e.target.value as AreaPrivada)}>
                                <option value="">Selecione…</option>
                                {AREAS_PRIVADAS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                              </Select>
                            )}
                          </Field>
                        )}
                      </div>
                      <div className="mg-modal-foot">
                        <Button type="button" variant="ghost" onClick={() => setReclassifyRecord(null)}>Cancelar</Button>
                        <Button type="submit" variant="primary" disabled={!classificacaoValida({ setor: reclassifySetor, esfera: reclassifyEsfera, area: reclassifyArea, atividadeEstatal: reclassifyAtividade })}>Salvar classificação</Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB MAPA NACIONAL */}
            {activeTab === 'mapa' && (
              <div id="tab-mapa-root">
                <PageHeader
                  level="h1"
                  title="Mapa nacional"
                  description="Maturidade em governança de IA por estado, a partir dos mesmos registros da Gestão de dados."
                />

                <div className="mg-grid" style={{ ['--cols-d' as string]: '1.6fr 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 24 }} id="mapa-nacional-row">
                  <Card>
                    <CardBody>
                      <BrazilMap mode="heatmap" data={ufData} selectedUf={selectedMapUf} onSelectUf={setSelectedMapUf} metricLabel="Score global" />
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader title={mapRecorteLabel} />
                    <CardBody>
                      {mapRecorteAgg && mapRecorteAgg.score !== null ? (
                        <>
                          <div className="mg-row" style={{ alignItems: 'flex-end', gap: 8 }}>
                            <span style={{ fontFamily: 'var(--mg-font-mono)', fontWeight: 800, fontSize: 32 }}>{formatNumber(mapRecorteAgg.score)}</span>
                            <span className="mg-small mg-muted">/ 3,00</span>
                            <LevelBadge level={mapRecorteAgg.level as Level} />
                          </div>
                          <p className="mg-small mg-muted" style={{ marginTop: 4 }}>{mapRecorteAgg.n} avaliações</p>
                          {mapRecorteAgg.dims && (
                            <div style={{ marginTop: 16 }}>
                              <DimensionBars scores={mapRecorteAgg.dims} />
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="mg-small mg-muted">Menos de 5 avaliações neste estado — dados insuficientes para exibir (sigilo k≥5).</p>
                      )}
                      {selectedMapUf && (
                        <Button variant="ghost" size="sm" style={{ marginTop: 16 }} onClick={() => setSelectedMapUf(null)}>Limpar seleção</Button>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB DADOS ABERTOS */}
            {activeTab === 'abertos' && (
              <div id="tab-abertos-root">
                <PageHeader
                  level="h1"
                  title="Dados abertos"
                  description="Exportação dos microdados agregados em CSV ou JSON — mesmos filtros e registros da Gestão de dados."
                  actions={
                    <div className="mg-row" style={{ gap: 8 }}>
                      <Button variant="secondary" icon={Download} onClick={handleExportCsv}>Exportar CSV</Button>
                      <Button variant="primary" icon={Download} onClick={handleExportJson}>Exportar JSON</Button>
                    </div>
                  }
                />

                <Card style={{ marginTop: 24 }}>
                  <CardHeader title="Recorte atual" />
                  <CardBody>
                    <p className="mg-small mg-muted">
                      {filteredRecords.length} de {historicalRecords.length} registros serão exportados.
                      {(sectorFilter !== 'Todos' || revisarFilter !== 'Todos' || searchCode !== '')
                        ? ' Os filtros de setor, busca e classificação aplicados na aba "Gestão de dados" continuam ativos aqui.'
                        : ' Nenhum filtro aplicado — ajuste em "Gestão de dados" para exportar um recorte específico.'}
                    </p>
                  </CardBody>
                </Card>

                <Card style={{ marginTop: 16 }}>
                  <CardHeader title="Schema" />
                  <CardBody>
                    <DataTable
                      caption="Colunas presentes no CSV e no JSON exportados"
                      rowKey={(c) => c.header}
                      columns={[
                        { key: 'coluna', header: 'Coluna', render: (c) => <span className="mg-code">{c.header}</span> },
                        { key: 'descricao', header: 'Descrição', render: (c) => c.desc },
                      ]}
                      rows={OPEN_DATA_COLUMNS}
                    />
                    <p className="mg-small mg-muted" style={{ marginTop: 12 }}>
                      Nenhuma coluna de identidade: sem nome da organização, CNPJ, e-mail ou IP — apenas o código
                      anônimo da avaliação (ex.: av1), como já exibido na aba Gestão de dados.
                    </p>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* TAB 2: GESTÃO DE USUÁRIOS */}
            {activeTab === 'usuarios' && (
              <div id="tab-usuarios-root">
                <PageHeader
                  level="h1"
                  title="Gestão de usuários administrativos"
                  description="Controle integrado de auditorias baseada em papel funcional (RBAC)."
                  actions={<Button variant="primary" icon={UserPlus} onClick={() => setShowAddUserModal(true)}>Novo usuário</Button>}
                />

                <div style={{ marginTop: 24 }} id="users-table-card">
                  <DataTable<AdminUser>
                    caption="Usuários administrativos, papel e status"
                    rowKey={(r) => r.id}
                    columns={[
                      { key: 'id', header: 'ID', render: (r) => <span className="mg-code">#{r.id}</span> },
                      { key: 'name', header: 'Nome do operador', render: (r) => (
                        <span className="mg-row" style={{ gap: 8 }}>
                          <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{r.name.charAt(0)}</span>
                          {r.name}
                        </span>
                      ) },
                      { key: 'email', header: 'E-mail funcional', render: (r) => r.email },
                      { key: 'role', header: 'Papel (role)', render: (r) => <Badge tone={r.role === 'super_admin' ? 'brand' : 'outline'}>{r.role}</Badge> },
                      { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status === 'Ativo' ? 'good' : 'critical'}>{r.status}</StatusBadge> },
                      { key: 'lastLogin', header: 'Último login', render: (r) => r.lastLogin },
                      { key: 'acoes', header: 'Ações', render: (r) => (
                        <Button variant={r.status === 'Ativo' ? 'danger' : 'secondary'} size="sm" onClick={() => handleDeactivateUser(r.id)}>
                          {r.status === 'Ativo' ? 'Inativar' : 'Reativar'}
                        </Button>
                      ) },
                    ]}
                    rows={usersList}
                  />
                </div>

                <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: 'repeat(3,1fr)', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 24 }} id="rbac-matrix-panel">
                  {[
                    { title: 'Scope super_admin', color: 'var(--brand)', desc: 'Acesso absoluto a todos os canais editoriais e modificações globais do banco de dados.' },
                    { title: 'Scope gestor', color: 'var(--status-good)', desc: 'Edição ativa de notícias, alinhamentos regulatórios e relatórios de base legal, sem acesso a dados de credenciais.' },
                    { title: 'Scope leitor', color: 'var(--surface-deep)', desc: 'Acesso unicamente a leitura consultiva e relatórios macro-estruturais exportáveis.' },
                  ].map((scope) => (
                    <div key={scope.title} style={{ background: 'var(--surface-raised)', borderTop: `3px solid ${scope.color}`, border: '1px solid var(--surface-deep)', borderTopWidth: 3, borderRadius: 'var(--radius-lg)', padding: 20 }}>
                      <p className="mg-code" style={{ fontWeight: 700, textTransform: 'uppercase' }}>{scope.title}</p>
                      <p className="mg-small mg-muted" style={{ marginTop: 8 }}>{scope.desc}</p>
                    </div>
                  ))}
                </div>

                {showAddUserModal && (
                  <div className="mg-scrim" style={{ position: 'fixed' }} id="add-user-modal">
                    <form onSubmit={handleAddUser} className="mg-modal" id="new-user-form">
                      <div className="mg-modal-head">
                        <p className="mg-title">Registrar novo usuário</p>
                      </div>
                      <div className="mg-modal-body">
                        <Field label="Nome">
                          {({ id }) => <Input id={id} required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Nome social corporativo" />}
                        </Field>
                        <Field label="E-mail corporativo">
                          {({ id }) => <Input id={id} type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="operador@instituto.gov.br" />}
                        </Field>
                        <Field label="Papel funcional (scope)">
                          {({ id }) => (
                            <Select id={id} value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as 'super_admin' | 'gestor' | 'leitor')}>
                              <option value="super_admin">super_admin</option>
                              <option value="gestor">gestor</option>
                              <option value="leitor">leitor</option>
                            </Select>
                          )}
                        </Field>
                      </div>
                      <div className="mg-modal-foot">
                        <Button type="button" variant="ghost" onClick={() => setShowAddUserModal(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary">Criar usuário</Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CURADORIA DE NOTÍCIAS */}
            {activeTab === 'noticias' && (
              <div id="tab-noticias-root">
                <PageHeader
                  level="h1"
                  title="Fila de curadoria de notícias"
                  description="Aprove ou descarte boletins regulatórios levantados por varreduras automáticas em RSS."
                  actions={
                    <Segmented<'pendentes' | 'aprovadas'>
                      label="Filtro de curadoria"
                      value={activeCurationFilter}
                      onChange={(v) => setActiveCurationFilter(v)}
                      options={[
                        { value: 'pendentes', label: 'Pendentes', count: 12 },
                        { value: 'aprovadas', label: 'Aprovados' },
                      ]}
                    />
                  }
                />

                <div className="mg-stack" style={{ gap: 12, marginTop: 24 }} id="curation-queue-list">
                  {curatedNewsList.map((news) => (
                    <div key={news.id} className="mg-card" style={{ padding: 20 }}>
                      <div className="mg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <div className="mg-row" style={{ gap: 8 }}>
                            <Badge>{news.category}</Badge>
                            <span className="mg-code mg-muted">{news.date} · Fonte: {news.source}</span>
                          </div>
                          <p className="mg-title" style={{ marginTop: 8 }}>{news.title}</p>
                          <p className="mg-small mg-muted" style={{ marginTop: 4 }}>{news.excerpt}</p>
                        </div>
                        <div className="mg-row" style={{ gap: 8, flexShrink: 0 }} id={`curator-actions-${news.id}`}>
                          <Button
                            variant={news.featured ? 'secondary' : 'ghost'}
                            iconOnly
                            icon={Star}
                            aria-label="Marcar destaque"
                            onClick={() => handleApproveNews(news.id, true)}
                          />
                          <Button variant="danger" icon={X} onClick={() => handleApproveNews(news.id, false)}>Descartar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: BASE LEGAL */}
            {activeTab === 'legal' && (
              <div id="tab-legal-root">
                <PageHeader
                  level="h1"
                  title="Base legal das práticas"
                  description="Vincule as 45 práticas às referências normativas aplicáveis (LGPD, AI Act, ISO/IEC 42001, ENIA)."
                  actions={<Button variant="primary" icon={Plus} onClick={() => setShowAddRefModal(true)}>Novo alinhamento legal</Button>}
                />

                <div className="mg-stack" style={{ gap: 12, marginTop: 24 }} id="legal-base-accordions">
                  {(DIMENSION_ORDER as DimensionId[]).map((key) => (
                    <details key={key} className="mg-acc" open={key === expandedLegalDim} onToggle={(e) => setExpandedLegalDim(e.currentTarget.open ? key : null)}>
                      <summary>
                        <DimensionTag dimension={key} />
                        {expandedLegalDim === key ? <ChevronUp className="chev mg-ico mg-ico-sm" aria-hidden="true" /> : <ChevronDown className="chev mg-ico mg-ico-sm" aria-hidden="true" />}
                      </summary>
                      <div style={{ padding: 20 }} id={`dim-legal-expanded-${key}`}>
                        <div className="mg-stack" style={{ gap: 12 }}>
                          {SAMPLE_LEGAL_REFS.map((ref) => (
                            <div key={`${ref.code}-${ref.norm}`} style={{ background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                              <div className="mg-row" style={{ justifyContent: 'space-between' }}>
                                <span className="mg-code" style={{ fontWeight: 700 }}>{ref.code} — {ref.name}</span>
                                <span className="mg-code" style={{ color: 'var(--brand)' }}>{ref.norm}</span>
                              </div>
                              <p className="mg-small" style={{ marginTop: 8 }}>{ref.ex}</p>
                              <div className="mg-row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                                <Button variant="ghost" size="sm">Editar</Button>
                                <Button variant="danger" size="sm">Deletar</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>

                {showAddRefModal && (
                  <div className="mg-scrim" style={{ position: 'fixed' }} id="add-ref-modal">
                    <form onSubmit={handleAddLegalRef} className="mg-modal" id="new-ref-form">
                      <div className="mg-modal-head">
                        <p className="mg-title">Vincular base legal a prática</p>
                      </div>
                      <div className="mg-modal-body">
                        <Field label="Prática alvo">
                          {({ id }) => (
                            <Select id={id} value={addRefForm.practiceId} onChange={(e) => setAddRefForm({ ...addRefForm, practiceId: e.target.value })}>
                              <option value="1.1">Prática 1.1 — Política institucional</option>
                              <option value="1.2">Prática 1.2 — Comitê governança</option>
                              <option value="3.1">Prática 3.1 — Proteção à LGPD</option>
                            </Select>
                          )}
                        </Field>
                        <Field label="Normativa / lei">
                          {({ id }) => <Input id={id} required value={addRefForm.norm} onChange={(e) => setAddRefForm({ ...addRefForm, norm: e.target.value })} placeholder="Ex: LGPD Art. 20" />}
                        </Field>
                        <Field label="Resumo de interface de impacto">
                          {({ id }) => (
                            <Textarea id={id} required rows={2} value={addRefForm.desc} onChange={(e) => setAddRefForm({ ...addRefForm, desc: e.target.value })} placeholder="Quais incisos legais ou parágrafos essa diretriz técnica ajuda a conformar?" />
                          )}
                        </Field>
                      </div>
                      <div className="mg-modal-foot" id="ref-modal-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowAddRefModal(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary">Vincular norma</Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </DsRoot>
  );
}
