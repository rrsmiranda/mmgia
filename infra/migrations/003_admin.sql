-- 003_admin.sql
-- Mundo administrativo identificado (CLAUDE.md, seção "Os dois mundos") — ISOLADO
-- de submissions por design: nenhuma tabela deste arquivo tem FK para submissions,
-- e nenhuma tabela de submissions tem FK para cá. Essa ausência de relação é a
-- garantia estrutural de que nenhum admin consegue ligar uma avaliação a uma
-- organização: a informação simplesmente não existe no banco.
CREATE TABLE admin_users (
  id            TEXT PRIMARY KEY,                 -- UUID
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                     -- bcrypt ou argon2 — nunca texto puro
  nome          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('super_admin','gestor','leitor')),
  ativo         INTEGER NOT NULL DEFAULT 1,
  created_at    INTEGER NOT NULL,
  last_login    INTEGER
);

-- Sessão por token JWT emitido no login — permite revogar/expirar sem precisar
-- invalidar o segredo de assinatura inteiro. ip_hash é só para auditoria de
-- administradores (quem logou de onde); nunca aparece em nenhuma tela pública e
-- não tem relação nenhuma com os ip_hash que o roteiro original cogitava nas
-- submissions — aqueles nunca chegaram a existir, por isso não aparecem em 001.
CREATE TABLE admin_sessions (
  id          TEXT PRIMARY KEY,                   -- UUID do token
  user_id     TEXT NOT NULL REFERENCES admin_users(id),
  expires_at  INTEGER NOT NULL,
  ip_hash     TEXT,
  created_at  INTEGER NOT NULL
);
-- NOTA: admin_sessions referencia admin_users, NUNCA submissions.

CREATE INDEX idx_admin_users_ativo       ON admin_users(ativo);
CREATE INDEX idx_admin_sessions_user_id  ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_expires  ON admin_sessions(expires_at);
