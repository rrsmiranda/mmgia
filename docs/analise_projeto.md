# Análise de Maturidade e Alinhamento do Projeto MMGIA (v1 vs. v2)

Este documento apresenta uma análise técnica profunda do projeto **MMGIA (Modelo de Maturidade em Governança de Inteligência Artificial)**, correlacionando o estado atual da base de código física (MVP v1) com as diretrizes e metas especificadas no documento mestre `CLAUDE.md` (Arquitetura Completa v2).

---

## 1. Resumo Executivo

O projeto MMGIA é uma iniciativa de alta relevância para a conformidade civil e governança de Inteligência Artificial no Brasil, alinhando-se à **ENIA 2026–2029**, **LGPD**, **ISO/IEC 42001** e as diretrizes do **PL 2338/2023**.

### O Contraste de Arquitetura:
*   **O Plano Teórico (CLAUDE.md):** Estabelece a criação de um **Monorepo** com 3 aplicações distintas e isoladas (`apps/web`, `apps/admin`, `apps/worker`), garantindo um isolamento físico rigoroso entre o "Mundo Público" (anônimo) e o "Mundo Admin" (identificado).
*   **A Implementação Física Atual (MVP v1):** Encontra-se na forma de uma **Single Page Application (SPA) unificada de alta fidelidade** desenvolvida em **React 19, Vite, TypeScript e Tailwind CSS v4**. O aplicativo simula com maestria as interações de ambos os mundos dentro do mesmo frontend por meio de roteamento interno baseado em estados (`currentTab`), persistência de simulação no `localStorage`, e componentes ricos.

---

## 2. Estrutura de Arquivos Existente (Mapeamento Físico)

O projeto atual no diretório raiz apresenta a seguinte arquitetura de SPA:

```
mmgia/
├── assets/                  # Ativos visuais estáticos
├── docs/                    # Documentação do projeto e registros de decisões [Criado agora]
├── src/
│   ├── App.tsx              # Componente mestre com roteamento baseado em estados
│   ├── index.css            # Estilização global com Tailwind CSS v4
│   ├── main.tsx             # Ponto de entrada do React 19
│   ├── types.ts             # Tipos compartilhados da aplicação
│   ├── svg-maps.d.ts        # Tipagem para mapas vetoriais do Brasil
│   └── components/          # 17 componentes funcionais de tela e comportamento:
│       ├── Header.tsx             # Navbar global de navegação e Switcher de Tema
│       ├── LandingPage.tsx        # Tela inicial com proposta de valor, estatísticas e CTAs
│       ├── Onboarding.tsx         # Fluxo de triagem em 3 etapas (Natureza, Setor, Porte)
│       ├── Questionnaire.tsx      # Interface de avaliação das 45 práticas de maturidade
│       ├── Revision.tsx           # Revisão das respostas com gráfico de radar
│       ├── Result.tsx             # Painel de resultados da empresa (Gaps e Plano de Ação)
│       ├── PublicPanel.tsx        # Painel público de dados agregados com mapa do Brasil
│       ├── BrazilMap.tsx          # Mapa interativo interligado aos dados de UFs
│       ├── Methodology.tsx        # Detalhamento metodológico e referências de base legal
│       ├── OpenData.tsx           # Exportação e acesso a microdados (JSON/CSV)
│       ├── EditAssessment.tsx     # Recuperação de diagnóstico anterior via código UUID
│       ├── NewsBlog.tsx           # Agregador visual de notícias regulatórias de IA
│       ├── AdminLogin.tsx         # Tela de autenticação administrativa do painel
│       ├── AdminDashboard.tsx     # Interface de administração com KPIs, filtros e gestão
│       ├── ReportViewer.tsx       # Visualizador formatado para exportação/impressão do relatório
│       ├── RadarChart.tsx         # Componente visual para exibição das dimensões de maturidade
│       └── PlexusBackground.tsx   # Efeito visual futurista de fundo (Plexus/Constelações)
```

---

## 3. Alinhamento com as Regras de Negócio do CLAUDE.md

