-- 000_stub_auth.sql — NÃO faz parte das migrations reais.
-- Reproduz, no minimo necessário, o que o Supabase já provisiona sozinho
-- (schema auth, tabela auth.users, função auth.uid()) só para validar
-- 001-006 num Postgres comum via Docker. Numa instância Supabase real
-- (hospedada ou self-hosted na VPS), este arquivo NUNCA é executado —
-- auth.* já existe, gerenciado pelo GoTrue.
-- Supabase também provisiona estas 3 roles de banco (o PostgREST assume uma
-- delas por request, conforme o JWT): anon (sem login), authenticated
-- (sessão válida) e service_role (ignora RLS — só no backend/Edge Function).
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end;
$$;

create schema if not exists auth;

create table auth.users (
  id                uuid primary key default gen_random_uuid(),
  email             text unique,
  encrypted_password text,
  raw_user_meta_data jsonb,
  created_at        timestamptz not null default now(),
  last_sign_in_at   timestamptz
);

-- Em produção, auth.uid() lê o JWT da sessão atual (claim "sub"). Aqui,
-- simulável via `set local request.jwt.claim.sub = '<uuid>'` dentro de
-- uma transação, imitando o que o PostgREST faz por request.
create function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- Numa instância Supabase real (hospedada ou self-hosted via
-- supabase/docker), a imagem supabase/postgres já roda, na primeira
-- inicialização, os scripts que criam estas 3 roles E concedem a elas
-- privilégio de tabela em public/auth (RLS é a segunda camada, mais fina,
-- por cima disso — sem o GRANT aqui, nenhuma policy chega a ser avaliada).
-- Num Postgres comum (como este container de teste), isso não existe por
-- padrão, então replicamos manualmente só para validar 001-006.
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;
