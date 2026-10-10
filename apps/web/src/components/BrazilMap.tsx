/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Table2, Map as MapIcon } from 'lucide-react';
import brazilMapData from '@svg-maps/brazil';
import { REGIAO_POR_UF } from '@mmgia/shared/taxonomy';
import { Button, DataTable, LEVEL_LABELS, cx, formatNumber, type Column, type Level } from '@mmgia/shared/design-system';

export interface UfAgg {
  score: number | null;
  level: number | null;
  n: number;
}

interface BrazilMapProps {
  /** 'select': escolha simples de UF, sem heatmap nem legenda (Onboarding). 'heatmap': painel do Observatório. */
  mode: 'select' | 'heatmap';
  /** Obrigatório em `mode="heatmap"` — uma entrada por UF, já resolvida (por UF ou por região) pelo chamador. */
  data?: Record<string, UfAgg>;
  selectedUf?: string | null;
  onSelectUf?: (uf: string | null) => void;
  /** Nome da métrica ativa, para o aria-label e o balão ("Score global" ou o nome curto de uma dimensão). */
  metricLabel?: string;
}

/** Estados geograficamente pequenos — ganham atalho porque são difíceis de clicar no mapa. */
const SMALL_UF_SHORTCUTS = ['DF', 'SE', 'AL', 'ES', 'RJ', 'RN', 'PB'];

const LEVELS: Level[] = [0, 1, 2, 3, 4, 5];

interface TableRow {
  uf: string;
  nome: string;
  regiao: string;
  n: number;
  score: number | null;
  level: number | null;
}

type SortKey = 'uf' | 'regiao' | 'n' | 'score';

