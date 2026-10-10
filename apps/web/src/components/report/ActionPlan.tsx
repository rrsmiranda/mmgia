/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import type { DimensionId, Practice, ScoreLevel } from '@mmgia/shared/types';
import { DIMENSIONS, LIST_PRACTICES } from '@mmgia/shared/types';
import type { MaturityLevelInfo } from '@mmgia/shared/scoring';
import {
  DIMENSION_WEIGHTS,
  getAllDimensionScores,
  getMaturityLevel,
  getOfficialPracticeCode,
  getPracticeScores,
  NPLF_VALUE,
} from '@mmgia/shared/scoring';
import {
  DIMENSION_ICONS,
  DIMENSION_ORDER,
  DimensionTag,
  formatNumber,
  LevelBadge,
  NplfBadge,
  RiskBadge,
  type Level,
} from '@mmgia/shared/design-system';
import RadarChart, { type RadarAxis } from '../RadarChart';

const DIM_FIRST_PAGE_ROWS = 5;
const DIM_CONTINUATION_ROWS = 12;

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

export interface KeyFindings {
  totalGaps: number;
  totalPractices: number;
  naoRespondidas: number;
  nulas: number;
  gapsIniciais: number;
  proximoNivel: number;
  maiorId: DimensionId;
  menorId: DimensionId;
  menorPesoPercent: number;
}

/**
 * Números por trás das "Principais conclusões" — únicos, derivados de `gaps` (já
 * calculado por `getGaps`) e dos scores por dimensão, para que o relatório PDF
 * (Summary.tsx) e a tela de Resultado mostrem exatamente os mesmos números.
 */
export function getKeyFindings(
  gaps: Practice[],
  dimensionScores: Record<DimensionId, number>,
  levelInfo: MaturityLevelInfo,
  answers: Record<string, ScoreLevel>
): KeyFindings {
  const sortedDims = [...DIMENSION_ORDER].sort((a, b) => dimensionScores[b] - dimensionScores[a]);
  const maiorId = sortedDims[0];
  const menorId = sortedDims[sortedDims.length - 1];

  return {
    totalGaps: gaps.length,
    totalPractices: LIST_PRACTICES.length,
    naoRespondidas: gaps.filter((g) => !answers[g.id]).length,
    nulas: gaps.filter((g) => answers[g.id] === 'N').length,
    gapsIniciais: gaps.filter((g) => g.level <= 3).length,
    proximoNivel: levelInfo.num + 1,
    maiorId,
    menorId,
    menorPesoPercent: Math.round(DIMENSION_WEIGHTS[menorId] * 100),
  };
}

interface DimensionGapBlock {
  dimensionId: DimensionId;
  gaps: Practice[];
}

/** `getGaps` já devolve as lacunas agrupadas por dimensão — aqui só se materializa essa divisão em blocos. */
function groupGapsByDimension(gaps: Practice[]): DimensionGapBlock[] {
  const blocks: DimensionGapBlock[] = [];
  for (const gap of gaps) {
    const last = blocks[blocks.length - 1];
    if (last && last.dimensionId === gap.dimensionId) {
      last.gaps.push(gap);
    } else {
      blocks.push({ dimensionId: gap.dimensionId, gaps: [gap] });
    }
  }
  return blocks;
}

function chunkRows(gaps: Practice[], firstPageRows: number, continuationRows: number): Practice[][] {
  const chunks: Practice[][] = [];
  let i = Math.min(firstPageRows, gaps.length);
  chunks.push(gaps.slice(0, i));
  while (i < gaps.length) {
    chunks.push(gaps.slice(i, i + continuationRows));
    i += continuationRows;
  }
  return chunks;
}

