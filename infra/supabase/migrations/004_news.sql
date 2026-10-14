-- 004_news.sql (Postgres / Supabase)
-- Notícias curadas (Fase B) — mapeia 1:1 para a interface NewsItem do
-- frontend (packages/shared/types.ts): titulo=title, resumo=excerpt,
-- fonte=source, categoria=category. `featured` do frontend vira
-- status='destaque' aqui, não uma coluna booleana à parte — evita o estado
-- inválido "destaque mas não aprovada".
--
-- `resumo` existe por obrigação de direitos autorais (CLAUDE.md, Fase 8.3):
-- nunca o texto completo da matéria, sempre um resumo curto que credita e
-- linka a fonte.
create table public.news_items (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  resumo       text not null,
  fonte        text not null,                 -- ex: "Agência Senado"
  url          text not null,                 -- link para a fonte original
  tags         text[] not null default '{}',
  categoria    text check (categoria in ('regulação','governança','tecnologia','mercado')),
  status       text not null default 'pendente' check (status in ('pendente','aprovada','rejeitada','destaque')),
  publicado_em timestamptz,
  curado_por   uuid references public.admin_profiles(id),
  created_at   timestamptz not null default now()
);

-- status: fila de curadoria filtra por 'pendente'; feed público só mostra
-- 'aprovada'/'destaque' ordenado por publicado_em.
create index idx_news_status       on public.news_items(status);
create index idx_news_publicado_em on public.news_items(publicado_em);
