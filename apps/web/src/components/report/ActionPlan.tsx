/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import type { Practice, ScoreLevel } from '@mmgia/shared/types';
import { LIST_PRACTICES } from '@mmgia/shared/types';
import { DimensionTag, LegalBadge, NplfBadge, DIMENSION_ORDER } from '@mmgia/shared/design-system';

const FIRST_PAGE_ROWS = 8;
const CONTINUATION_PAGE_ROWS = 12;

/** Lacuna: prática respondida como N ou P, ou sem resposta. */
export function getGaps(answers: Record<string, ScoreLevel>): Practice[] {
  return LIST_PRACTICES
    .filter((p) => {
      const ans = answers[p.id];
      return !ans || ans === 'N' || ans === 'P';
    })
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      const da = DIMENSION_ORDER.indexOf(a.dimensionId);
      const db = DIMENSION_ORDER.indexOf(b.dimensionId);
      if (da !== db) return da - db;
      return a.id.localeCompare(b.id);
    });
}

function chunkGaps(gaps: Practice[]): Practice[][] {
  const chunks: Practice[][] = [];
  let i = Math.min(FIRST_PAGE_ROWS, gaps.length);
  chunks.push(gaps.slice(0, i));
  while (i < gaps.length) {
    chunks.push(gaps.slice(i, i + CONTINUATION_PAGE_ROWS));
    i += CONTINUATION_PAGE_ROWS;
  }
  return chunks;
}

function TableHead() {
  return (
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Dimensão</th>
        <th scope="col">Prática e próximo passo</th>
        <th scope="col">Base legal</th>
      </tr>
    </thead>
  );
}

function GapRow({ num, practice, answer }: { num: number; practice: Practice; answer?: ScoreLevel }) {
  return (
    <tr>
      <td>{num}</td>
      <td>
        <DimensionTag dimension={practice.dimensionId} short />
        <div className="rp-small">Nível {practice.level}</div>
      </td>
      <td>
        <strong>{practice.id} {practice.name}</strong>{' '}
        {answer && <NplfBadge value={answer} />}
        <p className="rp-small">Para atender: {practice.criterion}</p>
      </td>
      <td>{practice.legalReference ? <LegalBadge>{practice.legalReference}</LegalBadge> : '—'}</td>
    </tr>
  );
}

/** Conteúdo (sem o wrapper ReportPage) de cada página do plano de ação — 1 ou mais. */
export function buildActionPlanContents(gaps: Practice[], answers: Record<string, ScoreLevel>): ReactNode[] {
  if (gaps.length === 0) {
    return [
      <>
        <p className="rp-eyebrow">3 · Plano de ação</p>
        <h1 className="rp-h1">Lacunas priorizadas</h1>
        <p>Todas as {LIST_PRACTICES.length} práticas foram respondidas como Larga (L) ou Total (F).</p>
      </>,
    ];
  }

  const chunks = chunkGaps(gaps);
  let rowStart = 0;

  return chunks.map((chunk, pageIndex) => {
    const isFirst = pageIndex === 0;
    const isLast = pageIndex === chunks.length - 1;
    const startNum = rowStart + 1;
    rowStart += chunk.length;

    return (
      <>
        <p className="rp-eyebrow">3 · Plano de ação{!isFirst && ' (continuação)'}</p>
        {isFirst && (
          <>
            <h1 className="rp-h1">Lacunas priorizadas</h1>
            <p>
              Foram identificadas <strong>{gaps.length} lacunas</strong>: práticas respondidas como Nulo (N) ou
              Parcial (P). Elas estão ordenadas pelo nível de maturidade da prática — primeiro as que sustentam os
              níveis iniciais — e, dentro de cada nível, pela ordem das dimensões. O próximo passo de cada lacuna é
              o critério de verificação da própria prática.
            </p>
          </>
        )}

        <table className="rp-table rp-gaps">
          <TableHead />
          <tbody>
            {chunk.map((practice, i) => (
              <GapRow key={practice.id} num={startNum + i} practice={practice} answer={answers[practice.id]} />
            ))}
          </tbody>
        </table>

        {isLast && (
          <p className="rp-small">
            A base legal aparece apenas quando a prática tem referência normativa cadastrada no modelo.
          </p>
        )}
      </>
    );
  });
}
