/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LuSearch,
  LuBookOpen,
  LuCalendar,
  LuShare2,
  LuBookmark,
  LuChevronRight,
  LuTrendingUp,
  LuFlame,
  LuArrowRight
} from 'react-icons/lu';

const Search = LuSearch as any;
const BookOpen = LuBookOpen as any;
const Calendar = LuCalendar as any;
const Share2 = LuShare2 as any;
const Bookmark = LuBookmark as any;
const ChevronRight = LuChevronRight as any;
const TrendingUp = LuTrendingUp as any;
const Flame = LuFlame as any;
const ArrowRight = LuArrowRight as any;
import { SEED_NEWS, NewsItem } from '../types';

export default function NewsBlog() {
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const trendHashtags = [
    '#RegulacaoIA', '#ENIA2026', '#AIActEuropeu', '#LGPD2026', '#PL2338', '#GovTechBr', '#IAGenerativaEtica'
  ];

  // Filtering news
  const filteredNews = SEED_NEWS.filter((item) => {
    const matchesCategory = activeCategory === 'todas' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featured = SEED_NEWS.find(n => n.featured) || SEED_NEWS[0];
  const regularList = filteredNews.filter(n => n.id !== featured.id || activeCategory !== 'todas');

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 px-6 font-sans select-none" id="news-blog-root">
      
      {/* 1. TITLE & SUBTITLE */}
      <div className="max-w-7xl mx-auto mb-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="blog-header-search">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400">curadoria_diária_editorial</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            Notícias de Regulamentação e IA
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Boletins atualizados sobre IA, diretrizes éticas brasileiras, LGPD e mercado nacional.
          </p>
        </div>

        {/* Search Input bar */}
        <div className="relative w-full md:max-w-xs flex items-center" id="search-bar-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar boletins..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-primary placeholder:text-slate-400 pl-10 text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
        </div>
      </div>

      {/* 2. TRENDING HASHTAGS ROW */}
      <div className="max-w-7xl mx-auto mb-8 bg-slate-900 border border-slate-800 rounded-2xl py-3 px-5 flex items-center gap-4 text-white overflow-x-auto whitespace-nowrap" id="trending-row">
        <div className="flex items-center gap-1 font-mono text-[9px] uppercase font-bold text-brand-accent shrink-0 select-none">
          <Flame className="w-4.5 h-4.5 text-orange-500 animate-pulse inline" />
          <span>Trending:</span>
        </div>
        <div className="flex gap-3 text-[10px] font-mono text-slate-400 select-none">
          {trendHashtags.map((tag) => (
            <span key={tag} className="hover:text-white cursor-pointer select-none">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Category filters line */}
        <div className="flex flex-wrap gap-2 justify-center" id="category-pills">
          {['todas', 'regulação', 'governança', 'tecnologia', 'mercado'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full text-xs font-mono font-bold uppercase border transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. FEATURED SPOTLIGHT GRID (Only shown when category is 'todas') */}
        {activeCategory === 'todas' && !searchTerm && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="featured-spotlight">
            
            {/* Main Featured Big Card (Left 7cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#0C3D6E] text-white px-3 py-1 rounded">
                    Destaque: {featured.category}
                  </span>
                  <span className="font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {featured.date}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-950 font-sans tracking-tight leading-tight pt-2">
                  {featured.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed font-light">
                  {featured.excerpt}
                </p>
              </div>

              <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center text-xs font-mono text-slate-500">
                <span>Curadoria: <strong className="text-slate-700">{featured.source}</strong></span>
                <a
                  href="https://google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-brand-primary flex items-center gap-1.5 hover:underline"
                >
                  Ler na fonte completa
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Adjacent Highlights List (Right 5cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="featured-adjacent">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-brand-primary border-b border-slate-50 pb-2">Outras Manchetes em Alta</h4>
                
                <div className="divide-y divide-slate-100">
                  {SEED_NEWS.slice(1, 4).map((item) => (
                    <div key={item.id} className="py-3 cursor-pointer group">
                      <span className="font-mono text-[8px] uppercase font-bold text-blue-600 block mb-0.5">{item.category}</span>
                      <h5 className="font-sans font-bold text-xs text-slate-800 leading-snug group-hover:text-brand-primary transition">
                        {item.title}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">{item.date} · {item.source}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-primary">
                <span>Curadoria verificada voluntária</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
        )}

        {/* 4. REGULAR LATEST MATRIX LIST */}
        <div className="space-y-4" id="latest-news-list">
          <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">Toda a Curadoria Editorial ({filteredNews.length})</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-72"
                id={`all-news-card-${item.id}`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-[9px] font-bold px-2.5 py-1 bg-slate-950 text-white rounded uppercase">
                      {item.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {item.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-950 font-sans tracking-tight leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-light">
                    {item.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Fonte: <strong className="text-slate-600">{item.source}</strong></span>
                  <a
                    href="https://google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-brand-primary hover:underline flex items-center"
                  >
                    fontes
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
