/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LuCode,
  LuSearch,
  LuTriangleAlert,
  LuArrowRight,
  LuSparkles,
  LuCircleCheck,
  LuCircleX
} from 'react-icons/lu';

const Code = LuCode as any;
const Search = LuSearch as any;
const AlertTriangle = LuTriangleAlert as any;
const ArrowRight = LuArrowRight as any;
const Sparkles = LuSparkles as any;
const CheckCircle2 = LuCircleCheck as any;
const XCircle = LuCircleX as any;
import { ScoreLevel } from '../types';

interface EditAssessmentProps {
  onLoadAssessment: (code: string, answers: Record<string, ScoreLevel>, metadata: any) => void;
  onGoToOnboarding: () => void;
}

export default function EditAssessment({ onLoadAssessment, onGoToOnboarding }: EditAssessmentProps) {
  const [sessionCode, setSessionCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    const trimmed = sessionCode.trim();
    if (!trimmed) {
      setErrorText('Por favor, informe o seu código de avaliação.');
      return;
    }

    // A valid simulated session loader, plus fallback checks on local storage
    const stored = localStorage.getItem(`mmgia_session_${trimmed}`);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSuccessText('Avaliação integrada com sucesso! Redirecionando...');
        setTimeout(() => {
          onLoadAssessment(trimmed, parsed.answers, parsed.metadata);
        }, 1200);
        return;
      } catch (err) {
        // fail silently or fallback
      }
    }

    // Default code simulators so users can test immediately with sample values
    const staticSampleCodes = ['a3f8-2b91-4c7d', 'exmp-code-2026', 'demo-test-1234'];
    
    if (staticSampleCodes.includes(trimmed.toLowerCase())) {
      // Load mocked completed assessment answers
      const mockAnswers: Record<string, ScoreLevel> = {
        '1.1': 'F', '1.2': 'L', '1.3': 'P', '1.4': 'N', '1.5': 'P', '1.6': 'N',
        '2.1': 'F', '2.2': 'L', '2.3': 'L', '2.4': 'P',
        '3.1': 'F', '3.2': 'P', '3.3': 'L', '3.4': 'N',
        '4.1': 'P', '4.2': 'P', '4.3': 'N',
        '5.1': 'L', '5.2': 'N'
      };
      
      const mockMeta = {
        natureza: 'Pública estadual',
        estado: 'SP',
        setor: 'Saúde',
        porte: 'Grande',
        termosAceitos: true,
        code: trimmed,
      };

      setSuccessText('Sessão de demonstração identificada! Carregando respostas...');
      setTimeout(() => {
        onLoadAssessment(trimmed, mockAnswers, mockMeta);
      }, 1200);
    } else {
      // Check if user has entered any formatted code or default to dummy load as fallback so we never block their experience!
      // But we will show error, or let them know they can click a quick-link for a demo test session code
      setErrorText('Código de avaliação não identificado localmente no navegador. Certifique-se de que digitou corretamente.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 px-6 font-sans select-none flex items-center justify-center" id="edit-assessment-root">
      <div className="w-full max-w-md bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center space-y-6" id="edit-box-card">
        
        <div>
          <span className="font-mono text-[9px] uppercase font-bold text-brand-accent tracking-widest block">// recuperar_diagnóstico</span>
          <h3 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight mt-1.5">
            Editar Avaliação Existente
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Cole o código alfanumérico que foi gerado ao final de sua sessão para recuperar as respostas.
          </p>
        </div>

        {/* Form search block */}
        <form onSubmit={handleSearchCode} className="space-y-4" id="recovery-form">
          <div className="space-y-1 text-left">
            <label className="font-mono text-[10px] uppercase font-bold text-slate-400 block pb-1">Código de Avaliação:</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="Ex: a3f8-2b91-4c7d"
                className="w-full font-mono text-center text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-primary placeholder:text-slate-300 tracking-wider uppercase"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-sans pt-1">
              Dica: use o código demo <span className="font-mono text-blue-600 font-bold">a3f8-2b91-4c7d</span> para carregar testes.
            </p>
          </div>

          {/* Feedback messages */}
          {errorText && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-3 text-[11px] font-sans text-left flex gap-2 items-start" id="recovery-error-block">
              <XCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {successText && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 text-[11px] font-sans text-left flex gap-2 items-start" id="recovery-success-block">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successText}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-brand-primary hover:brightness-110 transition text-white text-xs font-bold uppercase font-mono tracking-wider cursor-pointer"
          >
            Buscar e Restaurar Respostas
          </button>
        </form>

        {/* Warning cards block */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start text-left gap-3 text-amber-900" id="recovery-code-warning">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1 text-[10.5px]">
            <h5 className="font-bold">Aviso Importante:</h5>
            <p className="text-amber-700 font-sans leading-normal">
              Como garantimos privacidade anônima absoluta, não guardamos e-mails de cadastro nem cookies de sessão. Sem o código, é impossível recuperar seu progresso.
            </p>
          </div>
        </div>

        {/* Link back helper */}
        <div className="border-t border-slate-100 pt-4 text-xs font-semibold font-sans">
          <button
            onClick={onGoToOnboarding}
            className="text-brand-accent hover:text-emerald-600 flex items-center justify-center gap-1 mx-auto group cursor-pointer"
          >
            Iniciar nova avaliação de maturidade
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
