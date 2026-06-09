/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Questionnaire from './components/Questionnaire';
import Revision from './components/Revision';
import Result from './components/Result';
import PublicPanel from './components/PublicPanel';
import Methodology from './components/Methodology';
import OpenData from './components/OpenData';
import EditAssessment from './components/EditAssessment';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ReportViewer from './components/ReportViewer';
import { ScoreLevel, AssessmentMetadata } from './types';

export default function App() {
  // Theme Toggle for preview system
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mmgia_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light'; // Light mode is default matching bg-slate-50 text-slate-700
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('mmgia_theme', next);
      return next;
    });
  };

  // Navigation Routing Tabs
  const [currentTab, setCurrentTab] = useState<string>('home');
  
  // Questionnaire states
  const [assessStep, setAssessStep] = useState<'onboarding' | 'questions' | 'revision' | 'result'>('onboarding');
  const [answers, setAnswers] = useState<Record<string, ScoreLevel>>({});
  
  const generateSessionCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${segment()}-${segment()}-${segment()}`;
  };

  const [metadata, setMetadata] = useState<AssessmentMetadata>({
    natureza: '',
    estado: 'DF',
    setor: '',
    porte: '',
    termosAceitos: false,
    code: generateSessionCode(),
  });

  // Admin login states
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Sync state session to local storage for recovery simulations
  useEffect(() => {
    if (metadata.code && Object.keys(answers).length > 0) {
      localStorage.setItem(
        `mmgia_session_${metadata.code}`,
        JSON.stringify({ answers, metadata })
      );
    }
  }, [answers, metadata]);

  // Command dispatchers
  const handleStartOnboarding = () => {
    // start fresh dashboard questionnaire
    setAnswers({});
    const newCode = generateSessionCode();
    setMetadata({
      natureza: '',
      estado: 'DF',
      setor: '',
      porte: '',
      termosAceitos: false,
      code: newCode,
    });
    setAssessStep('onboarding');
    setCurrentTab('diagnostico');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishOnboarding = (meta: AssessmentMetadata) => {
    setMetadata(meta);
    setAssessStep('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishQuestions = () => {
    setAssessStep('revision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishRevision = (finalAnswers: Record<string, ScoreLevel>) => {
    setAnswers(finalAnswers);
    setAssessStep('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadAssessment = (code: string, restoredAnswers: Record<string, ScoreLevel>, restoredMeta: any) => {
    setMetadata(restoredMeta);
    setAnswers(restoredAnswers);
    setAssessStep('result');
    setCurrentTab('diagnostico');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccessAdminLogin = (email: string) => {
    setAdminEmail(email);
    setCurrentTab('admin');
  };

  const handleAdminLogout = () => {
    setAdminEmail(null);
    setCurrentTab('home');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-brand-primary selection:text-white font-sans transition-all duration-500 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-700'
    }`} id="mmgia-root-viewport">
      
      {/* Renders global header navigation unless user sits inside the fullscreen dashboard */}
      {currentTab !== 'admin' && currentTab !== 'login' && currentTab !== 'relatorio-viewer' && (
        <Header
          currentTab={currentTab}
          onChangeTab={(tab) => {
            if (tab === 'admin-login') {
              setCurrentTab('login');
            } else {
              setCurrentTab(tab);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          hasActiveAssessment={Object.keys(answers).length > 0}
          onGoToOnboarding={handleStartOnboarding}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Primary content routing switchboard */}
      <div className="flex-grow" id="primary-viewport-body">
        {currentTab === 'home' && (
          <LandingPage
            onStartOnboarding={handleStartOnboarding}
            onChangeTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            theme={theme}
          />
        )}

        {currentTab === 'diagnostico' && (
          <>
            {assessStep === 'onboarding' && (
              <Onboarding
                onComplete={handleFinishOnboarding}
                onCancel={() => setCurrentTab('home')}
                theme={theme}
              />
            )}
            {assessStep === 'questions' && (
              <Questionnaire
                answers={answers}
                onSaveAnswer={(id, val) => setAnswers(prev => ({ ...prev, [id]: val }))}
                onGoToRevision={handleFinishQuestions}
                onGoBackToOnboarding={() => setAssessStep('onboarding')}
                theme={theme}
              />
            )}
            {assessStep === 'revision' && (
              <Revision
                answers={answers}
                metadata={metadata}
                onGoToPractice={(dimId, idx) => {
                  setAssessStep('questions');
                }}
                onGoBackToQuestionnaire={() => setAssessStep('questions')}
                 onConfirmAndGenerateResult={() => handleFinishRevision(answers)}
                onViewReport={() => setCurrentTab('relatorio-viewer')}
                theme={theme}
              />
            )}
            {assessStep === 'result' && (
              <Result
                answers={answers}
                metadata={metadata}
                onRestart={handleStartOnboarding}
                onChangeTab={(tab) => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewReport={() => setCurrentTab('relatorio-viewer')}
                theme={theme}
              />
            )}
          </>
        )}

        {currentTab === 'relatorio-viewer' && (
          <ReportViewer
            answers={answers}
            metadata={metadata}
            onBack={() => {
              setCurrentTab('diagnostico');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'mapa' && (
          <PublicPanel
            onChangeTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'metodologia' && (
          <Methodology />
        )}

        {currentTab === 'opendata' && (
          <OpenData />
        )}

        {currentTab === 'editar' && (
          <EditAssessment
            onLoadAssessment={handleLoadAssessment}
            onGoToOnboarding={handleStartOnboarding}
          />
        )}

        {currentTab === 'login' && (
          <AdminLogin
            onSuccessLogin={handleSuccessAdminLogin}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'admin' && adminEmail && (
          <AdminDashboard
            adminEmail={adminEmail}
            onLogout={handleAdminLogout}
          />
        )}
      </div>

      {/* Footer is also excluded on deep custom administrative viewports and home landing, which renders its own complete brand footer */}
      {currentTab !== 'admin' && currentTab !== 'login' && currentTab !== 'home' && currentTab !== 'relatorio-viewer' && (
        <footer className={`py-12 px-6 border-t text-center select-none transition-colors duration-500 ${
          theme === 'dark' ? 'bg-slate-950 text-slate-400 border-slate-900' : 'bg-slate-900 text-slate-400 border-slate-800'
        }`} id="global-application-footer">
          <div className="max-w-7xl mx-auto space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-brand-accent">
              mmgia · modelo de maturidade em governança de inteligência artificial
            </p>
            <p className="text-[10px] font-sans text-slate-500 max-w-lg mx-auto leading-normal">
              Plataforma desenvolvida para auxílio à conformação civil de engenhos de IA no Brasil, amparada pelas diretrizes trilaterais do PL 2338/2023, LGPD e marcos gerais da ENIA.
            </p>
            <p className="text-[9px] font-mono text-slate-600">
              © {new Date().getFullYear()} MMGIA. Todos os direitos reservados. Licenciado para microdados sob CC BY 4.0.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
