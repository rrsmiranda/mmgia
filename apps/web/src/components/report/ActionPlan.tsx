/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import type { DimensionId, Practice, ScoreLevel } from '@mmgia/shared/types';
import { LIST_PRACTICES } from '@mmgia/shared/types';
import { getAllDimensionScores, getOfficialPracticeCode, NPLF_VALUE } from '@mmgia/shared/scoring';
import { DIMENSION_ORDER, DimensionTag, LegalBadge, NplfBadge } from '@mmgia/shared/design-system';

const FIRST_PAGE_ROWS = 8;
const CONTINUATION_PAGE_ROWS = 12;

/**
 * Lacunas (prática respondida como N ou P, ou sem resposta), agrupadas por dimensão —
 * a de menor score primeiro — e, dentro de cada dimensão, ordenadas pelo nível da
 * prática e, dentro do nível, da resposta mais fraca para a mais forte. Nenhum desses
 * critérios é "a forma oficial" de priorizar (o documento da metodologia não define
 * isso); são só os números que o próprio modelo já calcula, sem inventar nenhuma
 * métrica nova (ex.: esforço). Em empate exato de score entre duas dimensões, a ordem
 * fixa das dimensões na interface desempata — garante que cada dimensão continue um
 * bloco contíguo na lista, nunca intercalada com outra.
 */
export function getGaps(answers: Record<string, ScoreLevel>): Practice[] {
  const dimScores = getAllDimensionScores(answers);
  const dimRank = Object.fromEntries(
    [...DIMENSION_ORDER]
      .sort((a, b) => dimScores[a] - dimScores[b] || DIMENSION_ORDER.indexOf(a) - DIMENSION_ORDER.indexOf(b))
      .map((id, i) => [id, i])
  ) as Record<DimensionId, number>;

  return LIST_PRACTICES
    .filter((p) => {
      const ans = answers[p.id];
      return !ans || ans === 'N' || ans === 'P';
    })
    .sort((a, b) => {
      const dimDiff = dimRank[a.dimensionId] - dimRank[b.dimensionId];
      if (dimDiff !== 0) return dimDiff;
      if (a.level !== b.level) return a.level - b.level;
      const va = answers[a.id] ? NPLF_VALUE[answers[a.id]] : 0;
      const vb = answers[b.id] ? NPLF_VALUE[answers[b.id]] : 0;
      if (va !== vb) return va - vb;
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
  // A evidência mínima esperada do modelo costuma listar itens separados por ";" —
  // cada um vira uma linha do checklist, sem reescrever ou resumir o texto do documento.
  const evidenceItems = practice.evidence.split(';').map((s) => s.trim()).filter(Boolean);
  return (
    <tr>
      <td>{num}</td>
      <td>
        <DimensionTag dimension={practice.dimensionId} short />
        <div className="rp-small">Nível {practice.level}</div>
      </td>
      <td>
        <strong>{getOfficialPracticeCode(practice)} {practice.name}</strong>{' '}
        {answer && <NplfBadge value={answer} />}
        <p className="rp-small" style={{ marginTop: 2, marginBottom: 2 }}>Evidência mínima esperada:</p>
        <ul className="rp-list rp-small">
          {evidenceItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
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
              Parcial (P), ou sem resposta. Elas estão agrupadas por dimensão — a de menor score primeiro — e,
              dentro de cada dimensão, ordenadas pelo nível da prática e, dentro do nível, da resposta mais fraca
              para a mais forte. O código de cada prática e a evidência mínima esperada seguem exatamente o
              documento oficial do MMGIA.
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
