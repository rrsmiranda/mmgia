/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronDown } from 'lucide-react';
import { DimensionId, LIST_PRACTICES, ScoreLevel } from '@mmgia/shared/types';
import { Button, DIMENSION_ORDER, DimensionTag, NplfBadge } from '@mmgia/shared/design-system';

interface AnswerReviewProps {
  answers: Record<string, ScoreLevel>;
  onEditPractice: (dim: DimensionId, index: number) => void;
  /** Dimensão que já chega aberta (ex.: ao voltar do Resultado para corrigir uma prática). */
  initialOpenDim?: DimensionId | null;
}

/**
 * Conferência das respostas por dimensão, antes de calcular o score — sem
 * nenhum número de resultado (score, nível, radar). O detalhamento fica
 * só no Resultado, depois de confirmado.
 */
export default function AnswerReview({ answers, onEditPractice, initialOpenDim }: AnswerReviewProps) {
  return (
    <div className="mg-stack" style={{ gap: 12 }}>
      {DIMENSION_ORDER.map((key) => {
        const practices = LIST_PRACTICES.filter((p) => p.dimensionId === key);
        const answered = practices.filter((p) => !!answers[p.id]).length;

        return (
          <details key={key} className="mg-acc" open={key === (initialOpenDim ?? 'gov')}>
            <summary>
              <DimensionTag dimension={key} />
              <span className="mg-code">{answered}/{practices.length} respondidas</span>
              <span className="mg-spacer" />
              <ChevronDown className="chev mg-ico mg-ico-sm" aria-hidden="true" />
            </summary>

            {practices.map((practice, index) => {
              const scoreChoice = answers[practice.id];
              const isAnswered = !!scoreChoice;

              return (
                <div key={practice.id} className="mg-acc-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="mg-code">Prática {practice.id} · nível {practice.level}</span>
                    <p className="mg-title" style={{ marginTop: 4 }}>{practice.name}</p>
                    <p className="mg-small mg-muted" style={{ marginTop: 2 }}>{practice.description}</p>
                  </div>

                  <div className="mg-row" style={{ gap: 10, flexShrink: 0 }}>
                    {isAnswered ? <NplfBadge value={scoreChoice} /> : <span className="mg-small mg-muted">Não respondida</span>}
                    <Button variant="ghost" size="sm" onClick={() => onEditPractice(key, index)}>
                      {isAnswered ? 'Editar' : 'Responder'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </details>
        );
      })}
    </div>
  );
}
