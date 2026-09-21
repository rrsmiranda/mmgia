# CLAUDE.md — Plataforma MMGIA Completa (v2)
## Instruções mestras para o Claude Code

> Este é o roteiro mestre. Leia-o por completo antes de começar.
> Documentos complementares (ler junto, na ordem em que forem citados):
> - `MMGIA_ZOVA_PROMPT.md` — base de design e layout das telas públicas
> - `MMGIA_DESIGN_PROMPT.md` — especificação pixel-perfect dos componentes
> - `MMGIA_GAPS.md` — PDF completo, plano de ação, store do painel, insights
> - `MMGIA_VENUS_INTERACTIONS.md` — interações dinâmicas + theme switcher
> - `MMGIA_SDD_Roteiro.md` — arquitetura, ADRs, banco, CI/CD

---

## REGRAS GLOBAIS (valem para todo o projeto)

1. **TypeScript strict** — zero `any`, zero `@ts-ignore`, zero `as unknown`.
2. **Três arquivos por componente** — `Componente.tsx` + `.stories.tsx` + `.test.tsx`.
3. **Tipografia** — Plus Jakarta Sans (títulos + corpo) + Geist Mono (dados técnicos).
4. **Cores** — sempre via tokens; nunca hardcode hex fora de `tokens/`.
5. **Anonimidade é inegociável** — ver a seção "Os dois mundos" abaixo.
6. **Acessibilidade** — WCAG 2.1 AA; respeitar `prefers-reduced-motion`.
7. **Ao fim de cada fase** — rodar verificação antes de avançar.

---

## O que é este projeto

A plataforma **MMGIA** (Modelo de Maturidade em Governança de Inteligência
Artificial) é uma aplicação web gratuita e anônima por design que permite a
organizações brasileiras avaliar sua maturidade em governança de IA, alinhada
à ENIA 2026–2029.

**Características centrais:**
- Avaliação pública sem cadastro, sem login, sem identificação
- Cálculo de score feito no browser (nunca no servidor)
- Banco sem colunas de identidade (IP, nome, CNPJ, e-mail nunca armazenados)
- k-anonimidade ≥ 5 no painel público
- Código de avaliação (UUID) para editar sem identificar a organização
- Área administrativa separada para gestão de dados agregados
- Página de notícias com curadoria e fontes externas
- Correlação das 45 práticas com base legal (LGPD, AI Act, ISO 42001, ENIA)
- Código aberto, licença MIT
- Custo operacional próximo de zero (Cloudflare + Turso free tiers)

---

## Os dois mundos (princípio de segurança)

A plataforma tem DOIS MUNDOS que NUNCA se cruzam:

```
MUNDO PÚBLICO (anônimo)            MUNDO ADMIN (identificado)
─────────────────────             ──────────────────────────
organizações avaliam              administradores da plataforma
sem login, sem identidade         login + senha + RBAC
tabela submissions                tabela admin_users
(sem ip/nome/cnpj/email)          (com identidade dos admins)
código UUID anônimo               sessões JWT auditadas
                    \             /
                     \           /
                  ÚNICA PONTE PERMITIDA:
                  dados AGREGADOS e ANÔNIMOS
                  (scores, contagens — nunca identidade)
```

Um admin logado vê "892 avaliações no Sudeste, score médio 2.14" — mas NUNCA
consegue saber qual organização respondeu o quê, porque essa informação não
existe no banco. A tabela `admin_users` (identidade de administradores) e a
tabela `submissions` (avaliações anônimas) não têm relação por chave estrangeira.

---

## Estrutura do monorepo (3 apps)

