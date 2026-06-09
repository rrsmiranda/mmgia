/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LuMenu, LuX, LuSun, LuMoon, LuClipboardList } from 'react-icons/lu';

// Cast icons for React 19 safety
const MenuIcon = LuMenu as any;
const XIcon = LuX as any;
const SunIcon = LuSun as any;
const MoonIcon = LuMoon as any;
const ClipboardListIcon = LuClipboardList as any;

interface HeaderProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  hasActiveAssessment: boolean;
  onGoToOnboarding: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({
  currentTab,
  onChangeTab,
  hasActiveAssessment,
  onGoToOnboarding,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isHomeHeaderTransparent = currentTab === 'home' && !scrolled;

  return (
    <header
      id="site-header"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isHomeHeaderTransparent 
          ? 'bg-transparent border-transparent py-2' 
          : 'bg-[#101828]/95 backdrop-blur-md shadow-lg border-b border-white/5 py-0'
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Principal">
        {/* LOGO */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavClick('home-hero'); }}
          className="group flex items-center gap-3" 
          aria-label="MMGIA início"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B98E0] text-lg font-black text-white shadow-hard transition-transform group-hover:-translate-y-0.5">M</span>
          <span className="text-lg font-black tracking-tight text-white">MMG<span className="text-[#1B98E0]">IA</span></span>
        </a>

        {/* CENTER LINKS — DESKTOP */}
        <div className="hidden items-center gap-7 lg:flex">
          <button 
            onClick={() => handleNavClick('como')}
            className="text-sm font-semibold text-white/75 hover:text-white transition cursor-pointer"
          >
            Como funciona
          </button>
          <button 
            onClick={() => handleNavClick('dimensoes')}
            className="text-sm font-semibold text-white/75 hover:text-white transition cursor-pointer"
          >
            Dimensões
          </button>
          <button 
            onClick={() => handleNavClick('privacidade')}
            className="text-sm font-semibold text-white/75 hover:text-white transition cursor-pointer"
          >
            Privacidade
          </button>
          <button 
            onClick={() => handleNavClick('metodologia')}
            className="text-sm font-semibold text-white/75 hover:text-white transition cursor-pointer"
          >
            Metodologia
          </button>
          <button 
            onClick={() => handleNavClick('faq')}
            className="text-sm font-semibold text-white/75 hover:text-white transition cursor-pointer"
          >
            FAQ
          </button>
        </div>

        {/* RIGHT CTA MODULE — DESKTOP */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 border border-white/20 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center h-10 w-10"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <SunIcon className="w-4.5 h-4.5 text-amber-400" /> : <MoonIcon className="w-4.5 h-4.5 text-white" />}
          </button>

          <button 
            onClick={() => handleNavClick('mapa', true)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition cursor-pointer"
          >
            Painel público
          </button>
          
          <button 
            onClick={onGoToOnboarding}
            className="rounded-full bg-[#1B98E0] px-5 py-2.5 text-sm font-black text-white hover:bg-white hover:text-[#101828] transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#1B98E0]/10"
          >
            <ClipboardListIcon className="w-4 h-4 shrink-0" />
            <span>{hasActiveAssessment ? 'Retomar avaliação' : 'Iniciar avaliação'}</span>
          </button>
        </div>

        {/* MOBILE CONTROLS (HAMBURGER & THEME TOGGLE) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onToggleTheme}
            className="p-2 border border-white/20 rounded-xl text-white/85 hover:text-white transition-all cursor-pointer flex items-center justify-center h-10 w-10"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <SunIcon className="w-4.5 h-4.5 text-amber-400" /> : <MoonIcon className="w-4.5 h-4.5 text-white" />}
          </button>

          <button 
            id="menu-button" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white cursor-pointer hover:bg-white/5 active:scale-95 transition" 
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU ACCORDION */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu" 
          className="mx-5 mb-4 rounded-2xl border border-white/10 bg-[#101828]/95 p-4 shadow-panel backdrop-blur lg:hidden animate-in fade-in slide-in-from-top-3 duration-250"
        >
          <div className="grid gap-2 text-left">
            <button 
              onClick={() => handleNavClick('como')}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 text-left transition w-full"
            >
              Como funciona
            </button>
            <button 
              onClick={() => handleNavClick('dimensoes')}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 text-left transition w-full"
            >
              Dimensões
            </button>
            <button 
              onClick={() => handleNavClick('privacidade')}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 text-left transition w-full"
            >
              Privacidade
            </button>
            <button 
              onClick={() => handleNavClick('metodologia')}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 text-left transition w-full"
            >
              Metodologia
            </button>
            <button 
              onClick={() => handleNavClick('faq')}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 text-left transition w-full"
            >
              FAQ
            </button>

            <button 
              onClick={() => handleNavClick('mapa', true)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 text-left transition w-full"
            >
              Painel público
            </button>

            <button 
              onClick={() => { setMobileMenuOpen(false); onGoToOnboarding(); }}
              className="mt-2 rounded-xl bg-[#1B98E0] px-4 py-3 text-center text-sm font-black text-white hover:bg-white hover:text-[#101828] transition flex items-center justify-center gap-1.5"
            >
              <ClipboardListIcon className="w-4 h-4" />
              <span>{hasActiveAssessment ? 'Retomar avaliação' : 'Iniciar avaliação'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
