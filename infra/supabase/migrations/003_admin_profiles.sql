-- 003_admin_profiles.sql (Postgres / Supabase)
-- Mundo administrativo identificado (CLAUDE.md, "Os dois mundos") — ISOLADO
-- de submissions por design: nenhuma tabela deste arquivo tem FK para
-- submissions, e submissions não tem FK para cá.
--
-- A IDENTIDADE do admin (e-mail, senha, sessão/JWT, recuperação de senha) é
-- gerenciada inteiramente pelo Supabase Auth (schema auth.*, tabela
-- auth.users) — não reimplementamos nada disso aqui, ao contrário da versão
-- SQLite/D1 deste projeto (infra/migrations/003_admin.sql), que tinha
-- admin_users+admin_sessions próprios. admin_profiles só guarda os campos
-- específicos do produto que o Auth não tem: nome de exibição e o papel
-- (RBAC). auth.users já tem email, senha (com hash), last_sign_in_at,
-- created_at — não duplicar nenhum desses aqui.
create table public.admin_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  role        text not null check (role in ('super_admin','gestor','leitor')),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_admin_profiles_ativo on public.admin_profiles(ativo);

-- Toda vez que alguém é criado no Supabase Auth (convite, cadastro), ganha
-- automaticamente um admin_profile com o papel menos privilegiado ('leitor').
-- Promover a gestor/super_admin é sempre uma ação explícita de um
-- super_admin já existente depois — nunca automática.
create function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, nome, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email), 'leitor');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();

-- Papel do usuário autenticado atual, ou NULL se não for um admin ativo —
-- usado pelas policies de RLS em 006_rls_policies.sql em vez de repetir o
-- mesmo subselect em cada policy.
create function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_profiles where id = auth.uid() and ativo;
$$;