```
mmgia/
├── CLAUDE.md                    ← este arquivo
├── package.json                 ← workspace root
├── pnpm-workspace.yaml
├── turbo.json
├── .github/workflows/ci.yml
├── apps/
│   ├── web/                     ← SPA pública anônima (mmgia.org.br)
│   ├── admin/                   ← SPA administrativa (admin.mmgia.org.br)
│   └── worker/                  ← Cloudflare Worker (api.mmgia.org.br)
├── packages/
│   ├── shared/                  ← schemas Zod + scoring + base legal
│   ├── ui/                      ← design system (Plus Jakarta + Geist Mono)
│   ├── pdf/                     ← geração de PDF client-side
│   └── xlsx/                    ← geração de Excel (área admin)
└── infra/
    ├── migrations/
    │   ├── 001_initial.sql      ← submissions (anônima)
    │   ├── 002_edit_code.sql    ← código de edição
    │   ├── 003_admin.sql        ← admin_users + admin_sessions
    │   ├── 004_news.sql         ← news_items
    │   └── 005_legal.sql        ← legal_refs
    └── seeds/
        ├── dev_seed.sql
        └── legal_seed.sql       ← base legal das 45 práticas
```

**As 3 apps são deployadas separadamente** (domínios distintos), o que isola
completamente o código administrativo do público.

---

## Mapa completo de telas (15 telas)

### apps/web — público anônimo (10 telas)
| # | Tela | Rota | Fase |
|---|------|------|------|
| 1 | Landing | `/` | A |
| 2 | Onboarding | `/onboarding` | A |
| 3 | Avaliação | `/avaliacao` | A |
| 4 | Revisão | `/avaliacao/revisao` | A |
| 5 | Resultado | `/resultado` | A |
| 6 | Painel Público | `/painel` | A |
| 7 | Metodologia | `/metodologia` | A |
| 8 | Open Data | `/opendata` | A |
| 9 | Editar com código | `/editar/:codigo?` | A |
| 10 | Notícias | `/noticias` | B |

### apps/admin — administrativo identificado (5 telas)
| # | Tela | Rota | Fase |
|---|------|------|------|
| 11 | Login | `/login` | A |
| 12 | Dashboard + Gestão de dados | `/admin` | A |
| 13 | Usuários + Perfis (RBAC) | `/admin/usuarios` | A |
| 14 | Curadoria de notícias | `/admin/noticias` | B |
| 15 | Base legal | `/admin/base-legal` | A |

**Fase A** = núcleo (sem mudar custo). **Fase B** = notícias (RSS/API gratuitos).

---

## Ordem de execução das fases

```
Fase 0  — Monorepo e ferramentas base
Fase 1  — Pacote shared (schemas + scoring + base legal)
Fase 2  — Design system (packages/ui) com tipografia Venus + theme switcher
Fase 3  — Gerador de PDF (packages/pdf)
Fase 4  — Gerador de Excel (packages/xlsx)          [NOVO]
Fase 5  — Backend Worker (API pública + API admin)  [EXPANDIDO]
Fase 6  — Frontend público (apps/web) — 10 telas    [EXPANDIDO]
Fase 7  — Frontend admin (apps/admin) — 5 telas     [NOVO]
Fase 8  — Notícias (Fase B: agregador + curadoria)  [NOVO]
Fase 9  — CI/CD
Fase 10 — Verificação final completa
```

Cada fase tem critério de conclusão (`✅`). As seções abaixo detalham as fases
novas e expandidas. Para as fases 0–3, 9 e a base da 5–6, seguir também o
detalhamento de código que já consta nas seções correspondentes mais abaixo
neste arquivo (herdadas do roteiro original) e nos documentos complementares.

---

# DETALHAMENTO DAS NOVAS ARQUITETURAS

## Fase 1 (adição) — Base legal no pacote shared

### 1.x Criar packages/shared/src/constants/legal.ts

Cada uma das 45 práticas ganha referências legais. Estrutura:

```typescript
export interface LegalRef {
  norma:    string;   // ex: "LGPD", "AI Act EU", "ISO/IEC 42001", "ENIA"
  artigo:   string;   // ex: "Art. 20", "Art. 14", "Cláusula 6.2"
  descricao:string;   // como a prática se correlaciona com a norma
  url?:     string;   // link para a norma oficial
}

// Mapa: practiceId -> referências legais
export const LEGAL_REFS: Record<string, LegalRef[]> = {
  '1.1': [
    { norma:'LGPD', artigo:'Art. 50', descricao:'Boas práticas e governança no tratamento de dados', url:'...' },
    { norma:'ISO/IEC 42001', artigo:'Cláusula 5', descricao:'Liderança e comprometimento da alta direção' },
  ],
  '3.4': [
    { norma:'LGPD', artigo:'Art. 20', descricao:'Direito à revisão de decisões automatizadas' },
    { norma:'AI Act EU', artigo:'Art. 14', descricao:'Supervisão humana de sistemas de alto risco' },
  ],
  // ... todas as 45 práticas
};

export function getLegalRefs(practiceId: string): LegalRef[] {
  return LEGAL_REFS[practiceId] ?? [];
}
```

