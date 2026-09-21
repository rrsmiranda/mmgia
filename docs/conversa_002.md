# Registro de Conversas do Projeto — Sessão 002

*   **Data:** 18 de Junho de 2026
*   **Participantes:** Usuário (Desenvolvedor) & Claude Code (Interactive CLI Agent)
*   **Objetivo:** Avaliar a experiência do usuário (UX) e o design da aplicação MMGIA, e aplicar as primeiras correções de design priorizadas.

---

## 1. Demanda Inicial

O usuário solicitou, a partir da leitura dos documentos em `docs/` e do código-fonte:

1.  Uma análise de **UX** ("como a interface pode ser melhorada? O que está faltando?").
2.  Em seguida, uma análise específica de **design visual** ("quanto ao design, o que pode melhorar?").
3.  Por fim, a **aplicação das correções** ("faça as correções" → "sim").

---

## 2. Análise de UX (Resumo das Conclusões)

A interface tem alta qualidade visual (animações `motion`, dark mode, mapa interativo), mas foram identificadas lacunas relevantes — algumas de **confiança e integridade de dados**, não só estética:

### Problemas críticos
*   **Código de recuperação só aparece no final** (`Result.tsx:514`), mas o autosave depende dele (`App.tsx:66`). Quem abandona no meio das 45 práticas **não consegue recuperar**.
*   **Resultado pode ser gerado com perguntas em branco**, inflando o score (`getDimensionScore` faz média só das respondidas — `Result.tsx:67`). Sem aviso de completude.
*   **Dados comparativos fictícios apresentados como reais** (benchmark, percentil 68%, melhor score 2.71, plano de ação e cronograma — todos hardcoded em `Result.tsx`). Risco de confiança para ferramenta de governança.
*   **Ações destrutivas sem confirmação** ("Novo Diagnóstico", "Iniciar avaliação" apagam respostas).
*   **Export/PDF é mock** (`triggerDownload` apenas chama `window.print` após spinner falso).

### Acessibilidade
*   Fontes minúsculas em excesso (`text-[8px]`–`text-[10px]`).
*   `select-none` global impede copiar texto.
*   Cards clicáveis como `div` (sem foco/teclado) no Onboarding.
*   Estado das respostas codificado **só por cor** (problema para daltônicos).
*   Sem `prefers-reduced-motion`.

### O que está faltando
*   Expectativa de tempo/quantidade no início; opção "Não se aplica"; campo de nota por prática; "salvar e sair" com retomada visível; glossário de jargão; visão global do percurso; otimização mobile do dashboard do questionário.

---

## 3. Análise de Design Visual (Resumo das Conclusões)

1.  **Shades de cor inexistentes (bug real):** ~120 usos de tons que não existem no Tailwind (`slate-650`, `slate-850`, `slate-150`, `red-650`, etc.). Sem definição no `@theme`, **não aplicavam cor alguma** — a tela renderizava diferente do projetado.
2.  **Tokens existem mas quase ninguém usa:** ~50 valores hex hardcoded; 4 "pretos" de fundo diferentes (`#0B1120`, `#101828`, `#141E30`, `#13293D`). `.premium-card` definido em `index.css:81` mas nunca utilizado.
3.  **Dark mode escrito à mão** via ternário `theme === 'dark' ? … : …` em cada componente → divergência entre telas.
4.  **`font-mono` exagerado** + estética snake_case de terminal (`score_global_mmgia`, `peer_group_benchmarking`) reduzindo a seriedade institucional.
5.  Escala tipográfica indisciplinada; raios/elevação sem escala; excesso de glows/blur/animações; semântica de cor diluída (mesmas cores como resposta, região e dimensão).

---

## 4. Correções Aplicadas

### Correção #1 — Shades de cor inválidos (CONCLUÍDA)
*   Adicionadas **33 definições de shades intermediários** ao bloco `@theme` em `src/index.css`, com valores interpolados (ponto médio entre os shades padrão vizinhos).
*   Cobertura: `slate` (105–905), `red` (105, 650), `sky` (55, 650), `emerald` (150, 250, 650), `cyan-650`, `blue` (250, 650), `indigo` (650, 805), `teal-405`, `purple-650`.
*   **Resultado:** as ~120 classes passaram a renderizar o tom sutil pretendido, sem editar nenhum componente (risco de regressão mínimo).
*   **Verificação:** `npm run build` ✅; confirmado no CSS final que os utilitários agora existem (antes eram zero).

### Correção #3 — Snake_case decorativo (CONCLUÍDA)
*   **14 rótulos** convertidos de snake_case (cosplay de terminal) para português legível, em 8 arquivos:
    *   PublicPanel: `dados_consolidados_br` → "Dados Consolidados · Brasil"; `dados_estado_foco` → "Dados do Estado em Foco".
    *   OpenData: `opendata_repository` → "Repositório de Dados Abertos".
    *   NewsBlog: `curadoria_diária_editorial` → "Curadoria Editorial Diária".
    *   EditAssessment: `// recuperar_diagnóstico` → "Recuperar Diagnóstico".
    *   Revision + Result: `equacao_ponderada_ativa` → "Equação Ponderada Ativa".
    *   Methodology: `metodologia_oficial`, `// pilar_essência` → "Fundamento", `// níveis_de_maturidade`, `// dretrizes_e_diretórios` (corrigido typo) → "Dimensões e Práticas", `// consonância_legal`.
    *   LandingPage: `modelo_maturidade_ia · enia…` → "Modelo de Maturidade em IA · ENIA 2026–2029"; `score_global` → "Score Global".
*   **Mantidos de propósito** (mono legítimo): snippets JSON literais (`"ip_address":`, `"score_global":`, `sem_nome/cnpj/email`), a fórmula `Σ (peso_d × média_NPLF_d)` e os roles reais `super_admin`. Código JS (`rec.score_global`) não tocado.
*   **Verificação:** `tsc --noEmit` ✅; `npm run build` ✅; grep confirma nenhum snake_case decorativo restante.

---

## 5. Pendências e Próximos Passos

*   **#2 (próximo):** consolidar os ~50 hex hardcoded em tokens (1 surface dark única, cinzas duplicados → tokens, adotar `.premium-card`). Mais trabalhoso e exige cuidado com regressão.
*   **#3 (segunda metade):** reduzir a *família* `font-mono` → `font-sans` nos eyebrows/labels de prosa (mais subjetivo; deixado para passo dedicado).
*   **#4–#6:** escala fechada de tipografia/raio/elevação; migrar dark mode para variante `dark:` + variáveis CSS; conter glows/blur/animações decorativas.
*   **Quick wins de UX** (ainda não iniciados): mostrar código de recuperação cedo; aviso de completude; rotular dados comparativos como ilustrativos; confirmação antes de apagar avaliação ativa.

---
*Fim do registro da Sessão 002.*
