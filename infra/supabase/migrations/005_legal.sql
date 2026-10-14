-- 005_legal.sql (Postgres / Supabase)
-- Base legal: cada uma das 45 práticas pode ter várias referências normativas
-- (LGPD, AI Act da UE, ISO/IEC 42001, ENIA — ver CLAUDE.md Fase 1).
-- `practice_id` é o id interno da prática (ex. "1.7"), não o código oficial
-- exibido na tela (ex. "4.2", calculado por getOfficialPracticeCode em
-- packages/shared/lib/scoring.ts). As 45 práticas (nome, descrição,
-- critério, nível) continuam fixas em código, não viram dado editável no
-- banco — só a base legal é.
create table public.legal_refs (
  id          uuid primary key default gen_random_uuid(),
  practice_id text not null,                 -- ex: "1.1", "3.4" — bate com Practice.id
  norma       text not null,                 -- ex: "LGPD", "AI Act EU", "ISO/IEC 42001", "ENIA"
  artigo      text not null,                 -- ex: "Art. 20", "Cláusula 6.2"
  descricao   text not null,                 -- como a prática se correlaciona com a norma
  url         text,
  updated_by  uuid references public.admin_profiles(id),
  updated_at  timestamptz not null default now()
);
create index idx_legal_practice on public.legal_refs(practice_id);
