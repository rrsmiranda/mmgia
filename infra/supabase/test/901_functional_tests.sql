-- 901_functional_tests.sql — validação manual, não faz parte das migrations.
\set ON_ERROR_STOP off
\echo '--- 1. trigger handle_new_admin_user: insert em auth.users cria admin_profile leitor ---'
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'super@mmgia.test'),
  ('22222222-2222-2222-2222-222222222222', 'gestor@mmgia.test'),
  ('33333333-3333-3333-3333-333333333333', 'leitor@mmgia.test');
select id, nome, role, ativo from public.admin_profiles order by nome;

\echo '--- 2. promover papeis (ação manual de super_admin, fora do trigger) ---'
update public.admin_profiles set role = 'super_admin' where id = '11111111-1111-1111-1111-111111111111';
update public.admin_profiles set role = 'gestor'      where id = '22222222-2222-2222-2222-222222222222';
select id, nome, role from public.admin_profiles order by role;

\echo '--- 3. seed de 6 submissions (5 RJ para passar k>=5, 1 SP isolada) ---'
insert into public.submissions (setor, esfera, area, relacao_ia, estado, porte, regiao, respostas, score_global, score_gov, score_tec, score_seg, score_edu, score_eco, edit_code_hash)
select 'publico','estadual','saude','usa','RJ','Grande','Sudeste','{}'::jsonb, 2.0, 2.0,2.0,2.0,2.0,2.0, 'hash_rj_'||g
from generate_series(1,5) g;
insert into public.submissions (setor, esfera, area, relacao_ia, estado, porte, regiao, respostas, score_global, score_gov, score_tec, score_seg, score_edu, score_eco, edit_code_hash)
values ('privado',null,'industria','desenvolve','SP','Média','Sudeste','{}'::jsonb, 3.0,3.0,3.0,3.0,3.0,3.0, 'hash_sp_1');

\echo '--- 4. como anon: INSERT deve funcionar, SELECT direto deve dar 0 linhas (sem policy) ---'
set role anon;
insert into public.submissions (setor, esfera, area, relacao_ia, estado, porte, regiao, respostas, score_global, score_gov, score_tec, score_seg, score_edu, score_eco, edit_code_hash)
values ('privado',null,'industria','desenvolve','MG','Média','Sudeste','{}'::jsonb, 1.0,1.0,1.0,1.0,1.0,1.0, 'hash_mg_1');
select count(*) as anon_direct_select_deve_ser_zero from public.submissions;
reset role;

\echo '--- 5. anon via find_submission_by_code_hash: acha 1 linha pelo hash exato ---'
set role anon;
select id, estado, edit_code_hash from public.find_submission_by_code_hash('hash_sp_1');
select count(*) as deve_ser_zero_hash_inexistente from (select public.find_submission_by_code_hash('hash_nao_existe')) t where (public.find_submission_by_code_hash('hash_nao_existe')).id is not null;
reset role;

\echo '--- 6. anon via painel_aggregate: RJ tem 5 (>=5, mostra media); SP tem 1 (<5, deve vir NULL) ---'
set role anon;
select * from public.painel_aggregate(p_uf := 'RJ');
select * from public.painel_aggregate(p_uf := 'SP');
reset role;

\echo '--- 7. authenticated SEM admin_profile ativo: current_admin_role() deve ser NULL, SELECT em submissions deve dar 0 linhas ---'
begin;
set local role authenticated;
set local request.jwt.claim.sub = '99999999-9999-9999-9999-999999999999';
select public.current_admin_role() as deve_ser_null;
select count(*) as nao_admin_select_deve_ser_zero from public.submissions;
commit;

\echo '--- 8. authenticated COMO leitor ativo: le submissions mas NAO consegue dar UPDATE ---'
begin;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select public.current_admin_role() as deve_ser_leitor;
select count(*) as leitor_le_tudo_deve_ser_7 from public.submissions;
update public.submissions set porte = 'Pequena' where estado = 'SP';
commit;

\echo '--- 9. authenticated COMO gestor: consegue dar UPDATE em submissions ---'
begin;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
update public.submissions set porte = 'Pequena' where estado = 'SP';
select estado, porte from public.submissions where estado = 'SP';
commit;

\echo '--- 10. leitor NAO consegue ler admin_profiles de outro usuario (só o proprio) ---'
begin;
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select count(*) as leitor_ve_so_o_proprio_deve_ser_1 from public.admin_profiles;
commit;

\echo '--- 11. super_admin ve todos os admin_profiles ---'
begin;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select count(*) as super_admin_ve_todos_deve_ser_3 from public.admin_profiles;
commit;

\echo '--- 12. anon le legal_refs (publico) e noticias so aprovadas/destaque ---'
insert into public.legal_refs (practice_id, norma, artigo, descricao) values ('1.1','LGPD','Art. 50','Boas práticas e governança no tratamento de dados.');
insert into public.news_items (titulo, resumo, fonte, url, status) values
  ('Pendente', 'x', 'Fonte', 'https://x.test', 'pendente'),
  ('Aprovada', 'x', 'Fonte', 'https://x.test', 'aprovada');
set role anon;
select count(*) as anon_le_legal_deve_ser_1 from public.legal_refs;
select count(*) as anon_le_noticias_deve_ser_1_so_aprovada from public.news_items;
reset role;

\echo '--- 13. UNIQUE edit_code_hash: colisao deve falhar ---'
insert into public.submissions (setor, esfera, area, relacao_ia, estado, porte, regiao, respostas, score_global, score_gov, score_tec, score_seg, score_edu, score_eco, edit_code_hash)
values ('privado',null,'industria','desenvolve','BA','Pequena','Nordeste','{}'::jsonb, 1.0,1.0,1.0,1.0,1.0,1.0, 'hash_sp_1');

\echo '--- FIM ---'
