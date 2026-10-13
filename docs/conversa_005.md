# Registro de Conversas do Projeto — Sessão 005

*   **Data:** 10–13 de Outubro de 2026
*   **Participantes:** Usuário (Desenvolvedor) & Claude Code (Interactive CLI Agent)
*   **Objetivo:** Fechamento da auditoria de fidelidade metodológica na tela de Resultado (remoção de conteúdo fabricado, reorganização em abas), a mesma auditoria aplicada à landing page, e reescrita completa do Observatório Nacional (painel público) a partir de um prompt externo — mapa como filtro principal, sigilo k-anonimato ≥ 5 em cada recorte, e remoção de todo texto interpretativo escrito à mão.

---

## 1. Tela de Resultado — remoção do plano de ação fabricado

Threads finais de uma auditoria já em andamento: a lista de práticas por dimensão (`DimensionAnalysis.tsx`) trocou o badge de referência legal por `Nível X` + badge NPLF da resposta, e passou a mostrar as 9 práticas de cada dimensão (não só as de gap), esmaecendo as já respondidas em nível bom. O card "Plano de implementação prática" (`Result.tsx`) foi removido por inteiro — era um array estático de 4 itens (`ACTION_PLAN`), idêntico para qualquer organização independente das respostas reais, com um campo "esforço" sem nenhuma base na metodologia. O plano de ação real, derivado das respostas, já existia no relatório PDF (`ActionPlan.tsx`).

## 2. Resultado — conclusões e lacunas priorizadas trazidas do PDF para a tela

A pedido do usuário, levantada a questão "por que o relatório PDF tem informações que a tela não tem?". Implementadas duas seções novas em `Result.tsx`, replicando `report/Summary.tsx` e `report/ActionPlan.tsx`: "Principais conclusões" (as mesmas frases do sumário executivo do PDF) e "Lacunas priorizadas" (as práticas mais urgentes, mesma ordenação do plano de ação). Para evitar uma segunda cópia hardcoded dos números, a lógica de cálculo foi extraída para `getKeyFindings()` em `report/ActionPlan.tsx` — tela e PDF passam a consumir a mesma função, nunca podem divergir para a mesma organização.

## 3. Resultado — reordenação, abas e remoção de redundância

Revisão crítica pedida pelo usuário ("faz sentido o texto, a ordem, os dados?") encontrou: a frase de abertura do hero era fixa e contradizia os próprios dados da tela (prometia "cumpre grande parte das práticas" com 37 de 45 em gap e badge de Risco Alto); a lista de dimensões duplicava peso/contribuição que já apareciam na "Memória de cálculo"; e o card "O que significa cada nível" confundia mais do que ajudava. Corrigido: a frase do hero passou a vir de `levelInfo.desc` (a mesma descrição real do PDF); peso e contribuição migraram para a lista de dimensões abaixo do radar; e os quatro blocos de análise (Visão geral, Memória de cálculo, Principais conclusões, Lacunas priorizadas) viraram abas de verdade — só o conteúdo da aba ativa é renderizado, resolvendo ao mesmo tempo o problema de a página ficar comprida e evitando que o usuário precise rolar por tudo. Also corrigido, a pedido do usuário: ao selecionar uma dimensão no radar, a lista abaixo passa a mostrar só as práticas daquela dimensão, em vez de continuar listando as outras 4 fechadas.

## 4. Resultado — linha da lacuna navegando sozinha

O usuário reportou que, na aba "Lacunas priorizadas", clicar em qualquer ponto da linha (título, evidência, badge) já levava para a tela de edição. Causa: cada prática era renderizada como um `<button>` cobrindo a linha inteira. Trocado por uma linha não-interativa com um botão "Editar" explícito, no mesmo padrão já usado em `AnswerReview.tsx` — navegação só acontece com um clique direto no botão, nunca pela linha.

## 5. Landing page — auditoria de texto, dados e informações

