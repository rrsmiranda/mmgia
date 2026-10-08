/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Info, LayoutGrid } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { DIMENSIONS, DimensionId, ScoreLevel } from '@mmgia/shared/types';
import {
  getAllDimensionLevels,
  getAllDimensionScores,
  getGlobalScore,
  getLevelScores,
  getMaturityLevel,
  getPracticeScores,
} from '@mmgia/shared/scoring';
import {
  Banner,
  Button,
  Card,
  DIMENSION_ICONS,
  DIMENSION_ORDER,
  LegalBadge,
  LevelBadge,
  NPLF,
  LEVEL_LABELS,
  RiskBadge,
  SCORE_GOAL,
  cx,
  formatNumber,
  type Level,
} from '@mmgia/shared/design-system';
import RadarChart, { type RadarAxis } from './RadarChart';

const PRACTICE_LEVELS = [1, 2, 3, 4, 5] as const;

interface DimensionAnalysisProps {
  answers: Record<string, ScoreLevel>;
  /** Único ponto de edição: redireciona para a Revisão com a dimensão já aberta — não há edição por prática aqui. */
  onEditPractice: (dim: DimensionId) => void;
}

export default function DimensionAnalysis({ answers, onEditPractice }: DimensionAnalysisProps) {
  const [openDim, setOpenDim] = useState<DimensionId | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const dimRowRefs = useRef<Partial<Record<DimensionId, HTMLDetailsElement | null>>>({});
  const practiceRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scores = getAllDimensionScores(answers);
  const levels = getAllDimensionLevels(answers);
  const globalScore = getGlobalScore(answers);
  const globalLevel = getMaturityLevel(globalScore);

  useEffect(() => {
    if (!openDim) return;
    const el = dimRowRefs.current[openDim];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
    if (!inView) {
      el.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }, [openDim, prefersReducedMotion]);

  const generalAxes: RadarAxis[] = DIMENSION_ORDER.map((id) => {
    const score = scores[id];
    const level = levels[id];
    return {
      id,
      label: DIMENSIONS[id].shortName,
      sub: formatNumber(score),
      value: score,
      title: DIMENSIONS[id].name,
      detail: `Nível ${level.num} · ${LEVEL_LABELS[level.num]} · ${formatNumber(score)} / 3`,
      ariaLabel: `${DIMENSIONS[id].name}: nível ${level.num}, ${LEVEL_LABELS[level.num]}, score ${formatNumber(score)} de 3`,
    };
  });

  const openPracticeScores = openDim ? getPracticeScores(openDim, answers) : [];
  const openLevelScores = openDim ? getLevelScores(openDim, answers) : null;

  const practiceAxes: RadarAxis[] = openPracticeScores.map(({ practice, answer, value }) => ({
    id: practice.id,
    label: practice.id,
    sub: answer ? `${answer} · ${value}` : 'sem resposta',
    value,
    title: practice.name,
    detail: answer ? `Nível ${practice.level} · ${NPLF[answer].label} · ${value} de 3` : `Nível ${practice.level} · Sem resposta`,
    ariaLabel: `Prática ${practice.id}, ${practice.name}: ${answer ? `${NPLF[answer].label}, ${value} de 3` : 'sem resposta'}`,
  }));

  const axes = openDim ? practiceAxes : generalAxes;

  const handleAxisClick = (id: string) => {
    if (openDim) {
      practiceRowRefs.current[id]?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    } else {
      setOpenDim(id as DimensionId);
    }
  };

  const toggleDim = (id: DimensionId) => setOpenDim(openDim === id ? null : id);

  return (
    <Card className="mg-an2" id="dimension-analysis">
      <div className="mg-an-seg">
        <button type="button" className="mg-an-seg-btn" aria-pressed={openDim === null} onClick={() => setOpenDim(null)}>
          <LayoutGrid className="mg-ico mg-ico-sm" aria-hidden="true" />
          <span>Geral</span>
        </button>
        {DIMENSION_ORDER.map((id) => {
          const Icon = DIMENSION_ICONS[id];
          return (
            <button
              key={id}
              type="button"
              className="mg-an-seg-btn"
              aria-pressed={openDim === id}
              aria-label={DIMENSIONS[id].shortName}
              onClick={() => toggleDim(id)}
            >
              <Icon className="mg-ico mg-ico-sm" aria-hidden="true" />
              <span className="mg-an-seg-t">{DIMENSIONS[id].shortName}</span>
            </button>
          );
        })}
      </div>

      <div className="mg-an2-chart">
        <div className="mg-an2-radar">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={openDim ?? 'geral'}
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <RadarChart
                axes={axes}
                goal={SCORE_GOAL}
                highlightId={hoverId}
                onAxisHover={setHoverId}
                onAxisClick={handleAxisClick}
                ariaLabel={openDim ? `Radar das 9 práticas de ${DIMENSIONS[openDim].name}` : 'Radar de maturidade das 5 dimensões'}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mg-an2-side" aria-live="polite">
          {openDim === null ? (
            <>
              <p className="mg-label">Visão geral</p>
              <h3 className="mg-title" style={{ marginTop: 4 }}>Maturidade nas 5 dimensões</h3>
              <p className="mg-small mg-muted" style={{ marginTop: 16, marginBottom: 2 }}>Score global</p>
              <div className="mg-an-big">
                {formatNumber(globalScore)} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>/ 3</span>
              </div>
              <div className="mg-row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <LevelBadge level={globalLevel.num as Level} />
                <RiskBadge level={globalLevel.num as Level} />
              </div>
              <div className="mg-an-legend" style={{ marginTop: 20 }}>
                <span><i className="s" aria-hidden="true" />Sua organização</span>
                <span><i className="d" aria-hidden="true" />Meta · {formatNumber(SCORE_GOAL, 2)}</span>
              </div>
              <div className="mg-an-hint" style={{ marginTop: 16 }}>
                <Info className="mg-ico mg-ico-sm" aria-hidden="true" />
                <p className="mg-small mg-muted">Escolha uma dimensão nos botões acima ou na lista abaixo: o radar passa a mostrar as 9 práticas dela.</p>
              </div>
            </>
          ) : (
            <>
              <nav className="mg-an-crumb" aria-label="Navegação da análise por dimensão">
                <button type="button" onClick={() => setOpenDim(null)}>
                  <ChevronLeft className="mg-ico mg-ico-sm" aria-hidden="true" />
                  Visão geral
                </button>
                <ChevronRight className="mg-ico mg-ico-sm" aria-hidden="true" />
                <span aria-current="page">{DIMENSIONS[openDim].shortName}</span>
              </nav>
              <div className="mg-an-dhead">
                {(() => {
                  const Icon = DIMENSION_ICONS[openDim];
                  return <Icon className="mg-ico mg-an-dico" aria-hidden="true" />;
                })()}
                <h3 className="mg-title">{DIMENSIONS[openDim].name}</h3>
              </div>
              <div className="mg-row" style={{ gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <div className="mg-an-big">
                  {formatNumber(scores[openDim])} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>/ 3</span>
                </div>
                <LevelBadge level={levels[openDim].num as Level} />
              </div>

              <p className="mg-label" style={{ marginTop: 24 }}>Média por nível de maturidade</p>
              <ul className="mg-an-lvls">
                {PRACTICE_LEVELS.map((level) => {
                  const value = openLevelScores ? openLevelScores[level] : null;
                  return (
                    <li key={level}>
                      <span>Nível {level} · {LEVEL_LABELS[level as Level]}</span>
                      {value !== null ? (
                        <span className="mg-an-mini">
                          <div className="mg-bar" role="img" aria-label={`Nível ${level}: ${formatNumber(value)} de 3`}>
                            <span className="mg-bar-fill" style={{ width: `${(value / 3) * 100}%`, background: 'var(--brand)' }} />
                            <span className="mg-goal" style={{ left: `${(SCORE_GOAL / 3) * 100}%` }} aria-hidden="true" />
                          </div>
                        </span>
                      ) : (
                        <span />
                      )}
                      <b>{value !== null ? formatNumber(value) : '—'}</b>
                    </li>
                  );
                })}
              </ul>

              <div className="mg-an-legend" style={{ marginTop: 20 }}>
                <span><i className="s" aria-hidden="true" />Sua organização</span>
                <span><i className="d" aria-hidden="true" />Meta · {formatNumber(SCORE_GOAL, 2)}</span>
              </div>
              <p className="mg-small mg-muted" style={{ marginTop: 12 }}>
                Cada eixo é uma prática (N = 0 · P = 1 · L = 2 · F = 3), em ordem de nível, no sentido horário a partir do topo.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mg-an2-list">
        <div className="mg-an2-listhead">
          <span>Dimensão</span>
          <span>Score · meta {formatNumber(SCORE_GOAL, 2)}</span>
        </div>
        {DIMENSION_ORDER.map((id) => {
          const Icon = DIMENSION_ICONS[id];
          const dim = DIMENSIONS[id];
          const score = scores[id];
          const level = levels[id];
          const isOpen = openDim === id;
          const practiceScores = isOpen ? openPracticeScores : [];
          const unansweredCount = isOpen ? practiceScores.filter((p) => !p.answer).length : 0;
          const gapScores = practiceScores.filter(({ answer }) => !answer || answer === 'N' || answer === 'P');

          return (
            <details
              key={id}
              ref={(el) => { dimRowRefs.current[id] = el; }}
              className={cx('mg-an2-item', isOpen && 'is-open')}
              open={isOpen}
            >
              <summary onClick={(e) => { e.preventDefault(); toggleDim(id); }}>
                <span className="mg-an-sico"><Icon className="mg-ico" aria-hidden="true" /></span>
                <span className="mg-an-name">
                  <b>{dim.shortName}</b>
                  <small>{unansweredCount > 0 ? `${unansweredCount} sem resposta` : dim.name}</small>
                </span>
                <span className="mg-an-mini">
                  <div className="mg-bar" role="img" aria-label={`${dim.name}: ${formatNumber(score)} de 3`}>
                    <span className="mg-bar-fill" style={{ width: `${(Math.min(score, 3) / 3) * 100}%`, background: 'var(--brand)' }} />
                    <span className="mg-goal" style={{ left: `${(SCORE_GOAL / 3) * 100}%` }} aria-hidden="true" />
                  </div>
                </span>
                <span className="mg-an-val">{formatNumber(score)}</span>
                <LevelBadge level={level.num as Level} />
                <ChevronDown className="chev mg-ico mg-ico-sm" aria-hidden="true" />
              </summary>

              {isOpen && (
                <div className="mg-an2-body">
                  {gapScores.length === 0 ? (
                    <div style={{ padding: '16px 24px' }}>
                      <Banner tone="good" title="Nenhum gap crítico identificado">
                        Conformidade larga ou total em todas as práticas desta dimensão.
                      </Banner>
                    </div>
                  ) : (
                    gapScores.map(({ practice }) => {
                      const isHl = hoverId === practice.id;
                      return (
                        <div
                          key={practice.id}
                          ref={(el) => { practiceRowRefs.current[practice.id] = el; }}
                          className={cx('mg-acc-item', 'mg-an-row', isHl && 'is-hl')}
                          onMouseEnter={() => setHoverId(practice.id)}
                          onMouseLeave={() => setHoverId((h) => (h === practice.id ? null : h))}
                          onFocus={() => setHoverId(practice.id)}
                          onBlur={() => setHoverId((h) => (h === practice.id ? null : h))}
                        >
                          <span className="mg-code">{practice.id}</span>
                          <div style={{ minWidth: 0 }}>
                            <p className="mg-title" style={{ fontSize: 14 }}>{practice.name}</p>
                            <p className="mg-small mg-muted" style={{ marginTop: 2 }}>{practice.evidence}</p>
                          </div>
                          <span className="mg-an-legal">{practice.legalReference ? <LegalBadge>{practice.legalReference}</LegalBadge> : <span className="mg-small mg-muted">—</span>}</span>
                        </div>
                      );
                    })
                  )}
                  <div style={{ padding: '16px 24px', borderTop: '1px solid var(--surface-deep)' }}>
                    <Button variant="secondary" onClick={() => onEditPractice(id)}>Editar respostas desta dimensão</Button>
                  </div>
                </div>
              )}
            </details>
          );
        })}
      </div>
    </Card>
  );
}
