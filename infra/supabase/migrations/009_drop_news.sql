-- 009_drop_news.sql (Postgres / Supabase)
-- Remove a funcionalidade de notícias (Fase B do CLAUDE.md original) por
-- decisão do produto: sem agregador de verdade, a tela só mostraria boletins
-- fabricados ou uma fila permanentemente vazia — nem o app público chegou a
-- ter uma rota /noticias (o componente que existia foi removido antes por
-- mostrar conteúdo fictício). Derruba a tabela e as policies de
-- 004_news.sql/006_rls_policies.sql; não editamos as migrations antigas
-- (já aplicadas), só desfazemos numa nova.
drop policy if exists "anon le noticias aprovadas" on public.news_items;
drop policy if exists "admin le todas as noticias" on public.news_items;
drop policy if exists "gestor+ cura noticias" on public.news_items;

drop table if exists public.news_items;
