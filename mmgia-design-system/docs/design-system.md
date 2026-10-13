MMGIA é uma plataforma **pública, gratuita e anônima por design** para avaliação de maturidade em governança de IA, alinhada à ENIA 2026–2029. O tom é **institucional e de confiança** (setor público, LGPD) — nunca chamativo, nunca "produto de startup".

Este sistema vale igualmente para os dois apps do monorepo — `apps/web` (público) e `apps/admin` (administrativo) — que compartilham um único pacote de tokens (`packages/shared`). Não existe paleta do admin separada da paleta do público.

## Regras não-negociáveis

- **Desvio deliberado da especificação original:** badges categóricos deixaram de ser pílulas sólidas com texto branco, rótulos deixaram de ser mono e CTAs deixaram de ser pílulas — o resultado lia como interface genérica gerada por IA e se afastava da identidade `brand`/`ink`. Os hex de todas as paletas continuam os validados.

- Todo elemento clicável é `<button>` ou `<a href>`. Nunca `<div onClick>` sem `role`, `tabindex` e foco de teclado.
- Foco visível em todo controle: contorno 2px `focus-ring` com offset 2px (já em `bundle.css`).
- Um único componente de botão (`Button`), três variantes + desabilitado. Não criar variações por tela.
- Cor de dimensão **nunca** vira cor de status. Cor de status **nunca** aparece sozinha: sempre ícone + rótulo.
- No máximo 6–8 tamanhos de fonte por tela, todos da escala abaixo.
- Sem gradiente decorativo em título, sem emoji como ícone, sem clichês de "portfólio de IA".
- Respeite `prefers-reduced-motion` em toda animação (transição do onboarding incluída).
- Modo escuro usa a sua própria seleção de tons (tema `dark` em `tokens.json`) — nunca os hex do claro "escurecidos no olho".

## Conteúdo e voz

- Português do Brasil, voz institucional, frases curtas. Trate o usuário por "você"; a organização é "sua organização".
- Caixa de frase em títulos e botões ("Iniciar avaliação", "Novo Usuário" é exceção herdada do código). Eyebrows e labels de KPI em CAIXA ALTA (extrabold, como o h6 do gov.br); badges e cabeçalhos de tabela em caixa de frase.
- Verbo no início de CTAs: "Iniciar avaliação", "Gerar Código", "Exportar PDF", "Marcar Destaque", "Descartar".
- Números no formato brasileiro: vírgula decimal ("2,6"), ponto de milhar ("1.482"). Score sempre com duas casas e a escala ("1,78 / 3").
- Privacidade é dita explicitamente e sem eufemismo: "Nenhum dado pessoal é solicitado", "O código não pode ser recuperado".
- Os artboards usam o conteúdo real do repositório `rrsmiranda/mmgia` (práticas, textos, notícias e dados de seed). Valores de score de uma avaliação individual são exemplos coerentes com a fórmula real.

## Modelo de dados e cálculo (fonte: `src/types.ts` e `src/lib/scoring.ts`)

- **5 dimensões**, ids `gov`, `tec`, `seg`, `edu`, `eco` (nome curto do 5º eixo: **Ecossistema**), 9 práticas cada, com pesos **gov 25% · tec 20% · seg 25% · edu 15% · eco 15%**. Tokens `dim-gov` … `dim-eco` usam os mesmos ids.
- **45 práticas** identificadas por `dimensão.ordem` (ex.: `1.4`), cada uma com nível de 1 a 5, descrição, critério de verificação, evidência e referência legal. Exibir o id em mono (`mg-code`).
- **Escala NPLF**: Nulo (N = 0), Parcial (P = 1), Larga (L = 2), Total (F = 3), com subtítulos Inexistente, Iniciado, Amplo e Otimizado.
- **Score**: cada nível (1–5) de uma dimensão é a média NPLF das práticas respondidas; o score da dimensão é a média dos níveis avaliados; o score global é a média ponderada — **escala de 0 a 3**, nunca 0 a 5.
- **Nível de maturidade (0–5)** pelo score: < 0,50 Inexistente · 0,50 Inicial · 1,00 Gerenciado · 1,50 Definido · 2,00 Gerenciado Quantitativamente · ≥ 2,50 Otimizado. A meta tracejada nas barras (nível 3) fica em **1,50**, ou seja, 50% da barra.
- **Risco por nível**: crítico · crítico/alto · alto · moderado · baixo · mínimo — badge de status com ícone.
- **Código anônimo**: `xxxx-xxxx-xxxx` (12 caracteres hexadecimais, ex.: `a3f8-2b91-4c7d`), sempre em mono.

