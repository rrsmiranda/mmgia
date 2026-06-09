/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LuClipboardList,
  LuShieldCheck,
  LuTrendingUp,
  LuDatabase,
  LuGraduationCap,
  LuArrowRight,
  LuFileText,
  LuLandmark,
  LuScale,
  LuMonitor,
  LuGithub,
  LuCpu,
  LuCheck,
  LuNetwork,
  LuBuilding2,
  LuListChecks
} from 'react-icons/lu';

// Safely cast icons for React 19 compatibility
const ClipboardList = LuClipboardList as any;
const ShieldCheck = LuShieldCheck as any;
const TrendingUp = LuTrendingUp as any;
const Database = LuDatabase as any;
const GraduationCap = LuGraduationCap as any;
const ArrowRight = LuArrowRight as any;
const FileText = LuFileText as any;
const Landmark = LuLandmark as any;
const Scale = LuScale as any;
const Monitor = LuMonitor as any;
const Github = LuGithub as any;
const Cpu = LuCpu as any;
const Check = LuCheck as any;
const Network = LuNetwork as any;
const Building2 = LuBuilding2 as any;
const ListChecks = LuListChecks as any;
const BarChart3 = LuTrendingUp as any;

interface LandingPageProps {
  onStartOnboarding: () => void;
  onChangeTab: (tab: string) => void;
  theme: 'light' | 'dark';
}

