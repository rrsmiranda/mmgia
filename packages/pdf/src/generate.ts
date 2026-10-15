/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gerador de PDF para exportação de dados agregados (admin, "Gestão de
 * dados"). Mesma identidade visual do app (ver
 * packages/shared/src/design-system/styles/tokens.css e
 * apps/web/public/favicon.svg): marca "M" em quadrado arredondado na cor de
 * marca (#006494), wordmark "MM"+"GIA" (GIA na cor de destaque), tipografia
 * sans-serif (o PDF não carrega o Rawline oficial, só disponível via CDN —
 * usa a fonte padrão do jsPDF, mais próxima do Raleway/Rawline do que uma
 * serifada).
 *
 * NUNCA inclui coluna de identidade (ip, nome, cnpj, email) — quem chama
 * passa só as colunas que já decidiu exportar (mesmas de Dados Abertos).
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  key: string;
  header: string;
  desc?: string;
}

const BRAND = '#006494';
const BRAND_ACCENT = '#1B98E0';
const INK = '#13293D';
const TEXT_MUTED = '#475467';
const SURFACE_SUNKEN = '#F2F4F7';
const BORDER = '#E4E7EC';
const ON_BRAND = '#FFFFFF';

function drawHeader(doc: jsPDF, pageWidth: number) {
  const margin = 14;

  // Marca "M" — mesmo desenho do favicon.svg (quadrado arredondado + M branco).
  doc.setFillColor(BRAND);
  doc.roundedRect(margin, 10, 10, 10, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(ON_BRAND);
  doc.text('M', margin + 5, 16.8, { align: 'center' });

  // Wordmark "MMGIA" — "GIA" na cor de destaque, igual ao app.
  doc.setFontSize(14);
  doc.setTextColor(INK);
  doc.text('MM', margin + 15, 17);
  const mmWidth = doc.getTextWidth('MM');
  doc.setTextColor(BRAND_ACCENT);
  doc.text('GIA', margin + 15 + mmWidth, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_MUTED);
  doc.text('MODELO DE MATURIDADE EM GOVERNANÇA DE IA', margin + 15, 21.5);

  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin, 26, pageWidth - margin, 26);
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const margin = 14;
  doc.setDrawColor(BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_MUTED);
  doc.text(
    'Dados anônimos — sem identificação organizacional (ip, nome, cnpj, e-mail). Autoavaliação: não constitui certificação.',
    margin,
    pageHeight - 9
  );
  const page = doc.getCurrentPageInfo().pageNumber;
  doc.text(`Página ${page}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
}

export function generatePdf(
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  filtros: Record<string, string>
): Blob {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  drawHeader(doc, pageWidth);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(INK);
  doc.text('Relatório de avaliações — dados agregados', margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED);
  const filtrosTexto = Object.entries(filtros).length > 0
    ? Object.entries(filtros).map(([k, v]) => `${k}: ${v}`).join('  ·  ')
    : 'Nenhum filtro aplicado';
  doc.text(`Exportado em ${new Date().toLocaleString('pt-BR')}  ·  ${rows.length} registros  ·  ${filtrosTexto}`, margin, 41);

  const numericCols = new Set(columns.map((c, i) => (c.key.startsWith('score_') ? i : -1)).filter((i) => i >= 0));

  autoTable(doc, {
    startY: 47,
    margin: { left: margin, right: margin },
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => String(r[c.key] ?? ''))),
    styles: { font: 'helvetica', fontSize: 7, cellPadding: 1.5, textColor: INK, lineColor: BORDER, lineWidth: 0.1 },
    headStyles: { fillColor: BRAND, textColor: ON_BRAND, fontStyle: 'bold', fontSize: 6.5 },
    alternateRowStyles: { fillColor: SURFACE_SUNKEN },
    columnStyles: Object.fromEntries([...numericCols].map((i) => [i, { halign: 'right' as const }])),
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      if (doc.getCurrentPageInfo().pageNumber > 1) drawHeader(doc, pageWidth);
      drawFooter(doc, pageWidth, pageHeight);
    },
  });

  return doc.output('blob');
}