Essas referências aparecem em: relatório PDF (página de detalhamento), tela de
Metodologia, tela admin de Base Legal, e o resultado público da organização.

**✅ Conclusão Fase 1 (adição):** `getLegalRefs('1.1')` retorna referências; todas
as 45 práticas têm pelo menos uma referência legal mapeada.

---

## Fase 2 (adição) — Tipografia Venus + Theme Switcher

Seguir `MMGIA_VENUS_INTERACTIONS.md` integralmente. Resumo do que entra no `packages/ui`:

- `tokens/typography.ts` — Plus Jakarta Sans (display + body) + Geist Mono (mono)
- `styles/theme.css` — CSS variables com base, marca (fixa) e accent (variável)
- `lib/themes.ts` — 6 paletas de accent (teal, azul, roxo, coral, pink, âmbar)
- `store/theme.store.ts` — Zustand com persistência localStorage
- `ThemeSwitcher.tsx` — 6 swatches + toggle claro/escuro
- Hooks: `useReveal`, `AnimatedCounter`, `Carousel`, `useScrolled`, `BackToTop`
- `NewsletterForm.tsx` e formulários com RHF + Zod + Sonner

**Regra do accent:** muda botões/eyebrows/barras/ícones/badges; NÃO muda
logo/score/palavra "governança"/cor das dimensões.

**Fontes no globals.css:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Geist+Mono:wght@400;500&display=swap');
```

**✅ Conclusão Fase 2 (adição):** theme switcher troca accent em runtime; modo
escuro legível; preferência persiste; todas as animações respeitam reduced-motion.

---

## Fase 4 [NOVA] — Gerador de Excel (packages/xlsx)

### 4.1 Criar packages/xlsx/package.json

```json
{
  "name": "@mmgia/xlsx",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "dependencies": { "exceljs": "^4.4.0" },
  "devDependencies": { "typescript": "^5.4.0", "vitest": "^1.6.0" }
}
```

### 4.2 Criar packages/xlsx/src/generate.ts

```typescript
import ExcelJS from 'exceljs';

export interface ExportRow {
  id:          string;   // código truncado/anônimo
  periodo:     string;
  natureza:    string;
  estado:      string;
  setor:       string;
  porte:       string;
  scoreGlobal: number;
  nivelGlobal: number;
  scoreGov:    number;
  scoreTec:    number;
  scoreSeg:    number;
  scoreEdu:    number;
  scoreEco:    number;
}

/**
 * Gera planilha Excel dos dados agregados anônimos para a área admin.
 * NUNCA inclui colunas de identidade (ip, nome, cnpj, email).
 */
