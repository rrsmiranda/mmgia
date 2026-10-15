/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gerador de planilha Excel para exportação de dados agregados (admin,
 * "Gestão de dados"). Mesma identidade visual do app (ver
 * packages/shared/src/design-system/styles/tokens.css): cabeçalho na cor de
 * marca (#006494), tipografia Raleway (fallback do Rawline oficial, que só
 * existe via CDN — Excel não carrega fontes remotas).
 *
 * NUNCA inclui coluna de identidade (ip, nome, cnpj, email) — quem chama
 * passa só as colunas que já decidiu exportar (mesmas de Dados Abertos).
 */

import ExcelJS from 'exceljs';

export interface ExportColumn {
  key: string;
  header: string;
  desc?: string;
}

const BRAND_ARGB = 'FF006494';
const ON_BRAND_ARGB = 'FFFFFFFF';
const INK_ARGB = 'FF13293D';
const SURFACE_SUNKEN_ARGB = 'FFF2F4F7';
const BORDER_ARGB = 'FFE4E7EC';
const FONT_NAME = 'Raleway';

export async function generateExcel(
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  filtros: Record<string, string>
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MMGIA';
  wb.created = new Date();

  // Aba 1: dados
  const ws = wb.addWorksheet('Avaliações', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: Math.max(12, c.header.length + 4) }));

  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { name: FONT_NAME, bold: true, color: { argb: ON_BRAND_ARGB } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_ARGB } };
    cell.alignment = { vertical: 'middle' };
  });
  headerRow.height = 22;

  rows.forEach((r, i) => {
    const row = ws.addRow(r);
    row.eachCell((cell) => {
      cell.font = { name: FONT_NAME, color: { argb: INK_ARGB } };
      cell.border = { bottom: { style: 'thin', color: { argb: BORDER_ARGB } } };
      if (i % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SURFACE_SUNKEN_ARGB } };
    });
  });

  // Aba 2: filtros aplicados (metadados da exportação)
  const meta = wb.addWorksheet('Filtros');
  meta.columns = [{ width: 22 }, { width: 50 }];
  const addMetaRow = (label: string, value: string | number, bold = false) => {
    const row = meta.addRow([label, value]);
    row.font = { name: FONT_NAME, bold, color: { argb: INK_ARGB } };
  };
  addMetaRow('MMGIA', 'Modelo de Maturidade em Governança de IA', true);
  addMetaRow('Exportado em', new Date().toLocaleString('pt-BR'));
  addMetaRow('Total de registros', rows.length);
  Object.entries(filtros).forEach(([k, v]) => addMetaRow(k, v));
  addMetaRow('Aviso', 'Dados anônimos — sem identificação organizacional (ip, nome, cnpj, e-mail).');

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
