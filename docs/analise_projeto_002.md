# Análise do Projeto MMGIA - 09/09/2026

## Status do Git

- **Branch:** `main` (atualizada com `origin/main`)
- **Commits:** 2 commits
  - `feat: initial commit - MMGIA MVP v1`
  - `chore: update page title to MMGIA`
- **Alterações pendentes:** 10 arquivos modificados + 2 novos (NÃO commitados)

### Arquivos Modificados (não commitados)
- `.gitignore`
- `src/components/EditAssessment.tsx`
- `src/components/LandingPage.tsx`
- `src/components/Methodology.tsx`
- `src/components/NewsBlog.tsx`
- `src/components/OpenData.tsx`
- `src/components/PublicPanel.tsx`
- `src/components/Result.tsx`
- `src/components/Revision.tsx`
- `src/index.css`

### Arquivos Novos (não commitados)
- `CLAUDE.md`
- `docs/`

---

## Comparação: Projeto Atual vs. CLAUDE.md

| Aspecto | Projeto Atual | CLAUDE.md (Plano Completo) |
|---------|---------------|----------------------------|
| **Estrutura** | SPA React simples | Monorepo (3 apps + 4 packages) |
| **Backend** | Não existe | Cloudflare Worker (api.mmgia.org.br) |
| **Banco de dados** | localStorage | Turso/SQLite com migrations |
| **Telas públicas** | 8 de 10 | 10 telas |
| **Telas admin** | 2 de 5 | 5 telas |
| **Componentes** | 17 arquivos | 15 telas × 3 arquivos cada |

---

## O que existe no projeto atual

### Estrutura de arquivos
```
mmgia mvp v1/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   └── components/
│       ├── AdminDashboard.tsx
│       ├── AdminLogin.tsx
│       ├── BrazilMap.tsx
│       ├── EditAssessment.tsx
│       ├── Header.tsx
│       ├── LandingPage.tsx
│       ├── Methodology.tsx
│       ├── NewsBlog.tsx
│       ├── Onboarding.tsx
│       ├── OpenData.tsx
│       ├── PlexusBackground.tsx
│       ├── PublicPanel.tsx
│       ├── Questionnaire.tsx
│       ├── RadarChart.tsx
│       ├── ReportViewer.tsx
│       ├── Result.tsx
│       └── Revision.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vercel.json
```

### Stack atual
- React 19 + Vite
- Tailwind CSS 4
- TypeScript
- Deploy na Vercel

### Funcionalidades implementadas
1. **Landing Page** - Hero com mapa Brasil, contadores, serviços
2. **Onboarding** - 3 etapas de coleta de metadata
3. **Questionnaire** - 45 práticas de governança
4. **Revisão** - Accordion + Radar Chart
5. **Resultado** - Score global, gaps, plano de ação
6. **Painel Público** - Mapa UF, filtros, KPIs
7. **Metodologia** - Seções explicativas
8. **Open Data** - CSV/JSON export
9. **Editar com código** - Busca por código de sessão
10. **Admin Login** - Tela de login simples
11. **Admin Dashboard** - Gestão básica de dados

---

## O que falta (conforme CLAUDE.md)

### 1. Arquitetura Monorepo
- `apps/web/` - SPA pública
- `apps/admin/` - SPA administrativa
- `apps/worker/` - Cloudflare Worker
- `packages/shared/` - Schemas Zod + scoring
- `packages/ui/` - Design system
- `packages/pdf/` - Geração de PDF
- `packages/xlsx/` - Geração de Excel
- `infra/` - Migrations e seeds

### 2. Backend (Cloudflare Worker)
- API pública anônima (POST/GET/PUT submissions)
- API admin com JWT + RBAC
- Autenticação de administradores
- Middlewares de autorização

### 3. Banco de Dados
- Tabela `submissions` (anônima, sem identidade)
- Tabela `admin_users` (identificada)
- Tabela `admin_sessions` (JWT)
- Tabela `news_items` (notícias curadas)
- Tabela `legal_refs` (base legal das 45 práticas)

### 4. Design System (packages/ui)
- Tipografia: Plus Jakarta Sans + Geist Mono
- Theme switcher com 6 cores de accent
- Modo claro/escuro
- Tokens de cores centralizados
- Hooks personalizados (useReveal, AnimatedCounter, etc.)

### 5. Funcionalidades Avançadas
- Base legal das 45 práticas com referências (LGPD, AI Act, ISO 42001, ENIA)
- Sistema de notícias com agregador RSS
- Curadoria de notícias na área admin
- Exportação PDF client-side
- Exportação Excel para admin

### 6. Infraestrutura
- CI/CD com GitHub Actions
- Turso/SQLite para banco de dados
- Cloudflare para Worker e CDN
- k-anonimidade ≥ 5 no painel público

---

## Conclusão

**O projeto é um MVP funcional**, mas está longe de ser a plataforma completa descrita no CLAUDE.md. O MVP atual permite:

- Realizar avaliações de maturidade
- Visualizar resultados individuais
- Explorar dados agregados públicos
- Acessar área administrativa básica

**Para alcançar o estado completo, seria necessário:**

1. Refatorar para monorepo
2. Implementar backend com autenticação
3. Criar banco de dados relacional
4. Desenvolver design system completo
5. Adicionar todas as 15 telas
6. Implementar base legal e sistema de notícias
7. Configurar CI/CD e infraestrutura

---

*Documento gerado em 09/09/2026*
