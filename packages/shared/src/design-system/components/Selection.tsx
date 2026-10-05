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
  /** Linha compacta (rádio à esquerda, nome e descrição) para listas longas — use dentro de `OptionList`. */
  row?: boolean;
  /** Linha com nome à esquerda e valor à direita (ex.: faixas de porte) — use dentro de `OptionList`. */
  inline?: boolean;
  /** Valor à direita, só para `inline` (ex.: "até 19"). */
  trailing?: ReactNode;
  disabled?: boolean;
}

/** Opção em card, para grupos exclusivos (role="radio" dentro de um RadioGroup). */
export function OptionCard({ checked, onSelect, title, description, icon: Icon, leading, list, centered, row, inline, trailing, disabled }: OptionCardProps) {
  if (row) {
    return (
      <button type="button" role="radio" aria-checked={checked} aria-disabled={disabled || undefined} disabled={disabled} onClick={onSelect} className="mg-option mg-option--sector">
        <span className="mg-option-check" aria-hidden="true">{checked && <Check className="mg-ico" />}</span>
        <span className="mg-title">{title}</span>
        {description && <span className="mg-small mg-muted">{description}</span>}
      </button>
    );
  }

  if (inline) {
    return (
      <button type="button" role="radio" aria-checked={checked} aria-disabled={disabled || undefined} disabled={disabled} onClick={onSelect} className="mg-option mg-option--inline">
        <span className="mg-option-check" aria-hidden="true">{checked && <Check className="mg-ico" />}</span>
        <span className="mg-title" style={{ flex: 1 }}>{title}</span>
        {trailing && <span className="mg-small mg-muted">{trailing}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cx('mg-option', list && 'mg-option--list', centered && 'mg-option--centered')}
    >
      {Icon && <span className="mg-option-ico"><Icon className="mg-ico" aria-hidden="true" /></span>}
      {leading}
      <span className="mg-title">{title}</span>
      {description && <span className="mg-small mg-muted">{description}</span>}
      <span className="mg-option-check" aria-hidden="true">{checked && <Check className="mg-ico" />}</span>
    </button>
  );
}

/** Lista em linhas (borda única, divisórias) para opções com descrição longa — ex.: áreas do setor público. */
export function OptionList({ label, children, footer }: { label: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mg-sector-list">
      <div role="radiogroup" aria-label={label}>{children}</div>
      {footer && <div className="mg-option-note" style={{ padding: '0 16px 14px 46px', margin: 0 }}>{footer}</div>}
    </div>
  );
}

/** Grupo de rádio acessível: setas movem a seleção. */
export function RadioGroup({ label, columns, children, onKeyNav, required }: {
  label: string;
  /** Colunas por faixa: desktop, tablet, celular (ex.: ['repeat(4,1fr)','repeat(2,1fr)','1fr']). */
  columns: [string, string, string];
  children: ReactNode;
  onKeyNav?: (direction: 1 | -1) => void;
  required?: boolean;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onKeyNav) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); onKeyNav(1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); onKeyNav(-1); }
  };
  const style = { ['--cols-d' as string]: columns[0], ['--cols-t' as string]: columns[1], ['--cols-m' as string]: columns[2], gap: 12 };
  return (
    <div className="mg-grid" role="radiogroup" aria-label={label} aria-required={required || undefined} style={style} onKeyDown={onKeyDown}>
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