export async function generateExcel(rows: ExportRow[], filtros: Record<string,string>): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MMGIA';
  wb.created = new Date();

  // Aba 1: dados
  const ws = wb.addWorksheet('Avaliações');
  ws.columns = [
    { header: 'ID', key: 'id', width: 14 },
    { header: 'Período', key: 'periodo', width: 10 },
    { header: 'Natureza', key: 'natureza', width: 18 },
    { header: 'UF', key: 'estado', width: 6 },
    { header: 'Setor', key: 'setor', width: 16 },
    { header: 'Porte', key: 'porte', width: 10 },
    { header: 'Score Global', key: 'scoreGlobal', width: 12 },
    { header: 'Nível', key: 'nivelGlobal', width: 8 },
    { header: 'Gov', key: 'scoreGov', width: 8 },
    { header: 'Tec', key: 'scoreTec', width: 8 },
    { header: 'Seg', key: 'scoreSeg', width: 8 },
    { header: 'Edu', key: 'scoreEdu', width: 8 },
    { header: 'Eco', key: 'scoreEco', width: 8 },
  ];
  // Cabeçalho azul institucional
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0C3D6E' } };
  rows.forEach(r => ws.addRow(r));

  // Aba 2: filtros aplicados (metadados da exportação)
  const meta = wb.addWorksheet('Filtros');
  meta.addRow(['Exportado em', new Date().toLocaleString('pt-BR')]);
  meta.addRow(['Total de registros', rows.length]);
  Object.entries(filtros).forEach(([k, v]) => meta.addRow([k, v]));
  meta.addRow(['Aviso', 'Dados anônimos — sem identificação organizacional']);

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
```

**✅ Conclusão Fase 4:** `generateExcel` produz .xlsx com 2 abas; nenhuma coluna
de identidade; cabeçalho com brand azul.

---

## Fase 5 [EXPANDIDA] — Backend Worker (API pública + admin)

A API pública anônima permanece como no roteiro original. Adicionar:

### 5.x Migrations novas

**002_edit_code.sql** — código de edição na submissions:
```sql
ALTER TABLE submissions ADD COLUMN edit_code_hash TEXT;  -- hash do UUID, nunca o código em texto
ALTER TABLE submissions ADD COLUMN updated_at INTEGER;
CREATE INDEX idx_submissions_edit_code ON submissions(edit_code_hash);
```

**003_admin.sql** — mundo administrativo (ISOLADO de submissions):
```sql
CREATE TABLE admin_users (
  id            TEXT PRIMARY KEY,           -- UUID
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,              -- bcrypt/argon2
  nome          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('super_admin','gestor','leitor')),
  ativo         INTEGER NOT NULL DEFAULT 1,
  created_at    INTEGER NOT NULL,
  last_login    INTEGER
);

CREATE TABLE admin_sessions (
  id          TEXT PRIMARY KEY,             -- UUID do token
  user_id     TEXT NOT NULL REFERENCES admin_users(id),
  expires_at  INTEGER NOT NULL,
  ip_hash     TEXT,                         -- hash do IP só para auditoria de admins
  created_at  INTEGER NOT NULL
);
-- NOTA: admin_sessions referencia admin_users, NUNCA submissions.
```

**004_news.sql** — notícias curadas:
```sql
CREATE TABLE news_items (
  id          TEXT PRIMARY KEY,
  titulo      TEXT NOT NULL,
  resumo      TEXT NOT NULL,               -- resumo curto, NUNCA texto completo
  fonte       TEXT NOT NULL,               -- ex: "Agência Senado"
  url         TEXT NOT NULL,               -- link para a fonte original
  tags        TEXT,                        -- JSON array de hashtags
  categoria   TEXT,                        -- regulação, internacional, pesquisa...
  status      TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','aprovada','rejeitada','destaque')),
  publicado_em INTEGER,
  curado_por  TEXT REFERENCES admin_users(id),
  created_at  INTEGER NOT NULL
);
```

**005_legal.sql** — base legal:
```sql
CREATE TABLE legal_refs (
  id          TEXT PRIMARY KEY,
  practice_id TEXT NOT NULL,               -- ex: "1.1", "3.4"
  norma       TEXT NOT NULL,
  artigo      TEXT NOT NULL,
  descricao   TEXT NOT NULL,
  url         TEXT,
  updated_by  TEXT REFERENCES admin_users(id),
  updated_at  INTEGER NOT NULL
);
CREATE INDEX idx_legal_practice ON legal_refs(practice_id);
```

### 5.x Rotas novas no Worker

```
PÚBLICAS (anônimas):
  POST   /v1/submissions              cria avaliação, retorna edit_code (uma vez)
  GET    /v1/submissions/:codeHash    recupera avaliação por hash do código
  PUT    /v1/submissions/:codeHash    atualiza avaliação existente
  GET    /v1/news                     lista notícias aprovadas (público)
  GET    /v1/legal/:practiceId        referências legais de uma prática

