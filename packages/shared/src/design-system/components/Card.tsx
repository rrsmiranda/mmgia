import type { HTMLAttributes, ReactNode } from 'react';
import { CheckCircle2, FileText, Target, XCircle, AlertTriangle, type LucideIcon } from 'lucide-react';
import type { Practice } from '../../types';
import { cx, type Status } from '../tokens';
import { DimensionBadge, LegalBadge } from './Badge';

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Sem padding: use com CardHeader / CardBody / CardFooter ou tabelas. */
  flush?: boolean;
  large?: boolean;
  as?: 'section' | 'article' | 'div';
}

/** Superfície base: surface-raised, borda surface-deep, raio 8px, sem sombra. */
export function Card({ flush, large, as: Tag = 'section', className, children, ...rest }: CardProps) {
  return (
    <Tag className={cx('mg-card', flush && 'mg-card--flush', large && 'mg-card--lg', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, actions, level = 2 }: { title: ReactNode; actions?: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <div className="mg-card-head">
      <H className="mg-title">{title}</H>
      {actions}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mg-card-body', className)}>{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="mg-card-foot">{children}</div>;
}

/** Indicador: rótulo em caixa alta + valor tabular + contexto. */
export function KpiCard({ label, value, unit, meta }: { label: string; value: ReactNode; unit?: string; meta?: ReactNode }) {
  return (
    <div className="mg-card mg-kpi">
      <p className="mg-label">{label}</p>
      <div className="mg-kpi-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {meta && <p className="mg-kpi-meta">{meta}</p>}
    </div>
  );
}

const INSIGHT_ICON: Record<Status, LucideIcon> = { critical: XCircle, good: CheckCircle2, attention: Target, serious: AlertTriangle };
const INSIGHT_CLASS: Record<Status, string> = { critical: 'is-critical', good: 'is-good', attention: 'is-attention', serious: 'is-serious' };

/** Insight do painel: ícone na cor de status + rótulo; nunca cor de dimensão. */
export function InsightCard({ status, label, title, children }: { status: Status; label: string; title: ReactNode; children?: ReactNode }) {
  const Icon = INSIGHT_ICON[status];
  return (
    <article className={cx('mg-card mg-card--insight', INSIGHT_CLASS[status])}>
      <p className="mg-insight-head"><Icon className="mg-ico mg-ico-sm" aria-hidden="true" />{label}</p>
      <p className="mg-title" style={{ marginTop: 10 }}>{title}</p>
      {children && <p className="mg-small mg-muted" style={{ marginTop: 4 }}>{children}</p>}
    </article>
  );
}

/** Card da prática: dimensão, referência legal, código, nome, descrição, critério e evidência. */
export function PracticeCard({ practice, position, headingLevel = 2 }: { practice: Practice; position?: string; headingLevel?: 1 | 2 | 3 }) {
  const H = (`h${headingLevel}` as 'h1' | 'h2' | 'h3');
  return (
    <Card as="article" large>
      <div className="mg-row" style={{ gap: 8, marginBottom: 20 }}>
        <DimensionBadge dimension={practice.dimensionId} />
        {practice.legalReference && <LegalBadge>{practice.legalReference}</LegalBadge>}
        <span className="mg-spacer" />
        <span className="mg-code">{practice.id}{position ? ` · ${position}` : ''} · nível {practice.level}</span>
      </div>
      <H className="mg-h3">{practice.name}</H>
      <p className="mg-lead" style={{ marginTop: 8 }}>{practice.description}</p>
      <div className="mg-crit">
        <p className="mg-label"><CheckCircle2 className="mg-ico mg-ico-sm" aria-hidden="true" />Critério de verificação</p>
        <p>{practice.criterion}</p>
      </div>
      <div className="mg-meta">
        <span><FileText className="mg-ico mg-ico-sm" aria-hidden="true" />Evidência sugerida: {practice.evidence}</span>
      </div>
    </Card>
  );
}
