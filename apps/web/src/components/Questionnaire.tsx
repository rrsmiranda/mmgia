/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ScoreLevel, DIMENSIONS, LIST_PRACTICES, DimensionId } from '@mmgia/shared/types';
import {
  ActionBar,
  Banner,
  Button,
  Card,
  DimensionTag,
  DsRoot,
  Grid,
  NPLF,
  NplfBadge,
  OptionCard,
  Page,
  PracticeCard,
  RadioGroup,
  formatNumber,
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

export default function Questionnaire({
  answers,
  onSaveAnswer,
  onGoToRevision,
}: QuestionnaireProps) {
  const [activeDimension, setActiveDimension] = useState<DimensionId>('gov');
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [latestSavedId, setLatestSavedId] = useState<string | null>(null);
  const [showMobileDimensions, setShowMobileDimensions] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Filter practices to current active dimension
  const filteredPractices = LIST_PRACTICES.filter(p => p.dimensionId === activeDimension);
  const currentPractice = filteredPractices[currentPracticeIndex] || filteredPractices[0];
  const isLastDimensionAndPractice = activeDimension === 'eco' && currentPracticeIndex === filteredPractices.length - 1;

  // Handle toast notification dismiss
  useEffect(() => {
    if (latestSavedId) {
      const timer = setTimeout(() => {
        setLatestSavedId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [latestSavedId]);

  // Overall calculations
  const totalPractices = LIST_PRACTICES.length;
  const totalAnswered = LIST_PRACTICES.filter(p => !!answers[p.id]).length;
  const progressPercent = Math.round((totalAnswered / totalPractices) * 100);

  const handleSelectLevel = (level: ScoreLevel) => {
    if (currentPractice) {
      onSaveAnswer(currentPractice.id, level);
      setLatestSavedId(currentPractice.id);
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

  const getDimRespondedCount = (dimId: DimensionId) => {
    const list = LIST_PRACTICES.filter(p => p.dimensionId === dimId);
    return list.filter(p => !!answers[p.id]).length;
  };

  const move = (dir: 1 | -1) => {
    const val = answers[currentPractice?.id ?? ''];
    const i = val ? ORDER.indexOf(val) : -1;
    const next = ORDER[Math.max(0, Math.min(ORDER.length - 1, i + dir))];
    handleSelectLevel(next);
  };

  const dimensionList = (onPick: (id: DimensionId) => void) => (
    <RadioGroup label="Dimensões" columns={['1fr', '1fr', '1fr']}>
      {DIM_KEYS.map((key) => (
        <OptionCard
          key={key}
          list
          checked={activeDimension === key}
          onSelect={() => onPick(key)}
          leading={<DimensionTag dimension={key} short />}
          title=""
          description={`${getDimRespondedCount(key)}/9 práticas respondidas`}
        />
      ))}
    </RadioGroup>
  );

  if (!currentPractice) return null;

  return (
    <DsRoot>
      <Page>
        <Card style={{ marginBottom: 24 }}>
          <div className="mg-row mg-nowrap" style={{ gap: 16, justifyContent: 'space-between' }}>
            <div>
              <p className="mg-eyebrow">Progresso geral do diagnóstico</p>
              <h3 className="mg-h4" style={{ marginTop: 2 }}>{totalAnswered} de {totalPractices} práticas respondidas</h3>
            </div>
            <span className="mg-code">{formatNumber(progressPercent, 0)}% concluído</span>
          </div>
          <div className="mg-bar" style={{ marginTop: 14 }} role="img" aria-label={`${progressPercent}% concluído`}>
            <motion.span
              style={{ background: 'var(--brand)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 100, damping: 15 }}
            />
          </div>
        </Card>

        <Grid columns={['300px 1fr', '1fr', '1fr']} gap={40}>
          <nav aria-label="Dimensões" className="mg-only-desktop">
            {dimensionList((id) => { setActiveDimension(id); setCurrentPracticeIndex(0); })}
          </nav>

          <div className="mg-stack" style={{ gap: 24 }}>
            <Card className="mg-qprogress mg-only-mobile" style={{ padding: 16 }}>
              <div className="mg-row mg-nowrap" style={{ gap: 10 }}>
                <span className="mg-title" style={{ flex: 1 }}>
                  {DIMENSIONS[activeDimension].shortName} · prática {currentPracticeIndex + 1} de {filteredPractices.length}
                </span>
                <Button size="sm" icon={Layers} onClick={() => setShowMobileDimensions((v) => !v)} aria-expanded={showMobileDimensions}>
                  Dimensões
                </Button>
              </div>
              {showMobileDimensions && (
                <div style={{ marginTop: 16 }}>
                  {dimensionList((id) => { setActiveDimension(id); setCurrentPracticeIndex(0); setShowMobileDimensions(false); })}
                </div>
              )}
            </Card>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPractice.id}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
              >
                <PracticeCard
                  practice={currentPractice}
                  position={`prática ${currentPracticeIndex + 1} de ${filteredPractices.length}`}
                  headingLevel={1}
                />
              </motion.div>
            </AnimatePresence>

            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="mg-field-label" style={{ marginBottom: 12 }}>
                Escolha o grau de conformidade atual de sua organização
              </legend>
              <RadioGroup label="Escala NPLF" columns={['repeat(4,1fr)', 'repeat(2,1fr)', '1fr']} onKeyNav={move}>
                {ORDER.map((v, i) => (
                  <OptionCard
                    key={v}
                    list
                    checked={answers[currentPractice.id] === v}
                    onSelect={() => handleSelectLevel(v)}
                    leading={<NplfBadge value={v} />}
                    title={`${NPLF[v].label} (${v}) · tecla ${i + 1}`}
                    description={`${NPLF[v].subtitle}. ${NPLF[v].description}`}
                  />
                ))}
              </RadioGroup>
              <p className="mg-small mg-muted" style={{ marginTop: 12 }}>
                Atalhos de teclado: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> votam ·{' '}
                <kbd>←</kbd> <kbd>→</kbd> navegam entre práticas.
              </p>
            </fieldset>

            <ActionBar inline>
              <Button variant="ghost" icon={ArrowLeft} onClick={handlePrevPractice}>Anterior</Button>
              <Button variant="primary" size="lg" iconRight={ArrowRight} onClick={handleNextPractice}>
                {isLastDimensionAndPractice ? 'Finalizar avaliação' : 'Próxima prática'}
              </Button>
            </ActionBar>
          </div>
        </Grid>

        <AnimatePresence>
          {latestSavedId && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 350, damping: 25 }}
              style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 150, maxWidth: 320 }}
            >
              <Banner tone="good" title="Resposta salva">
                Salva localmente no seu navegador.
              </Banner>
            </motion.div>
          )}
        </AnimatePresence>
      </Page>
    </DsRoot>
  );
}
