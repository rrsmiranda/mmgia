/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Último recurso: sem isto, um erro não tratado em qualquer componente (ex.: um
 * campo nulo inesperado) derruba a árvore inteira do React e deixa a tela em
 * branco, sem nenhuma indicação do que aconteceu. Fica no nível mais alto
 * possível (main.tsx, fora do <App/>) para também cobrir erros do próprio App.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[MMGIA] Erro não tratado:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#F2F4F7',
          fontFamily: 'Raleway, system-ui, sans-serif',
          color: '#13293D',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#006494',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              margin: '0 auto 20px',
              fontSize: 20,
            }}
          >
            M
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Algo deu errado nesta tela</h1>
          <p style={{ fontSize: 14, color: '#475467', margin: '0 0 24px', lineHeight: 1.5 }}>
            Nenhuma resposta sua foi perdida — as avaliações ficam salvas no seu navegador. Recarregue a página para
            continuar; se o problema persistir, volte à tela inicial.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 8,
              border: 0,
              background: '#006494',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Recarregar página
          </button>
          {import.meta.env.DEV && (
            <pre
              style={{
                marginTop: 24,
                padding: 12,
                textAlign: 'left',
                fontSize: 11,
                background: '#13293D',
                color: '#E6EDF5',
                borderRadius: 8,
                overflowX: 'auto',
                maxHeight: 240,
              }}
            >
              {this.state.error.stack ?? this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
