-- 006_rls_policies.sql (Postgres / Supabase)
-- Isolamento dos "dois mundos" reforçado no próprio banco, não só pela
-- ausência de FK: com RLS ativo e SEM NENHUMA policy, uma tabela bloqueia
-- TUDO — inclusive para o dono — a não ser que a conexão use a
-- service_role key (ignora RLS; só para uso em servidor/Edge Function de
-- confiança, NUNCA exposta ao navegador). Toda policy abaixo é uma exceção
-- explícita e mínima a essa regra padrão de "fechado".
alter table public.submissions     enable row level security;
alter table public.admin_profiles  enable row level security;
alter table public.news_items      enable row level security;
alter table public.legal_refs      enable row level security;

-- =====================================================================
-- submissions
-- =====================================================================

-- Qualquer um pode criar uma avaliação — fluxo público, sem login.
create policy "anon cria submission"
  on public.submissions for insert
  to anon
  with check (true);

-- Propositalmente NÃO existe policy de SELECT para anon na tabela. Se
-- existisse, daria pra listar/raspar todas as avaliações (mesmo anônimas,
-- isso ainda viola k-anonimidade ao cruzar colunas). A tela "Editar com
-- código" e o Painel Público passam pelas funções abaixo (security
-- definer), que só devolvem UMA linha por código exato ou um agregado com
-- sigilo k>=5 — nunca "SELECT * FROM submissions".

-- Admin autenticado com papel ativo lê, atualiza e exclui tudo (telas
-- Gestão de dados, Mapa nacional, Dados abertos, Reclassificar).
create policy "admin le submissions"
  on public.submissions for select
  to authenticated
  using (public.current_admin_role() is not null);

create policy "admin gestor+ atualiza submissions"
  on public.submissions for update
  to authenticated
  using (public.current_admin_role() in ('super_admin','gestor'))
  with check (public.current_admin_role() in ('super_admin','gestor'));

create policy "admin gestor+ exclui submissions"
  on public.submissions for delete
  to authenticated
  using (public.current_admin_role() in ('super_admin','gestor'));

-- ---- Funções RPC para o fluxo "Editar com código" ----
-- security definer: rodam com o privilégio de quem criou a função (o dono do
-- schema), não com o de quem chama — por isso conseguem fazer o SELECT/UPDATE
-- mesmo sem uma policy aberta, mas só devolvem exatamente o que o parâmetro
-- pede, nunca a tabela inteira.

create function public.find_submission_by_code_hash(p_hash text)
returns public.submissions
language sql
stable
security definer
set search_path = public
as $$
  select * from public.submissions where edit_code_hash = p_hash limit 1;
$$;
grant execute on function public.find_submission_by_code_hash(text) to anon;

create function public.update_submission_by_code_hash(
  p_hash text,
  p_setor text, p_esfera text, p_area text, p_atividade_estatal text,
  p_relacao_ia text, p_estado text, p_porte text,
  p_regiao text, p_poder text,
  p_respostas jsonb,
  p_score_global double precision, p_score_gov double precision, p_score_tec double precision,
  p_score_seg double precision, p_score_edu double precision, p_score_eco double precision
)
returns public.submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.submissions;
begin
  update public.submissions set
    setor = p_setor, esfera = p_esfera, area = p_area, atividade_estatal = p_atividade_estatal,
    relacao_ia = p_relacao_ia, estado = p_estado, porte = p_porte,
    regiao = p_regiao, poder = p_poder,
    respostas = p_respostas,
    score_global = p_score_global, score_gov = p_score_gov, score_tec = p_score_tec,
    score_seg = p_score_seg, score_edu = p_score_edu, score_eco = p_score_eco,
    updated_at = now()
  where edit_code_hash = p_hash
  returning * into result;
  return result;
end;
$$;
grant execute on function public.update_submission_by_code_hash(
  text, text, text, text, text, text, text, text, text, text, jsonb,
  double precision, double precision, double precision, double precision, double precision, double precision
) to anon;

-- ---- Função RPC para o Painel Público ----
-- Mesma regra de sigilo k>=5 do frontend (packages/shared/lib/observatory.ts,
-- K_MIN), agora garantida pelo banco: mesmo que o código do Worker/Edge
-- Function esqueça de aplicar o filtro, a função já devolve NULL nos campos
-- de score quando count < 5 — "arquitetura, não promessa de política" (FAQ
-- pública), válido também no lado do banco.
create function public.painel_aggregate(
  p_setor text default null,
  p_esfera text default null,
  p_area text default null,
  p_poder text default null,
  p_relacao_ia text default null,
  p_porte text default null,
  p_uf text default null
)
returns table (
  n bigint,
  score_global double precision, score_gov double precision, score_tec double precision,
  score_seg double precision, score_edu double precision, score_eco double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*) as n,
    case when count(*) >= 5 then avg(score_global) end,
    case when count(*) >= 5 then avg(score_gov) end,
    case when count(*) >= 5 then avg(score_tec) end,
    case when count(*) >= 5 then avg(score_seg) end,
    case when count(*) >= 5 then avg(score_edu) end,
    case when count(*) >= 5 then avg(score_eco) end
  from public.submissions
  where (p_setor is null or setor = p_setor)
    and (p_esfera is null or esfera = p_esfera)
    and (p_area is null or area = p_area)
    and (p_poder is null or poder = p_poder)
    and (p_relacao_ia is null or relacao_ia = p_relacao_ia)
    and (p_porte is null or porte = p_porte)
    and (p_uf is null or estado = p_uf);
$$;
grant execute on function public.painel_aggregate(text, text, text, text, text, text, text) to anon;

-- =====================================================================
-- admin_profiles
-- =====================================================================

-- Todo admin autenticado lê o PRÓPRIO perfil — a UI precisa saber o papel
-- de quem está logado para decidir o que mostrar.
create policy "admin le o proprio perfil"
  on public.admin_profiles for select
  to authenticated
  using (id = auth.uid());

-- Só super_admin lê a lista inteira (tela Gestão de usuários) — igual ao
-- guard de rota que o CLAUDE.md pede ("apenas super_admin acessa esta tela"),
-- só que agora também no banco, não só escondendo o link na UI.
create policy "super_admin le todos os perfis"
  on public.admin_profiles for select
  to authenticated
  using (public.current_admin_role() = 'super_admin');

create policy "super_admin edita perfis"
  on public.admin_profiles for update
  to authenticated
  using (public.current_admin_role() = 'super_admin')
  with check (public.current_admin_role() = 'super_admin');

-- =====================================================================
-- news_items
-- =====================================================================

create policy "anon le noticias aprovadas"
  on public.news_items for select
  to anon
  using (status in ('aprovada','destaque'));

create policy "admin le todas as noticias"
  on public.news_items for select
  to authenticated
  using (public.current_admin_role() is not null);

-- gestor/super_admin fazem toda a curadoria (aprovar/rejeitar/destacar/editar).
create policy "gestor+ cura noticias"
  on public.news_items for all
  to authenticated
  using (public.current_admin_role() in ('super_admin','gestor'))
  with check (public.current_admin_role() in ('super_admin','gestor'));

-- =====================================================================
-- legal_refs
-- =====================================================================

-- Público por completo — aparece no relatório PDF, na Metodologia e no
-- resultado da organização avaliada, sem exigir login.
create policy "qualquer um le legal_refs"
  on public.legal_refs for select
  to anon, authenticated
  using (true);

create policy "gestor+ edita legal_refs"
  on public.legal_refs for all
  to authenticated
  using (public.current_admin_role() in ('super_admin','gestor'))
  with check (public.current_admin_role() in ('super_admin','gestor'));
