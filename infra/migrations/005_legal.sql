-- 005_legal.sql
-- Base legal: cada uma das 45 práticas pode ter várias referências normativas
-- (LGPD, AI Act da UE, ISO/IEC 42001, ENIA — ver CLAUDE.md Fase 1). `practice_id`
-- é o id interno da prática (ex. "1.7"), não o código oficial exibido na tela
-- (ex. "4.2", calculado por getOfficialPracticeCode em packages/shared/lib/scoring.ts)
-- — o Worker junta isso com a lista estática de práticas em código, não com uma
-- tabela própria: as 45 práticas (nome, descrição, critério, nível) continuam
-- fixas no pacote compartilhado, não viram dado editável no banco.
CREATE TABLE legal_refs (
  id          TEXT PRIMARY KEY,
  practice_id TEXT NOT NULL,                 -- ex: "1.1", "3.4" — bate com Practice.id
  norma       TEXT NOT NULL,                  -- ex: "LGPD", "AI Act EU", "ISO/IEC 42001", "ENIA"
  artigo      TEXT NOT NULL,                  -- ex: "Art. 20", "Cláusula 6.2"
  descricao   TEXT NOT NULL,                  -- como a prática se correlaciona com a norma
  url         TEXT,
  updated_by  TEXT REFERENCES admin_users(id),
  updated_at  INTEGER NOT NULL
);
CREATE INDEX idx_legal_practice ON legal_refs(practice_id);
