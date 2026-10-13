import type { KeyboardEvent, ReactNode } from 'react';
import { Check, type LucideIcon } from 'lucide-react';
import { cx } from '../tokens';

interface OptionCardProps {
  checked: boolean;
  onSelect: () => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Conteúdo à esquerda do título (ex.: NplfBadge). */
  leading?: ReactNode;
  /** No celular vira linha (badge à esquerda, texto à direita) — use na escala NPLF. */
  list?: boolean;
  centered?: boolean;
}

/** Opção em card, para grupos exclusivos (role="radio" dentro de um RadioGroup). */
export function OptionCard({ checked, onSelect, title, description, icon: Icon, leading, list, centered }: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cx('mg-option', list && 'mg-option--list')}
      style={centered ? { alignItems: 'center', textAlign: 'center' } : undefined}
    >
      {Icon && <span className="mg-option-ico"><Icon className="mg-ico" aria-hidden="true" /></span>}
      {leading}
      <span className="mg-title">{title}</span>
      {description && <span className="mg-small mg-muted">{description}</span>}
      <span className="mg-option-check" aria-hidden="true">{checked && <Check className="mg-ico" />}</span>
    </button>
  );
}

/** Grupo de rádio acessível: setas movem a seleção. */
export function RadioGroup({ label, columns, children, onKeyNav }: {
  label: string;
  /** Colunas por faixa: desktop, tablet, celular (ex.: ['repeat(4,1fr)','repeat(2,1fr)','1fr']). */
  columns: [string, string, string];
  children: ReactNode;
  onKeyNav?: (direction: 1 | -1) => void;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onKeyNav) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); onKeyNav(1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); onKeyNav(-1); }
  };
  const style = { ['--cols-d' as string]: columns[0], ['--cols-t' as string]: columns[1], ['--cols-m' as string]: columns[2], gap: 12 };
  return (
    <div className="mg-grid" role="radiogroup" aria-label={label} style={style} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}

/** Pílula de filtro ou escolha curta (setor, UF, categoria). */
export function Pill({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="mg-pill" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}

interface SegmentedOption<V extends string> { value: V; label: ReactNode; icon?: LucideIcon; count?: number }

/** Alternância de visualização (Mapa/Grade, Pendentes/Aprovados). */
export function Segmented<V extends string>({ label, options, value, onChange }: { label: string; options: SegmentedOption<V>[]; value: V; onChange: (v: V) => void }) {
  return (
    <div className="mg-seg" role="group" aria-label={label}>
      {options.map(({ value: v, label: l, icon: Icon, count }) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
          {Icon && <Icon className="mg-ico mg-ico-sm" aria-hidden="true" />}
          {l}
          {count !== undefined && <span className="mg-count">{count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Abas de uma mesma página. */
export function Tabs<V extends string>({ tabs, value, onChange }: { tabs: { value: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <div className="mg-tabs" role="tablist">
      {tabs.map((t) => (
        <a
          key={t.value}
          href={`#${t.value}`}
          role="tab"
          aria-selected={t.value === value}
          onClick={(e) => { e.preventDefault(); onChange(t.value); }}
        >
          {t.label}
        </a>
      ))}
    </div>
  );
}
