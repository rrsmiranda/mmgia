/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LuUsers,
  LuDatabase,
  LuFileText,
  LuNewspaper,
  LuBookOpen,
  LuMap,
  LuPlus,
  LuTrash2,
  LuCheck,
  LuX,
  LuStar,
  LuSettings,
  LuBell,
  LuSearch,
  LuEye,
  LuLogOut,
  LuUserPlus,
  LuShield,
  LuPencil,
  LuChevronUp,
  LuChevronDown
} from 'react-icons/lu';

const Users = LuUsers as any;
const Database = LuDatabase as any;
const FileText = LuFileText as any;
const Newspaper = LuNewspaper as any;
const BookOpen = LuBookOpen as any;
const Map = LuMap as any;
const Plus = LuPlus as any;
const Trash2 = LuTrash2 as any;
const Check = LuCheck as any;
const X = LuX as any;
const Star = LuStar as any;
const Settings = LuSettings as any;
const Bell = LuBell as any;
const Search = LuSearch as any;
const Eye = LuEye as any;
const LogOut = LuLogOut as any;
const UserPlus = LuUserPlus as any;
const Shield = LuShield as any;
const Edit2 = LuPencil as any;
const ChevronUp = LuChevronUp as any;
const ChevronDown = LuChevronDown as any;
import {
  AdminUser,
  SEED_ADMIN_USERS,
  HistoricalRecord,
  SEED_HISTORICAL_RECORDS,
  NewsItem,
  SEED_NEWS,
  DIMENSIONS,
  DimensionId
} from '../types';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
}

