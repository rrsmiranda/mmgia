import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { XCircle, type LucideIcon } from 'lucide-react';
import { cx } from '../tokens';

interface FieldProps {
  label: string;
  /** id do controle; gerado se omitido (passe o mesmo id ao controle via render prop). */
  id?: string;
  help?: ReactNode;
  error?: string;
  optional?: boolean;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Rótulo acima, ajuda/erro abaixo, ligação aria automática. */
export function Field({ label, id, help, error, optional, children }: FieldProps) {
  const auto = useId();
  const controlId = id ?? `f${auto}`;
  const helpId = `${controlId}-help`;
  const hasHelp = Boolean(error || help);
  return (
    <div className={cx('mg-field', error && 'is-error')}>
      <label htmlFor={controlId}>
        {label} {optional && <span className="opt">(opcional)</span>}
      </label>
      {children({ id: controlId, describedBy: hasHelp ? helpId : undefined, invalid: Boolean(error) })}
      {hasHelp && (
        <span className="mg-field-help" id={helpId}>
          {error && <XCircle className="mg-ico mg-ico-sm" aria-hidden="true" />}
          {error ?? help}
        </span>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  /** Estilo do código anônimo (mono, caixa alta, centralizado). */
  code?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ icon: Icon, code, className, ...rest }, ref) {
  const input = <input ref={ref} className={cx('mg-input', code && 'mg-input--code', className)} {...rest} />;
  if (!Icon) return input;
  return (
    <div className="mg-control">
      <Icon className="mg-ico" aria-hidden="true" />
      {input}
    </div>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...rest }, ref) {
  return <select ref={ref} className={cx('mg-select', className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cx('mg-textarea', className)} {...rest} />;
});

export function Checkbox({ children, ...rest }: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label className="mg-check">
      <input type="checkbox" {...rest} />
      <span>{children}</span>
    </label>
  );
}
