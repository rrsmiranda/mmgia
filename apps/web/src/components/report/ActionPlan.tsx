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
  getGlobalScore,
  getOfficialPracticeCode,
} from '@mmgia/shared/scoring';
import {
  DIMENSION_ORDER,
  DimensionTag,
  formatNumber,
  NplfBadge,
} from '@mmgia/shared/design-system';

const AGORA_FIRST_PAGE_ROWS = 3;
const AGORA_CONTINUATION_ROWS = 4;
const DEPOIS_FIRST_PAGE_ROWS = 8;
const DEPOIS_CONTINUATION_ROWS = 8;

/** Faixas de score que definem cada nível (mesmos limites de getMaturityLevel). */
const LEVEL_THRESHOLDS = [0.5, 1.0, 1.5, 2.0, 2.5];

/**
 * Lacunas (prática respondida como N ou P, ou sem resposta), ordenadas pelo nível da
 * prática primeiro — a lógica cumulativa do próprio modelo: práticas de nível 1 em
 * qualquer dimensão vêm antes de práticas de nível 2, e assim por diante — e, dentro
 * do mesmo nível, pelo ganho que cada uma traria ao score global se passasse para
 * Larga (maior ganho primeiro). O ganho não é uma métrica nova: é a diferença entre
 * `getGlobalScore` com e sem essa mudança, calculada pela mesma fórmula do modelo.
 * Em empate de ganho, a ordem fixa das dimensões na interface desempata.
 */
export function getGaps(answers: Record<string, ScoreLevel>): Practice[] {
  const gaps = LIST_PRACTICES.filter((p) => {
    const ans = answers[p.id];
    return !ans || ans === 'N' || ans === 'P';
  });

  const gainCache = new Map<string, number>();
  const gainOf = (p: Practice) => {
    if (!gainCache.has(p.id)) gainCache.set(p.id, getPracticeGain(p, answers));
    return gainCache.get(p.id)!;
  };

  return [...gaps].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    const gainDiff = gainOf(b) - gainOf(a);
    if (Math.abs(gainDiff) > 1e-9) return gainDiff;
    const dimDiff = DIMENSION_ORDER.indexOf(a.dimensionId) - DIMENSION_ORDER.indexOf(b.dimensionId);
    if (dimDiff !== 0) return dimDiff;
    return a.id.localeCompare(b.id);
  });
}