## Cor — quatro papéis, nunca misturados

**Proporção.** A tela é neutra (`surface`, `surface-raised`, `text`) com `brand` e `ink` como únicas cores de identidade. Cor categórica e de status entra em marcadores pequenos — ponto, quadrado de 8px, ícone, barra de gráfico — nunca como fundo de badge, banner ou card. Se uma tela parecer colorida, há cor no lugar errado.

| Papel | Codifica | Tokens |
|---|---|---|
| Marca | identidade institucional, chrome, CTAs | `brand`, `brand-mid`, `brand-accent`, `ink`, `surface*`, `text*` |
| Categórica (reservada) | qual dimensão, só em gráficos com várias séries | `dim-gov`, `dim-tec`, `dim-seg`, `dim-edu`, `dim-eco` |
| Ordinal | posição numa sequência | `level-0` … `level-5`, `nplf-n|p|l|f` |
| Status | estado bom → crítico | `status-good`, `status-attention`, `status-serious`, `status-critical` (+ `-text`, `-soft`) |

- **Marca.** A cor de ação é `brand`: botão primário em `brand` com `on-brand` (hover `brand-hover`), secundário em contorno `brand`, links, abas, navegação ativa e seleção (`brand-soft`). `brand-accent` é só destaque pontual — anel de foco e série de dados nos gráficos — nunca fundo de botão. Faixa institucional, hero, sidebar e footer em `ink` com `on-ink` / `on-ink-muted`, superfície elevada `ink-raised` e destaques `on-ink-accent`.
- **Neutros.** Página em `surface`; cards, inputs e tabelas em `surface-raised`; cabeçalho de tabela, trilho de barra e bloco de critério em `surface-sunken`. Bordas de card e divisores em `surface-deep`; bordas de controle (input, select, checkbox) em `border-control` (3:1). Texto em `text`, secundário em `text-muted`.
- **Dimensões são identificadas por ícone + nome, sempre na cor da marca:** Governança `Landmark`, Inovação `Cpu`, Segurança `ShieldCheck`, Educação `GraduationCap`, Ecossistema `Network`. As cores `dim-*` ficam reservadas para gráficos com várias séries e não aparecem nas telas — nem em ponto, badge, borda ou fundo. Ordem fixa: gov, tec, seg, edu, eco.
- **Gráficos de score por dimensão.** Barras, polígono e pontos em `brand`. A cor da dimensão não aparece nesses gráficos; a dimensão é identificada pelo ícone e pelo nome ao lado, nos eixos e nas legendas. O comprimento e o número mostram o valor; nem cor nem ícone indicam bom ou ruim.
- **Ordinal.** Nível de maturidade usa a rampa de um único matiz `level-0` (mais escuro, Inexistente) → `level-5` (mais claro, Otimizado): intensidade, não matiz. A escala NPLF reaproveita a mesma rampa em 4 degraus: `nplf-n` = `level-5` (mais claro), `nplf-p` = `level-3`, `nplf-l` = `level-1`, `nplf-f` = `level-0` (mais escuro). Texto sobre a rampa: `on-level`; sobre `level-5`/`nplf-n`: `on-level-5`. O heatmap do mapa por UF também usa esta rampa.
- **Rampa escura (pendência resolvida).** No tema `dark` a rampa é própria, ancorada no matiz de `brand-accent` e validada contra `#0B1120`: `#2782CC`, `#349AE1`, `#43B2F6`, `#6DC9FE`, `#A0DEFF`, `#D3F1FE` — luminosidade monotônica, degraus perceptíveis, todos ≥4.6:1 com a superfície, texto escuro (`on-level`) sobre todos.
- **Status.** Reservado a validações, avisos, risco e erro, e aplicado **só no ícone** (e no contorno do banner de erro): badges e banners são neutros, com ícone `status-*-text` + rótulo em `text`. Sem fundos pastel nem faixas coloridas. Os tokens `status-*-soft` ficam para casos excepcionais. Ações destrutivas ("Descartar", "Inativar", "Deletar") usam `status-critical-text`; "Sair" na sidebar usa `on-ink-critical`.

