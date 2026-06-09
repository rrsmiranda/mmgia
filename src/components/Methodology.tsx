/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LuListTodo,
  LuSettings,
  LuScale,
  LuBrainCircuit,
  LuLock,
  LuCompass,
  LuCircleCheck,
  LuChevronDown,
  LuChevronUp,
  LuOctagonAlert,
  LuCalculator,
  LuShieldCheck,
  LuBookOpen
} from 'react-icons/lu';

const ListTodo = LuListTodo as any;
const Settings = LuSettings as any;
const Scale = LuScale as any;
const BrainCircuit = LuBrainCircuit as any;
const Lock = LuLock as any;
const Compass = LuCompass as any;
const CheckCircle2 = LuCircleCheck as any;
const ChevronDown = LuChevronDown as any;
const ChevronUp = LuChevronUp as any;
const AlertOctagon = LuOctagonAlert as any;
const Calculator = LuCalculator as any;
const ShieldCheck = LuShieldCheck as any;
const BookOpen = LuBookOpen as any;
import { DIMENSIONS, LIST_PRACTICES, DimensionId } from '../types';

export default function Methodology() {
  const [activeSection, setActiveSection] = useState('niveis');
  const [expandedDim, setExpandedDim] = useState<DimensionId | null>('gov');

  const menuItems = [
    { id: 'sobre', label: 'Sobre o MMGIA' },
    { id: 'niveis', label: 'Níveis de Maturidade' },
    { id: 'dimensoes', label: 'Dimensões (45 Práticas)' },
    { id: 'calculo', label: 'Fórmula de Cálculo' },
    { id: 'regulatorio', label: 'Alinhamento Regulatório' },
    { id: 'privacidade', label: 'Arquitetura de Privacidade' },
  ];

  const handleMenuClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 px-6 font-sans select-none" id="methodology-root">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: STICKY SUBORDINATE NAVIGATION RAIL */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3" id="methodology-nav-rail">
            <h4 className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">Índice Metodológico</h4>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full text-left font-sans text-xs font-semibold py-2.5 px-3 rounded-xl transition duration-150 cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED RESPONSIVE EDITORIAL VIEWPORT */}
        <div className="lg:col-span-9 space-y-12">
          
          {/* Main Title Header */}
          <div className="text-center md:text-left max-w-2xl" id="methodology-general-header">
            <span className="font-mono text-[10px] uppercase font-bold text-brand-accent">metodologia_oficial</span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mt-1.5 font-sans">
              Modelo de Maturidade em Governança de IA (MMGIA)
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-light">
              Mapeamento de maturidade organizacional alinhado à Estratégia Nacional de Inteligência Artificial (ENIA 2026–2029).
            </p>
          </div>

          {/* SECTION: SOBRE */}
          <section id="sobre" className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 scroll-mt-24 shadow-sm">
            <div className="space-y-2">
              <span className="font-mono text-[9px] uppercase font-bold text-brand-primary">// pilar_essência</span>
              <h3 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">O que é o MMGIA?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                O MMGIA é uma régua de conformidade autoaplicável formulada com o intuito de democratizar a governança ética e cibernética de sistemas algorítmicos. O modelo serve de diagnóstico preventivo guiando equipes na formulação de portarias jurídicas e de blindagens contra vieses.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-800">Autoavaliação Direta</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">Cálculos locais efetuados e processados instantaneamente dentro do seu navegador.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-800">Alinhamento Legislativo</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">Referenciais que cruzam artigos da LGPD do Brasil e principais normativas ISO/IEC europeias.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: NIVEIS */}
          <section id="niveis" className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 scroll-mt-24 shadow-sm">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase font-bold text-brand-primary">// níveis_de_maturidade</span>
              <h3 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">Os 5 Níveis de Maturidade</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                As pontuações consolidadas categorizam a instituição dentro de uma métrica de responsabilidade civil algorítmica dividida em 5 estágios.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-500 font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold">
                    <th className="p-4 w-20">NÍVEL</th>
                    <th className="p-4 w-32">NOME</th>
                    <th className="p-4">DESCRIÇÃO OPERACIONAL</th>
                    <th className="p-4 w-32 text-center">RISCO ESTIMADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[11px]">
                  {[
                    { num: 'Nível 1', label: 'Iniciado', desc: 'Práticas executadas de maneira ad-hoc, informal e dispersa, sem registro ou salvaguardas formalizadas.', risk: 'Risco Alto', fill: 'text-red-500 bg-red-50' },
                    { num: 'Nível 2', label: 'Gerenciado', desc: 'Políticas e comitês ética já encontram-se estruturados. Inventários em andamento e relatórios de evidências em andamento.', risk: 'Risco Moderado', fill: 'text-amber-600 bg-amber-50' },
                    { num: 'Nível 3', label: 'Definido', desc: 'Processos padronizados e documentados em conformidade legal com a LGPD e termos ISO. Metas estabelecidas e cobradas.', risk: 'Risco Controlado', fill: 'text-sky-600 bg-sky-50' },
                    { num: 'Nível 4', label: 'Quantificado', desc: 'Métricas exatas de bias e drift de dados monitoradas em tempo real por painéis operatórios automáticos.', risk: 'Risco Baixo', fill: 'text-emerald-600 bg-emerald-50' },
                    { num: 'Nível 5', label: 'Otimizado', desc: 'Plena auditoria terceirizada com reciclagem periódica de modelos e contribuições ativas no ecossistema de dados abertos.', risk: 'Mínimo/Altamente Seguro', fill: 'text-emerald-700 bg-emerald-100 font-bold' },
                  ].map((row) => (
                    <tr key={row.num} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{row.num}</td>
                      <td className="p-4 font-sans font-bold text-slate-900">{row.label}</td>
                      <td className="p-4 text-slate-500 leading-normal font-sans">{row.desc}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${row.fill}`}>
                          {row.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION: DIMENSOES */}
          <section id="dimensoes" className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 scroll-mt-24 shadow-sm">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase font-bold text-brand-primary">// dretrizes_e_diretórios</span>
              <h3 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">Dimensões e práticas Mapeadas</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Expandir os painéis dos 5 pilares para visualizar detalhadamente os direcionamentos técnicos e as correspondentes prioridades de nível.
              </p>
            </div>

            <div className="space-y-3" id="methodology-accordions">
              {(Object.keys(DIMENSIONS) as DimensionId[]).map((key) => {
                const info = DIMENSIONS[key];
                const isExpanded = expandedDim === key;

                return (
                  <div key={key} className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                    <div
                      onClick={() => setExpandedDim(isExpanded ? null : key)}
                      className="p-4 flex justify-between items-center bg-slate-50/50 cursor-pointer hover:bg-slate-50 select-none"
                    >
                      <span className="font-sans font-bold text-xs text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }}></span>
                        {info.name}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-white space-y-3.5 divide-y divide-slate-100" id={`dim-practices-expanded-${key}`}>
                        {LIST_PRACTICES.filter(p => p.dimensionId === key).map((p) => (
                          <div key={p.id} className="pt-3.5 first:pt-0 space-y-2">
                            <div className="flex justify-between items-center font-mono text-[9px] font-bold">
                              <span className="text-slate-400">PRÁTICA {p.id} (Requisito Nível {p.level})</span>
                              {p.legalReference && (
                                <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <BookOpen className="w-2.5 h-2.5" />
                                  {p.legalReference}
                                </span>
                              )}
                            </div>
                            <h4 className="font-sans font-extrabold text-xs text-slate-950">{p.name}</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-light">{p.description}</p>
                            <p className="text-[10px] text-slate-400 font-mono bg-slate-50 p-2 border border-slate-100">
                              <strong className="text-brand-accent">Artefato chave:</strong> {p.evidence}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION: CALCULO */}
          <section id="calculo" className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 scroll-mt-24 shadow-sm">
            <div className="flex items-center gap-3 text-slate-950">
              <Calculator className="w-6 h-6 text-brand-primary" />
              <h3 className="text-xl font-extrabold font-sans tracking-tight">Fórmula de Cálculo do Score</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              O score final global do MMGIA é calculado por meio de médias ponderadas. Primeiro, é calculada a média simples de cada uma das 5 dimensões com base nas práticas respondidas (as práticas não respondidas recebem peso zero).
            </p>

            <div className="bg-slate-950 text-emerald-400 p-6 rounded-2xl font-mono text-xs space-y-3" id="math-formula-box">
              <p className="text-slate-500 font-bold">// EQUAÇÃO DE CÁLCULO GERAL:</p>
              <div className="text-center py-4 bg-white/2 border border-white/5 text-sm sm:text-base text-white font-extrabold">
                Score Global = (Média_Gov + Média_Tec + Média_Seg + Média_Edu + Média_Eco) / 5
              </div>
              <p className="text-slate-400 text-[10px]">
                Onde as respostas na escala NPLF correspondem aos seguintes pesos numéricos:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] text-white">
                <div className="p-2 border border-white/5">Nulo (N) = 0.00</div>
                <div className="p-2 border border-white/5">Parcial (P) = 1.00</div>
                <div className="p-2 border border-white/5">Largo (L) = 2.00</div>
                <div className="p-2 border border-white/5">Total (F) = 3.00</div>
              </div>
            </div>
          </section>

          {/* SECTION: REGULATORIO */}
          <section id="regulatorio" className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 scroll-mt-24 shadow-sm">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase font-bold text-brand-primary">// consonância_legal</span>
              <h3 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">Alinhamento Regulatório Trilateral</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                O MMGIA foi pavimentado sob a correspondência cruzada de normas legais vigentes no Brasil e marcos internacionais recomendados de conformidade.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl" id="regulatory-matrix">
              <table className="w-full text-left text-xs text-slate-500 font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold">
                    <th className="p-4 w-32">NORMA / MARCO</th>
                    <th className="p-4 w-40">ARTIGOS / CLÁUSULAS</th>
                    <th className="p-4">IMPACTO E RELAÇÃO DE INTERFACE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[11px] font-sans">
                  {[
                    { n: 'LGPD (Lei 13.709)', art: 'Art. 20, 37 e 46', desc: 'Direito a explicações de decisões 100% automatizadas, obrigatoriedade de relatórios de impacto e dever de criptografar checkpoints.' },
                    { n: 'PL 2338/2023 IA', art: 'Artigo 8º, 12 e 15', desc: 'Atribuição civil objetiva ao poluidor algorítmico, análise prévia de disparidades e Red Teaming de ataques.' },
                    { n: 'ISO/IEC 42001', art: 'Cláusula 5, 6, 8 e 9', desc: 'Desenvolvimento do Sistema de Gestão de IA integrado e auditoria independente periódica.' },
                    { n: 'NIST AI RMF 1.0', art: 'Framework Core 1.0', desc: 'Metodologias de gerenciamento de riscos organizando o mapeamento, identificação operacional e governança ética.' },
                  ].map((row) => (
                    <tr key={row.n} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-800">{row.n}</td>
                      <td className="p-4 font-mono text-slate-600">{row.art}</td>
                      <td className="p-4 text-slate-500 leading-normal font-light">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION: PRIVACIDADE */}
          <section id="privacidade" className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 scroll-mt-24 shadow-sm">
            <div className="flex items-center gap-3 text-slate-950">
              <ShieldCheck className="w-6 h-6 text-brand-accent-text text-brand-accent animate-pulse" />
              <h3 className="text-xl font-extrabold font-sans tracking-tight">Arquitetura de Privacidade</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-light">
               Todos os diagnósticos e seleções de conformidade de práticas são processados de forma isolada do servidor por padrão. O código hash de session é a única chave que vincula os itens em local storage.
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 text-emerald-950 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-ping"></span>
              <p>
                Os microdados agregados jamais exportam nomes de prefeituras, e-mails das equipes ou coordenadas lógicas confidenciais de banco de dados.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
