/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LuDownload,
  LuTerminal,
  LuDatabase,
  LuMail,
  LuFileCheck,
  LuCircleCheck,
  LuTable,
  LuCircleHelp,
  LuCode
} from 'react-icons/lu';

const Download = LuDownload as any;
const Terminal = LuTerminal as any;
const Database = LuDatabase as any;
const Mail = LuMail as any;
const FileCheck = LuFileCheck as any;
const CheckCircle2 = LuCircleCheck as any;
const Table = LuTable as any;
const HelpCircle = LuCircleHelp as any;
const Code = LuCode as any;

export default function OpenData() {
  const [downloadType, setDownloadType] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', institution: '', email: '', message: '' });

  const handleDownload = (format: string) => {
    setDownloadType(format);
    setTimeout(() => {
      setDownloadType(null);
      
      // Simulate download dispatch
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ status: 'success', data: 'microdata_mmgia_2026' }));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `microdados_mmgia_2026.${format}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }, 1200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', institution: '', email: '', message: '' });
    }, 4000);
  };

  const schemaFields = [
    { name: 'id', type: 'string', desc: 'Hash UUID de 12 caracteres anonimizado que indexa a avaliação.', ex: 'a3f8-2b91-4c7d' },
    { name: 'periodo', type: 'string', desc: 'Mês e ano consolidados de submissão do formulário.', ex: 'Jun/2026' },
    { name: 'natureza', type: 'string', desc: 'Esfera jurídica ou institucional declarada.', ex: 'Pública federal' },
    { name: 'estado', type: 'string', desc: 'Unidade Federativa de atuação principal.', ex: 'SP' },
    { name: 'setor', type: 'string', desc: 'Vertical econômica ou atividade prática principal.', ex: 'Financeiro' },
    { name: 'score_global', type: 'float', desc: 'Média global recalculada de 0.00 a 3.00.', ex: '1.82' },
    { name: 'nivel_global', type: 'integer', desc: 'Maturidade apurada de nível 1 a 5.', ex: '3' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 px-6 font-sans select-none" id="opendata-root">
      
      {/* Header section title */}
      <div className="max-w-7xl mx-auto mb-10 text-center md:text-left">
        <span className="font-mono text-[10px] uppercase font-bold text-[#1D9E75]">opendata_repository</span>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5 font-sans">
          Dados Abertos e Microdados
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Acesse a base agregada, anônima e segmentada das avaliações sob licença internacional CC BY 4.0.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: DOWNLOAD BUTTONS & DATA SCHEMA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6" id="downloads-pulp">
            <div className="flex gap-3 items-start">
              <div className="p-3 bg-teal-50 text-brand-accent rounded-2xl shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-slate-950 text-sm">Download de Datasets</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Baixe o painel completo atualizado contendo os índices ponderados de mais de 1.800 avaliações nacionais.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload('csv')}
                disabled={downloadType !== null}
                className="py-3.5 bg-brand-primary hover:brightness-110 disabled:opacity-50 text-white font-sans text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-brand-accent" />
                Baixar CSV
              </button>

              <button
                onClick={() => handleDownload('json')}
                disabled={downloadType !== null}
                className="py-3.5 bg-brand-accent hover:brightness-110 disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Baixar JSON
              </button>
            </div>
          </div>

          {/* TABLE schema description */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4" id="schema-description">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Table className="w-4 h-4 text-brand-primary" />
              <h4 className="text-xs uppercase font-mono tracking-wider font-bold">Arquivo de Esquema dos Dados</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px] text-slate-500">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold">
                    <th className="py-2">CAMPO</th>
                    <th className="py-2">TIPO</th>
                    <th className="py-2">DESCRIÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schemaFields.map((field) => (
                    <tr key={field.name}>
                      <td className="py-2.5 font-bold text-slate-800">{field.name}</td>
                      <td className="py-2.5 text-blue-600 font-bold">{field.type}</td>
                      <td className="py-2.5 text-[9.5px] text-slate-500 font-sans leading-normal">
                        {field.desc} <span className="block font-mono text-[8px] text-slate-400">Ex: {field.ex}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SAMPLE SQL QUERIES & SOLICITATIONS FORM */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sample pre-coded SQL code-block */}
          <div className="bg-slate-950 text-emerald-400 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-4" id="sql-block-console">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-white font-mono text-xs">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span>Exemplo Consulta SQL (PostgreSQL)</span>
              </div>
              <span className="font-mono text-[8px] uppercase text-slate-400 font-bold">Read-Only API Console</span>
            </div>

            <pre className="text-[10px] sm:text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`-- Consulta média de score global por setor governamental
SELECT 
  setor,
  COUNT(id) AS amostras,
  ROUND(AVG(score_global)::numeric, 2) AS score_medio_geral
FROM microdados_mmgia
WHERE natureza LIKE 'Pública%'
GROUP BY setor
ORDER BY score_medio_geral DESC;`}
            </pre>
          </div>

          {/* Attributive license badge */}
          <div className="bg-sky-50 border border-sky-100 rounded-3xl p-5 flex items-start gap-4 text-brand-primary" id="cc-license-card">
            <div className="text-xl font-bold font-mono border border-brand-primary/30 rounded px-2.5 py-1 inline-block shrink-0 bg-white">
              CC BY 4.0
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold flex items-center gap-1">Articulação Creative Commons Atribuição 4.0</h4>
              <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                Você é livre de compartilhar, compor, copiar e redistribuir os dados em qualquer suporte ou formato para fins acadêmicos ou comerciais, desde que atribua o crédito devido à plataforma oficial do MMGIA.
              </p>
            </div>
          </div>

          {/* Solicitations PHP Email styled Form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6" id="downloads-request-form">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight font-sans">Solicitar Base Completa Consolidada</h4>
              <p className="text-xs text-slate-400">Pesquisadores e centros de auditoria podem requerer cortes microdemográficos específicos.</p>
            </div>

            {formSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 p-5 rounded-2xl flex items-start gap-3" id="form-success-banner">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h5 className="font-bold">Requisição Enviada</h5>
                  <p className="text-[11px] text-emerald-700 leading-normal">
                    Seu formulário de solicitação técnica de dados foi processado. Retornaremos com o link definitivo no e-mail corporativo informado em até 48 horas.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4" id="php-email-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-400">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dr. Carlos Silva"
                      className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-primary focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase font-bold text-slate-400">Instituição / Sigla *</label>
                    <input
                      type="text"
                      required
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="Universidade Federal (UFC)"
                      className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-primary focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase font-bold text-slate-400 font-black">E-mail de Contato Acadêmico *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="carlos.silva@academia.edu.br"
                    className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-primary focus:bg-white transition-all text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase font-bold text-slate-400">Motivação da Pesquisa / Justificativa *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Quais recortes demográficos ou hipóteses estatísticas você pretende validar com estas informações?"
                    className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-primary focus:bg-white transition-all text-slate-800 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-brand-primary hover:brightness-110 transition text-white text-xs font-bold uppercase font-mono tracking-wider cursor-pointer"
                >
                  Enviar Requisição de Acesso
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
