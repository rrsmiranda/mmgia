# Banco de dados — MMGIA (SQLite / Turso / Cloudflare D1)

> **Caminho alternativo, não o ativo.** A direção atual do projeto é
> Supabase (Postgres) self-hosted numa VPS — ver [`../supabase/README.md`](../supabase/README.md).
> Este diretório foi a primeira modelagem do schema (CLAUDE.md Fase 5
> original, Worker + D1/Turso) e fica preservado como referência e como
> opção caso o projeto volte a esse stack — mas `infra/supabase/` é quem
> recebe as mudanças de schema daqui para frente.

Schema completo do banco (CLAUDE.md, Fase 5), ainda sem o Worker que o usa —
`apps/worker/` não existe no repositório hoje. Isto aqui é só a estrutura de
dados: tabelas, migrations e um seed de desenvolvimento.

## Os dois mundos

`submissions` (mundo público anônimo) e `admin_users`/`admin_sessions` (mundo
administrativo identificado) não têm nenhuma chave estrangeira entre si — nem
em uma direção nem na outra. Essa ausência de relação é proposital: é o que
torna estruturalmente impossível, não só uma política, ligar uma avaliação a
quem a respondeu. Ver CLAUDE.md, seção "Os dois mundos".

## Migrations

Rodar em ordem, uma vez cada, nunca editar uma já aplicada (criar uma nova
migration para qualquer mudança futura):

| Arquivo | O que cria |
|---|---|
| `001_submissions.sql` | Tabela `submissions` — uma linha por avaliação concluída |
| `002_edit_code.sql` | Código de edição (hash, nunca texto puro) |
| `003_admin.sql` | `admin_users` e `admin_sessions` — mundo administrativo |
| `004_news.sql` | `news_items` — curadoria de notícias (Fase B) |
| `005_legal.sql` | `legal_refs` — base legal das 45 práticas |

### Turso (libSQL)

```bash
turso db create mmgia
turso db shell mmgia < migrations/001_submissions.sql
turso db shell mmgia < migrations/002_edit_code.sql
turso db shell mmgia < migrations/003_admin.sql
turso db shell mmgia < migrations/004_news.sql
turso db shell mmgia < migrations/005_legal.sql
```

### Cloudflare D1

```bash
wrangler d1 create mmgia
wrangler d1 execute mmgia --file=migrations/001_submissions.sql
wrangler d1 execute mmgia --file=migrations/002_edit_code.sql
wrangler d1 execute mmgia --file=migrations/003_admin.sql
wrangler d1 execute mmgia --file=migrations/004_news.sql
wrangler d1 execute mmgia --file=migrations/005_legal.sql
```

As migrations usam SQL padrão (sem extensão específica de nenhum dos dois),
então funcionam em qualquer um dos dois bancos sem alteração.

## Seed de desenvolvimento

`seeds/dev_seed.sql` só para rodar as telas do admin localmente contra um
banco de verdade — nunca para produção. Detalhes e limitações (hash de senha
placeholder, submissions sem `respostas` reais) no topo do próprio arquivo.

```bash
turso db shell mmgia < seeds/dev_seed.sql
# ou
wrangler d1 execute mmgia --file=seeds/dev_seed.sql
```

## Mapeamento banco ↔ frontend

As colunas de `submissions` espelham `AssessmentMetadata` e `HistoricalRecord`
(`packages/shared/src/types.ts`), com duas diferenças:

- **`regiao` e `poder`** não vêm de pergunta nenhuma do Onboarding — são
  derivados no servidor com as mesmas funções já usadas no cliente
  (`derivarRegiao`, `derivarPoder` em `packages/shared/src/lib/taxonomy.ts`).
  O Worker deve chamar essas funções, nunca reimplementar a lógica.
- **`periodo`** (string tipo `"Jun/2026"`, usada por `monthly()` em
  `packages/shared/src/lib/observatory.ts`) não é uma coluna — é derivada de
  `created_at` na camada que monta a resposta da API, para não guardar a mesma
  informação em dois formatos.

As 45 práticas (nome, descrição, critério, nível, `whatToDo`) continuam
fixas em código (`packages/shared/src/types.ts`, `LIST_PRACTICES`) — não há
tabela para elas. Só a base legal (`legal_refs`) é editável pelo admin.

## O que ainda falta (fora do escopo deste schema)

- `apps/worker/`: a API que lê e escreve neste banco (rotas, JWT, RBAC,
  middleware) — CLAUDE.md Fase 5 já especifica as rotas, ainda não implementadas.
- Migração dos dados hoje só em `localStorage` (avaliações feitas antes de
  existir backend) — não há dado real para migrar ainda, porque não há
  backend em produção.