**Contraste — pares que ficam abaixo de AA em texto pequeno** (mantidos exatos por especificação, válidos só para o uso reservado de `dim-*` em gráficos com várias séries): branco sobre `dim-tec` 3.4:1, `dim-eco` 3.5:1, `dim-seg` 3.8:1, `level-4` 4.2:1. Nas telas, a dimensão é identificada por ícone `brand` + nome, não por fundo colorido — o nível continua podendo usar `level-4` como fundo de badge, sempre com o número escrito por extenso ao lado. O botão primário usa `brand` com branco (6.5:1). `surface-deep` é decorativa (abaixo de 3:1) — por isso controles usam `border-control`.

## Tipografia — modelo gov.br

A tipografia segue o **Padrão Digital de Governo (gov.br DS)**: mesma família, mesma escala, mesmos pesos e alturas de linha, com os nomes de token do gov.br (`--font-size-scale-*`, `--font-weight-*`, `--font-line-height-*`).

- **Família**: `Rawline, Raleway, sans-serif` (`--font-sans`), exatamente a pilha do gov.br. Rawline é a fonte oficial do governo e deve ser carregada em produção pelo CDN do gov.br DS; **Raleway** (OFL) está em `fonts/` como substituta local e é a que aparece nos previews. Como a Raleway usa algarismos de estilo antigo, o `body` liga `font-variant-numeric: lining-nums`, e números em tabelas e KPIs usam também `tabular-nums`.
- **JetBrains Mono** 500/700 só para códigos de prática, IDs, código de edição e blocos de SQL/fórmula — o gov.br não define fonte mono.
- **Escala**: razão 1.2 (terça menor) sobre base 14px — `scale-down-01` 11,662 · `base` 14 · `up-01` 16,8 · `up-02` 20,16 · `up-03` 24,192 · `up-04` 29,036 · `up-05` 34,832 · `up-06` 41,804 · `up-07` 50,162 · `up-08` 60,2 · `up-10` 86,688 · `up-11` 104,02. Nenhum tamanho fora da escala.
- **Alturas de linha**: `low` 1,15 (títulos, rótulos), `medium` 1,45 (texto e interface — padrão do `body`), `high` 1,85 (leitura longa).
- **Títulos**: sem tracking negativo; o peso cai conforme o tamanho cresce, como no gov.br.