export default function LandingPage({ onStartOnboarding, onChangeTab }: LandingPageProps) {
  const [sliderScore, setSliderScore] = useState<number>(1.82);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "A avaliação é realmente anônima?",
      a: "Sim. O banco de dados não possui colunas para IP, nome, CNPJ ou e-mail. O middleware stripIdentity descarta headers identificadores antes que qualquer handler processe o request. É uma impossibilidade técnica, não uma promessa de política."
    },
    {
      q: "Quanto tempo leva para completar?",
      a: "Entre 20 e 40 minutos, dependendo do conhecimento prévio sobre as práticas da organização. O progresso é salvo automaticamente no browser — você pode pausar e retomar a qualquer momento."
    },
    {
      q: "Preciso criar uma conta ou fazer login?",
      a: "Não. A avaliação é iniciada sem cadastro. Ao final, você recebe um código único para editar sua avaliação depois — sem e-mail, sem senha."
    },
    {
      q: "O que acontece com os dados enviados?",
      a: "Os scores são armazenados de forma anônima para compor o painel público de benchmark nacional. Nenhum dado permite identificar qual organização respondeu. Os dados são publicados sob licença CC BY 4.0."
    },
    {
      q: "A plataforma tem algum custo?",
      a: "Não. A plataforma é gratuita, de código aberto (licença MIT) e mantida com custos operacionais próximos de zero usando Cloudflare Workers e Turso."
    },
    {
      q: "Posso editar minha avaliação depois?",
      a: "Sim, usando o código de avaliação gerado ao final. Ele é a única forma de recuperar e editar — guarde-o em local seguro. Sem o código, não há recuperação, porque o sistema não pede e-mail."
    }
  ];

  return (
    <div className="antialiased text-[#101828] bg-[#F9FAFB] min-h-screen selection:bg-[#1B98E0] selection:text-white" id="landing-page-root">
      
      {/* 1. HERO SECTION — Dark layout with grid mask and mesh gradient */}
      <section className="relative isolate min-h-screen overflow-hidden bg-[#101828] pt-28 text-white clip-slant" id="home-hero">
        <div className="absolute inset-0 -z-10 grid-mask opacity-60 pointer-events-none"></div>
        <div className="absolute left-1/2 top-10 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#006494]/30 blur-3xl pointer-events-none"></div>
        <div className="absolute right-[-12%] top-20 -z-10 h-[430px] w-[430px] rounded-full bg-[#247BA0]/25 blur-3xl pointer-events-none"></div>
        
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-32 pt-14 sm:px-8 lg:grid-cols-12 lg:pb-40 lg:pt-24">
          <div className="lg:col-span-6 text-left">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#12B76A]"></span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[.22em] text-white/80">modelo_maturidade_ia · enia 2026–2029</span>
            </div>
            
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.055em] sm:text-6xl lg:text-7xl leading-[1.05]">
              Avalie a governança de <span className="text-[#1B98E0]">IA</span> com rigor, privacidade e ação.
            </h1>
            
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75">
              Diagnóstico gratuito e anônimo em 5 dimensões, 45 práticas e 6 níveis de maturidade. O score é calculated no seu navegador — sem cadastro, sem identificação e com relatório PDF ao final.
            </p>
            
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button 
                onClick={onStartOnboarding}
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#1B98E0] px-7 text-base font-black text-white shadow-hard transition hover:-translate-y-0.5 hover:bg-white hover:text-[#101828] cursor-pointer"
              >
                Iniciar avaliação
              </button>
              <a href="#metodologia" className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 px-7 text-base font-black text-white transition hover:bg-white/10">
                Ver metodologia
              </a>
            </div>
            
            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-white/65">
              <div className="flex -space-x-2">
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#101828] bg-[#006494] font-mono text-[10px] font-black text-white">SP</span>
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#101828] bg-[#06AED4] font-mono text-[10px] font-black text-white">RJ</span>
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#101828] bg-[#12B76A] font-mono text-[10px] font-black text-white">MG</span>
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#101828] bg-[#1B98E0] font-mono text-[10px] font-black text-white">+24</span>
              </div>
              <span><strong className="text-white">1.847</strong> avaliações · 27 estados · <strong className="text-white">100%</strong> gratuito</span>
            </div>
          </div>
 
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-xl">
              <div className="absolute -left-4 -top-4 h-full w-full rounded-xl bg-[#1B98E0]"></div>
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white p-3 text-[#101828] shadow-panel">
                <div className="rounded-lg bg-[#101828] p-5 text-white text-left">
                  <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-[.18em] text-white/50">score exemplo</div>
                      <div className="mt-1 text-4xl font-black tracking-tight font-mono">{sliderScore.toFixed(2)}</div>
                    </div>
                    <span className="rounded-full bg-[#12B76A]/15 px-3 py-1 font-mono text-[11px] font-bold text-[#12B76A]">nível_3 · definido</span>
                  </div>
                  
                  <div className="grid gap-3">
                    <div className="rounded-lg bg-white/5 p-4">
                      <div className="mb-2 flex justify-between font-mono text-xs text-white/55">
                        <span>Governança regulatória</span>
                        <span>25%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#006494]" style={{ width: `${(sliderScore / 3) * 115 > 100 ? 100 : (sliderScore / 3) * 115}%` }}></div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-4">
                      <div className="mb-2 flex justify-between font-mono text-xs text-white/55">
                        <span>Tecnologia e inovação</span>
                        <span>20%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#12B76A]" style={{ width: `${(sliderScore / 3) * 87 > 100 ? 100 : (sliderScore / 3) * 87}%` }}></div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-4">
                      <div className="mb-2 flex justify-between font-mono text-xs text-white/55">
                        <span>Segurança e confiança</span>
                        <span>25%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#F04438]" style={{ width: `${(sliderScore / 3) * 103 > 100 ? 100 : (sliderScore / 3) * 103}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-white/5 p-4">
                        <div className="font-mono text-xs text-white/55">Educação</div>
                        <div className="mt-1 text-2xl font-black font-mono">{(1.5 * (sliderScore / 1.82)).toFixed(1)}</div>
                      </div>
                      <div className="rounded-lg bg-white/5 p-4">
                        <div className="font-mono text-xs text-white/55">Ecossistema</div>
                        <div className="mt-1 text-2xl font-black font-mono">{(1.4 * (sliderScore / 1.82)).toFixed(1)}</div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5">
                      <input 
                        type="range" min="0.5" max="3" step="0.05"
                        value={sliderScore} onChange={(e) => setSliderScore(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#1B98E0]"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 p-4">
                  <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-4 text-left">
                    <div className="font-mono text-2xl font-black text-[#006494]">45</div>
                    <div className="mt-1 text-xs font-bold text-[#667085]">práticas</div>
                  </div>
                  <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-4 text-left">
                    <div className="font-mono text-2xl font-black text-[#12B76A]">5</div>
                    <div className="mt-1 text-xs font-bold text-[#667085]">dimensões</div>
                  </div>
                  <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-4 text-left">
                    <div className="font-mono text-2xl font-black text-[#247BA0]">6</div>
                    <div className="mt-1 text-xs font-bold text-[#667085]">níveis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP SECTION — Overlaps the hero slant line */}
      <section className="relative z-10 -mt-20 px-5 sm:px-8" id="stats-banner">
        <div className="mx-auto grid max-w-7xl grid-cols-2 overflow-hidden rounded-xl border border-[#EAECF0] bg-white shadow-panel lg:grid-cols-4">
          <div className="border-b border-r border-[#EAECF0] p-7 lg:border-b-0 text-left">
            <div className="font-mono text-4xl font-black text-[#101828]">1.847</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[.18em] text-[#667085]">Avaliações</div>
          </div>
          <div className="border-b border-[#EAECF0] p-7 lg:border-b-0 lg:border-r text-left">
            <div className="font-mono text-4xl font-black text-[#101828]">45</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[.18em] text-[#667085]">Práticas</div>
          </div>
          <div className="border-r border-[#EAECF0] p-7 text-left">
            <div className="font-mono text-4xl font-black text-[#101828]">5</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[.18em] text-[#667085]">Dimensões</div>
          </div>
          <div className="p-7 text-left">
            <div className="font-mono text-4xl font-black text-[#12B76A]">100%</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[.18em] text-[#667085]">Gratuito</div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="como" className="px-5 py-28 sm:px-8 lg:py-36 bg-[#F9FAFB]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-12 text-left">
              <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#247BA0]">Como funciona</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl text-[#101828]">Da primeira pergunta ao relatório em 30 minutos.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#667085] lg:col-span-12 text-left">
              O fluxo foi de fato redesenhado como uma jornada operacional: contexto mínimo, avaliação guiada, score local e relatório exportável. O objetivo é transformar maturidade em decisões, não em burocracia.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-[#EAECF0] bg-white p-7 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-5xl font-black text-[#EAECF0]">01</span>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#1B98E0] text-white">
                    <Building2 className="h-6 w-6" />
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#101828]">Contexto institucional</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">Natureza jurídica, estado, setor e porte. Quatro perguntas objetivas — nenhuma de identidade.</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] font-bold text-[#667085]">
                <span className="rounded-md bg-[#F9FAFB] px-2 py-1">sem_nome</span>
                <span className="rounded-md bg-[#F9FAFB] px-2 py-1">sem_cnpj</span>
                <span className="rounded-md bg-[#F9FAFB] px-2 py-1">sem_email</span>
              </div>
            </article>

            <article className="rounded-xl border border-[#EAECF0] bg-white p-7 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-5xl font-black text-[#EAECF0]">02</span>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#006494] text-white">
                    <ListChecks className="h-6 w-6" />
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#101828]">Avaliação guiada</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">45 práticas com escala NPLF: Nulo, Parcial, Larga e Total. O progresso fica salvo automaticamente no browser.</p>
              </div>
              <div className="mt-4"></div>
            </article>

            <article className="rounded-xl border border-#EAECF0 bg-white p-7 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-5xl font-black text-[#EAECF0]">03</span>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#12B76A] text-white">
                    <BarChart3 className="h-6 w-6" />
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#101828]">Score e diagnóstico</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">Nível de maturidade de 0 a 5, gaps priorizados e posicionamento frente ao benchmark do setor.</p>
              </div>
              <div className="mt-4"></div>
            </article>

            <article className="rounded-xl border border-[#EAECF0] bg-white p-7 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-5xl font-black text-[#EAECF0]">04</span>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#101828] text-white">
                    <FileText className="h-6 w-6 text-white" />
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#101828]">Relatório PDF</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">Gerado localmente no browser, em versão executiva ou técnica. Nenhum dado identificador é transmitido ao servidor.</p>
              </div>
              <div className="mt-4"></div>
            </article>
          </div>
        </div>
      </section>

      {/* 4. DIMENSIONS SECTION */}
      <section id="dimensoes" className="bg-white px-5 py-28 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center text-left">
            <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#006494]">Dimensões avaliadas</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl text-[#101828]">5 dimensões, 45 práticas, 6 níveis.</h2>
            <p className="mt-5 text-lg leading-8 text-[#667085]">A maturidade é observada por um conjunto balanceado de governança, tecnologia, confiança, cultura e cooperação.</p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            <article className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-7 lg:col-span-4 text-left flex flex-col justify-between">
              <div>
                <Landmark className="h-8 w-8 text-[#006494]" />
                <h3 className="mt-5 text-xl font-black text-[#101828]">Governança regulatória</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">Políticas, comitês, auditorias e frameworks de gestão de riscos.</p>
              </div>
              <div className="mt-5 flex gap-2 font-mono text-[11px] font-bold">
                <span className="rounded-md bg-white px-2 py-1 text-[#006494]">25%</span>
                <span className="rounded-md bg-white px-2 py-1 text-[#667085]">9 práticas</span>
              </div>
            </article>

            {/* Middle Mock Panel */}
            <article className="relative overflow-hidden rounded-xl bg-[#101828] p-8 text-white lg:col-span-4 lg:row-span-2 text-left">
              <div className="absolute inset-0 grid-mask opacity-60 pointer-events-none"></div>
              <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[.2em] text-white/45">painel de leitura</p>
                  <h3 className="mt-4 text-3xl font-black tracking-tight">Maturidade como mapa de ação.</h3>
                  <p className="mt-4 text-sm leading-6 text-white/65">O resultado consolida score global, gaps por dimensão, nível CMMI-like e recomendações para avançar ao próximo estágio.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-end justify-between font-mono">
                    <span className="text-sm text-white/50">score_global</span>
                    <span className="text-5xl font-black">1.82</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-full w-[61%] rounded-full bg-[#1B98E0]"></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-white/50">
                    <span>0 inexistente</span>
                    <span className="text-[#1B98E0] font-black">3 definido</span>
                    <span>5 otimizado</span>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-7 lg:col-span-4 text-left flex flex-col justify-between">
              <div>
                <Cpu className="h-8 w-8 text-[#12B76A]" />
                <h3 className="mt-5 text-xl font-black text-[#101828]">Tecnologia e inovação</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">MLOps, gestão de portfólio de IA, P&D e infraestrutura.</p>
              </div>
              <div className="mt-5 flex gap-2 font-mono text-[11px] font-bold">
                <span className="rounded-md bg-white px-2 py-1 text-[#12B76A]">20%</span>
                <span className="rounded-md bg-white px-2 py-1 text-[#667085]">9 práticas</span>
              </div>
            </article>

            <article className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-7 lg:col-span-4 text-left flex flex-col justify-between">
              <div>
                <ShieldCheck className="h-8 w-8 text-[#F04438]" />
                <h3 className="mt-5 text-xl font-black text-[#101828]">Segurança e confiança</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">LGPD, viés algorítmico, red teaming e contestação.</p>
              </div>
              <div className="mt-5 flex gap-2 font-mono text-[11px] font-bold">
                <span className="rounded-md bg-white px-2 py-1 text-[#F04438]">25%</span>
                <span className="rounded-md bg-white px-2 py-1 text-[#667085]">9 práticas</span>
              </div>
            </article>

            <article className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-7 lg:col-span-4 text-left flex flex-col justify-between">
              <div>
                <GraduationCap className="h-8 w-8 text-[#7A5AF8]" />
                <h3 className="mt-5 text-xl font-black text-[#101828]">Educação e cultura</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">Letramento em dados, capacitação por função e gestão de mudança.</p>
              </div>
              <div className="mt-5 flex gap-2 font-mono text-[11px] font-bold">
                <span className="rounded-md bg-white px-2 py-1 text-[#7A5AF8]">15%</span>
                <span className="rounded-md bg-white px-2 py-1 text-[#667085]">9 práticas</span>
              </div>
            </article>

            <article className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-7 lg:col-span-4 text-left flex flex-col justify-between">
              <div>
                <Network className="h-8 w-8 text-[#1B98E0]" />
                <h3 className="mt-5 text-xl font-black text-[#101828]">Cooperação e ecossistema</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">Parcerias acadêmicas, benchmarking e políticas públicas.</p>
              </div>
              <div className="mt-5 flex gap-2 font-mono text-[11px] font-bold">
                <span className="rounded-md bg-white px-2 py-1 text-[#1B98E0]">15%</span>
                <span className="rounded-md bg-white px-2 py-1 text-[#667085]">9 práticas</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 5. SERVICES */}
      <section id="servicos" className="px-5 py-28 sm:px-8 lg:py-36 bg-[#F9FAFB]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start text-left">
            <div className="lg:sticky lg:top-28 lg:col-span-4">
              <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#12B76A]">Serviços</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl text-[#101828]">O que a plataforma entrega.</h2>
              <p className="mt-5 text-lg leading-8 text-[#667085]">Uma base prática para equipes públicas, privadas e do terceiro setor medirem governança de IA e priorizarem evolução.</p>
            </div>
            
            <div className="grid gap-5 lg:col-span-8">
              <article className="rounded-xl border border-[#EAECF0] bg-white p-8 shadow-sm md:p-10">
                <div className="grid gap-8 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-7">
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#101828] text-white">
                      <ClipboardList className="h-7 w-7 text-[#1B98E0]" />
                    </div>
                    <h3 className="mt-6 text-2xl font-black text-[#101828]">Avaliação Institucional</h3>
                    <p className="mt-3 text-sm leading-6 text-[#667085]">Diagnóstico completo das práticas de IA, mapeando riscos e oportunidades em 5 dimensões com peso calibrado.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 md:col-span-5 text-center font-mono">
                    <div className="rounded-xl bg-[#F9FAFB] p-4">
                      <div className="font-mono text-3xl font-black text-[#006494]">5</div>
                      <div className="text-xs font-bold text-[#667085]">dimensões</div>
                    </div>
                    <div className="rounded-xl bg-[#F9FAFB] p-4">
                      <div className="font-mono text-3xl font-black text-[#12B76A]">45</div>
                      <div className="text-xs font-bold text-[#667085]">práticas</div>
                    </div>
                    <div className="rounded-xl bg-[#F9FAFB] p-4">
                      <div className="font-mono text-3xl font-black text-[#247BA0]">6</div>
                      <div className="text-xs font-bold text-[#667085]">níveis</div>
                    </div>
                  </div>
                </div>
              </article>
              
              <div className="grid gap-5 md:grid-cols-2">
                <article className="rounded-xl border border-[#EAECF0] bg-white p-8 shadow-sm">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#12B76A] text-white">
                    <Scale className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-[#101828]">Alinhamento regulatório</h3>
                  <p className="mt-3 text-sm leading-6 text-[#667085]">Cada prática correlacionada com LGPD, AI Act, ISO 42001 e ENIA.</p>
                </article>
                <article className="rounded-xl border border-[#EAECF0] bg-white p-8 shadow-sm">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#006494] text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black text-[#101828]">Relatório e plano de ação</h3>
                  <p className="mt-3 text-sm leading-6 text-[#667085]">PDF com gaps priorizados, benchmark do setor e práticas para o próximo nível.</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRIVACY */}
      <section id="privacidade" className="bg-[#101828] px-5 py-28 text-white clip-slant-up sm:px-8 lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-panel">
              <div className="rounded-lg bg-[#0B1220] p-5 font-mono text-sm text-left">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#F04438]"></span>
                    <span className="h-3 w-3 rounded-full bg-[#1B98E0]"></span>
                    <span className="h-3 w-3 rounded-full bg-[#12B76A]"></span>
                  </div>
                  <span className="text-[11px] text-white/40 font-mono font-bold">POST /v1/submissions</span>
                </div>
                <div className="leading-8 text-xs sm:text-sm">
                  <div className="text-white/35">// dados armazenados</div>
                  <div><span className="text-white/55">"natureza":</span> <span className="text-[#12B76A]">"publica_estadual"</span></div>
                  <div><span className="text-white/55">"estado":</span> <span className="text-[#12B76A]">"GO"</span></div>
                  <div><span className="text-white/55">"setor":</span> <span className="text-[#12B76A]">"saude"</span></div>
                  <div><span className="text-white/55">"score_global":</span> <span className="text-[#12B76A]">1.82</span></div>
                  <div className="mt-4 border-t border-white/10 pt-3 text-white/35">// nunca coletado</div>
                  <div className="opacity-45"><span className="text-white/45">"ip_address":</span> <span className="text-[#F04438] line-through">203.0.113.42</span></div>
                  <div className="opacity-45"><span className="text-white/45">"cnpj":</span> <span className="text-[#F04438] line-through">"12.345.678/0001"</span></div>
                  <div className="opacity-45"><span className="text-white/45">"email":</span> <span className="text-[#F04438] line-through">"gestor@org.br"</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 text-left">
            <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#1B98E0]">Privacidade por design</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Sua organização nunca é identificada.</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">A arquitetura torna a identificação tecnicamente impossível. Não é uma promessa de política — é uma limitação estrutural do sistema.</p>
            <div className="mt-8 grid gap-4 text-left">
              <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
                <Monitor className="h-6 w-6 shrink-0 text-[#1B98E0]" />
                <div>
                  <h3 className="font-black">Cálculo no browser</h3>
                  <p className="mt-1 text-sm leading-6 text-white/60">Scoring roda localmente. Servidor recebe apenas números finais.</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
                <Database className="h-6 w-6 shrink-0 text-[#1B98E0]" />
                <div>
                  <h3 className="font-black">Banco sem identidade</h3>
                  <p className="mt-1 text-sm leading-6 text-white/60">Sem coluna de IP, nome ou CNPJ. k-anonimidade ≥ 5.</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
                <Github className="h-6 w-6 shrink-0 text-[#1B98E0]" />
                <div>
                  <h3 className="font-black">Código aberto</h3>
                  <p className="mt-1 text-sm leading-6 text-white/60">Qualquer equipe pode verificar no GitHub.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. METHODOLOGY */}
      <section id="metodologia" className="bg-white px-5 py-28 sm:px-8 lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 text-left">
            <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#006494]">Metodologia</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Score ponderado com rigor acadêmico.</h2>
            <p className="mt-5 text-lg leading-8 text-[#667085]">O score global é a média ponderada dos scores das 5 dimensões, onde cada dimensão é a média das respostas NPLF das suas 9 práticas.</p>
            <ul className="mt-8 grid gap-4 text-sm leading-6 text-[#667085]">
              <li className="flex gap-3">
                <Check className="h-5 w-5 shrink-0 text-[#12B76A]" />
                <span>Escala NPLF: Nulo (0), Parcial (1), Larga (2), Total (3).</span>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 shrink-0 text-[#12B76A]" />
                <span>Pesos diferenciados por dimensão: gov 25%, tec 20%, seg 25%, edu 15%, eco 15%.</span>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 shrink-0 text-[#12B76A]" />
                <span>Alinhado ao CMMI, ISO 33001 e frameworks de maturidade consolidados.</span>
              </li>
            </ul>
          </div>
          
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-5 shadow-panel">
              <div className="rounded-lg bg-white p-7 text-left">
                <div className="font-mono text-[11px] font-black uppercase tracking-[.2em] text-[#667085]">Fórmula do score global</div>
                <div className="mt-6 rounded-xl border border-[#EAECF0] bg-[#101828] p-6 text-center text-white">
                  <div className="font-mono text-sm text-white/45">Score Global =</div>
                  <div className="mt-2 text-xl font-black text-[#1B98E0] font-mono">Σ (peso_d × média_NPLF_d)</div>
                  <div className="mt-2 font-mono text-xs text-white/45">d ∈ {'{gov, tec, seg, edu, eco}'}</div>
                </div>
                <div className="mt-7 grid gap-2 font-mono text-sm">
                  <div className="flex justify-between rounded-lg bg-[#F9FAFB] px-4 py-3"><span className="text-[#667085]">gov × 0.25</span><span className="font-black text-[#006494]">0.525</span></div>
                  <div className="flex justify-between rounded-lg bg-[#F9FAFB] px-4 py-3"><span className="text-[#667085]">tec × 0.20</span><span className="font-black text-[#12B76A]">0.320</span></div>
                  <div className="flex justify-between rounded-lg bg-[#F9FAFB] px-4 py-3"><span className="text-[#667085]">seg × 0.25</span><span className="font-black text-[#F04438]">0.475</span></div>
                  <div className="flex justify-between rounded-lg bg-[#F9FAFB] px-4 py-3"><span className="text-[#667085]">edu × 0.15</span><span className="font-black text-[#7A5AF8]">0.225</span></div>
                  <div className="flex justify-between rounded-lg bg-[#F9FAFB] px-4 py-3"><span className="text-[#667085]">eco × 0.15</span><span className="font-black text-[#1B98E0]">0.210</span></div>
                  <div className="mt-2 flex justify-between rounded-xl bg-[#1B98E0] px-4 py-4"><span className="font-black text-white">Score global</span><span className="font-black text-white">1.755</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ALIGNMENT TABLE */}
      <section className="px-5 pb-28 sm:px-8 lg:pb-36 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-center">
          <div className="order-2 lg:order-1 lg:col-span-7 text-left">
            <div className="overflow-hidden rounded-xl border border-[#EAECF0] bg-white shadow-sm overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="p-4 font-mono text-[11px] uppercase tracking-[.18em] text-[#667085]">Norma</th>
                    <th className="p-4 font-mono text-[11px] uppercase tracking-[.18em] text-[#667085]">Artigos/Cláusulas</th>
                    <th className="p-4 font-mono text-[11px] uppercase tracking-[.18em] text-[#667085]">Dimensões</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0]">
                  <tr>
                    <td className="p-4 font-black">LGPD</td>
                    <td className="p-4 text-[#667085]">Art. 20, 46, 50</td>
                    <td className="p-4"><span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-[11px] font-bold text-[#006494]">gov seg</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-black">AI Act EU</td>
                    <td className="p-4 text-[#667085]">Art. 6, 9, 14, 52</td>
                    <td className="p-4"><span className="rounded-md bg-red-50 px-2 py-1 font-mono text-[11px] font-bold text-[#F04438]">seg tec</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-black">ISO 42001</td>
                    <td className="p-4 text-[#667085]">Cl. 4, 5, 6, 8, 10</td>
                    <td className="p-4"><span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-[11px] font-bold text-[#006494]">gov tec</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-black">ENIA 2026</td>
                    <td className="p-4 text-[#667085]">Eixos 1–7</td>
                    <td className="p-4"><span className="rounded-md bg-purple-50 px-2 py-1 font-mono text-[11px] font-bold text-[#7A5AF8]">todas</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-black">NIST AI RMF</td>
                    <td className="p-4 text-[#667085]">Govern, Map, Measure</td>
                    <td className="p-4"><span className="rounded-md bg-green-50 px-2 py-1 font-mono text-[11px] font-bold text-[#12B76A]">gov seg eco</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-4 lg:col-start-9 text-left">
            <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#12B76A]">Alinhamento regulatório</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] text-[#101828]">Correlação com 5 marcos normativos.</h2>
            <p className="mt-5 text-lg leading-8 text-[#667085]">Cada uma das 45 práticas é mapeada para artigos e cláusulas específicos das normas aplicáveis. O relatório mostra onde a organização está conforme e onde precisa evoluir.</p>
          </div>
        </div>
      </section>

      {/* 9. LEVELS */}
      <section className="bg-white px-5 py-28 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#247BA0]">Escala de maturidade</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl text-[#101828]">6 níveis, do inexistente ao otimizado.</h2>
          </div>
          
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 text-center">
            <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-5 text-center flex flex-col justify-between">
               <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 font-mono text-xl font-black text-[#F04438]">0</div>
              <h3 className="mt-4 font-black">Inexistente</h3>
              <p className="mt-1 font-mono text-xs text-[#667085]">0 – 0.5</p>
              <span className="mt-3 inline-flex rounded-full bg-red-50 px-3 py-1 font-mono text-[10px] font-bold text-[#F04438] justify-center">crítico</span>
            </div>
            
            <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-5 text-center flex flex-col justify-between">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-orange-100 font-mono text-xl font-black text-orange-600">1</div>
              <h3 className="mt-4 font-black">Inicial</h3>
              <p className="mt-1 font-mono text-xs text-[#667085]">0.5 – 1.0</p>
              <span className="mt-3 inline-flex rounded-full bg-orange-50 px-3 py-1 font-mono text-[10px] font-bold text-orange-600 justify-center">crítico</span>
            </div>

            <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-5 text-center flex flex-col justify-between">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 font-mono text-xl font-black text-amber-700">2</div>
              <h3 className="mt-4 font-black">Gerenciado</h3>
              <p className="mt-1 font-mono text-xs text-[#667085]">1.0 – 1.5</p>
              <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 font-mono text-[10px] font-bold text-amber-700 justify-center">alto</span>
            </div>

            <div className="relative rounded-xl border-2 border-[#101828] bg-[#101828] p-5 text-center text-white shadow-hard flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1B98E0] px-3 py-1 font-mono text-[9px] font-black uppercase text-white">meta enia</span>
              <div className="mx-auto mt-2 grid h-12 w-12 place-items-center rounded-full bg-white/15 font-mono text-xl font-black">3</div>
              <h3 className="mt-4 font-black">Definido</h3>
              <p className="mt-1 font-mono text-xs text-white/55">1.5 – 2.0</p>
              <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] font-bold text-white/80 justify-center">moderado</span>
            </div>

            <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-5 text-center flex flex-col justify-between">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100 font-mono text-xl font-black text-green-700">4</div>
              <h3 className="mt-4 font-black">Quantitativo</h3>
              <p className="mt-1 font-mono text-xs text-[#667085]">2.0 – 2.5</p>
              <span className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 font-mono text-[10px] font-bold text-green-700 justify-center">controlado</span>
            </div>

            <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-5 text-center flex flex-col justify-between">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-violet-100 font-mono text-xl font-black text-[#7A5AF8]">5</div>
              <h3 className="mt-4 font-black">Otimizado</h3>
              <p className="mt-1 font-mono text-xs text-[#667085]">2.5 – 3.0</p>
              <span className="mt-3 inline-flex rounded-full bg-violet-50 px-3 py-1 font-mono text-[10px] font-bold text-[#7A5AF8] justify-center">mínimo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PUBLIC PANEL CTA */}
      <section id="painel" className="bg-[#101828] px-5 py-24 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8 text-left">
            <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#1B98E0]">Dados agregados e anonimizados</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Acompanhe a evolução da maturidade em IA no Brasil.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">Visualize tendências por estado, setor e porte sem comprometer a privacidade das organizações respondentes.</p>
          </div>
          <div className="lg:col-span-4 lg:text-right text-left">
            <button 
              onClick={() => onChangeTab('mapa')}
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#1B98E0] px-8 text-base font-black text-white shadow-hard hover:bg-white hover:text-[#101828] transition cursor-pointer"
            >
              Ver painel público
            </button>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section id="faq" className="px-5 py-28 sm:px-8 lg:py-36 bg-[#F9FAFB]">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 text-left">
            <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#006494]">Perguntas frequentes</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl text-[#101828]">Dúvidas sobre a avaliação.</h2>
            <p className="mt-5 text-lg leading-8 text-[#667085]">Respostas rápidas para quem precisa aplicar a avaliação com segurança, transparência e autonomia.</p>
          </div>
          
          <div className="space-y-3 lg:col-span-7">
            {faqData.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="rounded-xl border border-[#EAECF0] bg-white text-left overflow-hidden">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-black text-sm sm:text-base text-[#101828] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#667085] text-lg select-none">{isOpen ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="p-5 pt-0 text-sm leading-6 text-[#667085] border-t border-[#EAECF0]/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. NEWS */}
      <section id="noticias" className="bg-white px-5 py-28 sm:px-8 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end text-left-side">
            <div className="text-left">
              <p className="font-mono text-xs font-black uppercase tracking-[.25em] text-[#12B76A]">Notícias</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl text-[#101828]">IA no Brasil e no mundo.</h2>
            </div>
            <button onClick={() => onChangeTab('mapa')} className="inline-flex items-center gap-2 font-black text-[#006494] hover:text-[#101828]">
              Ver todas <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid gap-5 lg:grid-cols-12 text-left">
            <div className="group overflow-hidden rounded-xl border border-[#EAECF0] bg-[#F9FAFB] shadow-sm lg:col-span-7 flex flex-col justify-between">
              <div className="relative min-h-[260px] bg-[#101828] p-8 text-white flex flex-col justify-end">
                <div className="absolute inset-0 grid-mask opacity-60 pointer-events-none"></div>
                <div className="relative z-10">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-white/45">Regulação · 08 Jun 2026</span>
                  <h3 className="mt-3 max-w-xl text-2xl font-black leading-tight">Marco Legal da IA avança no Senado com foco em governança de risco</h3>
                </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-white">
                <span className="font-mono text-xs font-bold text-[#667085]">Agência Senado</span>
                <span className="font-black text-[#006494] group-hover:underline">ler na fonte ↗</span>
              </div>
            </div>
            
            <div className="grid gap-5 lg:col-span-5 text-left">
              <div className="group rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-7 shadow-sm">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-[#660085] text-[#667085]">Internacional · 07 Jun 2026</span>
                <h3 className="mt-4 text-xl font-black leading-tight group-hover:text-[#006494] text-[#101828]">UE publica diretrizes do AI Act para sistemas de alto risco</h3>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#667085]">Reuters</span>
                  <span className="font-black text-[#006494] group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
              
              <div className="group rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-7 shadow-sm">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-[#667085]">Pesquisa · 05 Jun 2026</span>
                <h3 className="mt-4 text-xl font-black leading-tight group-hover:text-[#006494] text-[#101828]">Estudo mapeia maturidade em IA de 200 órgãos públicos brasileiros</h3>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#667085]">FGV</span>
                  <span className="font-black text-[#006494] group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="bg-[#0B1220] px-5 py-16 text-white sm:px-8 text-left">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1B98E0] font-black text-white shadow-hard">M</span>
                <span className="text-lg font-black">MMG<span className="text-[#1B98E0]">IA</span></span>
              </div>
              <p className="mt-5 text-sm leading-6 text-white/55">Ferramenta de código aberto para medir a maturidade em governança de IA no Brasil.</p>
            </div>
            
            <div>
              <h4 className="font-mono text-xs font-black uppercase tracking-[.2em] text-white/35">Plataforma</h4>
              <ul className="mt-5 grid gap-3 text-sm text-white/55">
                <li><button onClick={onStartOnboarding} className="hover:text-[#1B98E0] text-left">Iniciar diagnóstico</button></li>
                <li><button onClick={() => onChangeTab('mapa')} className="hover:text-[#1B98E0] text-left">Painel público</button></li>
                <li><a className="hover:text-[#1B98E0]" href="#metodologia">Metodologia</a></li>
                <li><button onClick={() => onChangeTab('opendata')} className="hover:text-[#1B98E0] text-left">Open data</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-mono text-xs font-black uppercase tracking-[.2em] text-white/35">Recursos</h4>
              <ul className="mt-5 grid gap-3 text-sm text-[#eaecf0]/55">
                <li><a className="hover:text-[#1B98E0]" href="#dimensoes">As 5 Dimensões</a></li>
                <li><a className="hover:text-[#1B98E0]" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li>
                <li><a className="hover:text-[#1B98E0]" href="#como">Como Funciona</a></li>
                <li><a className="hover:text-[#1B98E0]" href="#privacidade">Privacidade</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-mono text-xs font-black uppercase tracking-[.2em] text-white/35">Newsletter</h4>
              <p className="mt-5 text-sm leading-6 text-white/55">Atualizações sobre governança de IA.</p>
              <div className="mt-4 flex">
                <input aria-label="E-mail" type="email" placeholder="seu@email.com" className="min-w-0 flex-1 rounded-l-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#1B98E0]" />
                <button onClick={() => alert('Cadastro de newsletter demonstrativo realizado com sucesso!')} className="rounded-r-xl bg-[#1B98E0] px-5 text-sm font-black text-white hover:bg-white hover:text-[#101828]">OK</button>
              </div>
            </div>
          </div>
          
          <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
            <span className="text-sm text-white/45">© 2026 MMGIA · Código aberto</span>
            <div className="flex flex-wrap gap-2 font-mono text-[10px] font-bold text-white/45">
              <span className="rounded-md border border-white/10 px-2.5 py-1">MIT</span>
              <span className="rounded-md border border-white/10 px-2.5 py-1">CC BY 4.0</span>
              <span className="rounded-md border border-white/10 px-2.5 py-1 font-bold">ENIA 2026</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
