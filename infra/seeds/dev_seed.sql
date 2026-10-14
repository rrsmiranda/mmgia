-- dev_seed.sql
-- Dados de exemplo para rodar as telas do admin localmente contra um banco de
-- verdade, sem depender dos SEED_* fixos em packages/shared/src/types.ts (que
-- continuam existindo à parte, para o frontend funcionar sem nenhum backend).
--
-- NÃO é para produção nem para qualquer ambiente real:
--  - password_hash abaixo é um placeholder, não um hash bcrypt de verdade.
--    Gere hashes reais (bcrypt/argon2) antes de usar estas linhas fora do seu
--    ambiente local.
--  - `respostas` das submissions é '{}' — estas 20 linhas foram transcritas das
--    mesmas 20 primeiras de SEED_HISTORICAL_RECORDS (packages/shared/types.ts),
--    que só guarda os scores já calculados, não as respostas NPLF originais.
--    Servem para exercitar filtros, mapa, export e os painéis do admin — não
--    para testar o recálculo de score a partir de respostas.
--  - edit_code_hash fica NULL: sem um código de verdade para gerar o hash, a
--    tela "Editar com código" não tem o que recuperar nestas linhas.

-- ===== admin_users =====
INSERT INTO admin_users (id, email, password_hash, nome, role, ativo, created_at, last_login) VALUES
  ('u1', 'julia.costa@ggia.unb.br',   '$2b$10$CHANGE_ME_before_using_in_any_real_environment', 'Júlia Costa',    'super_admin', 1, 1749384000000, 1749384840000),
  ('u2', 'rafael.almeida@ggia.unb.br','$2b$10$CHANGE_ME_before_using_in_any_real_environment', 'Rafael Almeida', 'gestor',      1, 1749297600000, 1749313320000),
  ('u3', 'mateus.azevedo@ggia.unb.br','$2b$10$CHANGE_ME_before_using_in_any_real_environment', 'Mateus Azevedo', 'leitor',      1, 1749124800000, 1749131400000),
  ('u4', 'patricia.rocha@ggia.unb.br','$2b$10$CHANGE_ME_before_using_in_any_real_environment', 'Patrícia Rocha', 'gestor',      0, 1747008000000, 1747058200000);

-- ===== legal_refs (exemplo canônico do CLAUDE.md, Fase 1, para a prática 1.1) =====
INSERT INTO legal_refs (id, practice_id, norma, artigo, descricao, url, updated_by, updated_at) VALUES
  ('lr1', '1.1', 'LGPD',         'Art. 50',     'Boas práticas e governança no tratamento de dados.',  NULL, 'u1', 1749384000000),
  ('lr2', '1.1', 'ISO/IEC 42001','Cláusula 5',  'Liderança e comprometimento da alta direção.',         NULL, 'u1', 1749384000000);

-- ===== news_items (conteúdo de exemplo, claramente fictício — ver AdminDashboard.tsx) =====
INSERT INTO news_items (id, titulo, resumo, fonte, url, tags, categoria, status, publicado_em, curado_por, created_at) VALUES
  ('n1', '[Exemplo] Novas diretrizes setoriais de segurança de dados em modelos de IA',       'Conteúdo de demonstração — layout de card de notícia com categoria "regulação" e fonte citada.', 'Fonte de exemplo', 'https://example.org/n1', '[]', 'regulação',  'destaque', 1749340800000, 'u1', 1749340800000),
  ('n2', '[Exemplo] Comissão debate impacto de IA generativa em projeto de lei',              'Conteúdo de demonstração — layout de card de notícia com categoria "regulação".',                 'Fonte de exemplo', 'https://example.org/n2', '[]', 'regulação',  'aprovada', 1749081600000, 'u1', 1749081600000),
  ('n3', '[Exemplo] Organizações debatem modelos de governança de IA em fórum setorial',      'Conteúdo de demonstração — layout de card de notícia com categoria "governança".',                'Fonte de exemplo', 'https://example.org/n3', '[]', 'governança', 'aprovada', 1748822400000, 'u1', 1748822400000),
  ('n4', '[Exemplo] Biblioteca de MLOps promete otimizar inferência em servidores legados',   'Conteúdo de demonstração — layout de card de notícia com categoria "tecnologia".',                'Fonte de exemplo', 'https://example.org/n4', '[]', 'tecnologia', 'pendente', NULL,          NULL, 1748563200000),
  ('n5', '[Exemplo] Empresas aumentam investimento em testes de segurança de IA',             'Conteúdo de demonstração — layout de card de notícia com categoria "mercado".',                   'Fonte de exemplo', 'https://example.org/n5', '[]', 'mercado',    'pendente', NULL,          NULL, 1748304000000);