/** Quanto o score global sobe se só esta prática passar para Larga — mesma fórmula do modelo, nada novo. */
export function getPracticeGain(practice: Practice, answers: Record<string, ScoreLevel>): number {
  const base = getGlobalScore(answers);
  const withLarga = getGlobalScore({ ...answers, [practice.id]: 'L' });
  return withLarga - base;
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

export interface NextStep {
  steps: { practice: Practice; gain: number }[];
  fromScore: number;
  toScore: number;
  reached: boolean;
}

/**
 * Caminho mínimo até o próximo nível: a cada passo, escolhe entre as lacunas
 * restantes a que mais aumenta o score global SE passasse para Larga, aplica essa
 * mudança e repete — até cruzar o limiar do próximo nível ou esgotar as lacunas.
 * É uma simulação gulosa, não uma soma: o ganho de uma prática muda conforme outras
 * já aplicadas na mesma dimensão/nível, então os ganhos individuais não se somam
 * livremente fora desse caminho (só quando práticas estão em níveis ou dimensões
 * diferentes, como costuma ser o caso das primeiras escolhidas).
 */
export function getNextStep(gaps: Practice[], answers: Record<string, ScoreLevel>, levelInfo: MaturityLevelInfo): NextStep | null {
  if (levelInfo.num >= 5) return null;
  const threshold = LEVEL_THRESHOLDS[levelInfo.num];
  let sim = { ...answers };
  let current = getGlobalScore(sim);
  const fromScore = current;
  const remaining = [...gaps];
  const steps: { practice: Practice; gain: number }[] = [];

  while (current < threshold && remaining.length > 0) {
    let bestIdx = -1;
    let bestGain = -Infinity;
    remaining.forEach((p, i) => {
      const gain = getGlobalScore({ ...sim, [p.id]: 'L' }) - current;
      if (gain > bestGain) {
        bestGain = gain;
        bestIdx = i;
      }
    });
    if (bestIdx === -1 || bestGain <= 0) break;
    const practice = remaining.splice(bestIdx, 1)[0];
    sim = { ...sim, [practice.id]: 'L' };
    const newScore = getGlobalScore(sim);
    steps.push({ practice, gain: newScore - current });
    current = newScore;
  }

  return { steps, fromScore, toScore: current, reached: current >= threshold };
}

function chunkRows<T>(rows: T[], firstPageRows: number, continuationRows: number): T[][] {
  const chunks: T[][] = [];
  let i = Math.min(firstPageRows, rows.length);
  chunks.push(rows.slice(0, i));
  while (i < rows.length) {
    chunks.push(rows.slice(i, i + continuationRows));
    i += continuationRows;
  }
  return chunks;
}

function GainCell({ gain }: { gain: number }) {
  return <td className="num rp-gain">+{formatNumber(gain, 2)}</td>;
}

function EvidenceList({ practice }: { practice: Practice }) {
  // A evidência mínima esperada do modelo costuma listar itens separados por ";" —
  // cada um vira uma linha do checklist, sem reescrever ou resumir o texto do documento.
  const items = practice.evidence.split(';').map((s) => s.trim()).filter(Boolean);
  return (
    <>
      <p className="rp-small" style={{ marginTop: 4, marginBottom: 2 }}>Evidência mínima esperada:</p>
      <ul className="rp-list rp-small">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </>
  );
}

/**
 * Ficha completa (Agora, níveis 1-3): código + nome + resposta, a orientação "O que
 * fazer" (reformulação do `criterion` em modo imperativo — rascunho interno, não é
 * texto do documento oficial, pendente de validação do GGIA) e a evidência mínima
 * esperada, que essa sim é o texto oficial.
 */
function RichGapRow({ num, practice, answer, gain }: { num: number; practice: Practice; answer?: ScoreLevel; gain: number }) {
  return (
    <tr>
      <td>{num}</td>
      <td className="rp-small">Nível {practice.level}</td>
      <td>
        <strong>{getOfficialPracticeCode(practice)} {practice.name}</strong>{' '}
        {answer && <NplfBadge value={answer} />}
        <div className="rp-wtf">
          <span className="rp-wtf-label">O que fazer</span>
          <p>{practice.whatToDo}</p>
        </div>
        <EvidenceList practice={practice} />
      </td>
      <GainCell gain={gain} />
    </tr>
  );
}

/** Linha compacta (Depois, níveis 4-5): sem "O que fazer", para não inflar o relatório com metas distantes. */
function CompactGapRow({ num, practice, answer, gain }: { num: number; practice: Practice; answer?: ScoreLevel; gain: number }) {
  return (
    <tr>
      <td>{num}</td>
      <td className="rp-small">Nível {practice.level}</td>
      <td>
        <strong>{getOfficialPracticeCode(practice)} {practice.name}</strong>{' '}
        {answer && <NplfBadge value={answer} />}
        <EvidenceList practice={practice} />
      </td>
      <GainCell gain={gain} />
    </tr>
  );
}

function NextStepCard({ nextStep }: { nextStep: NextStep }) {
  if (nextStep.steps.length === 0) return null;
  return (
    <div className="rp-nextstep">
      <p className="rp-label">Seu próximo passo</p>
      <div className="rp-nextstep-scores">
        <span className="rp-big" style={{ fontSize: '20pt' }}>{formatNumber(nextStep.fromScore)}</span>
        <span className="rp-nextstep-arrow">→</span>
        <span className="rp-big" style={{ fontSize: '20pt' }}>{formatNumber(nextStep.toScore)}</span>
      </div>
      <p className="rp-small">
        Levar {nextStep.steps.length === 1 ? 'esta prática' : `estas ${nextStep.steps.length} práticas`} de Parcial
        (ou Nulo) para Larga {nextStep.reached ? 'alcança o próximo nível de maturidade' : 'é o máximo que as lacunas atuais permitem — não é suficiente para alcançar o próximo nível'}.
      </p>
      <ul className="rp-list rp-small" style={{ marginTop: 6 }}>
        {nextStep.steps.map(({ practice, gain }) => (
          <li key={practice.id}>
            <strong>{getOfficialPracticeCode(practice)} {practice.name}</strong> — {DIMENSIONS[practice.dimensionId].shortName}, +{formatNumber(gain, 2)} no score
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Conteúdo (sem o wrapper ReportPage) de cada página do plano de ação — 1 ou mais. */
export function buildActionPlanContents(gaps: Practice[], answers: Record<string, ScoreLevel>, levelInfo: MaturityLevelInfo): ReactNode[] {
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
  const agora = gaps.filter((g) => g.level <= 3);
  const depois = gaps.filter((g) => g.level > 3);
  const nextStep = getNextStep(gaps, answers, levelInfo);
  const pages: ReactNode[] = [];

  const gainsByDim = DIMENSION_ORDER.map((id) => ({
    dimensionId: id,
    score: dimScores[id],
    count: gaps.filter((g) => g.dimensionId === id).length,
  })).filter((d) => d.count > 0);

  pages.push(
    <>
      <p className="rp-eyebrow">3 · Plano de ação</p>
      <h1 className="rp-h1">Lacunas priorizadas</h1>
      <p>
        Foram identificadas <strong>{gaps.length} lacunas</strong>: práticas respondidas como Nulo (N) ou Parcial (P),
        ou sem resposta. A ordem segue a lógica cumulativa do modelo — nível 1 antes de nível 2, e assim por diante
        — e, dentro do mesmo nível, o ganho que cada prática traria ao score global se passasse para Larga.{' '}
        <strong>Agora</strong> reúne as {agora.length} lacunas de níveis 1 a 3, que sustentam o nível seguinte;{' '}
        <strong>Depois</strong> reúne as {depois.length} de níveis 4 e 5, metas para depois de consolidar o nível 3.
      </p>

      {nextStep && <NextStepCard nextStep={nextStep} />}

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
          {gainsByDim.map(({ dimensionId, score, count }) => (
            <tr key={dimensionId}>
              <td><DimensionTag dimension={dimensionId} /></td>
              <td>{formatNumber(score)}</td>
              <td className="num">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  const buildSection = (
    title: string,
    rows: Practice[],
    firstPageRows: number,
    continuationRows: number,
    rich: boolean
  ) => {
    if (rows.length === 0) return;
    const chunks = chunkRows(rows, firstPageRows, continuationRows);
    let rowStart = 0;

    chunks.forEach((chunk, pageIndex) => {
      const isFirst = pageIndex === 0;
      const startNum = rowStart + 1;
      rowStart += chunk.length;

      pages.push(
        <>
          <p className="rp-eyebrow">3 · Plano de ação{!isFirst && ' (continuação)'}</p>
          <h2 className="rp-h2" style={{ marginTop: 0 }}>{title}</h2>
          <table className={rich ? 'rp-table rp-gaps rp-gaps--rich' : 'rp-table rp-gaps'}>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nível</th>
                <th scope="col">{rich ? 'Prática, orientação e evidência' : 'Prática e evidência'}</th>
                <th scope="col" className="num">Ganho</th>
              </tr>
            </thead>
            <tbody>
              {chunk.map((practice, i) => {
                const gain = getPracticeGain(practice, answers);
                const answer = answers[practice.id];
                return rich
                  ? <RichGapRow key={practice.id} num={startNum + i} practice={practice} answer={answer} gain={gain} />
                  : <CompactGapRow key={practice.id} num={startNum + i} practice={practice} answer={answer} gain={gain} />;
              })}
            </tbody>
          </table>
        </>
      );
    });
  };

  buildSection('Agora · níveis 1 a 3', agora, AGORA_FIRST_PAGE_ROWS, AGORA_CONTINUATION_ROWS, true);
  buildSection('Depois · níveis 4 e 5', depois, DEPOIS_FIRST_PAGE_ROWS, DEPOIS_CONTINUATION_ROWS, false);

  return pages;
}
