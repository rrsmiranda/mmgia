/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from 'react';
import { cx } from '@mmgia/shared/design-system';

interface ReportPageProps {
  n: number;
  total: number;
  code: string;
  cover?: boolean;
  children: ReactNode;
}

const Logo = () => (
  <span className="mg-logo" aria-hidden="true">
    <span className="mg-flow-logo-sq">M</span>
    <span className="mg-logo-word"><b>MMG<span className="rp-logo-ia">IA</span></b></span>
  </span>
);

/** Uma página A4 do relatório — mesmo componente usado na tela e na impressão. */
export default function ReportPage({ n, total, code, cover, children }: ReportPageProps) {
  return (
    <div className="rp" data-theme="light" lang="pt-BR">
      <article className={cx('rp-page', cover && 'rp-page--cover')}>
        {!cover && (
          <header className="rp-head">
            <Logo />
            <span>Relatório de autoavaliação de maturidade em governança de IA</span>
            <span className="rp-mono">{code}</span>
          </header>
        )}
        <div className="rp-body">{children}</div>
        <footer className="rp-foot">
          <span>Autoavaliação. Não constitui certificação, auditoria ou parecer jurídico.</span>
          <span>Página {n} de {total}</span>
        </footer>
      </article>
    </div>
  );
}

export { Logo as ReportLogo };