| Estilo / classe | Desktop (gov.br) | Mobile (gov.br) | Uso no MMGIA |
|---|---|---|---|
| `display` · `.mg-display` | up-07 · light 300 | up-04 · medium | headline do hero |
| `h1` · `.mg-h1` | up-06 · light 300 | up-04 · medium | título de página pública |
| `h2` · `.mg-h2` | up-05 · regular 400 | up-03 · semibold | seção de página, destaque de notícia |
| `h3` · `.mg-h3` | up-04 · medium 500 | up-02 · bold | título de página do admin, pergunta do onboarding, nome da prática ativa |
| `h4` · `.mg-h4` | up-03 · semibold 600 | up-01 · bold | subtítulo, UF em foco |
| `h5` · `.mg-h5` | up-02 · bold 700 | base · extrabold, CAIXA ALTA | nome de prática, título de notícia |
| `h6` · `.mg-h6` | up-01 · extrabold 800, CAIXA ALTA | down-01 | título curto |
| `lead` · `.mg-lead` | up-02 · regular | up-01 | subtítulo de página |
| `body` · `.mg-body` | up-01 · regular | base | parágrafo (o `p` do gov.br) |
| `body-sm` · `.mg-small` | base · regular | base | texto de interface, tabelas |
| `title` · `.mg-title` | up-01 · semibold | up-01 | título de card, rótulo de opção |
| `label` · `.mg-label` / `.mg-eyebrow` | down-01 · extrabold, CAIXA ALTA | down-01 | eyebrow, label de KPI (o h6 mobile do gov.br) |
| `caption` · `.mg-caption` | down-01 · regular | down-01 | legenda de gráfico |
| botão | up-01 · semibold (pequeno: base) | — | todos os botões |

Valores de destaque: KPI em `up-04` semibold, score de exemplo em `up-08` bold, score do Resultado em `up-10` light.

## Responsividade — grid do gov.br

O sistema é responsivo por uma camada adicional em `bundle.css`: as regras de desktop ficam como estão e só são sobrescritas abaixo dos breakpoints do gov.br (tokens `grid-*`).

| Faixa | Largura | Colunas · gutter · margem | O que muda |
|---|---|---|---|
| Desktop | ≥ 992px | 12 · 24px · 40px (conteúdo máx. 1200px) | nada — é o layout de referência |
| Tablet | 576–991px | 8 · 24px · 24px | nav do header vira menu (`mg-menu-btn`); barra lateral do questionário vira indicador compacto; sidebar do admin some atrás do menu; grades passam a `--cols-t` |
| Celular | < 576px | 4 · 16px · 16px | tipografia mobile do gov.br; grades em `--cols-m`; tabelas empilhadas; rodapé de ações fixo |

**Grades.** Todo `.mg-grid` declara três variáveis: `--cols-d` (desktop), `--cols-t` (tablet) e `--cols-m` (celular). A regra escolhe a variável por faixa, então mexer no celular nunca altera o desktop. Ex.: KPIs `repeat(4,1fr)` → `repeat(2,1fr)` → `repeat(2,1fr)`; escala NPLF `repeat(4,1fr)` → `repeat(2,1fr)` → `1fr`. Filhos de grade têm `min-width: 0` para não estourar a largura.

**Utilitários.** `mg-only-desktop` / `mg-only-mobile` (troca de componente abaixo de 992px), `mg-hide-mobile`, `mg-hide-tablet`, `mg-nowrap` (linha que não quebra), `mg-table--stack` (padrão das tabelas: no celular cada linha vira um bloco com rótulo vindo de `data-label`).

**Fluxo de avaliação no celular** (onboarding, questionário, revisão, resultado, editar com código):
- **Barra de fluxo:** só o logotipo, a trilha compacta (apenas a etapa atual rotulada) e o ícone de sair.
- **Rodapé de ações fixo** (`mg-actionbar`, `position: sticky`) com o botão primário ocupando a largura restante, ao alcance do polegar.
- **Questionário:** a lista de dimensões dá lugar a um card de progresso ("Governança · prática 4 de 9" + botão "Dimensões"); a escala NPLF vira lista vertical de largura total (`mg-option--list`).
- **Onboarding:** natureza jurídica em 2 colunas, porte em 2×2; a UF abre em **Grade** (5 colunas) porque DF, SE e AL são pequenos demais para toque no mapa.
- **Revisão e Resultado:** o radar dá lugar às barras por dimensão; o benchmark vira tabela Você × Setor; gaps viram blocos empilhados.

