-- 002_edit_code.sql (Postgres / Supabase)
-- Código de avaliação: gerado no cliente ou numa Edge Function ao criar a
-- submission, devolvido em texto ao usuário UMA VEZ (tela de Resultado), e
-- gravado aqui só como hash — nunca o código em texto puro. Recuperar uma
-- avaliação é: hash(código informado) -> WHERE edit_code_hash = ?, exposto só
-- pela função find_submission_by_code_hash (006_rls_policies.sql), nunca por
-- uma policy de SELECT aberta na tabela.
--
-- UNIQUE: uma colisão de hash deixaria o código de uma organização editar a
-- avaliação de outra — isso é uma falha de isolamento entre avaliações, não
-- só de performance.
alter table public.submissions add column edit_code_hash text;
alter table public.submissions add column updated_at timestamptz;

create unique index idx_submissions_edit_code on public.submissions(edit_code_hash);
