# Registro de Conversas do Projeto — Sessão 003

*   **Data:** 17–21 de Setembro de 2026
*   **Participantes:** Usuário (Desenvolvedor) & Claude Code (Interactive CLI Agent)
*   **Objetivo:** Analisar o status do projeto frente ao `CLAUDE.md`, confrontar o modelo de maturidade implementado com o documento oficial do MMGIA, corrigir a metodologia de cálculo, evoluir o relatório de resultado e limpar código morto do repositório.

---

## 1. Análise do status atual do projeto

Comparação entre o roteiro mestre (`CLAUDE.md`, monorepo com 3 apps + Cloudflare Worker + Turso) e o estado real do repositório: uma **SPA única** (React 19 + Vite + Tailwind 4), sem backend, persistência em `localStorage`, roteamento via `useState` em `App.tsx`. 8/10 telas públicas e 2/5 telas admin implementadas, sem JWT/RBAC real. Confirmado que 2 commits já estavam publicados em `origin/main`, com 10 arquivos modificados e não commitados na sessão anterior.

---

## 2. Análise de 13 pontos entregue pelo usuário

O usuário colou uma análise externa do sistema MMGIA com 13 críticas: linguagem rebuscada, necessidade de aprovação do Grupo de Pesquisa, evidências desalinhadas do modelo, avaliação "por degrau" em vez de média, resultado por eixo (não global), práticas sem prioridade de execução, pergunta inicial de nível-alvo (padrão COBIT), e correções pontuais de texto ("Correlação" → "Alinhamento", remover "rigor acadêmico").

**Aplicado de imediato** (baixo risco, instrução literal do usuário):
*   `LandingPage.tsx`: "Correlação com 5 marcos normativos." → "Alinhamento com 5 marcos normativos."
*   `LandingPage.tsx`: "Score ponderado com rigor acadêmico." → "Score ponderado por eixo estratégico."
*   `AdminDashboard.tsx`: "Correlação Trilateral de Base Legal" → "Alinhamento Trilateral de Base Legal" (mesma troca de termo, mesmo contexto).

**Não implementado ainda:** o restante dos 13 pontos aponta para um redesenho do modelo de maturidade (score por degrau/eixo em vez de média global ponderada) — sinalizado como decisão grande demais para assumir sozinho, especialmente após o achado da seção 3.

---

## 3. Leitura do PDF oficial do MMGIA — achado crítico

A pedido do usuário, foi lido por completo o documento oficial `Modelo de Maturidade em Governança de Inteligência Artificial (MMGIA)` (29 páginas: conceitos fundamentais, níveis 0-5, escala NPLF, as 45 práticas por dimensão, metodologia de cálculo).

**Achado 1 — o cálculo já batia com o oficial:** pesos por dimensão (25/20/25/15/15%), escala NPLF→numérico e a tabela de conversão Score Global→Nível já eram implementados corretamente em `Result.tsx`. Isso contradiz o pedido de "modelo por degrau/eixo" da análise de 13 pontos — que continua pendente de confirmação com o Grupo de Pesquisa, já que entra em conflito direto com o documento oficial.

**Achado 2 — muito mais grave: as 45 práticas do app não eram as práticas do PDF.** Nomes, descrições, critérios e evidências completamente diferentes entre o catálogo do app (`types.ts`) e o documento oficial, apesar da mesma distribuição de níveis (1+2+2+2+2 = 9 práticas por dimensão). Isso explicava, de raiz, boa parte da análise de 13 pontos (linguagem, evidências desalinhadas, "modelo não passou por rigor").

**Decisão do usuário:** substituir as 45 práticas pelas do PDF; **não mexer** no modelo de score (global vs. por eixo/degrau) até confirmação do Grupo de Pesquisa.

---

## 4. Reescrita do catálogo de práticas (`types.ts`)

*   As 45 práticas substituídas integralmente pelo conteúdo oficial do PDF (nome, descrição detalhada, evidência mínima esperada).
*   Novo campo `criterion` (Critério de Verificação) adicionado à interface `Practice` e às 45 práticas — existia no PDF, não existia no app.
*   Nomes e "Objetivo do Eixo" das 5 dimensões corrigidos para o texto oficial (ex.: "Governança e Inteligência" → "Governança e Arcabouço Regulatório").
*   Referências legais recriadas com base no conteúdo de cada prática nova — **estimativa própria, não vem do PDF** (que não traz coluna de base legal). Fica pendente de validação jurídica/Grupo de Pesquisa.
*   UI atualizada para exibir o critério de verificação (`Questionnaire.tsx`, `Methodology.tsx`) e nomes de dimensão corrigidos em `Result.tsx`, `Revision.tsx`, `ReportViewer.tsx` (estavam hardcoded e inconsistentes entre si em 3 lugares).
*   `getGapRecommendation`, duplicada em `Result.tsx`/`Revision.tsx` com um dicionário de recomendações amarrado às práticas antigas, foi trocada por lógica derivada dos dados (`practice.criterion` + esforço pelo nível).

---

## 5. Correção da fórmula de cálculo

A pedido do usuário, a metodologia oficial foi explicada passo a passo (NPLF→numérico, score por nível dentro da dimensão, score da dimensão, score global ponderado, conversão para nível 0-5).

**Erro identificado no PDF:** o Passo 4 ("Score Dimensão = Σ Score de todos os Níveis / Número Total de Práticas na Dimensão") é matematicamente inconsistente com o próprio exemplo numérico do documento — dividir por 9 (práticas) em vez de 5 (níveis) tornaria impossível atingir os scores de dimensão mostrados no exemplo (ex. 2.2). Diagnosticado como errata de redação, não falha conceitual.