ADMIN (JWT obrigatório):
  POST   /admin/auth/login            login, retorna JWT
  POST   /admin/auth/logout
  GET    /admin/users                 lista usuários (super_admin)
  POST   /admin/users                 cria usuário (super_admin)
  PATCH  /admin/users/:id             edita/desativa (super_admin)
  GET    /admin/data                  dados agregados com filtros
  GET    /admin/export/pdf            exporta PDF
  GET    /admin/export/xlsx           exporta Excel
  GET    /admin/news                  lista todas as notícias (incl. pendentes)
  POST   /admin/news/aggregate        dispara agregador RSS/API
  PATCH  /admin/news/:id              aprova/rejeita/destaca
  GET    /admin/legal                 lista base legal
  PUT    /admin/legal/:id             edita referência legal
```

### 5.x Middleware de autenticação admin

```typescript
// apps/worker/src/middleware/adminAuth.ts
// Verifica JWT no header Authorization
// Valida sessão em admin_sessions (não expirada)
// Anexa user + role ao contexto
// RBAC: super_admin (tudo), gestor (dados+notícias+legal), leitor (só leitura)
```

**✅ Conclusão Fase 5:** rotas públicas e admin separadas; JWT válido; RBAC
aplicado; recuperação por código funciona via hash; nenhuma rota cruza os dois mundos.

---

## Fase 6 [EXPANDIDA] — Frontend público (10 telas)

Telas 1–8: seguir `MMGIA_ZOVA_PROMPT.md` (base) + `MMGIA_DESIGN_PROMPT.md`
(componentes) + `MMGIA_GAPS.md` (resultado e painel) + estética Venus com
Plus Jakarta Sans + interações de `MMGIA_VENUS_INTERACTIONS.md`.

### Tela 9 [NOVA] — Editar com código (`/editar/:codigo?`)

Layout:
```
┌─────────────────────────────────────────────┐
│  // editar_avaliação                         │
│  Editar uma avaliação existente              │
│                                              │
│  Cole o código que você guardou ao final     │
│  da sua avaliação:                           │
│  ┌─────────────────────────────────┐         │
│  │ a3f8-2b91-...                   │ [Buscar]│
│  └─────────────────────────────────┘         │
│                                              │
│  ⚠ Não tem o código? Sem ele, não é possível │
│    recuperar a avaliação (não pedimos e-mail │
│    nem qualquer dado de identificação).      │
│    Você pode iniciar uma nova avaliação.     │
└─────────────────────────────────────────────┘
```

Comportamento:
- Campo aceita o código UUID; ao buscar, faz hash no browser e chama
  `GET /v1/submissions/:codeHash`
- Se encontrado: carrega as respostas no `assessment.store` e redireciona
  para `/avaliacao` em modo edição (banner "Editando avaliação existente")
- Se não encontrado: mensagem clara, sem vazar se o código existe ou não
- Aviso explícito sobre irrecuperabilidade (decisão registrada)
- Link de "Editar com meu código" aparece no hero da landing

### Tela 10 [NOVA, Fase B] — Notícias (`/noticias`)

Seguir o mockup validado (estilo Venus). Estrutura:
- Hero com eyebrow + título + subtítulo
- Faixa de trending topics (hashtags clicáveis que filtram)
- Notícia em destaque (card grande) + 3 secundárias
- Grade de cards das últimas notícias
- Cada card: tag de categoria, título, resumo curto, fonte, data, link externo
- **Direitos autorais:** nunca o texto completo; sempre redireciona à fonte
- Dados de `GET /v1/news` (apenas aprovadas)

### Código de avaliação no fluxo de Resultado

Ao submeter a avaliação (`POST /v1/submissions`), o Worker gera um UUID,
guarda só o hash, e retorna o código em texto UMA VEZ. A tela de Resultado
exibe com destaque:
```
┌──────────────────────────────────────────┐
│  🔑 Seu código de avaliação               │
│  a3f8-2b91-4c7d-...                 [copiar]│
│  Guarde este código. É a única forma de    │
│  editar sua avaliação depois — não há      │
│  recuperação, pois não coletamos e-mail.   │
└──────────────────────────────────────────┘
```

**✅ Conclusão Fase 6:** 10 telas funcionais; código de avaliação gerado e
exibido; edição por código funciona; nenhuma identidade coletada.

---

## Fase 7 [NOVA] — Frontend admin (apps/admin)

App SEPARADO (`admin.mmgia.org.br`). Estética Gentelella (sidebar escura,
topbar, KPIs, tabelas densas) com brand MMGIA. Plus Jakarta Sans + Geist Mono.

### 7.1 apps/admin/package.json
Mesma stack do web (React + Vite + Tailwind + Zustand + Recharts), mais:
proteção de rota por JWT, `react-router` com guards de RBAC.

### Tela 11 — Login (`/login`)
```
Centralizado, fundo gradiente azul institucional.
Card branco com: logo MMGIA, campo e-mail, campo senha,
botão "Entrar", mensagem de erro inline.
RHF + Zod. POST /admin/auth/login. Guarda JWT em memória + httpOnly cookie.
Rate limit visual após 5 tentativas.
```

### Tela 12 — Dashboard + Gestão de dados (`/admin`)
Seguir o mockup Gentelella validado:
- Sidebar: Dashboard, Gestão de dados, Mapa nacional, Relatórios,
  Curadoria notícias, Base legal, Usuários, Perfis, Configurações
- Topbar: breadcrumb, busca por código, notificações, toggle tema
- 4 KPIs: total avaliações, score médio, no último mês, UFs com dados
- Tabela de registros: ID truncado, natureza, UF, setor, porte, score, nível,
  período, ações (ver/excluir). NUNCA nome da organização.
- Filtros: setor, porte, UF, natureza, período + botão Aplicar
- Exportação: botão PDF (usa @mmgia/pdf) e Excel (usa @mmgia/xlsx)
- 2 painéis: score médio por dimensão + distribuição por nível
- `painel.store.ts` admin reutiliza lógica do `MMGIA_GAPS.md`

### Tela 13 — Usuários + Perfis RBAC (`/admin/usuarios`)
- Tabela de usuários: nome, e-mail, perfil (badge), status, último login, ações
- Botão "Novo usuário" abre modal: nome, e-mail, perfil (select), senha inicial
- 3 perfis com permissões documentadas:
  - `super_admin`: tudo, incluindo gestão de usuários
  - `gestor`: dados + notícias + base legal (sem gestão de usuários)
  - `leitor`: somente leitura
- Apenas super_admin acessa esta tela (guard de rota)
- Editar/desativar usuário (nunca excluir, só desativar — auditoria)

### Tela 15 — Base legal (`/admin/base-legal`)
- Lista as 45 práticas agrupadas por dimensão (accordion)
- Cada prática: referências legais editáveis (norma, artigo, descrição, url)
- Adicionar/editar/remover referência
- Salva via `PUT /admin/legal/:id`
- Preview de como aparece no relatório da organização

**✅ Conclusão Fase 7:** login com JWT; RBAC aplicado nas rotas; gestão de dados
com filtros e exportação PDF/Excel; CRUD de usuários; base legal editável;
todos os dados exibidos são anônimos/agregados.

---

## Fase 8 [NOVA, Fase B] — Notícias (agregador + curadoria)

### 8.1 Agregador no Worker

```typescript
// apps/worker/src/services/newsAggregator.ts
// Fontes GRATUITAS:
//  - Google News RSS (sem chave): https://news.google.com/rss/search?q=...&hl=pt-BR
//  - GNews API (free tier): 100 req/dia
//  - NewsData.io (free tier): 200 req/dia
// Busca por queries: "governança IA", "regulação inteligência artificial",
//   "AI Act", "ENIA", "LGPD inteligência artificial"
// Salva como status='pendente' em news_items
// Deduplicação por URL
// Cron trigger diário (Cloudflare Cron Triggers — gratuito)
```

### 8.2 Tela 14 — Curadoria de notícias (`/admin/noticias`)
- Lista notícias pendentes/aprovadas/rejeitadas (filtro por status)
- Cada item: título, resumo, fonte, tags, data, preview do link
- Ações: aprovar, rejeitar, marcar como destaque, editar tags/categoria
- Botão "Buscar novas" dispara `POST /admin/news/aggregate`
- Só notícias `aprovada`/`destaque` aparecem no `/noticias` público

### 8.3 Conformidade com direitos autorais
- Armazenar e exibir apenas título + resumo curto (≤ 2 linhas)
- NUNCA o texto completo do artigo
- Sempre creditar a fonte e linkar para a origem
- Card abre a fonte original em nova aba

**✅ Conclusão Fase 8:** agregador busca de RSS/API gratuitos; curadoria
funciona; notícias aprovadas aparecem no público; sem reprodução de texto integral.

---

## Fase 10 — Verificação final completa

### Checklist de telas (15)
```
apps/web (10):
□ Landing — hero + mapa Brasil + counters + serviços + CTA escuro + notícias preview + footer
□ Onboarding — 3 etapas com validação
□ Avaliação — 45 práticas, auto-save, sidebar score
□ Revisão — accordion + radar
□ Resultado — score + gaps + plano de ação + benchmark + código de avaliação + downloads
□ Painel Público — mapa UF + filtros + KPIs + insights + heatmap + trend
□ Metodologia — seções + base legal por prática
□ Open Data — CSV/JSON + schema
□ Editar com código — busca por hash + aviso de irrecuperabilidade
□ Notícias — trending + destaque + grade (Fase B)