**Desktop.** A única mudança visível no desktop é a margem lateral de 40px do gov.br (antes 32px) e o botão "Anterior" do questionário com rótulo curto. A largura mínima fixa de 1280px foi removida — janelas estreitas e zoom de 125–200% agora reorganizam o layout em vez de gerar rolagem horizontal.

**Admin** continua desktop-first: abaixo de 992px a sidebar vira menu e as tabelas empilham, mas não há artboards mobile do admin.

## Espaçamento, raio, sombra

- Grid de 4/8px do Tailwind: `space-1` (4) … `space-16` (64). Padding de card `space-6`; gap de grade `space-6`; seções da Landing separadas por `space-16`.
- Inputs e CTAs `lg` com `control-height` (44px); botões padrão 40px, pequenos 32px.
- Raios contidos, de linguagem institucional: `radius-xs` 2px (medidor), `radius-sm` 4px (badges, chips, filtros), `radius-input` e `radius-md` 6px (inputs, botões, opções, banners), `radius-lg` 8px (cards, tabelas), `radius-xl` 12px (modais). `radius-pill` só em avatares e indicadores de etapa — nada de botões ou badges em pílula.
- Sem sombra em cards (`shadow-card` = none): separação por borda. `shadow-modal` só em modais.

## Iconografia

SVG inline em traço, 16–20px, `stroke-width: 2`, cantos arredondados, `stroke: currentColor`, nunca preenchido, nunca emoji — o mesmo desenho do `lucide-react` já usado no código. Ícone decorativo leva `aria-hidden="true"`; botão só com ícone leva `aria-label`. Em cards e listas o ícone vai num quadro de 36px (`mg-option-ico`, `surface-sunken` + `brand`). Cor de status em ícone é a principal forma de sinalizar estado.

**Ícone de dimensão.** As 5 dimensões são identificadas por ícone + nome, sempre em `brand` (16px, `aria-hidden="true"`, o nome continua escrito ao lado — o ícone ajuda a reconhecer, não substitui o texto): Governança e Arcabouço Regulatório `Landmark`, Desenvolvimento Tecnológico, Pesquisa e Inovação `Cpu`, Segurança, Confiança e Proteção da Sociedade `ShieldCheck`, Educação, Capacitação e Cultura Organizacional `GraduationCap`, Cooperação e Inserção no Ecossistema `Network`. Fonte única: `DIMENSION_ICONS` em `design-system/tokens.ts`. Mesmo ícone em todo o sistema — nunca cor categórica em preenchimento, ponto, borda ou fundo.

**Logotipo provisório.** Não havia marca nos insumos: o símbolo é um quadrado `brand` (raio 8) com três barras ascendentes em `on-brand` — a rampa de maturidade — ao lado de "MMGIA" em extrabold e um descritor de 11px. Sobre `ink` (sidebar, footer, painel do login) o quadrado passa a `ink-raised`. Substitua pela marca oficial quando existir.

**Mapa.** O mapa por UF usa os contornos reais do Brasil do pacote `@svg-maps/brazil` (licença CC BY 4.0 — manter a atribuição no rodapé da tela ou nos créditos).

## Componentes

Da especificação: `Button`, `Badge` (categórica · ordinal · status), `Card` (prática · insight · KPI · com cabeçalho), `Input`, `Table`, `PublicHeader` (com faixa institucional), `AdminSidebar`. Adições intencionais, todas derivadas do que as telas já pedem: `LevelMeter` (nível em tabelas sem uma coluna de badges sólidos), `Selection` (opções em card, pills, segmentado, abas), `Banner` (mensagens em linha) e `Charts` (barras por dimensão, radar, mapa por UF). Tudo são classes `mg-*` em `components/bundle.css`, sem dependência de framework.

