/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ArrowRight, Calendar, Flame, Search } from 'lucide-react';
import { SEED_NEWS } from '@mmgia/shared/types';
import { Badge, Card, DsRoot, Field, Input, LinkButton, Page, Pill } from '@mmgia/shared/design-system';

const TREND_HASHTAGS = ['#RegulacaoIA', '#ENIA2026', '#AIActEuropeu', '#LGPD2026', '#PL2338', '#GovTechBr', '#IAGenerativaEtica'];
const CATEGORIES = ['todas', 'regulação', 'governança', 'tecnologia', 'mercado'];

export default function NewsBlog() {
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNews = SEED_NEWS.filter((item) => {
    const matchesCategory = activeCategory === 'todas' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featured = SEED_NEWS.find((n) => n.featured) || SEED_NEWS[0];
  const showFeatured = activeCategory === 'todas' && !searchTerm;

  return (
    <DsRoot>
      <Page>
        <Card style={{ marginBottom: 16 }} id="blog-header-search">
          <div className="mg-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="mg-eyebrow">Curadoria editorial diária</p>
              <h1 className="mg-h3" style={{ marginTop: 4 }}>Notícias de regulamentação e IA</h1>
              <p className="mg-small mg-muted" style={{ marginTop: 4 }}>
                Boletins atualizados sobre IA, diretrizes éticas brasileiras, LGPD e mercado nacional.
              </p>
            </div>
            <div style={{ width: 260, maxWidth: '100%' }} id="search-bar-wrapper">
              <Field label="Pesquisar">
                {({ id }) => (
                  <Input id={id} icon={Search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pesquisar boletins..." />
                )}
              </Field>
            </div>
          </div>
        </Card>

        <div className="mg-row" style={{ gap: 16, padding: '12px 20px', background: 'var(--ink)', color: 'var(--on-ink)', borderRadius: 'var(--radius-lg)', marginBottom: 24, overflowX: 'auto', whiteSpace: 'nowrap' }} id="trending-row">
          <span className="mg-row" style={{ gap: 6, flexShrink: 0 }}>
            <Flame className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--on-ink-accent)' }} />
            <span className="mg-code" style={{ color: 'var(--on-ink-accent)', textTransform: 'uppercase' }}>Trending:</span>
          </span>
          {TREND_HASHTAGS.map((tag) => (
            <span key={tag} className="mg-code" style={{ color: 'var(--on-ink-muted)' }}>{tag}</span>
          ))}
        </div>

        <div className="mg-row" style={{ gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }} id="category-pills">
          {CATEGORIES.map((cat) => (
            <Pill key={cat} pressed={activeCategory === cat} onClick={() => setActiveCategory(cat)}>{cat}</Pill>
          ))}
        </div>

        {showFeatured && (
          <div className="mg-grid" style={{ ['--cols-d' as string]: '1.4fr 1fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 24, marginBottom: 32 }} id="featured-spotlight">
            <Card large flush>
              <div style={{ padding: 'var(--space-6)' }}>
                <div className="mg-row" style={{ justifyContent: 'space-between' }}>
                  <Badge tone="brand">Destaque: {featured.category}</Badge>
                  <span className="mg-row mg-code mg-muted" style={{ gap: 4 }}><Calendar className="mg-ico mg-ico-sm" aria-hidden="true" />{featured.date}</span>
                </div>
                <h2 className="mg-h3" style={{ marginTop: 16 }}>{featured.title}</h2>
                <p className="mg-small mg-muted" style={{ marginTop: 12 }}>{featured.excerpt}</p>
              </div>
              <div className="mg-row" style={{ justifyContent: 'space-between', padding: 'var(--space-6)', borderTop: '1px solid var(--surface-deep)', background: 'var(--surface-sunken)' }}>
                <span className="mg-small mg-muted">Curadoria: <strong>{featured.source}</strong></span>
                <LinkButton href="https://google.com" target="_blank" rel="noreferrer" variant="ghost" iconRight={ArrowRight}>Ler na fonte completa</LinkButton>
              </div>
            </Card>

            <Card id="featured-adjacent">
              <p className="mg-eyebrow">Outras manchetes em alta</p>
              <div className="mg-stack" style={{ gap: 0, marginTop: 12 }}>
                {SEED_NEWS.slice(1, 4).map((item) => (
                  <div key={item.id} style={{ padding: '12px 0', borderTop: '1px solid var(--surface-deep)' }}>
                    <span className="mg-code">{item.category}</span>
                    <p className="mg-title" style={{ marginTop: 4 }}>{item.title}</p>
                    <span className="mg-small mg-muted" style={{ display: 'block', marginTop: 4 }}>{item.date} · {item.source}</span>
                  </div>
                ))}
              </div>
              <div className="mg-row" style={{ justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--surface-deep)' }}>
                <span className="mg-small" style={{ fontWeight: 700 }}>Curadoria verificada voluntária</span>
                <span style={{ width: 10, height: 10, borderRadius: 'var(--radius-pill)', background: 'var(--status-good)', display: 'inline-block' }} />
              </div>
            </Card>
          </div>
        )}

        <h2 className="mg-h3">Toda a curadoria editorial ({filteredNews.length})</h2>
        <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(3,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 16, marginTop: 16 }} id="latest-news-list">
          {filteredNews.map((item) => (
            <Card key={item.id} id={`all-news-card-${item.id}`}>
              <div className="mg-row" style={{ justifyContent: 'space-between' }}>
                <Badge>{item.category}</Badge>
                <span className="mg-code">{item.date}</span>
              </div>
              <p className="mg-title" style={{ marginTop: 12 }}>{item.title}</p>
              <p className="mg-small mg-muted" style={{ marginTop: 8 }}>{item.excerpt}</p>
              <div className="mg-row" style={{ justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--surface-deep)' }}>
                <span className="mg-small mg-muted">Fonte: <strong>{item.source}</strong></span>
                <LinkButton href="https://google.com" target="_blank" rel="noreferrer" variant="ghost" size="sm">fontes</LinkButton>
              </div>
            </Card>
          ))}
        </div>
      </Page>
    </DsRoot>
  );
}
