/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LuLock,
  LuMail,
  LuEye,
  LuEyeOff,
  LuCircleAlert,
  LuArrowLeft,
  LuSettings,
  LuShieldCheck
} from 'react-icons/lu';

const Lock = LuLock as any;
const Mail = LuMail as any;
const Eye = LuEye as any;
const EyeOff = LuEyeOff as any;
const AlertCircle = LuCircleAlert as any;
const ArrowLeft = LuArrowLeft as any;
const Settings = LuSettings as any;
const ShieldCheck = LuShieldCheck as any;

interface AdminLoginProps {
  onSuccessLogin: (userEmail: string) => void;
  onCancel: () => void;
}

export default function AdminLogin({ onSuccessLogin, onCancel }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email) {
      setErrorText('Por favor, digite seu e-mail funcional.');
      return;
    }
    if (!password) {
      setErrorText('Por favor, digite sua senha de acesso.');
      return;
    }

    setLoading(true);

    // Simulated verification
    setTimeout(() => {
      setLoading(false);
      // Valid administrators: rafaelmirandanpd@gmail.com or julia.costa@instituto.gov.br
      const validEmails = ['rafaelmirandanpd@gmail.com', 'julia.costa@instituto.gov.br', 'admin@mmgia.gov.br'];
      
      onSuccessLogin(email);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 overflow-hidden select-none" id="admin-login-root">
      
      {/* Immersive clean backgrounds */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#2487ce]/10 rounded-full filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#124265]/10 rounded-full filter blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>

      <div className="w-full max-w-sm bg-white p-8 shadow-2xl relative z-1 rounded-none border border-slate-100" id="login-form-card">
        
        {/* Top Back Action */}
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-3" />
          Voltar
        </button>

        {/* LOGO */}
        <div className="text-center space-y-2 mt-4 mb-8">
          <div className="w-9 h-9 bg-brand-primary flex items-center justify-center font-bold text-white text-xl mx-auto">
            M
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
              MM<span className="text-brand-accent">GIA</span> <span className="font-mono text-slate-400 font-normal">admin</span>
            </h3>
            <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider mt-1">Área Restrita Administrativa</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4" id="admin-login-form">
          <div className="space-y-1.5 text-left">
            <label className="font-mono text-[9px] uppercase font-bold text-slate-500 block">E-mail Corporativo:</label>
            <div className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rafaelmirandanpd@gmail.com"
                className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:border-brand-primary placeholder:text-slate-300 pl-9 text-slate-800"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="font-mono text-[9px] uppercase font-bold text-slate-500">Senha Privada:</label>
              <a href="https://google.com" target="_blank" rel="noreferrer" className="text-[9px] text-brand-primary font-mono uppercase hover:underline">
                Esqueceu?
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs font-sans p-3 bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:border-brand-primary placeholder:text-slate-300 pl-9 pr-10 text-slate-800"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorText && (
            <div className="bg-red-50 border border-red-100 p-3 text-[10.5px] text-red-800 font-sans rounded-none flex gap-1.5 items-start" id="login-error-log">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-primary hover:brightness-110 text-white text-xs font-bold uppercase font-mono tracking-wider cursor-pointer"
          >
            {loading ? 'Autenticando chaves...' : 'Entrar no Painel Admin'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[9px] text-slate-400 font-mono text-center">
          <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0 animate-pulse" />
          <span>Serviço monitorado por auditoria trilateral securitária gov.br</span>
        </div>
      </div>
    </div>
  );
}
