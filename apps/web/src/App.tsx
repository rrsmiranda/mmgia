/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import { ScoreLevel, AssessmentMetadata, DimensionId } from '@mmgia/shared/types';
import { submitAssessment, updateAssessmentByCode } from '@mmgia/shared/submissionsApi';

const Onboarding = lazy(() => import('./components/Onboarding'));
const Questionnaire = lazy(() => import('./components/Questionnaire'));
const Revision = lazy(() => import('./components/Revision'));
const Result = lazy(() => import('./components/Result'));
const PublicPanel = lazy(() => import('./components/PublicPanel'));
const Methodology = lazy(() => import('./components/Methodology'));
const EditAssessment = lazy(() => import('./components/EditAssessment'));
const ReportViewer = lazy(() => import('./components/ReportViewer'));

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
  // Dimensão a já abrir na Revisão, quando chegamos lá a partir de "editar" no Resultado.
  const [reviewFocusDim, setReviewFocusDim] = useState<DimensionId | null>(null);
  // Abrir o relatório já no diálogo de impressão (botão "Imprimir relatório" do Resultado).
  const [reportAutoPrint, setReportAutoPrint] = useState(false);
  // true depois do 1º salvamento bem-sucedido (ou ao carregar via código existente):
  // a próxima confirmação da Revisão deve ATUALIZAR a submission, não criar outra.
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const generateSessionCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${segment()}-${segment()}-${segment()}`;
  };

  const [metadata, setMetadata] = useState<AssessmentMetadata>({
    taxonomiaVersao: 2,
    setor: '',
    estado: 'DF',
    porte: '',
    termosAceitos: false,
    code: generateSessionCode(),
  });

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
      taxonomiaVersao: 2,
      setor: '',
      estado: 'DF',
      porte: '',
      termosAceitos: false,
      code: newCode,
    });
    setReviewFocusDim(null);
    setIsEditingExisting(false);
    setSaveStatus('idle');
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
    setReviewFocusDim(null);
    setAssessStep('revision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // "Editar" numa prática a partir do Resultado: volta para a Revisão com a dimensão já aberta.
  const handleEditFromResult = (dim: DimensionId) => {
    setReviewFocusDim(dim);
    setAssessStep('revision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishRevision = (finalAnswers: Record<string, ScoreLevel>) => {
    setAnswers(finalAnswers);
    setAssessStep('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setSaveStatus('saving');
    const save = isEditingExisting
      ? updateAssessmentByCode(metadata.code, finalAnswers, metadata)
      : submitAssessment(finalAnswers, metadata);
    save.then((result) => {
      setSaveStatus(result.ok ? 'saved' : 'error');
      if (result.ok) setIsEditingExisting(true);
    });
  };

  const handleLoadAssessment = (code: string, restoredAnswers: Record<string, ScoreLevel>, restoredMeta: AssessmentMetadata) => {
    setMetadata(restoredMeta);
    setAnswers(restoredAnswers);
    setIsEditingExisting(true);
    setSaveStatus('idle');
    setAssessStep('result');
    setCurrentTab('diagnostico');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Onboarding and the questionnaire render their own flow header (logo + steps + "Sair"), so the public site header/footer stay hidden during both.
  const isFlowScreen = currentTab === 'diagnostico' && (assessStep === 'onboarding' || assessStep === 'questions');

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-brand-primary selection:text-white font-sans transition-all duration-500 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-700'
    }`} id="mmgia-root-viewport">

      {/* Renders global header navigation unless user sits inside the fullscreen dashboard or a screen with its own flow header */}
      {currentTab !== 'relatorio-viewer' && !isFlowScreen && (
        <Header
          currentTab={currentTab}
          onChangeTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          hasActiveAssessment={Object.keys(answers).length > 0}
          onGoToOnboarding={handleStartOnboarding}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Primary content routing switchboard */}
      <Suspense fallback={<main className="mg-page" style={{ paddingBlock: 48 }} aria-live="polite">Carregando…</main>}>
        <main className="flex-grow" id="primary-viewport-body">
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
                initialOpenDim={reviewFocusDim}
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
                onViewReport={(options) => {
                  setReportAutoPrint(!!options?.print);
                  setCurrentTab('relatorio-viewer');
                }}
                onEditPractice={handleEditFromResult}
                saveStatus={saveStatus}
                theme={theme}
              />
            )}
          </>
        )}

        {currentTab === 'relatorio-viewer' && (
          <ReportViewer
            answers={answers}
            metadata={metadata}
            autoPrint={reportAutoPrint}
            onBack={() => {
              setReportAutoPrint(false);
              setCurrentTab('diagnostico');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'mapa' && (
          <PublicPanel />
        )}

        {currentTab === 'metodologia' && (
          <Methodology />
        )}

        {currentTab === 'editar' && (
          <EditAssessment
            onLoadAssessment={handleLoadAssessment}
            onGoToOnboarding={handleStartOnboarding}
          />
        )}
        </main>
      </Suspense>

      {/* Footer is also excluded on deep custom administrative viewports and home landing, which renders its own complete brand footer */}
      {currentTab !== 'home' && currentTab !== 'relatorio-viewer' && !isFlowScreen && (
        <footer className="mg-footer select-none" style={{ textAlign: 'center' }} id="global-application-footer">
          <div
            className="mg-stack"
            style={{ gap: 10, alignItems: 'center', maxWidth: 560, marginInline: 'auto', fontFamily: 'var(--mg-font-sans)' }}
          >
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-ink)', margin: 0 }}>
              MMGIA · Modelo de Maturidade em Governança de Inteligência Artificial
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--on-ink-muted)', margin: 0 }}>
              Plataforma desenvolvida pelo Grupo de Pesquisa em Governança e Gestão de Inteligência Artificial (GGIA)
              da Universidade de Brasília (UnB).
            </p>
            <p style={{ fontSize: 12, color: 'var(--on-ink-muted)', opacity: 0.8, margin: 0 }}>
              © {new Date().getFullYear()} MMGIA - GGIA. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