function TableHead() {
  return (
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Nível</th>
        <th scope="col">Prática e próximo passo</th>
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
      <td className="rp-small">Nível {practice.level}</td>
      <td>
        <strong>{getOfficialPracticeCode(practice)} {practice.name}</strong>{' '}
        {answer && <NplfBadge value={answer} />}
        <p className="rp-small" style={{ marginTop: 2, marginBottom: 2 }}>Evidência mínima esperada:</p>
        <ul className="rp-list rp-small">
          {evidenceItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </td>
    </tr>
  );
}

/**
 * Cabeçalho da primeira página de cada dimensão: radar das 9 práticas (mesmo
 * componente e mesma leitura da tela de Resultado) ao lado do score e do total de
 * lacunas — visão de conjunto antes da lista detalhada, sem repetir essa lista em
 * forma de gráfico (o gráfico não carrega a evidência mínima esperada de cada item).
 */
function DimensionGapHeader({ dimensionId, answers, score, gapCount }: {
  dimensionId: DimensionId;
  answers: Record<string, ScoreLevel>;
  score: number;
  gapCount: number;
}) {
  const dim = DIMENSIONS[dimensionId];
  const Icon = DIMENSION_ICONS[dimensionId];
  const level = getMaturityLevel(score);

  const axes: RadarAxis[] = getPracticeScores(dimensionId, answers).map(({ practice, answer, value }) => {
    const code = getOfficialPracticeCode(practice);
    return {
      id: practice.id,
      label: code,
      sub: answer ?? '—',
      value,
      title: practice.name,
      detail: answer ? `Nível ${practice.level} · ${answer} · ${value} de 3` : `Nível ${practice.level} · Sem resposta`,
      ariaLabel: `${code} ${practice.name}: ${answer ? `${answer}, ${value} de 3` : 'sem resposta'}`,
    };
  });

  return (
    <div className="rp-cols rp-gap-head">
      <div className="rp-gap-radar">
        <RadarChart axes={axes} ariaLabel={`Radar das 9 práticas de ${dim.name}`} />
      </div>
      <div>
        <div className="mg-row" style={{ gap: 8, alignItems: 'center' }}>
          <Icon className="mg-ico" aria-hidden="true" />
          <h2 className="rp-h2" style={{ margin: 0 }}>{dim.name}</h2>
        </div>
        <p className="rp-big" style={{ fontSize: '22pt', marginTop: 6 }}>
          {formatNumber(score)}<span style={{ fontSize: '10.5pt' }}> / 3</span>
        </p>
        <div className="mg-row" style={{ gap: 6, marginTop: 4 }}>
          <LevelBadge level={level.num as Level} />
          <RiskBadge level={level.num as Level} />
        </div>
        <p className="rp-small" style={{ marginTop: 10 }}>{level.risco}</p>
        <p className="rp-small" style={{ marginTop: 6 }}>
          {gapCount} {gapCount === 1 ? 'lacuna' : 'lacunas'} nesta dimensão — cada eixo do radar é uma das 9 práticas
          (N · P · L · F), na ordem dos níveis de maturidade.
        </p>
      </div>
    </div>
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

  const dimScores = getAllDimensionScores(answers);
  const blocks = groupGapsByDimension(gaps);
  const pages: ReactNode[] = [];

  pages.push(
    <>
      <p className="rp-eyebrow">3 · Plano de ação</p>
      <h1 className="rp-h1">Lacunas priorizadas</h1>
      <p>
        Foram identificadas <strong>{gaps.length} lacunas</strong>: práticas respondidas como Nulo (N) ou Parcial (P),
        ou sem resposta. A seguir, cada dimensão com lacunas tem sua própria página — a de menor score primeiro —,
        com um radar das 9 práticas (visão de conjunto) seguido da lista de lacunas daquela dimensão, ordenadas por
        nível e, dentro do nível, da resposta mais fraca para a mais forte. O código de cada prática e a evidência
        mínima esperada seguem exatamente o documento oficial do MMGIA.
      </p>
      <h2 className="rp-h2">Lacunas por dimensão</h2>
      <table className="rp-table">
        <thead>
          <tr>
            <th scope="col">Dimensão</th>
            <th scope="col">Score</th>
            <th scope="col" className="num">Lacunas</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map(({ dimensionId, gaps: dimGaps }) => (
            <tr key={dimensionId}>
              <td><DimensionTag dimension={dimensionId} /></td>
              <td>{formatNumber(dimScores[dimensionId])}</td>
              <td className="num">{dimGaps.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  blocks.forEach(({ dimensionId, gaps: dimGaps }) => {
    const score = dimScores[dimensionId];
    const chunks = chunkRows(dimGaps, DIM_FIRST_PAGE_ROWS, DIM_CONTINUATION_ROWS);
    let rowStart = 0;

    chunks.forEach((chunk, pageIndex) => {
      const isFirst = pageIndex === 0;
      const startNum = rowStart + 1;
      rowStart += chunk.length;

      pages.push(
        <>
          <p className="rp-eyebrow">3 · Plano de ação{!isFirst && ' (continuação)'}</p>
          {isFirst ? (
            <DimensionGapHeader dimensionId={dimensionId} answers={answers} score={score} gapCount={dimGaps.length} />
          ) : (
            <div className="mg-row" style={{ gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <DimensionTag dimension={dimensionId} />
              <h2 className="rp-h2" style={{ margin: 0 }}>{DIMENSIONS[dimensionId].name}</h2>
            </div>
          )}

          <table className="rp-table rp-gaps">
            <TableHead />
            <tbody>
              {chunk.map((practice, i) => (
                <GapRow key={practice.id} num={startNum + i} practice={practice} answer={answers[practice.id]} />
              ))}
            </tbody>
          </table>
        </>
      );
    });
  });

  return pages;
}
