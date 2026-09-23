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
  LogOut,
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
  Badge,
  Button,
  DataTable,
  DIMENSION_ORDER,
  DimensionTag,
  DsRoot,
  Field,
  Input,
  KpiCard,
  PageHeader,
  Segmented,
  Select,
  StatusBadge,
  Textarea,
  formatNumber,
} from '@mmgia/shared/design-system';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
}

type Tab = 'dados' | 'usuarios' | 'noticias' | 'legal';

const NAV_SECTIONS: { label: string; items: { tab: Tab; label: string; icon: typeof Database; count?: number }[] }[] = [
  { label: 'Geral', items: [{ tab: 'dados', label: 'Gestão de dados', icon: Database }] },
  { label: 'Conteúdo', items: [
    { tab: 'noticias', label: 'Curadoria notícias', icon: Newspaper, count: 12 },
    { tab: 'legal', label: 'Base legal', icon: BookOpen },
  ] },
  { label: 'Administração', items: [{ tab: 'usuarios', label: 'Gestão de usuários', icon: Users }] },
];

const SAMPLE_LEGAL_REFS = [
  { code: 'Prática 1.1', name: 'Política ética', norm: 'PL 2338/23 Art. 8º de Conformidade', ex: 'Deita regras relativas de transparência ao cidadão e comissão supervisora federativa operacional.' },
  { code: 'Prática 1.2', name: 'Comitê multidisciplinar', norm: 'ISO/IEC 42001 Cl. 5.1 Liderança', ex: 'Delega canais coordenados de escrutínio deliberativo.' },
];

export default function AdminDashboard({ adminEmail, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dados');
  const [notifications, setNotifications] = useState(3);

  // Tab 1: Gestão de dados
  const [historicalRecords, setHistoricalRecords] = useState<HistoricalRecord[]>(SEED_HISTORICAL_RECORDS);
  const [searchCode, setSearchCode] = useState('');
  const [sectorFilter, setSectorFilter] = useState('Todos');

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
    return matchesSearch && matchesSector;
  });

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
                  level="h3"
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
                  <KpiCard label="Avaliados total" value="1.847" unit="registros" />
                  <KpiCard label="Média nacional score" value={formatNumber(1.42)} unit="/ 3,00" />
                  <KpiCard label="Novas avaliações (30d)" value="312" unit="registradas" />
                  <KpiCard label="Estados mapeados" value="27 de 27" unit="UFs" />
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
                      <Select id={id} value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                        <option value="Todos">Todos</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="Saúde">Saúde</option>
                        <option value="Educação">Educação</option>
                        <option value="Gov. federal">Gov. federal</option>
                        <option value="Gov. municipal">Gov. municipal</option>
                      </Select>
                    )}
                  </Field>
                </div>

                <div style={{ marginTop: 24 }} id="evaluations-table-card">
                  <DataTable<HistoricalRecord>
                    caption="Registros de avaliação com score e ações"
                    rowKey={(r) => r.id}
                    columns={[
                      { key: 'id', header: 'ID sessão', render: (r) => <span className="mg-code" style={{ fontWeight: 700 }}>{r.id}</span> },
                      { key: 'natureza', header: 'Natureza jurídica', render: (r) => r.natureza },
                      { key: 'estado', header: 'UF', render: (r) => r.estado },
                      { key: 'setor', header: 'Setor', render: (r) => r.setor },
                      { key: 'porte', header: 'Porte', render: (r) => r.porte },
                      { key: 'score', header: 'Score', numeric: true, render: (r) => <strong>{formatNumber(r.score_global)}</strong> },
                      { key: 'nivel', header: 'Maturidade', render: (r) => {
                        const scoreLevel = r.score_global < 1.0 ? 'Nível 1' : r.score_global < 1.5 ? 'Nível 2' : 'Nível 3';
                        const status = scoreLevel === 'Nível 1' ? 'critical' : scoreLevel === 'Nível 2' ? 'attention' : 'good';
                        return <StatusBadge status={status}>{scoreLevel}</StatusBadge>;
                      } },
                      { key: 'acoes', header: 'Ações', render: (r) => (
                        <Button variant="danger" size="sm" iconOnly icon={Trash2} aria-label="Excluir diagnóstico" onClick={() => handleDeleteRecord(r.id)} />
                      ) },
                    ]}
                    rows={filteredRecords}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: GESTÃO DE USUÁRIOS */}
            {activeTab === 'usuarios' && (
              <div id="tab-usuarios-root">
                <PageHeader
                  level="h3"
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
                  level="h3"
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
                  level="h3"
                  title="Alinhamento trilateral de base legal"
                  description="Vincule as 45 práticas às normativas constitucionais, do Congresso ou ISO."
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
                            <div key={ref.code} style={{ background: 'var(--surface-sunken)', border: '1px solid var(--surface-deep)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
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
