-- dev_seed.sql (Postgres / Supabase)
-- Equivalente de infra/seeds/dev_seed.sql (SQLite/D1/Turso), adaptado ao
-- schema de infra/supabase/migrations/. Mesmo propósito: dados de exemplo
-- para exercitar as telas do admin contra um banco de verdade. NÃO é para
-- produção.
--
-- Diferença importante em relação à versão SQLite: não existe mais
-- `admin_users` para inserir por SQL. Identidade de admin é 100% do
-- Supabase Auth (tabela auth.users, gerenciada pelo GoTrue) — criar um admin
-- de teste é um passo SEPARADO, feito pela Auth API/CLI/Dashboard, nunca por
-- INSERT direto. Depois que o usuário existe em auth.users, o trigger
-- handle_new_admin_user (003_admin_profiles.sql) já cria a linha em
-- admin_profiles com role='leitor' automaticamente — este seed só promove
-- esses perfis para os papéis de exemplo abaixo.
--
-- Passo 1 (fora deste arquivo) — criar os usuários de teste, ex. via
-- Supabase CLI contra a instância local/self-hosted:
--   supabase auth admin create-user --email julia.costa@ggia.unb.br --password 'troque-depois' --email-confirm
--   supabase auth admin create-user --email rafael.almeida@ggia.unb.br --password 'troque-depois' --email-confirm
--   supabase auth admin create-user --email mateus.azevedo@ggia.unb.br --password 'troque-depois' --email-confirm
-- (ou pelo painel do Supabase Studio em http://<vps>:8000 → Authentication → Add user)
--
-- Passo 2 — depois de criados, promover os papéis por e-mail (idempotente;
-- não falha se o usuário ainda não existir, só não promove nada):
update public.admin_profiles set role = 'super_admin'
  where id = (select id from auth.users where email = 'julia.costa@ggia.unb.br');
update public.admin_profiles set role = 'gestor'
  where id = (select id from auth.users where email = 'rafael.almeida@ggia.unb.br');
-- mateus.azevedo@ggia.unb.br fica 'leitor' (valor padrão do trigger, nada a fazer).

-- ===== legal_refs (exemplo canônico do CLAUDE.md, Fase 1, para a prática 1.1) =====
insert into public.legal_refs (practice_id, norma, artigo, descricao, url) values
  ('1.1', 'LGPD',          'Art. 50',    'Boas práticas e governança no tratamento de dados.', null),
  ('1.1', 'ISO/IEC 42001', 'Cláusula 5', 'Liderança e comprometimento da alta direção.',        null);

-- ===== news_items (conteúdo de exemplo, claramente fictício — ver AdminDashboard.tsx) =====
insert into public.news_items (titulo, resumo, fonte, url, tags, categoria, status, publicado_em, created_at) values
  ('[Exemplo] Novas diretrizes setoriais de segurança de dados em modelos de IA',     'Conteúdo de demonstração — layout de card de notícia com categoria "regulação" e fonte citada.', 'Fonte de exemplo', 'https://example.org/n1', '{}', 'regulação',  'destaque', to_timestamp(1749340800000/1000.0), to_timestamp(1749340800000/1000.0)),
  ('[Exemplo] Comissão debate impacto de IA generativa em projeto de lei',            'Conteúdo de demonstração — layout de card de notícia com categoria "regulação".',                 'Fonte de exemplo', 'https://example.org/n2', '{}', 'regulação',  'aprovada', to_timestamp(1749081600000/1000.0), to_timestamp(1749081600000/1000.0)),
  ('[Exemplo] Organizações debatem modelos de governança de IA em fórum setorial',    'Conteúdo de demonstração — layout de card de notícia com categoria "governança".',                'Fonte de exemplo', 'https://example.org/n3', '{}', 'governança', 'aprovada', to_timestamp(1748822400000/1000.0), to_timestamp(1748822400000/1000.0)),
  ('[Exemplo] Biblioteca de MLOps promete otimizar inferência em servidores legados', 'Conteúdo de demonstração — layout de card de notícia com categoria "tecnologia".',                'Fonte de exemplo', 'https://example.org/n4', '{}', 'tecnologia', 'pendente', null,                                to_timestamp(1748563200000/1000.0)),
  ('[Exemplo] Empresas aumentam investimento em testes de segurança de IA',           'Conteúdo de demonstração — layout de card de notícia com categoria "mercado".',                   'Fonte de exemplo', 'https://example.org/n5', '{}', 'mercado',    'pendente', null,                                to_timestamp(1748304000000/1000.0));

-- ===== submissions (20 primeiras linhas de SEED_HISTORICAL_RECORDS) =====
-- termos_aceitos/revisar: 1/0 (SQLite) -> true/false (Postgres boolean).
-- created_at: epoch ms (SQLite) -> timestamptz via to_timestamp(ms/1000.0).
insert into public.submissions (taxonomia_versao, setor, esfera, area, atividade_estatal, relacao_ia, estado, porte, termos_aceitos, regiao, poder, respostas, score_global, score_gov, score_tec, score_seg, score_edu, score_eco, revisar, created_at) values
  (2, 'publico',  'federal',  'gestao',     null, null,         'DF', 'Grande',  true, 'Centro-Oeste', 'executivo', '{}', 2.12, 2.33, 1.88, 2.44, 2.11, 1.95, false, to_timestamp(1780272000000/1000.0)),
  (2, 'privado',  null,       'financas',   null, null,         'SP', 'Grande',  true, 'Sudeste',      null,        '{}', 1.89, 2.05, 1.77, 2.10, 1.66, 1.88, false, to_timestamp(1780272000000/1000.0)),
  (2, 'outro',    null,       null,         null, null,         'RJ', 'Grande',  true, 'Sudeste',      null,        '{}', 1.54, 1.20, 2.05, 1.10, 2.10, 1.25, true,  to_timestamp(1777593600000/1000.0)),
  (2, 'publico',  'estadual', 'saude',      null, null,         'MG', 'Média',   true, 'Sudeste',      'executivo', '{}', 1.34, 1.45, 1.22, 1.55, 1.10, 1.40, false, to_timestamp(1777593600000/1000.0)),
  (2, 'publico',  'municipal','gestao',     null, null,         'RS', 'Pequena', true, 'Sul',          'executivo', '{}', 0.98, 1.10, 0.88, 0.90, 1.20, 0.80, false, to_timestamp(1775001600000/1000.0)),
  (2, 'terceiro', null,       'causas',     null, null,         'BA', 'Micro',   true, 'Nordeste',     null,        '{}', 0.72, 0.80, 0.66, 0.70, 0.88, 0.55, false, to_timestamp(1775001600000/1000.0)),
  (2, 'privado',  null,       'tecnologia', null, null,         'SC', 'Pequena', true, 'Sul',          null,        '{}', 1.62, 1.44, 1.88, 1.50, 1.40, 1.88, false, to_timestamp(1772323200000/1000.0)),
  (2, 'publico',  'estadual', 'saude',      null, null,         'AM', 'Grande',  true, 'Norte',        'executivo', '{}', 1.11, 1.20, 1.05, 1.30, 0.90, 1.10, false, to_timestamp(1772323200000/1000.0)),
  (2, 'privado',  null,       'saude',      null, 'desenvolve', 'RS', 'Grande',  true, 'Sul',          null,        '{}', 1.84, 1.88, 1.87, 1.89, 1.74, 1.82, false, to_timestamp(1769904000000/1000.0)),
  (2, 'publico',  'estadual', 'seguranca',  null, 'desenvolve', 'PI', 'Média',   true, 'Nordeste',     'executivo', '{}', 1.53, 1.52, 1.68, 1.38, 1.55, 1.53, false, to_timestamp(1767225600000/1000.0)),
  (2, 'terceiro', null,       'educacao',   null, 'desenvolve', 'SP', 'Grande',  true, 'Sudeste',      null,        '{}', 1.48, 1.43, 1.51, 1.43, 1.44, 1.57, false, to_timestamp(1777593600000/1000.0)),
  (2, 'privado',  null,       'tecnologia', null, 'desenvolve', 'DF', 'Média',   true, 'Centro-Oeste', null,        '{}', 1.61, 1.45, 1.74, 1.77, 1.57, 1.51, false, to_timestamp(1754006400000/1000.0)),
  (2, 'privado',  null,       'comercio',   null, 'usa',        'CE', 'Média',   true, 'Nordeste',     null,        '{}', 1.44, 1.59, 1.54, 1.39, 1.30, 1.40, false, to_timestamp(1780272000000/1000.0)),
  (2, 'terceiro', null,       'causas',     null, 'nao_usa',    'TO', 'Média',   true, 'Norte',        null,        '{}', 1.18, 1.21, 1.19, 1.12, 1.26, 1.11, false, to_timestamp(1772323200000/1000.0)),
  (2, 'privado',  null,       'financas',   null, 'nao_usa',    'SE', 'Pequena', true, 'Nordeste',     null,        '{}', 1.39, 1.35, 1.49, 1.34, 1.44, 1.33, false, to_timestamp(1769904000000/1000.0)),
  (2, 'publico',  'estadual', 'seguranca',  null, 'usa',        'MT', 'Média',   true, 'Centro-Oeste', 'executivo', '{}', 1.54, 1.52, 1.62, 1.50, 1.58, 1.49, false, to_timestamp(1767225600000/1000.0)),
  (2, 'publico',  'municipal','saude',      null, 'usa',        'GO', 'Grande',  true, 'Centro-Oeste', 'executivo', '{}', 1.52, 1.46, 1.45, 1.69, 1.39, 1.61, false, to_timestamp(1761955200000/1000.0)),
  (2, 'publico',  'municipal','seguranca',  null, 'desenvolve', 'PR', 'Pequena', true, 'Sul',          'executivo', '{}', 1.32, 1.49, 1.32, 1.17, 1.20, 1.43, false, to_timestamp(1764547200000/1000.0)),
  (2, 'publico',  'municipal','regulacao',  null, 'nao_usa',    'PB', 'Grande',  true, 'Nordeste',     'executivo', '{}', 1.60, 1.52, 1.67, 1.75, 1.54, 1.51, false, to_timestamp(1769904000000/1000.0)),
  (2, 'terceiro', null,       'classe',     null, 'usa',        'SE', 'Grande',  true, 'Nordeste',     null,        '{}', 1.27, 1.30, 1.16, 1.11, 1.39, 1.38, false, to_timestamp(1777593600000/1000.0));