### A. Princípio dos Dois Mundos (Anonimidade Criptográfica)
O `CLAUDE.md` preconiza que a anonimidade do usuário público é inegociável.
*   **No MVP Atual:** Esse comportamento é emulado localmente. No arquivo `App.tsx`, o código de sessão UUID é gerado no navegador e as respostas são salvas no `localStorage` sob a chave `mmgia_session_[UUID]`. Na transição para o ambiente em nuvem real, as submissões serão enviadas ao Cloudflare Worker (`apps/worker`), o qual salvará apenas o **hash SHA-256** do UUID no banco Turso/SQLite (`submissions`), destruindo o texto claro original e garantindo que ninguém consiga deduzir a identidade do avaliado de forma reversa.

### B. Tecnologias & Performance
*   **React 19 & Tailwind CSS v4:** A base técnica já é extremamente moderna. O uso do Tailwind v4 (`@tailwindcss/vite`) na SPA elimina a necessidade de configurações complexas do PostCSS.
*   **Tipografia Venus:** O tema Plus Jakarta Sans (para títulos/corpo) e Geist Mono (para elementos de dados técnicos) está perfeitamente alinhado com o guia visual de interações.

---

## 4. Análise de Lacunas (Gap Analysis) para Produção (Fase A/B)

Para transformar a SPA MVP atual na arquitetura de produção escalável e de custo zero proposta no `CLAUDE.md`, precisaremos realizar as seguintes transições técnicas:

| Recurso / Módulo | Estado Atual no MVP (SPA) | Requisito de Produção (CLAUDE.md) | Ações Necessárias para Migração |
| :--- | :--- | :--- | :--- |
| **Isolamento de Apps** | Roteamento por estado (`App.tsx`) na mesma SPA. | Monorepo pnpm + Turborepo dividindo em `apps/web`, `apps/admin` e `apps/worker`. | Reorganizar a estrutura de pastas e segmentar os componentes em seus respectivos apps. |
| **Banco de Dados** | Simulado via `localStorage`. | Banco SQLite (Turso) com tabelas `submissions`, `admin_users`, `news_items` e `legal_refs`. | Criar o Cloudflare Worker e rodar as migrações SQL (001 a 005) descritas no `CLAUDE.md`. |
| **Autenticação Admin** | Simulada sem validação criptográfica real. | Login via JWT assinado pelo Worker com RBAC (`super_admin`, `gestor`, `leitor`). | Implementar o middleware de autenticação no Worker e acoplar a validação real na tela de login. |
| **Geração de PDF/Excel** | ReportViewer estático para impressão. | Pacotes `@mmgia/pdf` (client-side) e `@mmgia/xlsx` (via `exceljs`). | Integrar bibliotecas como `jspdf` / `html2canvas` para PDF e `exceljs` para gerar planilhas limpas e estilizadas na exportação admin. |
| **Agregador de Notícias** | Exibição de cards estáticos no Blog. | Cron Trigger no Cloudflare Worker buscando dados via RSS do Google News / APIs gratuitas. | Codificar o `newsAggregator.ts` no backend para automatizar a captura diária de notícias sobre regulação de IA. |

---

## 5. Estratégia de Implementação Gradual

O MVP atual é um ponto de partida excepcional, pois **toda a camada de interface (UI/UX) já está desenhada e com alta qualidade visual**. A transição deve focar na separação da SPA para o monorepo sem quebrar a coesão das interfaces existentes:

1.  **Criação do Workspace Monorepo:** Configurar `pnpm-workspace.yaml` e `turbo.json`.
2.  **Extracção de Shared & UI:** Mover os schemas, algoritmos de cálculo de score e referências da base legal para `packages/shared`. Mover os componentes compartilhados (ex: `PlexusBackground`, `ThemeSwitcher`) para `packages/ui`.
3.  **Deploy do Worker:** Subir o backend no Cloudflare Worker com integração ao Turso (D1).
4.  **Distribuição das Telas:**
    *   Mover as telas de avaliação, resultado, painel público e metodologia para `apps/web`.
    *   Mover o login administrativo, dashboard de dados, RBAC de usuários e curadoria para `apps/admin`.

---

## 6. Próximos Passos Imediatos

*   **Validação da SPA Local:** Certificar-se de que o fluxo do MVP atual roda de ponta a ponta sem erros de compilação ou de tipagem TypeScript (`npm run lint` / `tsc --noEmit`).
*   **Estruturação de Documentos de Sessão:** A pasta `docs/` servirá como repositório central das sessões de trabalho, decisões arquiteturais (ADRs) e feedbacks recebidos do usuário para rastreabilidade de evolução do projeto.

---
*Análise elaborada pela ferramenta opencode em 18 de Junho de 2026.*
