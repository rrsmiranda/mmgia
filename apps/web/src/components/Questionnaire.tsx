/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ScoreLevel, DIMENSIONS, LIST_PRACTICES, DimensionId } from '@mmgia/shared/types';
import {
  ActionBar,
  Button,
  DsRoot,
  FlowHeader,
  LegalBadge,
  NPLF,
  NplfBadge,
  OptionCard,
  OptionList,
} from '@mmgia/shared/design-system';

interface QuestionnaireProps {
  answers: Record<string, ScoreLevel>;
  onSaveAnswer: (practiceId: string, value: ScoreLevel) => void;
  onGoToRevision: () => void;
  onGoBackToOnboarding: () => void;
  theme?: 'light' | 'dark';
}

const ORDER: ScoreLevel[] = ['N', 'P', 'L', 'F'];
const DIM_KEYS: DimensionId[] = ['gov', 'tec', 'seg', 'edu', 'eco'];
const FLOW_STEPS = [...DIM_KEYS.map((k) => DIMENSIONS[k].shortName), 'Revisão'];

export default function Questionnaire({
  answers,
  onSaveAnswer,
  onGoToRevision,
  onGoBackToOnboarding,
}: QuestionnaireProps) {
  const [activeDimension, setActiveDimension] = useState<DimensionId>('gov');
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [liveMessage, setLiveMessage] = useState('');
  const prefersReducedMotion = useReducedMotion();

  // Filter practices to current active dimension
  const filteredPractices = LIST_PRACTICES.filter(p => p.dimensionId === activeDimension);
  const currentPractice = filteredPractices[currentPracticeIndex] || filteredPractices[0];
  const isFirstPracticeOverall = activeDimension === 'gov' && currentPracticeIndex === 0;
  const isLastDimensionAndPractice = activeDimension === 'eco' && currentPracticeIndex === filteredPractices.length - 1;

  // Overall calculations
  const totalPractices = LIST_PRACTICES.length;
  const totalAnswered = LIST_PRACTICES.filter(p => !!answers[p.id]).length;
  const progressPercent = (totalAnswered / totalPractices) * 100;

  const getDimRespondedCount = (dimId: DimensionId) => {
    const list = LIST_PRACTICES.filter(p => p.dimensionId === dimId);
    return list.filter(p => !!answers[p.id]).length;
  };

  const handleSelectLevel = (level: ScoreLevel) => {
    if (currentPractice) {
      onSaveAnswer(currentPractice.id, level);
      setLiveMessage(`Resposta salva: ${NPLF[level].label}.`);
    }
  };

  const handlePrevPractice = () => {
    if (currentPracticeIndex > 0) {
      setCurrentPracticeIndex(currentPracticeIndex - 1);
    } else {
      const currentTabIdx = DIM_KEYS.indexOf(activeDimension);
      if (currentTabIdx > 0) {
        const prevDim = DIM_KEYS[currentTabIdx - 1];
        setActiveDimension(prevDim);
        const prevDimLength = LIST_PRACTICES.filter(p => p.dimensionId === prevDim).length;
        setCurrentPracticeIndex(prevDimLength - 1);
      }
    }
  };

  const handleNextPractice = () => {
    if (!answers[currentPractice.id]) return;
    if (currentPracticeIndex < filteredPractices.length - 1) {
      setCurrentPracticeIndex(currentPracticeIndex + 1);
    } else {
      const currentTabIdx = DIM_KEYS.indexOf(activeDimension);
      if (currentTabIdx < DIM_KEYS.length - 1) {
        setActiveDimension(DIM_KEYS[currentTabIdx + 1]);
        setCurrentPracticeIndex(0);
      } else {
        onGoToRevision();
      }
    }
  };

  const handleSelectFlowStep = (index: number) => {
    if (index === DIM_KEYS.length) {
      if (totalAnswered === totalPractices) onGoToRevision();
      return;
    }
    const dim = DIM_KEYS[index];
    const dimPractices = LIST_PRACTICES.filter(p => p.dimensionId === dim);
    const firstUnanswered = dimPractices.findIndex(p => !answers[p.id]);
    setActiveDimension(dim);
    setCurrentPracticeIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
  };

  const isFlowStepDisabled = (index: number) => index === DIM_KEYS.length && totalAnswered < totalPractices;

  const flowStepAriaLabel = (index: number) => {
    if (index === DIM_KEYS.length) {
      return totalAnswered === totalPractices ? 'Revisão — disponível' : `Revisão — disponível após responder as ${totalPractices} práticas`;
    }
    const dim = DIM_KEYS[index];
    const count = LIST_PRACTICES.filter(p => p.dimensionId === dim).length;
    return `${DIMENSIONS[dim].name} — ${getDimRespondedCount(dim)} de ${count} respondidas`;
  };

  // Keyboard Shortcuts for Rapid Audit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      if (e.key === '1') {
        handleSelectLevel('N');
      } else if (e.key === '2') {
        handleSelectLevel('P');
      } else if (e.key === '3') {
        handleSelectLevel('L');
      } else if (e.key === '4') {
        handleSelectLevel('F');
      } else if (e.key === 'ArrowLeft') {
        handlePrevPractice();
      } else if (e.key === 'ArrowRight') {
        handleNextPractice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPracticeIndex, activeDimension, answers]);

  const move = (dir: 1 | -1) => {
    const val = answers[currentPractice?.id ?? ''];
    const i = val ? ORDER.indexOf(val) : -1;
    const next = ORDER[Math.max(0, Math.min(ORDER.length - 1, i + dir))];
    handleSelectLevel(next);
  };

  if (!currentPractice) return null;

  const dimension = DIMENSIONS[activeDimension];
  const nextLabel = isLastDimensionAndPractice
    ? 'Ir para a revisão'
    : currentPracticeIndex === filteredPractices.length - 1
      ? 'Próxima dimensão'
      : 'Próxima prática';

  return (
    <DsRoot>
      <FlowHeader
        steps={FLOW_STEPS}
        current={DIM_KEYS.indexOf(activeDimension) + 1}
        onExit={onGoBackToOnboarding}
        onSelect={handleSelectFlowStep}
        isDisabled={isFlowStepDisabled}
        ariaLabel={flowStepAriaLabel}
        progress={progressPercent}
      />

      <div className="mg-flow-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPractice.id}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
          >
            <p className="mg-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: dimension.color, display: 'inline-block', flex: 'none' }} />
              {dimension.shortName} · prática {currentPracticeIndex + 1} de {filteredPractices.length}
            </p>
            <h1 className="mg-h3" style={{ marginTop: 8 }}>{currentPractice.name}</h1>

            <div className="mg-grid" style={{ ['--cols-d' as string]: 'minmax(0,1.15fr) minmax(0,1fr)', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 40, marginTop: 32 }}>
              <div>
                <div className="mg-row mg-nowrap" style={{ gap: 10 }}>
                  <span className="mg-code">{currentPractice.id} · prática de nível {currentPractice.level}</span>
                  {currentPractice.legalReference && <LegalBadge>{currentPractice.legalReference}</LegalBadge>}
                </div>
                <p className="mg-body" style={{ marginTop: 12 }}>{currentPractice.description}</p>
                <div className="mg-crit">
                  <p className="mg-label"><CheckCircle2 className="mg-ico mg-ico-sm" aria-hidden="true" />Critério de verificação</p>
                  <p>{currentPractice.criterion}</p>
                </div>
                <div className="mg-meta">
                  <span><FileText className="mg-ico mg-ico-sm" aria-hidden="true" />Evidência sugerida: {currentPractice.evidence}</span>
                </div>
              </div>

              <div>
                <h2 className="mg-h5">Em que grau a prática está implementada?</h2>
                <p className="mg-small mg-muted" style={{ marginTop: 4, marginBottom: 16 }}>Use as teclas 1 a 4 para responder.</p>
                <OptionList label="Escala NPLF" required onKeyNav={move}>
                  {ORDER.map((v) => (
                    <OptionCard
                      key={v}
                      row
                      className="mg-option--stack"
                      checked={answers[currentPractice.id] === v}
                      onSelect={() => handleSelectLevel(v)}
                      title={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <NplfBadge value={v} />
                          {NPLF[v].label}
                        </span>
                      }
                      description={`${NPLF[v].subtitle}. ${NPLF[v].description}`}
                    />
                  ))}
                </OptionList>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mg-sr" role="status" aria-live="polite">{liveMessage}</p>
      </div>

      <ActionBar>
        <Button variant="ghost" icon={ArrowLeft} onClick={handlePrevPractice} disabled={isFirstPracticeOverall}>Anterior</Button>
        <span className="mg-small mg-muted mg-hide-mobile">
          Prática {currentPracticeIndex + 1} de {filteredPractices.length} · salvo automaticamente
        </span>
        <Button variant="primary" size="lg" iconRight={ArrowRight} onClick={handleNextPractice} disabled={!answers[currentPractice.id]}>
          {nextLabel}
        </Button>
      </ActionBar>
    </DsRoot>
  );
}
