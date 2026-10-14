-- 001_submissions.sql (Postgres / Supabase)
-- Mundo público anônimo (CLAUDE.md, seção "Os dois mundos"). Equivalente
-- Postgres de infra/migrations/001_submissions.sql (SQLite/D1/Turso) — mesma
-- estrutura, tipos nativos do Postgres (uuid, boolean, timestamptz, jsonb).
--
-- `respostas` guarda as 45 respostas brutas (NPLF por prática) como jsonb — é
-- o que a tela "Editar com código" precisa para repopular o questionário. Os
-- scores por dimensão/global são REDUNDANTES de propósito: dá para
-- recalculá-los a partir de `respostas` a qualquer momento
-- (packages/shared/lib/scoring.ts), mas materializá-los evita recomputar em
-- toda consulta do Painel Público e do admin.
--
-- `regiao` e `poder` também são materializados — derivados de `estado` e de
-- `setor`+`area` respectivamente, pelas mesmas funções já usadas no cliente
-- (packages/shared/lib/taxonomy.ts: derivarRegiao, derivarPoder). Quem grava
-- aqui (Edge Function, RPC) deve chamar essa mesma lógica, nunca reimplementá-la.
create extension if not exists pgcrypto; -- gen_random_uuid()

create table public.submissions (
  id                 uuid primary key default gen_random_uuid(),
  taxonomia_versao   integer not null default 2,

  -- Classificação institucional (igual a AssessmentMetadata no frontend)
  setor              text not null check (setor in ('publico','privado','terceiro','outro')),
  esfera             text check (esfera in ('federal','estadual','municipal')),             -- só setor = 'publico'
  area               text check (area in (
                       'gestao','regulacao','educacao','saude','seguranca','justica',
                       'legislativo','estatal','financas','tecnologia','industria',
                       'comercio','causas','classe'
                     )),
  atividade_estatal  text check (atividade_estatal in ('financas','tecnologia','educacao','saude','industria','comercio')), -- só area = 'estatal'
  relacao_ia         text check (relacao_ia in ('desenvolve','usa','nao_usa')),
  estado             text not null,          -- UF (2 letras) — validado na aplicação contra as 27 UFs
  porte              text not null check (porte in ('Micro','Pequena','Média','Grande')),
  termos_aceitos     boolean not null default true,

  -- Derivados no servidor a partir dos campos acima — nunca pedidos ao usuário
  regiao             text check (regiao in ('Norte','Nordeste','Centro-Oeste','Sudeste','Sul')),
  poder              text check (poder in ('executivo','judiciario','legislativo')),         -- só setor = 'publico'

  -- Respostas e scores
  respostas          jsonb not null,          -- { "1.1": "N"|"P"|"L"|"F", ... } — 45 práticas
  score_global       double precision not null,
  score_gov          double precision not null,
  score_tec          double precision not null,
  score_seg          double precision not null,
  score_edu          double precision not null,
  score_eco          double precision not null,

  -- Fluxo administrativo (ver Tela "Gestão de dados" / ação "Reclassificar")
  revisar            boolean not null default false,

  created_at         timestamptz not null default now()
  -- `updated_at` chega só na 002_edit_code.sql — antes de existir edição,
  -- uma submission nunca mudava.
);

create index idx_submissions_estado     on public.submissions(estado);
create index idx_submissions_regiao     on public.submissions(regiao);
create index idx_submissions_setor      on public.submissions(setor);
create index idx_submissions_porte      on public.submissions(porte);
create index idx_submissions_created_at on public.submissions(created_at);
create index idx_submissions_revisar    on public.submissions(revisar) where revisar;
