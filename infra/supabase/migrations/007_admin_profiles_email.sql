-- 007_admin_profiles_email.sql (Postgres / Supabase)
-- A tela "Gestão de usuários" (CLAUDE.md, Tela 12) precisa listar o e-mail de
-- cada admin. auth.users.email existe, mas o schema `auth` não é exposto pela
-- API REST (PGRST_DB_SCHEMAS=public,graphql_public) — o navegador não
-- consegue ler de lá. Em vez de uma função RPC cruzando schemas, denormaliza
-- o e-mail em admin_profiles no momento da criação da conta: mais simples, e
-- e-mail de admin não é um dado que muda com frequência.
alter table public.admin_profiles add column email text;

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, nome, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email), new.email, 'leitor');
  return new;
end;
$$;

-- Backfill dos admins já criados antes desta migration (o trigger só roda em
-- INSERTs novos em auth.users).
update public.admin_profiles ap
set email = u.email
from auth.users u
where u.id = ap.id and ap.email is null;
