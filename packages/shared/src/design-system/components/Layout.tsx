import type { ReactNode } from 'react';
import { AlertTriangle, Check, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';
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
export function Steps({ steps, current, compact, onSelect, isDisabled, ariaLabel }: {
  steps: string[];
  current: number;
  /** Só a etapa atual mostra o nome; no celular só a etapa atual aparece. */
  compact?: boolean;
  /** Quando informado, cada etapa vira um botão clicável. */
  onSelect?: (index: number) => void;
  isDisabled?: (index: number) => boolean;
  /** Rótulo acessível completo por etapa (ex.: "Tecnologia — 3 de 9 respondidas"). Sem isso, usa o texto visível. */
  ariaLabel?: (index: number) => string;
}) {
  return (
    <ol className={cx('mg-steps', compact && 'mg-steps--compact')} aria-label="Etapas">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const content = (
          <>
            <span className="n">{done ? <Check className="mg-ico mg-ico-sm" aria-hidden="true" /> : n}</span>
            <span className="t">{label}</span>
          </>
        );
        return (
          <li key={label} className={done ? 'done' : undefined} aria-current={n === current ? 'step' : undefined}>
            {onSelect ? (
              <button type="button" onClick={() => onSelect(i)} disabled={isDisabled?.(i)} aria-label={ariaLabel?.(i) ?? label}>
                {content}
              </button>
            ) : content}
            {n < steps.length && <span className={cx('line', done && 'done')} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

/** Cabeçalho do fluxo (onboarding e questionário): logotipo, trilha de etapas e "Sair". */
export function FlowHeader({ steps, current, onExit, exitLabel = 'Sair', onSelect, isDisabled, ariaLabel, progress }: {
  steps: string[];
  current: number;
  onExit: () => void;
  exitLabel?: string;
  onSelect?: (index: number) => void;
  isDisabled?: (index: number) => boolean;
  ariaLabel?: (index: number) => string;
  /** 0–100; quando informado, mostra uma barra fina de progresso abaixo do cabeçalho. */
  progress?: number;
}) {
  return (
    <div className="mg-flowbar">
      <div className="mg-flowbar-row">
        <span className="mg-logo" aria-hidden="true">
          <span className="mg-flow-logo-sq">M</span>
          <span className="mg-logo-word"><b>MMG<span style={{ color: 'var(--brand)' }}>IA</span></b></span>
        </span>
        <Steps steps={steps} current={current} compact onSelect={onSelect} isDisabled={isDisabled} ariaLabel={ariaLabel} />
        <button type="button" className="mg-flow-exit" onClick={onExit}>
          <X className="mg-ico" aria-hidden="true" />
          <span className="mg-exit-label">{exitLabel}</span>
        </button>
      </div>
      {progress !== undefined && (
        <div className="mg-progress" role="img" aria-label={`${Math.round(progress)}% concluído`}>
          <span style={{ width: `${progress}%`, transition: 'width .4s ease' }} />
        </div>
      )}
    </div>
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