-- ===== submissions (20 primeiras linhas de SEED_HISTORICAL_RECORDS) =====
INSERT INTO submissions (id, taxonomia_versao, setor, esfera, area, atividade_estatal, relacao_ia, estado, porte, termos_aceitos, regiao, poder, respostas, score_global, score_gov, score_tec, score_seg, score_edu, score_eco, revisar, created_at, edit_code_hash, updated_at) VALUES
  ('av1',  2, 'publico',  'federal',  'gestao',     NULL, NULL,          'DF', 'Grande',  1, 'Centro-Oeste', 'executivo', '{}', 2.12, 2.33, 1.88, 2.44, 2.11, 1.95, 0, 1780272000000, NULL, 1780272000000),
  ('av2',  2, 'privado',  NULL,       'financas',   NULL, NULL,          'SP', 'Grande',  1, 'Sudeste',      NULL,        '{}', 1.89, 2.05, 1.77, 2.10, 1.66, 1.88, 0, 1780272000000, NULL, 1780272000000),
  ('av3',  2, 'outro',    NULL,       NULL,         NULL, NULL,          'RJ', 'Grande',  1, 'Sudeste',      NULL,        '{}', 1.54, 1.20, 2.05, 1.10, 2.10, 1.25, 1, 1777593600000, NULL, 1777593600000),
  ('av4',  2, 'publico',  'estadual', 'saude',      NULL, NULL,          'MG', 'Média',   1, 'Sudeste',      'executivo', '{}', 1.34, 1.45, 1.22, 1.55, 1.10, 1.40, 0, 1777593600000, NULL, 1777593600000),
  ('av5',  2, 'publico',  'municipal','gestao',     NULL, NULL,          'RS', 'Pequena', 1, 'Sul',          'executivo', '{}', 0.98, 1.10, 0.88, 0.90, 1.20, 0.80, 0, 1775001600000, NULL, 1775001600000),
  ('av6',  2, 'terceiro', NULL,       'causas',     NULL, NULL,          'BA', 'Micro',   1, 'Nordeste',     NULL,        '{}', 0.72, 0.80, 0.66, 0.70, 0.88, 0.55, 0, 1775001600000, NULL, 1775001600000),
  ('av7',  2, 'privado',  NULL,       'tecnologia', NULL, NULL,          'SC', 'Pequena', 1, 'Sul',          NULL,        '{}', 1.62, 1.44, 1.88, 1.50, 1.40, 1.88, 0, 1772323200000, NULL, 1772323200000),
  ('av8',  2, 'publico',  'estadual', 'saude',      NULL, NULL,          'AM', 'Grande',  1, 'Norte',        'executivo', '{}', 1.11, 1.20, 1.05, 1.30, 0.90, 1.10, 0, 1772323200000, NULL, 1772323200000),
  ('av9',  2, 'privado',  NULL,       'saude',      NULL, 'desenvolve',  'RS', 'Grande',  1, 'Sul',          NULL,        '{}', 1.84, 1.88, 1.87, 1.89, 1.74, 1.82, 0, 1769904000000, NULL, 1769904000000),
  ('av10', 2, 'publico',  'estadual', 'seguranca',  NULL, 'desenvolve',  'PI', 'Média',   1, 'Nordeste',     'executivo', '{}', 1.53, 1.52, 1.68, 1.38, 1.55, 1.53, 0, 1767225600000, NULL, 1767225600000),
  ('av11', 2, 'terceiro', NULL,       'educacao',   NULL, 'desenvolve',  'SP', 'Grande',  1, 'Sudeste',      NULL,        '{}', 1.48, 1.43, 1.51, 1.43, 1.44, 1.57, 0, 1777593600000, NULL, 1777593600000),
  ('av12', 2, 'privado',  NULL,       'tecnologia', NULL, 'desenvolve',  'DF', 'Média',   1, 'Centro-Oeste', NULL,        '{}', 1.61, 1.45, 1.74, 1.77, 1.57, 1.51, 0, 1754006400000, NULL, 1754006400000),
  ('av13', 2, 'privado',  NULL,       'comercio',   NULL, 'usa',         'CE', 'Média',   1, 'Nordeste',     NULL,        '{}', 1.44, 1.59, 1.54, 1.39, 1.30, 1.40, 0, 1780272000000, NULL, 1780272000000),
  ('av14', 2, 'terceiro', NULL,       'causas',     NULL, 'nao_usa',     'TO', 'Média',   1, 'Norte',        NULL,        '{}', 1.18, 1.21, 1.19, 1.12, 1.26, 1.11, 0, 1772323200000, NULL, 1772323200000),
  ('av15', 2, 'privado',  NULL,       'financas',   NULL, 'nao_usa',     'SE', 'Pequena', 1, 'Nordeste',     NULL,        '{}', 1.39, 1.35, 1.49, 1.34, 1.44, 1.33, 0, 1769904000000, NULL, 1769904000000),
  ('av16', 2, 'publico',  'estadual', 'seguranca',  NULL, 'usa',         'MT', 'Média',   1, 'Centro-Oeste', 'executivo', '{}', 1.54, 1.52, 1.62, 1.50, 1.58, 1.49, 0, 1767225600000, NULL, 1767225600000),
  ('av17', 2, 'publico',  'municipal','saude',      NULL, 'usa',         'GO', 'Grande',  1, 'Centro-Oeste', 'executivo', '{}', 1.52, 1.46, 1.45, 1.69, 1.39, 1.61, 0, 1761955200000, NULL, 1761955200000),
  ('av18', 2, 'publico',  'municipal','seguranca',  NULL, 'desenvolve',  'PR', 'Pequena', 1, 'Sul',          'executivo', '{}', 1.32, 1.49, 1.32, 1.17, 1.20, 1.43, 0, 1764547200000, NULL, 1764547200000),
  ('av19', 2, 'publico',  'municipal','regulacao',  NULL, 'nao_usa',     'PB', 'Grande',  1, 'Nordeste',     'executivo', '{}', 1.60, 1.52, 1.67, 1.75, 1.54, 1.51, 0, 1769904000000, NULL, 1769904000000),
  ('av20', 2, 'terceiro', NULL,       'classe',     NULL, 'usa',         'SE', 'Grande',  1, 'Nordeste',     NULL,        '{}', 1.27, 1.30, 1.16, 1.11, 1.39, 1.38, 0, 1777593600000, NULL, 1777593600000);
