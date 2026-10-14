-- 004_news.sql
-- Notícias curadas (Fase B) — mapeia 1:1 para a interface NewsItem do frontend
-- (packages/shared/types.ts): titulo=title, resumo=excerpt, fonte=source,
-- categoria=category. `featured` do frontend vira status='destaque' aqui, não
-- uma coluna booleana à parte — evita o estado inválido "destaque mas não aprovada".
--
-- `resumo` existe por obrigação de direitos autorais (CLAUDE.md, Fase 8.3): nunca
-- o texto completo da matéria, sempre um resumo curto que credita e linka a fonte.
CREATE TABLE news_items (
  id          TEXT PRIMARY KEY,
  titulo      TEXT NOT NULL,
  resumo      TEXT NOT NULL,
  fonte       TEXT NOT NULL,                       -- ex: "Agência Senado"
  url         TEXT NOT NULL,                        -- link para a fonte original
  tags        TEXT,                                 -- JSON array de hashtags
  categoria   TEXT CHECK(categoria IN ('regulação','governança','tecnologia','mercado')),
  status      TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','aprovada','rejeitada','destaque')),
  publicado_em INTEGER,
  curado_por  TEXT REFERENCES admin_users(id),
  created_at  INTEGER NOT NULL
);

-- status: fila de curadoria filtra por 'pendente'; feed público só mostra
-- 'aprovada'/'destaque' ordenado por publicado_em.
CREATE INDEX idx_news_status       ON news_items(status);
CREATE INDEX idx_news_publicado_em ON news_items(publicado_em);
