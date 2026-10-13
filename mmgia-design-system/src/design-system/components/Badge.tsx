import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Scale, XCircle, type LucideIcon } from 'lucide-react';
import { DIMENSIONS, type DimensionId, type ScoreLevel } from '../../types';
import { LEVEL_LABELS, LEVEL_RISK, NPLF, cx, type Level, type Status } from '../tokens';

type Tone = 'default' | 'neutral' | 'brand' | 'outline';

interface BadgeProps {
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}

/** Etiqueta neutra. A cor, quando existe, fica só no marcador ou no ícone. */
export function Badge({ tone = 'default', icon: Icon, className, children }: BadgeProps) {
  return (
    <span className={cx('mg-badge', tone !== 'default' && `mg-badge--${tone}`, className)}>
      {Icon && <Icon className="mg-ico" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Categórica: identifica a dimensão (quadrado dim-* + nome curto). Nunca indica bom/ruim. */
export function DimensionBadge({ dimension, full = false }: { dimension: DimensionId; full?: boolean }) {
  const d = DIMENSIONS[dimension];
  return <span className={`mg-badge mg-badge--${dimension}`}>{full ? d.name : d.shortName}</span>;
}

/** Ordinal: nível de maturidade 0–5 (quadrado level-* + rótulo). */
export function LevelBadge({ level, showLabel = true }: { level: Level; showLabel?: boolean }) {
  return (
    <span className={`mg-badge mg-badge--l${level}`}>
      Nível {level}
      {showLabel && ` · ${LEVEL_LABELS[level]}`}
    </span>
  );
}

const STATUS_ICON: Record<Status, LucideIcon> = {
  good: CheckCircle2,
  attention: AlertTriangle,
  serious: AlertTriangle,
  critical: XCircle,
};

/** Status: sempre ícone + rótulo. A cor nunca comunica sozinha. */
export function StatusBadge({ status, children }: { status: Status; children: ReactNode }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`mg-badge mg-badge--${status}`}>
      <Icon className="mg-ico" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Risco correspondente a um nível (ex.: nível 3 → "Risco moderado"). */
export function RiskBadge({ level }: { level: Level }) {
  const r = LEVEL_RISK[level];
  return <StatusBadge status={r.status}>{r.label}</StatusBadge>;
}

/** Letra NPLF em quadrado da rampa ordinal. */
export function NplfBadge({ value }: { value: ScoreLevel }) {
  const key = value === 'F' ? 'f' : value.toLowerCase();
  return (
    <span className={`mg-badge mg-badge--${key} mg-badge--square`} title={NPLF[value].label}>
      {value}
    </span>
  );
}

/** Referência legal de uma prática (ex.: "LGPD Art. 20"). */
export function LegalBadge({ children }: { children: ReactNode }) {
  return <Badge tone="outline" icon={Scale}>{children}</Badge>;
}