**Proposta de correção entregue** para os dois lados: texto corrigido para o guia (documento), e um refactor de código para o sistema — criar um módulo único de cálculo em vez de manter a lógica triplicada.

---

## 6. Implementação da correção (aprovada pelo usuário: "implemente a e b")

*   Criado `src/lib/scoring.ts`: `getDimensionScore` (Passos 3+4 corrigidos — média por nível, depois média dos níveis respondidos), `getAllDimensionScores`, `getGlobalScore` (Passo 5, inalterado), `getMaturityLevel` (conversão final, inalterada).
*   **4 cópias divergentes da lógica de score** consolidadas: `Result.tsx`, `Revision.tsx`, `ReportViewer.tsx` (pequenas divergências entre si, ex. tokens de cor diferentes) e uma quarta em `Questionnaire.tsx` — essa última pior ainda (score global sem ponderação nenhuma, tabela de níveis com faixas e rótulos diferentes dos oficiais) e **inteiramente código morto** (nunca renderizada), removida em vez de conectada.
*   Efeito prático: scores de dimensão mudam de valor onde os níveis têm quantidade desigual de práticas (ex.: só cumprir a prática do Nível 1 de uma dimensão sobe de 0,33 para 0,60).

---

## 7. Evolução aditiva do modelo — "Camada 1: Nível por Eixo"

Proposta de evolução em duas camadas, sem tocar pesos/conversão global:
*   **Camada 1 (implementada, aprovada pelo usuário):** `getAllDimensionLevels` em `scoring.ts` — reaplica a mesma tabela de conversão já usada no score global a cada dimensão. Badge "Nível X · Rótulo" adicionado em `Result.tsx`, `Revision.tsx` e na tabela de scores de `ReportViewer.tsx` (tanto na versão em tela quanto na versão HTML estática usada para impressão/exportação).
*   **Camada 2 (modelo por degrau/CMM-SEI, só desenhada, não implementada):** um modelo escalonado onde o nível da organização trava no primeiro nível não satisfeito, com um threshold (NPLF ≥ L ou ≥ F) que **o PDF não define** — segue pendente de decisão do Grupo de Pesquisa.

---

## 8. Varredura e limpeza de código morto

A pedido do usuário ("veja se tem código lixo em uso"), foi disparado um fork de pesquisa cobrindo todo `src/` (18 arquivos, ~10 mil linhas). Achados organizados em duas frentes:

**Frente 1 — limpeza segura, implementada nesta sessão:**
*   Imports/aliases de ícones mortos removidos em `Result.tsx`, `Revision.tsx`, `ReportViewer.tsx`, `PublicPanel.tsx`, `RadarChart.tsx` — incluindo aliases que o scan inicial não pegou e foram achados por conferência manual exaustiva (`CheckCircle2`, `ListTodo`, `ChevronDownIcon`, `ChevronUpIcon`, `ClipboardCheckIcon`, `XCircle`, entre outros).
*   Estado morto `showEvidence`/`setShowEvidence` removido de `Questionnaire.tsx`.
*   Exports mortos removidos de `types.ts`: `LegalCorrelation`, `AssessmentState`, `INITIAL_ASSESSMENT`.
*   `getSectorBenchmarks`/`getPeerAverageGlobal` — mais uma triplicação, movida para `scoring.ts`; no processo, achado que `sectorBenchmarks` (objeto completo) era declarado mas nunca lido em `Revision.tsx`/`ReportViewer.tsx` (só `peerAverageGlobal` era usado) — removido.
*   `package.json`: removidas 5 dependências nunca importadas em `src/` (`@google/genai`, `dotenv`, `dotted-map`, `express`, `@types/express`) — sobra do scaffold original (AI Studio/Gemini). `npm install` removeu 132 pacotes transitivos.
*   `tsc --noEmit` e `vite build` verificados limpos após cada rodada de edição.

**Frente 2 — decisões do usuário, ainda pendentes:**
*   Bug real: `LandingPage.tsx` recebe a prop `theme` mas nunca a desestrutura — a Landing inteira ignora o modo escuro.
*   Cluster morto do botão "copiar código" em `Revision.tsx` (`copied`/`handleCopyCode` sem nenhum `onClick` e sem leitura no JSX) — conectar ou remover.
*   2 arquivos órfãos nunca importados: `NewsBlog.tsx` e `PlexusBackground.tsx` — deletar ou manter como scaffold da Fase B (notícias).

---

## 9. Início do ambiente local

Servidor de desenvolvimento iniciado em background (`npm run dev`), confirmado respondendo em `http://localhost:3000/` (HTTP 200, Vite pronto em 386ms).

---

## 10. Pendências gerais ao final da sessão

*   Confirmação do Grupo de Pesquisa sobre modelo por eixo/degrau (Camada 2) vs. modelo global ponderado do PDF oficial.
*   Correção formal do Passo 4 da metodologia a ser levada ao documento/Grupo de Pesquisa.
*   Validação jurídica das referências legais recriadas para as 45 práticas novas.
*   Decisões da Frente 2 da limpeza de código (bug do theme, botão de copiar, arquivos órfãos).
*   Itens 1, 3, 9, 11, 12 da análise original de 13 pontos (linguagem simples nas evidências/critérios, priorização de práticas, pergunta de nível-alvo por eixo) ainda não endereçados.

---
*Fim do registro da Sessão 003.*