**Padrões de layout.** Conteúdo público em coluna de 1200px com gutter de 32px; seções da Landing a 88–96px. Gráficos e tabelas sempre em card com cabeçalho (`mg-card-head`: título à esquerda, ações à direita) e rodapé para legenda ou fonte. Fluxos (onboarding, questionário) trocam o header por uma barra de fluxo com etapas e "Sair", e fixam as ações no rodapé. Admin: sidebar `ink` + topbar branca de 60px + área de 32px de padding.

## Telas

As 15 telas do produto estão em 17 artboards desktop e 8 mobile (375px, fluxo do respondente) (o onboarding tem um por etapa): `Tela01Landing` … `Tela15BaseLegal`, montados só com os componentes e tokens acima. Inventário em "Telas".


# Telas

Os 17 artboards (15 telas) seguem exatamente os tokens e componentes do sistema. Público em `apps/web`, admin em `apps/admin`; mesma paleta nos dois.

| # | Tela | Rota | App | Artboard |
|---|---|---|---|---|
| 1 | Landing | `/` | web | `Tela01Landing` — hero + abaixo da dobra (metodologia, alinhamento legal, níveis, footer) |
| 2 | Onboarding | `/onboarding` | web | `Tela02aOnboarding`, `Tela02bOnboarding`, `Tela02cOnboarding` — um por etapa |
| 3 | Avaliação / Questionário | `/avaliacao` | web | `Tela03Questionario` |
| 4 | Revisão | `/avaliacao/revisao` | web | `Tela04Revisao` |
| 5 | Resultado | `/resultado` | web | `Tela05Resultado` |
| 6 | Painel Público | `/painel` | web | `Tela06PainelPublico` |
| 7 | Metodologia | `/metodologia` | web | `Tela07Metodologia` |
| 8 | Open Data | `/opendata` | web | `Tela08OpenData` |
| 9 | Editar com código | `/editar/:codigo?` | web | `Tela09EditarCodigo` |
| 10 | Notícias | `/noticias` | web | `Tela10Noticias` |
| 11 | Login | `/login` | admin | `Tela11Login` |
| 12 | Dashboard — Gestão de Dados | `/admin` | admin | `Tela12Dashboard` |
| 13 | Usuários / RBAC | `/admin/usuarios` | admin | `Tela13Usuarios` |
| 14 | Curadoria de Notícias | `/admin/noticias` | admin | `Tela14Curadoria` |
| 15 | Base Legal | `/admin/base-legal` | admin | `Tela15BaseLegal` — aba dentro do Dashboard |

## Artboards mobile (375px)

Mesma marcação dos artboards desktop, renderizada a 375px — a adaptação vem só do CSS responsivo. Cobrem o fluxo de quem responde:

| Artboard | Tela |
|---|---|
| `TelaM01Landing` | Landing |
| `TelaM02aOnboarding`, `TelaM02bOnboarding`, `TelaM02cOnboarding` | Onboarding, etapas 1–3 |
| `TelaM03Questionario` | Questionário |
| `TelaM04Revisao` | Revisão |
| `TelaM05Resultado` | Resultado |
| `TelaM09EditarCodigo` | Editar com código |

## Convenções dos artboards

- Desktop: largura de layout 1280px, conteúdo em `mg-page` (máx. 1200px, margem 40px). Mobile: 375px, margem 16px.
- Conteúdo real do repositório: práticas, critérios, evidências e referências legais (`LIST_PRACTICES`), notícias (`SEED_NEWS`), usuários (`SEED_ADMIN_USERS`), registros (`SEED_HISTORICAL_RECORDS`), textos da Landing, Onboarding, Metodologia e Painel. O resultado individual (1,78 / 3) é um exemplo calculado com a fórmula real.
- O mapa do Painel Público e da etapa 2 do onboarding é o SVG real do Brasil (@svg-maps/brazil, CC BY 4.0); no painel a cor segue a rampa ordinal `level-*`.
- Cada artboard mostra um estado: Editar com código em erro, Usuários com o modal de criação aberto. As demais variantes estão nos componentes `Banner` e `Selection`.