export default function AdminDashboard({ adminEmail, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dados' | 'usuarios' | 'noticias' | 'legal'>('dados');
  const [notifications, setNotifications] = useState(3);
  
  // Tab 1: Gestão de dados states
  const [historicalRecords, setHistoricalRecords] = useState<HistoricalRecord[]>(SEED_HISTORICAL_RECORDS);
  const [searchCode, setSearchCode] = useState('');
  const [sectorFilter, setSectorFilter] = useState('Todos');

  // Tab 2: Gestão de usuários states
  const [usersList, setUsersList] = useState<AdminUser[]>(SEED_ADMIN_USERS);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'super_admin' | 'gestor' | 'leitor'>('gestor');

  // Tab 3: Curadoria notícias states
  const [curatedNewsList, setCuratedNewsList] = useState<NewsItem[]>(SEED_NEWS);
  const [activeCurationFilter, setActiveCurationFilter] = useState<'pendentes' | 'aprovadas'>('pendentes');

  // Tab 4: Base legal states
  const [expandedLegalDim, setExpandedLegalDim] = useState<DimensionId | null>('gov');
  const [showAddRefModal, setShowAddRefModal] = useState(false);
  const [addRefForm, setAddRefForm] = useState({ practiceId: '1.1', norm: 'LGPD', article: 'Artigo 20', desc: 'Direito à revisão manual de decisões automatizadas.' });

  // Mock handlers
  const handleAddUser = (e: React.FormEvent) => {
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
      // simulate approval success
      setCuratedNewsList(curatedNewsList.map(n => n.id === id ? { ...n, featured: !n.featured } : n));
    } else {
      // delete/reject item from curators lists
      setCuratedNewsList(curatedNewsList.filter(n => n.id !== id));
    }
  };

  const handleAddLegalRef = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddRefModal(false);
    alert(`Referência de conformidade integrada com sucesso à prática ${addRefForm.practiceId}!`);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir permanentemente este registro anonimizado do painel nacional?')) {
      setHistoricalRecords(historicalRecords.filter(r => r.id !== id));
    }
  };

  // Filter historical records for tab 1
  const filteredRecords = historicalRecords.filter((rec) => {
    const matchesSearch = rec.id.toLowerCase().includes(searchCode.toLowerCase()) || 
                          rec.estado.toLowerCase().includes(searchCode.toLowerCase());
    const matchesSector = sectorFilter === 'Todos' || rec.setor === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex" id="admin-panel-root">
      
      {/* 1. FIXED LEFT SIDEBAR */}
      <aside className="w-56 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0" id="admin-sidebar">
        <div>
          {/* Logo Brand top */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-6 h-6 bg-brand-primary flex items-center justify-center font-bold text-white text-sm">
              M
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white font-sans uppercase">
              MMGIA <span className="text-brand-accent text-[9px] font-mono text-slate-400">cpanel</span>
            </span>
          </div>

          {/* User profile card */}
          <div className="p-4 bg-slate-950 flex items-center gap-2.5 border-b border-slate-900" id="sidebar-profile-card">
            <div className="w-8 h-8 rounded-full bg-brand-accent text-slate-900 font-bold flex items-center justify-center text-xs">
              JC
            </div>
            <div className="space-y-0.5 truncate">
              <h5 className="font-sans font-bold text-white text-xs">Júlia Costa</h5>
              <span className="font-mono text-[8px] uppercase tracking-wider text-brand-accent block font-bold">super_admin</span>
            </div>
          </div>

          {/* Menu Sections layout list */}
          <nav className="p-3 space-y-5" id="sidebar-navigation">
            <div className="space-y-1">
              <span className="font-mono text-[8px] font-bold text-slate-500 uppercase tracking-wider px-3 block">GERAL</span>
              
              <button
                onClick={() => setActiveTab('dados')}
                className={`w-full text-left font-sans text-xs font-semibold py-2.5 px-3 rounded-none flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'dados'
                    ? 'border-l-4 border-brand-accent bg-white/5 text-white'
                    : 'text-slate-400 hover:bg-white/2 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4 text-brand-primary" />
                Gestão de Dados
              </button>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[8px] font-bold text-slate-500 uppercase tracking-wider px-3 block">CONTEÚDO</span>
              
              <button
                onClick={() => setActiveTab('noticias')}
                className={`w-full text-left font-sans text-xs font-semibold py-2.5 px-3 rounded-none flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'noticias'
                    ? 'border-l-4 border-brand-accent bg-white/5 text-white'
                    : 'text-slate-400 hover:bg-white/2 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-brand-accent" />
                  Curadoria Notícias
                </span>
                <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  12
                </span>
              </button>

              <button
                onClick={() => setActiveTab('legal')}
                className={`w-full text-left font-sans text-xs font-semibold py-2.5 px-3 rounded-none flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'legal'
                    ? 'border-l-4 border-brand-accent bg-white/5 text-white'
                    : 'text-slate-400 hover:bg-white/2 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                Base Legal
              </button>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[8px] font-bold text-slate-500 uppercase tracking-wider px-3 block">ADMINISTRAÇÃO</span>
              
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`w-full text-left font-sans text-xs font-semibold py-2.5 px-3 rounded-none flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'usuarios'
                    ? 'border-l-4 border-brand-accent bg-white/5 text-white'
                    : 'text-slate-400 hover:bg-white/2 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-brand-accent" />
                Gestão de Usuários
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Logout action */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-red-650 hover:bg-red-900 border border-red-950 hover:border-red-950 font-mono text-[10px] uppercase font-bold tracking-wider text-slate-200 flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE VIEWPORT: TOPBAR & SCROLLING MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0" id="admin-viewport">
        
        {/* 2. TOPBAR */}
        <header className="bg-white border-b border-slate-100 py-3.5 px-6 flex justify-between items-center" id="admin-topbar">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 select-none">
            <span>admin</span>
            <span>/</span>
            <span className="text-slate-700 font-bold">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Bell Alert widget */}
            <div className="relative cursor-pointer" onClick={() => setNotifications(0)}>
              <Bell className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </div>
            
            <div className="text-right text-[10px] font-mono text-slate-400 hidden sm:block">
              <span>Sessão de e-mail: <strong className="text-slate-700 font-bold">{adminEmail}</strong></span>
            </div>
          </div>
        </header>

        {/* 3. MAIN TAB CONTENT */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* TAB 1: GESTÃO DE DADOS */}
          {activeTab === 'dados' && (
            <div className="space-y-6" id="tab-dados-root">
              
              {/* Header section titles */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Registros de Avaliação</h3>
                  <p className="text-xs text-slate-500">Filtragem e exclusão direta de diagnósticos agregados.</p>
                </div>

                {/* Simulated exports buttons */}
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                    Exportar PDF
                  </button>
                  <button className="px-4 py-2 bg-[#1D9E75] hover:brightness-110 text-white font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                    Exportar Excel
                  </button>
                </div>
              </div>

              {/* KPI indicators counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="dados-kpi-row">
                {[
                  { label: 'avaliados total', val: '1.847 registros', highlight: 'text-brand-primary' },
                  { label: 'média nacional score', val: '1.42 / 3.00', highlight: 'text-blue-600' },
                  { label: 'novas avaliações (30d)', val: '312 registradas', highlight: 'text-emerald-600' },
                  { label: 'estados mapeados', val: '27 de 27 UFs', highlight: 'text-purple-650' },
                ].map((kpi, i) => (
                  <div key={kpi.label} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                    <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">{kpi.label}</span>
                    <span className="text-lg font-bold text-slate-950 font-sans tracking-tight block">{kpi.val}</span>
                  </div>
                ))}
              </div>

              {/* FILTERING HEADER */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch select-none" id="dados-filter-rail">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Pesquisar por ID parcial ou Estado (UF)..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-primary pl-9 text-slate-800 font-mono"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                </div>

                <div className="flex gap-3">
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="Todos">Filtrar Setor (Todos)</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Gov. federal">Gov. federal</option>
                    <option value="Gov. municipal">Gov. municipal</option>
                  </select>
                </div>
              </div>

              {/* TABLE LIST */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm" id="evaluations-table-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] text-slate-500">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold">
                        <th className="p-4">ID SESSÃO</th>
                        <th className="p-4">NATUREZA JURÍDICA</th>
                        <th className="p-4 text-center">UF</th>
                        <th className="p-4">SETOR</th>
                        <th className="p-4">PORTE</th>
                        <th className="p-4 text-center font-black text-slate-900">SCORE</th>
                        <th className="p-4 text-center">MATURIDADE</th>
                        <th className="p-4 text-right">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[10.5px]">
                      {filteredRecords.map((rec) => {
                        const scoreLevel = rec.score_global < 1.0 ? 'Nível 1' : rec.score_global < 1.5 ? 'Nível 2' : 'Nível 3';
                        const badgeColor = scoreLevel === 'Nível 1' ? 'bg-red-50 text-red-650' : scoreLevel === 'Nível 2' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-brand-primary';

                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-900 select-all">{rec.id}</td>
                            <td className="p-4 font-sans font-semibold text-slate-700">{rec.natureza}</td>
                            <td className="p-4 text-center font-bold text-slate-800">{rec.estado}</td>
                            <td className="p-4 font-sans text-slate-600">{rec.setor}</td>
                            <td className="p-4 font-sans text-slate-500">{rec.porte}</td>
                            <td className="p-4 text-center font-black text-[#0C3D6E] text-xs">{rec.score_global.toFixed(2)}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${badgeColor}`}>
                                {scoreLevel}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteRecord(rec.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition cursor-pointer inline-block"
                                title="Excluir Diagnóstico"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTÃO DE USUÁRIOS & RBAC */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6" id="tab-usuarios-root">
              
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Gestão de Usuários administratrios</h3>
                  <p className="text-xs text-slate-500">Controle integrado de auditorias baseada em papel funcional (RBAC).</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-5 py-3 bg-brand-primary hover:brightness-110 text-white font-sans text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Novo Usuário
                </button>
              </div>

              {/* USER LIST TABLE */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm" id="users-table-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] text-slate-500">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold">
                        <th className="p-4">ID</th>
                        <th className="p-4">NOME DO OPERADOR</th>
                        <th className="p-4">EMAIL FUNCIONAL</th>
                        <th className="p-4">PAPEL (ROLE)</th>
                        <th className="p-4 text-center">STATUS</th>
                        <th className="p-4 text-center">ÚLTIMO DETALHE LOGIN</th>
                        <th className="p-4 text-right">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[10.5px]">
                      {usersList.map((user) => {
                        const isSuper = user.role === 'super_admin';
                        const isReader = user.role === 'leitor';
                        
                        return (
                          <tr key={user.id} className="hover:bg-slate-50/50">
                            <td className="p-4 text-slate-400 font-bold">#{user.id}</td>
                            <td className="p-4 font-sans font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                                {user.name.charAt(0)}
                              </span>
                              {user.name}
                            </td>
                            <td className="p-4 select-all text-slate-500">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded font-bold text-[8.5px] uppercase ${
                                isSuper ? 'bg-blue-100 text-blue-700' : isReader ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[8.5px] uppercase ${
                                user.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-650'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="p-4 text-center text-slate-400">{user.lastLogin}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeactivateUser(user.id)}
                                className={`text-[10px] font-sans font-semibold px-2.5 py-1.5 transition cursor-pointer ${
                                  user.status === 'Ativo' ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                              >
                                {user.status === 'Ativo' ? 'Inativar' : 'Reativar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Permissions scope explanation table matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="rbac-matrix-panel">
                {[
                  { title: 'Scope super_admin', color: 'border-blue-500', desc: 'Acesso absoluto a todos os canais editoriais e modificações globais do PostgreSQL.' },
                  { title: 'Scope gestor', color: 'border-emerald-500', desc: 'Edição ativa de notícias, alinhamentos regulatórios, relatórios de base legal, sem acesso a dados de credenciais.' },
                  { title: 'Scope leitor', color: 'border-slate-300', desc: 'Acesso unicamente a leitura consultiva e relatórios macro-estruturais exportáveis.' }
                ].map((scope) => (
                  <div key={scope.title} className={`bg-white border-t-4 ${scope.color} rounded-2xl p-5 shadow-xs text-xs space-y-1.5`}>
                    <h4 className="font-mono uppercase font-bold text-slate-800">{scope.title}</h4>
                    <p className="text-slate-400 leading-normal font-light">{scope.desc}</p>
                  </div>
                ))}
              </div>

              {/* OVERLAY ADD USER MODAL */}
              {showAddUserModal && (
                <div className="fixed inset-0 z-200 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6" id="add-user-modal">
                  <form onSubmit={handleAddUser} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border" id="new-user-form">
                    <h4 className="font-sans font-bold text-slate-950 text-sm">Registrar Novo Usuário</h4>
                    
                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[9px] uppercase font-bold text-slate-400">Nome:</label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Nome social corporativo"
                        className="w-full text-xs p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-brand-primary text-slate-800"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[9px] uppercase font-bold text-slate-400 font-black">E-mail corporativo:</label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="operador@instituto.gov.br"
                        className="w-full text-xs p-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-brand-primary text-slate-800"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[9px] uppercase font-bold text-slate-400">Papel Funcional (Scope):</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full text-xs p-3 bg-slate-50 border rounded-xl focus:outline-none text-slate-800"
                      >
                        <option value="super_admin">super_admin</option>
                        <option value="gestor">gestor</option>
                        <option value="leitor">leitor</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-sans tracking-wide font-semibold select-none cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-primary hover:brightness-110 text-white font-sans font-semibold tracking-wide cursor-pointer"
                      >
                        Criar Usuário
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CURADORIA DE NOTÍCIAS */}
          {activeTab === 'noticias' && (
            <div className="space-y-6" id="tab-noticias-root">
              
              <div className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight font-sans text-left">Fila de Curação de Notícias</h3>
                  <p className="text-xs text-slate-500">Aprove ou descarte boletins regulatórios levantados por varreduras automáticas em RSS.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl" id="curator-toggle">
                  <button
                    onClick={() => setActiveCurationFilter('pendentes')}
                    className={`px-4.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
                      activeCurationFilter === 'pendentes' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    Pendentes (12)
                  </button>
                  <button
                    onClick={() => setActiveCurationFilter('aprovadas')}
                    className={`px-4.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
                      activeCurationFilter === 'aprovadas' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    Aprovados
                  </button>
                </div>
              </div>

              {/* News items list queue curation mapping */}
              <div className="space-y-4" id="curation-queue-list">
                {curatedNewsList.map((news) => (
                  <div
                    key={news.id}
                    className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs hover:border-slate-200 transition"
                  >
                    <div className="space-y-1.5 flex-1 select-none">
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                          {news.category}
                        </span>
                        <span className="text-slate-400">{news.date} · Fonte: <strong className="text-slate-600 font-bold">{news.source}</strong></span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-950 font-sans tracking-tight">{news.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-light">{news.excerpt}</p>
                    </div>

                    <div className="flex gap-2 shrink-0 self-start sm:self-center" id={`curator-actions-${news.id}`}>
                      {/* Highlight Star action toggle */}
                      <button
                        onClick={() => handleApproveNews(news.id, true)}
                        className={`p-2.5 rounded-2xl border cursor-pointer ${
                          news.featured ? 'bg-amber-100 border-amber-300 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Marcar Destaque"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>

                      {/* Reject action */}
                      <button
                        onClick={() => handleApproveNews(news.id, false)}
                        className="py-2 px-4 border border-red-200 hover:bg-red-50 text-red-650 font-sans text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                        title="Rejeitar Artigo"
                      >
                        <X className="w-4.5 h-4.5" />
                        Descartar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BASE LEGAL & ENIA MAPPING */}
          {activeTab === 'legal' && (
            <div className="space-y-6" id="tab-legal-root">
              
              <div className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Correlação Trilateral de Base Legal</h3>
                  <p className="text-xs text-slate-500">Instrua o modelo vinculando as 45 práticas às normativas constitucionais, senado ou ISO.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddRefModal(true)}
                  className="px-5 py-3 bg-brand-primary hover:brightness-110 text-white font-sans text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  Nova Correlação Legal
                </button>
              </div>

              {/* 5-pilar dimensions legal correlations mappings */}
              <div className="space-y-3" id="legal-base-accordions">
                {(Object.keys(DIMENSIONS) as DimensionId[]).map((key) => {
                  const info = DIMENSIONS[key];
                  const isExpanded = expandedLegalDim === key;

                  return (
                    <div key={key} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                      <div
                        onClick={() => setExpandedLegalDim(isExpanded ? null : key)}
                        className="p-5 flex justify-between items-center cursor-pointer select-none"
                      >
                        <span className="font-sans font-bold text-xs text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }}></span>
                          {info.name}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>

                      {isExpanded && (
                        <div className="border-t p-5 bg-slate-50/50 space-y-4" id={`dim-legal-expanded-${key}`}>
                          
                          {/* Sample bindings lists */}
                          {[
                            { code: 'Prática 1.1', name: 'Política ética', norm: 'PL 2338/23 Art. 8º de Conformidade', art: 'Art. 8º inc. II', ex: 'Deita regras relativas de transparência ao cidadão e comissão supervisora federativa operacional.' },
                            { code: 'Prática 1.2', name: 'Comitê multidisciplinar', norm: 'ISO/IEC 42001 Cl. 5.1 Liderança', art: 'Cláusula 5.1', ex: 'Delega canais coordenados de escrutínio deliberativo.' },
                          ].map((ref, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="font-bold text-slate-700">{ref.code} — {ref.name}</span>
                                <span className="bg-sky-55 text-[#0C3D6E] font-extrabold">{ref.norm}</span>
                              </div>
                              <p className="text-xs text-slate-600 font-sans leading-relaxed">{ref.ex}</p>
                              <div className="flex justify-end gap-2.5">
                                <button className="p-1 px-3 border border-slate-200 font-mono text-[9px] uppercase hover:bg-slate-50 text-slate-500 cursor-pointer">
                                  Editar
                                </button>
                                <button className="p-1 px-3 border border-red-200 font-mono text-[9px] uppercase hover:bg-red-50 text-red-650 cursor-pointer">
                                  Deletar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* OVERLAY ADD LEGAL REFERENCE MODAL */}
              {showAddRefModal && (
                <div className="fixed inset-0 z-200 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-6" id="add-ref-modal">
                  <form onSubmit={handleAddLegalRef} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border" id="new-ref-form">
                    <h4 className="font-sans font-bold text-slate-950 text-sm">Vincular Base Legal a Prática</h4>

                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[9px] uppercase font-bold text-slate-400">Prática Alvo:</label>
                      <select
                        value={addRefForm.practiceId}
                        onChange={(e) => setAddRefForm({ ...addRefForm, practiceId: e.target.value })}
                        className="w-full text-xs p-3 bg-slate-50 border rounded-xl focus:outline-none text-slate-800"
                      >
                        <option value="1.1">Prática 1.1 — Política Institucional</option>
                        <option value="1.2">Prática 1.2 — Comitê Governança</option>
                        <option value="3.1">Prática 3.1 — Proteção à LGPD</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[9px] uppercase font-bold text-slate-400">Normativa / Lei:</label>
                      <input
                        type="text"
                        required
                        value={addRefForm.norm}
                        onChange={(e) => setAddRefForm({ ...addRefForm, norm: e.target.value })}
                        placeholder="Ex: LGPD Art. 20"
                        className="w-full text-xs p-3 bg-slate-50 border rounded-xl focus:outline-none text-slate-800"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="font-mono text-[9px] uppercase font-bold text-slate-400">Resumo de Interface de Impacto:</label>
                      <textarea
                        required
                        rows={2}
                        value={addRefForm.desc}
                        onChange={(e) => setAddRefForm({ ...addRefForm, desc: e.target.value })}
                        placeholder="Quais incisos legais ou parágrafos essa diretriz técnica ajuda a conformar?"
                        className="w-full text-xs p-3 bg-slate-50 border rounded-xl focus:outline-none text-slate-800 resize-none text-slate-700 leading-normal"
                      ></textarea>
                    </div>

                    <div className="flex gap-2 pt-2 text-xs" id="ref-modal-actions">
                      <button
                        type="button"
                        onClick={() => setShowAddRefModal(false)}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-sans tracking-wide font-semibold select-none cursor-pointer animate-pulse"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-primary hover:brightness-110 text-white font-sans font-semibold tracking-wide cursor-pointer"
                      >
                        Vincular Norma
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