A pedido do usuário, revisão completa da landing page contra as fontes canônicas (`scoring.ts`, `types.ts`) e contra o documento oficial já vetado em sessões anteriores. Dois erros concretos de dado: o card "Exemplo ilustrativo" mostrava um score global (1,72) que não batia com a média ponderada das próprias barras de dimensão exibidas ao lado (a conta correta dava 1,78); e uma citação "ISO 33001" na seção Metodologia não existe em nenhuma outra referência do app nem no documento oficial (a lista real cita CMMI e o modelo do MITRE). Outros achados: "1847 avaliações" aparecia como contagem real sem nenhum aviso de exemplo, quando não existe backend/banco ainda; a seção Privacidade e o FAQ descreviam infraestrutura (middleware nomeado, payload de API, provedores específicos) como se já estivesse implementada; e o card "Alinhamento regulatório" repetia o mesmo enquadramento já corrigido em `Methodology.tsx` em sessão anterior.

## 6. Landing page — correções aplicadas

Score do exemplo passou a ser calculado a partir das próprias barras (`SAMPLE_SCORES × DIMENSION_WEIGHTS`) em vez de um segundo número hardcoded. "ISO 33001" trocado por "CMMI e modelo de maturidade de IA do MITRE". "1847 avaliações" removido dos dois lugares (hero e faixa de KPIs), substituído por fatos reais e verificáveis da plataforma (45 práticas, 5 dimensões, 6 níveis). Privacidade e FAQ reescritos para afirmar só o que é verdade hoje (cálculo 100% no navegador) e tratar banco/painel como arquitetura planejada, não fato corrente. "Alinhamento regulatório" renomeado para "Base metodológica".

## 7. Landing page — estimativa de tempo removida

Pedido direto do usuário ("não precisa colocar o tempo estimado, deixe em aberto"). O título da seção "Como funciona" ("...em 30 minutos") e a resposta do FAQ ("Entre 20 e 40 minutos") foram reescritos sem nenhum intervalo de tempo — só explicam que a duração varia por organização e que dá para pausar e retomar quando quiser.

## 8. Observatório Nacional — planejamento da reescrita

O usuário forneceu um pacote (`PROMPT_observatorio.md` + `observatorio.css` + 3 imagens de referência) pedindo a reescrita completa do painel público: mapa como protagonista/filtro principal, sigilo k-anonimato ≥ 5 aplicado em cada recorte (não só no total), e zero texto interpretativo escrito à mão — tudo gerado por regra a partir dos dados agregados. Dado o tamanho da tarefa, entrou-se em modo de planejamento: confirmados os pré-requisitos do prompt no repositório atual (ícones e nomes curtos das dimensões, tokens `--level-0..5`, taxonomia v2 completa), identificada a ausência de um test runner no monorepo (Vitest precisou ser adicionado), e levantado que o dataset de exemplo tinha só 8 registros — insuficiente para demonstrar a regra de sigilo de forma realista. Decidido, com confirmação do usuário, ampliar o seed para ~200 registros sintéticos, determinísticos e com distribuição deliberada (toda UF acima de k=5 no recorte sem filtro; porte "Micro" propositalmente raro para reproduzir o sigilo mesmo sem filtro nenhum, igual ao exemplo das referências).

## 9. Observatório Nacional — camada de dados e reescrita dos componentes

Criado `packages/shared/src/lib/observatory.ts`, módulo puro com toda a lógica de agregação, filtros e sigilo (`aggregate`, `byUf`, `byRegion`, `levelDistribution`, `compareBy`, `insights`, `wouldBreakK`) — nenhum componente calcula nada sozinho. Cobertura de 17 testes (Vitest, novo na stack) para as fronteiras de nível e a regra de k-anonimato. `BrazilMap.tsx` foi reescrito: cor só por `var(--level-0..5)` (zero Tailwind), hachurado para UF com menos de 5 avaliações, navegação por teclado, balão de hover/foco, legenda clicável, atalhos de estado pequeno e visualização em tabela ordenável — preservando intacto o uso simples do Onboarding (escolha de UF sem heatmap) atrás de uma nova prop `mode`. `PublicPanel.tsx` foi reescrito com estado único refletido na URL (`?uf=DF&dim=seg&setor=...`), filtros que desabilitam opções que quebrariam o sigilo, comparativos que nunca escondem o bloco inteiro (linha por grupo, cadeado quando insuficiente), e as frases de "O que os dados mostram" geradas por `insights()`.

## 10. Observatório Nacional — bug de interação e verificação

