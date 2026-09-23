import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ícone à esquerda (ações). */
  icon?: LucideIcon;
  /** Ícone à direita (avanço, ex.: ArrowRight). */
  iconRight?: LucideIcon;
  /** Botão só com ícone: exige aria-label. */
  iconOnly?: boolean;
  /** Sobre fundo `ink` (hero): ajusta o secundário. */
  onInk?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
export type LinkButtonProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function classes({ variant = 'secondary', size = 'md', iconOnly, onInk, fullWidth }: CommonProps, extra?: string) {
  return cx(
    'mg-btn',
    `mg-btn--${variant}`,
    size === 'sm' && 'mg-btn--sm',
    size === 'lg' && 'mg-btn--lg',
    iconOnly && 'mg-btn--icon',
    onInk && 'mg-btn--on-ink',
    extra,
  );
}

function Content({ icon: Icon, iconRight: IconRight, iconOnly, children }: CommonProps) {
  return (
    <>
      {Icon && <Icon className="mg-ico mg-ico-sm" aria-hidden="true" />}
      {!iconOnly && children}
      {IconRight && <IconRight className="mg-ico mg-ico-sm" aria-hidden="true" />}
    </>
  );
}

/** Botão único do sistema: 3 variantes + desabilitado (atributo `disabled`) + destrutivo. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const { variant, size, icon, iconRight, iconOnly, onInk, fullWidth, className, children, type = 'button', style, ...rest } = props;
  return (
    <button
      ref={ref}
      type={type}
      className={classes({ variant, size, iconOnly, onInk }, className)}
      style={fullWidth ? { width: '100%', ...style } : style}
      {...rest}
    >
      <Content icon={icon} iconRight={iconRight} iconOnly={iconOnly}>{children}</Content>
    </button>
  );
});

/** Mesmo visual do Button para navegação (`<a href>`). */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(props, ref) {
  const { variant, size, icon, iconRight, iconOnly, onInk, fullWidth, className, children, style, ...rest } = props;
  return (
    <a
      ref={ref}
      className={classes({ variant, size, iconOnly, onInk }, className)}
      style={fullWidth ? { width: '100%', ...style } : style}
      {...rest}
    >
      <Content icon={icon} iconRight={iconRight} iconOnly={iconOnly}>{children}</Content>
    </a>
  );
});