apps/admin (5):
□ Login — JWT + rate limit
□ Dashboard/Gestão — KPIs + tabela anônima + filtros + export PDF/Excel
□ Usuários/RBAC — CRUD + 3 perfis
□ Curadoria notícias — aprovar/rejeitar/destaque (Fase B)
□ Base legal — 45 práticas editáveis
```

### Checklist de tema e interações
```
□ Theme switcher: 6 cores + claro/escuro, persiste
□ Accent muda botões/eyebrows/barras/ícones — não muda logo/score/governança
□ Scroll reveal, counters animados, carrossel, hover lift, nav drawer, back-to-top
□ Tipografia: Plus Jakarta Sans (títulos+corpo) + Geist Mono (dados)
□ prefers-reduced-motion desativa animações
```

### Checklist de privacidade (CRÍTICO)
```bash
# Banco público sem colunas de identidade
sqlite3 mmgia.db ".schema submissions" | grep -iE "ip|nome|cnpj|email" # deve ser VAZIO

# CSV sem identidade
head -1 export.csv  # NÃO deve conter: ip, email, nome, cnpj

# Dois mundos isolados: nenhuma FK de admin_* para submissions
sqlite3 mmgia.db ".schema" | grep -A2 "admin_sessions" | grep "submissions" # deve ser VAZIO