export default function BrazilMap({ mode, data, selectedUf = null, onSelectUf, metricLabel = 'Score global' }: BrazilMapProps) {
  const isHeatmap = mode === 'heatmap';

  const [hoveredUf, setHoveredUf] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [adjustedPos, setAdjustedPos] = useState({ x: 0, y: 0 });
  const [highlightLevel, setHighlightLevel] = useState<Level | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'score', dir: 'desc' });

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hoveredUf) return;
    const hide = () => setHoveredUf(null);
    window.addEventListener('scroll', hide, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', hide, true);
  }, [hoveredUf]);

  useLayoutEffect(() => {
    if (!hoveredUf || !tooltipRef.current) {
      setAdjustedPos(tooltipPos);
      return;
    }
    const rect = tooltipRef.current.getBoundingClientRect();
    const margin = 12;
    let x = tooltipPos.x;
    let y = tooltipPos.y;
    if (x + rect.width + margin > window.innerWidth) x = tooltipPos.x - rect.width - 30;
    if (y + rect.height + margin > window.innerHeight) y = tooltipPos.y - rect.height - 10;
    x = Math.max(margin, x);
    y = Math.max(margin, y);
    setAdjustedPos({ x, y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredUf, tooltipPos]);

  const handlePointerMove = (e: React.PointerEvent) => {
    setTooltipPos({ x: e.clientX + 15, y: e.clientY - 15 });
  };

  const locations = useMemo(() => brazilMapData.locations.map((loc) => ({ ...loc, uf: loc.id.toUpperCase() })), []);

  const selectState = (uf: string) => {
    if (!onSelectUf) return;
    if (isHeatmap && selectedUf === uf) onSelectUf(null);
    else onSelectUf(uf);
  };

  const handleKeyDown = (e: React.KeyboardEvent, uf: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectState(uf);
    }
  };

  // Ordem de renderização sempre fixa — nunca reordena por hover/seleção. Reordenar moveria o
  // <path> no DOM no meio do próprio gesto de clique (pointerenter dispara antes do click) e o
  // navegador cancela o clique quando o alvo sai do lugar entre mousedown e mouseup. O destaque de
  // borda por cima dos vizinhos vem de um <path> extra, sem interação, desenhado depois de todos.
  const highlightUf = selectedUf ?? hoveredUf;
  const highlightLoc = highlightUf ? locations.find((l) => l.uf === highlightUf) : undefined;

  const fillFor = (uf: string): string => {
    if (!isHeatmap) return selectedUf === uf ? 'var(--brand)' : hoveredUf === uf ? 'var(--surface-deep)' : 'var(--surface-sunken)';
    const agg = data?.[uf];
    if (!agg || agg.score === null || agg.level === null) return 'url(#obs-hatch)';
    return `var(--level-${agg.level})`;
  };

  // O destaque de borda do hover/seleção vem do <path> extra (highlightLoc) — aqui fica só o
  // separador neutro entre estados, sempre igual, para não duplicar a borda.
  const strokeFor = (): string => 'var(--surface-raised)';
  const strokeWidthFor = (): number => 1;

  const opacityFor = (uf: string): number => {
    if (selectedUf && selectedUf !== uf) return 0.45;
    if (!selectedUf && highlightLevel !== null) {
      const agg = data?.[uf];
      if (!agg || agg.level !== highlightLevel) return 0.3;
    }
    return 1;
  };

  const ariaLabelFor = (uf: string, nome: string): string => {
    if (!isHeatmap) return `${nome}${selectedUf === uf ? ' (selecionado)' : ''}`;
    const agg = data?.[uf];
    if (!agg || agg.score === null || agg.level === null) return `${nome}: dados insuficientes`;
    return `${nome}: ${formatNumber(agg.score)}, nível ${agg.level}, ${agg.n} ${agg.n === 1 ? 'avaliação' : 'avaliações'}`;
  };

  const mapSvg = (
    <svg
      viewBox={brazilMapData.viewBox}
      style={{ width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid meet"
      onPointerLeave={() => setHoveredUf(null)}
    >
      {isHeatmap && (
        <defs>
          <pattern id="obs-hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="var(--surface-sunken)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--text-muted)" strokeWidth="2" />
          </pattern>
        </defs>
      )}
      {locations.map((loc) => {
        const agg = data?.[loc.uf];
        const insuficiente = isHeatmap && (!agg || agg.score === null);
        return (
          <path
            key={loc.id}
            d={loc.path}
            role="button"
            tabIndex={0}
            aria-label={ariaLabelFor(loc.uf, loc.name)}
            aria-pressed={selectedUf === loc.uf}
            fill={fillFor(loc.uf)}
            stroke={strokeFor()}
            strokeWidth={strokeWidthFor()}
            strokeLinejoin="round"
            opacity={opacityFor(loc.uf)}
            style={{ cursor: 'pointer', transition: 'opacity .2s, fill .2s', outline: 'none' }}
            onPointerEnter={() => !insuficiente && setHoveredUf(loc.uf)}
            onPointerLeave={() => setHoveredUf((h) => (h === loc.uf ? null : h))}
            onFocus={() => !insuficiente && setHoveredUf(loc.uf)}
            onBlur={() => setHoveredUf((h) => (h === loc.uf ? null : h))}
            onClick={() => selectState(loc.uf)}
            onKeyDown={(e) => handleKeyDown(e, loc.uf)}
          />
        );
      })}
      {highlightLoc && (
        <path
          d={highlightLoc.path}
          fill="none"
          stroke="var(--text)"
          strokeWidth={selectedUf === highlightLoc.uf ? 3 : 2}
          strokeLinejoin="round"
          pointerEvents="none"
          aria-hidden="true"
        />
      )}
    </svg>
  );

  const tooltipPortal = typeof document !== 'undefined' && createPortal(
    hoveredUf ? (
      <div
        ref={tooltipRef}
        className="mg-obs-tip"
        style={{ top: adjustedPos.y, left: adjustedPos.x }}
      >
        {(() => {
          const loc = locations.find((l) => l.uf === hoveredUf);
          const nome = loc?.name ?? hoveredUf;
          const agg = data?.[hoveredUf];
          if (!isHeatmap) {
            return (
              <>
                <b>{nome} ({hoveredUf})</b>
                <span>Clique para selecionar</span>
              </>
            );
          }
          if (!agg || agg.score === null || agg.level === null) {
            return <b>{nome} ({hoveredUf})</b>;
          }
          return (
            <>
              <b>{nome} ({hoveredUf})</b>
              <span>{metricLabel}: {formatNumber(agg.score)} / 3 · Nível {agg.level} · {LEVEL_LABELS[agg.level as Level]}</span>
              <span>{agg.n} {agg.n === 1 ? 'avaliação' : 'avaliações'} · clique para filtrar</span>
            </>
          );
        })()}
      </div>
    ) : null,
    document.body
  );

  const tableRows: TableRow[] = useMemoTableRows(data, locations);
  const sortedRows = useMemo(() => sortRows(tableRows, sort), [tableRows, sort]);

  if (!isHeatmap) {
    return (
      <div ref={containerRef} onPointerMove={handlePointerMove} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
        {mapSvg}
        {tooltipPortal}
      </div>
    );
  }

  const handleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'uf' || key === 'regiao' ? 'asc' : 'desc' }));
  };

  const columns: Column<TableRow>[] = [
    { key: 'uf', header: 'UF', render: (r) => `${r.nome} (${r.uf})` },
    { key: 'regiao', header: 'Região', render: (r) => r.regiao },
    { key: 'n', header: 'Avaliações', numeric: true, render: (r) => String(r.n) },
    { key: 'score', header: 'Score', numeric: true, render: (r) => (r.score !== null ? formatNumber(r.score) : '—') },
    { key: 'level', header: 'Nível', render: (r) => (r.level !== null ? `${r.level} · ${LEVEL_LABELS[r.level as Level]}` : 'Dados insuficientes') },
  ];

  return (
    <div className="mg-stack" style={{ gap: 16 }}>
      <div className="mg-row" style={{ justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" icon={showTable ? MapIcon : Table2} onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'Ver como mapa' : 'Ver como tabela'}
        </Button>
      </div>

      {showTable ? (
        <div className="mg-row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 8 }} role="group" aria-label="Ordenar tabela">
          {(['uf', 'regiao', 'n', 'score'] as SortKey[]).map((key) => (
            <Button key={key} variant="secondary" size="sm" onClick={() => handleSort(key)}>
              {{ uf: 'UF', regiao: 'Região', n: 'Avaliações', score: 'Score' }[key]}
              {sort.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
            </Button>
          ))}
        </div>
      ) : null}

      {showTable ? (
        <DataTable<TableRow> caption="Maturidade por estado" rowKey={(r) => r.uf} columns={columns} rows={sortedRows} />
      ) : (
        <>
          <div ref={containerRef} onPointerMove={handlePointerMove} className="mg-obs-map" style={{ aspectRatio: '1 / 1' }}>
            {mapSvg}
            {tooltipPortal}
          </div>

          <div className="mg-obs-small">
            <span className="mg-small mg-muted">Estados pequenos:</span>
            {SMALL_UF_SHORTCUTS.map((uf) => {
              const agg = data?.[uf];
              const suficiente = agg && agg.score !== null;
              return (
                <button
                  key={uf}
                  type="button"
                  className={cx('mg-obs-uf', selectedUf === uf && 'is-on')}
                  onClick={() => selectState(uf)}
                >
                  <b>{uf}</b> {suficiente ? formatNumber(agg!.score!) : ''}
                </button>
              );
            })}
          </div>

          <div className="mg-obs-legend">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                className="mg-obs-lg"
                aria-pressed={highlightLevel === lvl}
                onClick={() => setHighlightLevel((h) => (h === lvl ? null : lvl))}
              >
                <i style={{ background: `var(--level-${lvl})` }} />
                <b>{lvl} {LEVEL_LABELS[lvl]}</b>
                <small>{levelRange(lvl)}</small>
              </button>
            ))}
            <span className="mg-obs-lg is-na">
              <i className="hatch" />
              <b>Dados insuficientes</b>
              <small>menos de 5 avaliações</small>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function levelRange(lvl: Level): string {
  const ranges: Record<Level, string> = { 0: '< 0,50', 1: '0,50–0,99', 2: '1,00–1,49', 3: '1,50–1,99', 4: '2,00–2,49', 5: '≥ 2,50' };
  return ranges[lvl];
}

function useMemoTableRows(data: Record<string, UfAgg> | undefined, locations: { uf: string; name: string }[]): TableRow[] {
  return useMemo(() => {
    if (!data) return [];
    return locations.map((loc) => {
      const agg = data[loc.uf];
      return {
        uf: loc.uf,
        nome: loc.name,
        regiao: REGIAO_POR_UF[loc.uf] ?? '—',
        n: agg?.n ?? 0,
        score: agg?.score ?? null,
        level: agg?.level ?? null,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, locations]);
}

function sortRows(rows: TableRow[], sort: { key: SortKey; dir: 'asc' | 'desc' }): TableRow[] {
  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    if (sort.key === 'uf') cmp = a.nome.localeCompare(b.nome);
    else if (sort.key === 'regiao') cmp = a.regiao.localeCompare(b.regiao);
    else if (sort.key === 'n') cmp = a.n - b.n;
    else cmp = (a.score ?? -1) - (b.score ?? -1);
    return sort.dir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}
