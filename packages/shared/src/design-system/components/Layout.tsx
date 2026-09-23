import type { ReactNode } from 'react';
import { AlertTriangle, Check, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react';
import { cx } from '../tokens';

/** Envolve telas que usam o sistema: aplica fonte, cor de texto e fundo do MMGIA sem afetar o resto do app. */
export function DsRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mg-root', className)}>{children}</div>;
}

/** Cabeçalho de página: eyebrow opcional, título, descrição e ações à direita. */
export function PageHeader({ eyebrow, title, description, actions, level = 'h1' }: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** h1 em páginas públicas; h3 no admin e nas perguntas do fluxo. */
  level?: 'h1' | 'h2' | 'h3';
}) {
  const cls = { h1: 'mg-h1', h2: 'mg-h2', h3: 'mg-h3' }[level];
  return (
    <div className="mg-pagehead">
      <div>
        {eyebrow && <p className="mg-eyebrow">{eyebrow}</p>}
        <h1 className={cls}>{title}</h1>
        {description && <p className="mg-lead" style={{ maxWidth: 640 }}>{description}</p>}
      </div>
      {actions}
    </div>
  );
}

/** Página com largura máxima de 1200px e margens do grid gov.br. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mg-page', className)}>{children}</div>;
}

/** Grade responsiva: colunas por faixa (desktop, tablet, celular). */
export function Grid({ columns, gap, children, className }: { columns: [string, string, string]; gap?: number; children: ReactNode; className?: string }) {
  const style = { ['--cols-d' as string]: columns[0], ['--cols-t' as string]: columns[1], ['--cols-m' as string]: columns[2], ...(gap !== undefined ? { gap } : {}) };
  return <div className={cx('mg-grid', className)} style={style}>{children}</div>;
}

/** Rodapé de ações. `inline` fica no fluxo no desktop e fixo no celular; sem `inline` é sempre uma faixa própria. */
export function ActionBar({ children, inline = false }: { children: ReactNode; inline?: boolean }) {
  return (
    <div className={cx('mg-actionbar', inline && 'mg-actionbar--inline')}>
      <div>{children}</div>
    </div>
  );
}

/** Trilha de etapas do onboarding. No celular só a etapa atual mostra o rótulo. */
export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mg-steps" aria-label="Etapas">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        return (
          <li key={label} className={done ? 'done' : undefined} aria-current={n === current ? 'step' : undefined}>
            <span className="n">{done ? <Check className="mg-ico mg-ico-sm" aria-hidden="true" /> : n}</span>
            <span className="t">{label}</span>
            {n < steps.length && <span className={cx('line', done && 'done')} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

type BannerTone = 'critical' | 'good' | 'attention' | 'info';
const BANNER_ICON: Record<BannerTone, LucideIcon> = { critical: XCircle, good: CheckCircle2, attention: AlertTriangle, info: Info };

/** Mensagem em linha: ícone + título + texto. Erro usa role="alert"; sucesso, role="status". */
export function Banner({ tone, title, children }: { tone: BannerTone; title: ReactNode; children?: ReactNode }) {
  const Icon = BANNER_ICON[tone];
  const role = tone === 'critical' ? 'alert' : tone === 'good' ? 'status' : undefined;
  return (
    <div className={`mg-banner mg-banner--${tone}`} role={role}>
      <Icon className="mg-ico" aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  );
}
