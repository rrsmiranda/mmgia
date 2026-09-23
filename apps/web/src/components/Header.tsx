/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ClipboardList, Menu, Moon, Sun, X } from 'lucide-react';
import { Button } from '@mmgia/shared/design-system';

interface HeaderProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  hasActiveAssessment: boolean;
  onGoToOnboarding: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { id: 'como', label: 'Como funciona' },
  { id: 'dimensoes', label: 'Dimensões' },
  { id: 'privacidade', label: 'Privacidade' },
  { id: 'metodologia', label: 'Metodologia' },
  { id: 'faq', label: 'FAQ' },
];

export default function Header({
  currentTab,
  onChangeTab,
  hasActiveAssessment,
  onGoToOnboarding,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string, isTab: boolean = false) => {
    setMobileMenuOpen(false);
    if (isTab) {
      onChangeTab(sectionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentTab !== 'home') {
      onChangeTab('home');
      // Delay slightly to allow the home page to mount before scrolling
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header id="site-header" className="mg-root" style={{ position: 'fixed', insetInline: 0, top: 0, zIndex: 50 }}>
      {/* Barra institucional */}
      <div className="mg-govbar">
        <div>
          <strong>MMGIA</strong>
          <span className="sep" aria-hidden="true" />
          <span className="mg-hide-tablet">Diagnóstico de código aberto alinhado à ENIA 2026-2029</span>
        </div>
      </div>

      {/* Cabeçalho principal */}
      <div className="mg-header">
        <div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavClick('home-hero'); }}
            className="mg-logo"
            aria-label="MMGIA início"
          >
            <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand)', color: 'var(--on-brand)', fontWeight: 800 }}>M</span>
            <span className="mg-logo-word">
              <b>MMG<span style={{ color: 'var(--brand)' }}>IA</span></b>
            </span>
          </a>

          <nav className="mg-nav" aria-label="Principal">
            {NAV_LINKS.map((link) => (
              <a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); handleNavClick(link.id); }}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mg-header-actions">
            <button type="button" className="mg-iconbtn" onClick={onToggleTheme} title="Alternar tema" aria-label="Alternar tema claro/escuro">
              {theme === 'dark' ? <Sun className="mg-ico" aria-hidden="true" /> : <Moon className="mg-ico" aria-hidden="true" />}
            </button>

            <Button variant="secondary" onClick={() => handleNavClick('mapa', true)}>Painel público</Button>

            <Button variant="primary" icon={ClipboardList} onClick={onGoToOnboarding}>
              {hasActiveAssessment ? 'Retomar avaliação' : 'Iniciar avaliação'}
            </Button>

            <button
              type="button"
              className="mg-iconbtn mg-menu-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="mg-ico" aria-hidden="true" /> : <Menu className="mg-ico" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile (abaixo de 992px) */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Principal (celular)"
          className="mg-only-mobile mg-stack"
          style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-deep)', padding: 16 }}
        >
          {NAV_LINKS.map((link) => (
            <Button key={link.id} variant="ghost" fullWidth onClick={() => handleNavClick(link.id)}>{link.label}</Button>
          ))}
          <Button variant="ghost" fullWidth onClick={() => handleNavClick('mapa', true)}>Painel público</Button>
          <Button variant="primary" fullWidth icon={ClipboardList} onClick={() => { setMobileMenuOpen(false); onGoToOnboarding(); }} style={{ marginTop: 8 }}>
            {hasActiveAssessment ? 'Retomar avaliação' : 'Iniciar avaliação'}
          </Button>
        </nav>
      )}
    </header>
  );
}