# Código de avaliação: só hash no banco, nunca texto plano
sqlite3 mmgia.db "SELECT edit_code_hash FROM submissions LIMIT 1" # deve ser hash, não UUID legível
```

### Checklist de qualidade
```
□ pnpm typecheck — zero erros
□ pnpm lint — zero erros
□ pnpm test — cobertura ≥ 80%
□ pnpm build — todas as 3 apps buildam
□ axe-core — 0 violações críticas em todas as 15 telas
□ Bundle web < 200KB gzip
□ Mobile 375px — todas as telas sem overflow horizontal
```

---

## Comportamento esperado do Claude Code

1. Ler este arquivo + os 5 complementares antes de começar.
2. Executar fase por fase (0 → 10), na ordem.
3. Ao fim de cada fase, rodar a verificação correspondente.
4. Priorizar Fase A; a Fase B (notícias) pode ser feita por último.
5. Manter os dois mundos isolados em TODA decisão de código.
6. Nunca coletar, armazenar ou exibir dados de identidade de organizações.
7. Três arquivos por componente; TypeScript strict; tokens para cores.
8. Em caso de dúvida sobre design, consultar os mockups descritos nos
   complementares (Zova para público, Gentelella para admin, Venus para
   interações e tipografia).

---

*MMGIA CLAUDE.md v2 · roteiro mestre consolidado · 15 telas · 3 apps · MIT*
*Fase A (núcleo) + Fase B (notícias) · anônimo por design · ENIA 2026–2029*
