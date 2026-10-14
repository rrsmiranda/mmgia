-- 001_submissions.sql
-- Mundo público anônimo (ver CLAUDE.md, seção "Os dois mundos").
--
-- Tabela central da plataforma: uma linha por avaliação de maturidade concluída.
-- NUNCA tem coluna de identidade — sem ip, nome, cnpj ou e-mail. O único jeito de
-- reconectar a esta linha depois é o código de avaliação (UUID gerado no cliente),
-- e mesmo esse código nunca é gravado em texto puro aqui (ver 002_edit_code.sql).
--
-- `respostas` guarda as 45 respostas brutas (NPLF por prática) como JSON — é o que
-- a tela "Editar com código" precisa para repopular o questionário. Os scores por
-- dimensão/global são REDUNDANTES de propósito: dá para recalculá-los a partir de
-- `respostas` a qualquer momento (packages/shared/lib/scoring.ts), mas materializá-los
-- evita recomputar em toda consulta do Painel Público e do admin. Se os dois
-- divergirem, `respostas` + scoring.ts é a fonte da verdade; `score_*` é cache.
--
-- `regiao` e `poder` também são materializados — derivados de `estado` e de
-- `setor`+`area` respectivamente, pelas mesmas funções já usadas no cliente
-- (packages/shared/lib/taxonomy.ts: derivarRegiao, derivarPoder). O Worker deve
-- chamar essa mesma lógica ao gravar, nunca reimplementá-la.
CREATE TABLE submissions (
  id                 TEXT PRIMARY KEY,       -- UUID, gerado no Worker (crypto.randomUUID())
  taxonomia_versao   INTEGER NOT NULL DEFAULT 2,

  -- Classificação institucional (igual a AssessmentMetadata no frontend)
  setor              TEXT NOT NULL CHECK(setor IN ('publico','privado','terceiro','outro')),
  esfera             TEXT CHECK(esfera IN ('federal','estadual','municipal')),             -- só setor = 'publico'
  area               TEXT CHECK(area IN (
                       'gestao','regulacao','educacao','saude','seguranca','justica',
                       'legislativo','estatal','financas','tecnologia','industria',
                       'comercio','causas','classe'
                     )),
  atividade_estatal  TEXT CHECK(atividade_estatal IN ('financas','tecnologia','educacao','saude','industria','comercio')), -- só area = 'estatal'
  relacao_ia         TEXT CHECK(relacao_ia IN ('desenvolve','usa','nao_usa')),
  estado             TEXT NOT NULL,          -- UF (2 letras) — validado na aplicação contra as 27 UFs
  porte              TEXT NOT NULL CHECK(porte IN ('Micro','Pequena','Média','Grande')),
  termos_aceitos     INTEGER NOT NULL DEFAULT 1,

  -- Derivados no servidor a partir dos campos acima — nunca pedidos ao usuário
  regiao             TEXT CHECK(regiao IN ('Norte','Nordeste','Centro-Oeste','Sudeste','Sul')),
  poder              TEXT CHECK(poder IN ('executivo','judiciario','legislativo')),         -- só setor = 'publico'

  -- Respostas e scores
  respostas          TEXT NOT NULL,          -- JSON: { "1.1": "N"|"P"|"L"|"F", ... } — 45 práticas
  score_global       REAL NOT NULL,
  score_gov          REAL NOT NULL,
  score_tec          REAL NOT NULL,
  score_seg          REAL NOT NULL,
  score_edu          REAL NOT NULL,
  score_eco          REAL NOT NULL,

  -- Fluxo administrativo (ver Tela "Gestão de dados" / ação "Reclassificar")
  revisar            INTEGER NOT NULL DEFAULT 0, -- registro migrado sem conversão segura de classificação

  created_at         INTEGER NOT NULL        -- epoch ms. `updated_at` chega só na 002_edit_code.sql —
                                              -- antes de existir edição, uma submission nunca mudava.
);

CREATE INDEX idx_submissions_estado     ON submissions(estado);
CREATE INDEX idx_submissions_regiao     ON submissions(regiao);
CREATE INDEX idx_submissions_setor      ON submissions(setor);
CREATE INDEX idx_submissions_porte      ON submissions(porte);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
CREATE INDEX idx_submissions_revisar    ON submissions(revisar) WHERE revisar = 1;