Durante a verificação manual no navegador, um clique nos estados do mapa não registrava a seleção. Causa raiz: o código reordenava os `<path>` do SVG no DOM a cada hover (para o destaque visual ficar por cima dos vizinhos) — isso movia o elemento entre o `pointerdown` e o `pointerup` do próprio clique, e o navegador cancela o clique quando o alvo sai do lugar no meio do gesto. Corrigido com ordem de renderização sempre fixa e um `<path>` extra, sem interação, só para o destaque visual. Após o fix, verificados no navegador (claro/escuro, com e sem filtro): hover mostra balão; clique seleciona e atualiza a URL e todos os blocos; trocar métrica recolore o mapa; "Ver como tabela" ordena; e um filtro restritivo (Terceiro setor + Micro, 1 avaliação) deixa o mapa inteiro hachurado e os comparativos mostram só a mensagem única de dados insuficientes — sem nenhum número de grupo abaixo de 5 aparecendo na tela.

## 11. Observatório Nacional — remoção do conceito de "meta"

O usuário identificou, numa nova rodada de revisão ("vi meta e isso não existe"), que a marca "Meta 1,50 · Nível 3" espalhada pela tela (barras de dimensão, gráfico de evolução, régua dos comparativos, KPI "No nível 3 ou acima", texto de "Como ler este painel") não tinha base na metodologia oficial — era uma suposição do próprio prompt externo, implementada sem checar contra a fonte. A faixa 1,50 em si é real (é o limite inferior do Nível 3 em `getMaturityLevel`), mas tratá-la como um alvo que as organizações devem perseguir é uma interpretação inventada. Removido de toda a tela e da camada de dados: a função `shareAtOrAbove` e o candidato de frase correspondente em `insights()`, o KPI "No nível 3 ou acima" (grid de 4 para 3 colunas), e todas as marcas/linhas/legendas de "meta" — preservando as comparações reais que não dependiam dela (marca do Brasil nas barras de dimensão, por exemplo).

## 12. Dados abertos — removidos do site público

Decisão de produto comunicada pelo usuário: a tela de Dados abertos (download de CSV/JSON dos microdados agregados) não ficará disponível publicamente — vai para a área administrativa, ainda não implementada. Removidos `OpenData.tsx` e sua rota, o botão "Dados abertos" e o card inteiro de download no Observatório, e o link "Open data" no rodapé da landing page. As afirmações de licenciamento (CC BY 4.0) que aparecem em outros lugares — rodapé do app, FAQ — foram mantidas, por serem sobre a licença dos dados em si, não sobre existir uma tela pública de download.

## 13. Disciplina de verificação

Em cada rodada desta sessão, o padrão se repetiu: fluxo de edição real testado no navegador (código de demonstração `a3f8-2b91-4c7d`) após cada mudança na tela de Resultado; `npm run lint` (`tsc --noEmit`), `npm run build` e, a partir da reescrita do Observatório, `npm run test` (Vitest, 17/17) rodados limpos antes de cada commit; e, na reescrita do Observatório especificamente, uma checagem final por `grep` confirmando que nenhum dos textos de desenvolvimento ou frases fabricadas do arquivo antigo (`Framer Motion`, `Nível modal`, `+14% AoA`, as frases interpretativas escritas à mão) sobrevivia em lugar nenhum do código novo.

---

## 14. Pendências ao final da sessão

*   Captura em 375px (celular) do Observatório não foi possível nesta sessão — a ferramenta de redimensionar a janela do navegador não respondeu no ambiente disponível. O CSS mobile em si é o mesmo `observatorio.css` fornecido pelo usuário, aplicado à estrutura de classes exata que ele espera, mas não há confirmação visual direta.
*   Branch `feat/observatorio-v2` (a partir de `feat/analise-dimensao`) permanece sem merge — nenhum merge foi pedido ou feito durante a sessão.
*   A funcionalidade de Dados abertos/microdados, removida do app público, ainda não tem nenhuma implementação equivalente na área administrativa — é trabalho futuro, fora do escopo desta sessão.
*   Pasta `mmgia-design-system/` (pacotes de prompt/referência trazidos pelo usuário ao longo da sessão) permanece intencionalmente fora do controle de versão.

---
*Fim do registro da Sessão 005.*
