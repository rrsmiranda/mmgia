-- 002_edit_code.sql
-- Código de avaliação (CLAUDE.md, Fase 5): o Worker gera um UUID ao criar a
-- submission, devolve esse código em texto para o usuário UMA VEZ (tela de
-- Resultado), e grava aqui só o hash — nunca o código em texto puro. Recuperar
-- uma avaliação é: hash(código informado) -> WHERE edit_code_hash = ?.
--
-- UNIQUE (além do índice que o roteiro original já pedia): uma colisão de hash
-- deixaria o código de uma organização editar a avaliação de outra — isso é uma
-- falha de isolamento entre avaliações, não só de performance, então o banco
-- recusa a escrita em vez de só logar o problema depois.
ALTER TABLE submissions ADD COLUMN edit_code_hash TEXT;
ALTER TABLE submissions ADD COLUMN updated_at INTEGER;

CREATE UNIQUE INDEX idx_submissions_edit_code ON submissions(edit_code_hash);
