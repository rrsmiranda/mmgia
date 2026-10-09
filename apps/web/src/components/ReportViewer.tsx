/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, type ReactNode } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { ScoreLevel, AssessmentMetadata } from '@mmgia/shared/types';
import { Button } from '@mmgia/shared/design-system';
import { getAllDimensionScores, getAllDimensionLevels, getGlobalScore, getMaturityLevel } from '@mmgia/shared/scoring';
import ReportPage from './report/ReportPage';
import CoverContent from './report/Cover';
import SummaryContent from './report/Summary';
import DimensionResultsContent from './report/DimensionResults';
import { buildActionPlanContents, getGaps } from './report/ActionPlan';
import MethodologyContent from './report/Methodology';
import AnnexContent from './report/Annex';

interface ReportViewerProps {
  answers: Record<string, ScoreLevel>;
  metadata: AssessmentMetadata;
  onBack: () => void;
  /** Abre o diálogo de impressão assim que o relatório termina de montar. */
  autoPrint?: boolean;
}

export default function ReportViewer({ answers, metadata, onBack, autoPrint = false }: ReportViewerProps) {
  const dimensionScores = getAllDimensionScores(answers);
  const globalScore = getGlobalScore(answers);
  const levelInfo = getMaturityLevel(globalScore);
  const dimensionLevels = getAllDimensionLevels(answers);
  const gaps = getGaps(answers);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `MMGIA-relatorio-${metadata.code}`;
    return () => {
      document.title = prevTitle;
    };
  }, [metadata.code]);

  // Espera as fontes assentarem antes de imprimir: senão o diálogo abre com o
  // texto ainda na fonte de fallback e a paginação sai diferente da tela.
  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) window.print();
    });
    return () => { cancelled = true; };
  }, [autoPrint]);

  const pages: ReactNode[] = [
    <CoverContent metadata={metadata} />,
    <SummaryContent globalScore={globalScore} levelInfo={levelInfo} dimensionScores={dimensionScores} gaps={gaps} answers={answers} />,
    <DimensionResultsContent
      globalScore={globalScore}
      levelInfo={levelInfo}
      dimensionScores={dimensionScores}
      dimensionLevels={dimensionLevels}
      answers={answers}
    />,
    ...buildActionPlanContents(gaps, answers),
    <MethodologyContent />,
    <AnnexContent answers={answers} />,
  ];
  const total = pages.length;

  return (
    <div data-theme="light" id="report-viewer-root">
      <div className="mg-flowbar rp-viewer-bar" id="report-viewer-bar">
        <div className="mg-flowbar-row">
          <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Voltar</Button>
          <span className="rp-viewer-title">Relatório da avaliação</span>
          <Button variant="primary" icon={Download} onClick={() => window.print()}>Baixar PDF</Button>
        </div>
      </div>

      <div className="rp-stack">
        {pages.map((content, i) => (
          <ReportPage key={i} n={i + 1} total={total} code={metadata.code} cover={i === 0}>
            {content}
          </ReportPage>
        ))}
      </div>
    </div>
  );
}
