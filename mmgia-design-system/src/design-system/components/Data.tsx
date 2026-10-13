import type { ReactNode } from 'react';
import { DIMENSIONS, type DimensionId } from '../../types';
import { DIMENSION_ORDER, LEVEL_LABELS, SCORE_GOAL, SCORE_MAX, cx, formatNumber, type Level } from '../tokens';

/** Medidor compacto do nível (0–5) para tabelas e listas. */
export function LevelMeter({ level, showLabel = true }: { level: Level; showLabel?: boolean }) {
  return (
    <span className="mg-level" role="img" aria-label={`Nível ${level}: ${LEVEL_LABELS[level]}`}>
      <span className="mg-level-track" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} style={i < level ? { background: `var(--level-${level})` } : undefined} />
        ))}
      </span>
      <b>{level}</b>
      {showLabel && <span>{LEVEL_LABELS[level]}</span>}
    </span>
  );
}

/** Ponto + nome da dimensão (legendas, listas, tabelas). */
export function DimensionTag({ dimension, short = false }: { dimension: DimensionId; short?: boolean }) {
  const d = DIMENSIONS[dimension];
  return (
    <span className="mg-dim">
      <span className="mg-dot" style={{ background: `var(--dim-${dimension})` }} aria-hidden="true" />
      {short ? d.shortName : d.name}
    </span>
  );
}

interface DimensionBarsProps {
  scores: Record<DimensionId, number>;
  /** Mostra a meta tracejada no nível 3 (score 1,50). */
  goal?: boolean;
  short?: boolean;
}

/** Barras por dimensão na escala 0–3, cor categórica = identidade. */
export function DimensionBars({ scores, goal = true, short = false }: DimensionBarsProps) {
  return (
    <div className="mg-bars">
      {DIMENSION_ORDER.map((id) => {
        const v = scores[id];
        const d = DIMENSIONS[id];
        return (
          <div className="mg-bars-row" key={id}>
            <DimensionTag dimension={id} short={short} />
            <span className="v">{formatNumber(v)}</span>
            <div className="mg-bar" role="img" aria-label={`${d.name}: ${formatNumber(v)} de ${SCORE_MAX}`}>
              <span style={{ width: `${Math.min(100, (v / SCORE_MAX) * 100)}%`, background: `var(--dim-${id})` }} />
              {goal && <span className="mg-goal" style={{ left: `${(SCORE_GOAL / SCORE_MAX) * 100}%` }} aria-hidden="true" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  numeric?: boolean;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** No celular cada linha vira um bloco com rótulos (padrão: sim). */
  stacked?: boolean;
  caption?: string;
}

/** Tabela do sistema: cabeçalho em surface-sunken, sem zebra, números tabulares. */
export function DataTable<T>({ columns, rows, rowKey, stacked = true, caption }: DataTableProps<T>) {
  return (
    <table className={cx('mg-table', stacked && 'mg-table--stack')}>
      {caption && <caption className="mg-sr">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} scope="col" className={c.numeric ? 'num' : undefined}>{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={rowKey(r)}>
            {columns.map((c) => (
              <td key={c.key} data-label={c.header} className={c.numeric ? 'num' : undefined}>{c.render(r)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
