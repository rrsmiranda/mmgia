# MMGIA — Especificação Completa do Design System

> Documento-fonte para criar/estender o Design System do MMGIA no Claude Design
> (canvas: https://claude.ai/artifact/TnTDuyy1MV63VdDVofx2HU). Cobre fundamentos
> visuais validados (cor, tipografia, componentes) e as 15 telas do produto com
> conteúdo real levantado do código-fonte — não é conteúdo inventado.
>
> Como usar: cole este documento inteiro como prompt em uma sessão do Claude com
> acesso ao Design (canvas), pedindo para continuar o canvas existente usando esta
> especificação. Ele já contém todas as decisões de cor/tipografia/componente —
> não é para redecidir do zero, é para aplicar.

---

## 1. Contexto e princípios do produto

MMGIA é uma plataforma **pública, gratuita e anônima por design** para avaliação
de maturidade em governança de IA, alinhada à ENIA 2026–2029. Tom **institucional
e de confiança** (setor público, LGPD) — nunca chamativo ou "produto de startup".

**Arquitetura dos "dois mundos"**: o produto é servido por dois apps separados
(`apps/web` público e `apps/admin` administrativo, monorepo npm workspaces),
compartilhando um único pacote de tokens/tipos (`packages/shared`). Qualquer
decisão de design feita aqui vale para os dois apps ao mesmo tempo — não existe
"paleta do admin" separada da "paleta do público".

**Regras não-negociáveis** (vieram de uma auditoria de design system já feita
neste projeto — construir em cima delas, não repetir os problemas):

- Todo elemento clicável é `<button>` ou `<a href>`, nunca `<div onClick>` sem
  `role`/`tabindex`/foco de teclado.
- Estado de foco visível (`outline`/`ring`) em todo controle interativo.
- Um único componente de botão, 3 variantes (ver §3.1) — não recriar variações
  ad hoc por tela.
- Cor de identidade de dimensão **nunca** é reaproveitada como cor de status
  (ver §2.1 — é o problema estrutural que este documento resolve).
- Máximo 6–8 tamanhos de fonte por tela (o código real tem hoje ~19 tamanhos
  arbitrários fragmentados — não repetir).
- Sem gradiente decorativo em título institucional, sem emoji como ícone, sem
  clichê de "portfólio de IA" (isso é do template de referência que **não**
  deve influenciar o tom do MMGIA).
- `prefers-reduced-motion` deve ser respeitado onde houver animação.
- Modo escuro usa variáveis CSS com seleção própria de tons — nunca reaproveitar
  os mesmos hex do modo claro escurecendo "no olho".

---

## 2. Fundamentos visuais

### 2.1 Cor — validada, não escolhida no olho

Toda cor no sistema tem exatamente um de 4 papéis. Nunca misturar papéis na
mesma cor:

| Papel | O que codifica | Onde aparece no MMGIA |
|---|---|---|
| **Categórica** | identidade (qual dimensão) | as 5 cores de eixo estratégico |
| **Ordinal** | posição numa sequência | nível de maturidade (0–5), escala NPLF |
| **Status** | estado (bom→crítico) | alertas, validações, indicadores de risco |
| **Marca** | identidade institucional | navegação, CTAs, chrome da aplicação |

**Problema estrutural encontrado e corrigido**: as cores das dimensões
Segurança (vermelho) e Tecnologia (verde) coincidiam com o significado universal
de "ruim"/"bom", fazendo com que um score ótimo em Segurança ainda parecesse
"vermelho = errado". A correção: nível/NPLF deixam de reaproveitar as cores de
dimensão e passam a ser uma **rampa ordinal de uma única cor** (intensidade, não
matiz). As 5 cores de dimensão foram testadas e 2 delas reprovaram em critérios
reais (contraste/legibilidade) — os valores abaixo já são os corrigidos.

#### Marca (institucional)

| Token | Hex | Uso |
|---|---|---|
| `brand` | `#006494` | cor primária institucional, botões secundários, links |
| `brand-mid` | `#247BA0` | estados hover/intermediários |
| `brand-accent` | `#1B98E0` | CTA primário, destaque, foco |
| `ink` | `#13293D` | texto principal, fundos escuros (hero, sidebar) |
| `surface` | `#F9FAFB` | fundo padrão das telas claras |

#### Categórica — 5 dimensões (validada: luminosidade, croma, separação por
daltonismo e contraste todos aprovados)

| Dimensão | Hex | Observação |
|---|---|---|
| Governança e Arcabouço Regulatório | `#255EAD` | corrigido — o valor antigo `#0C3D6E` reprovava por ser escuro/dessaturado demais (lia como cinza-azulado) |
| Desenvolvimento Tecnológico, Pesquisa e Inovação | `#1D9E75` | mantido, já passava |
| Segurança, Confiança e Proteção da Sociedade | `#E74C3C` | mantido, já passava |
| Educação, Capacitação e Cultura Organizacional | `#8E44AD` | mantido, já passava |
| Cooperação e Inserção no Ecossistema | `#D9691E` | corrigido — o valor antigo `#E67E22` reprovava contraste (abaixo de 3:1) |

Regra: essas 5 cores **só** identificam "qual dimensão" — nunca usar para
indicar se o resultado daquela dimensão é bom ou ruim.

#### Ordinal — nível de maturidade (0–5), rampa de uma única cor (validada:
luminosidade monotônica, degraus perceptíveis, contraste no extremo claro)

| Nível | Hex | Rótulo |
|---|---|---|
| 0 | `#002d57` | Inexistente |
| 1 | `#00426d` | Inicial |
| 2 | `#005784` | Gerenciado |
| 3 | `#006e9b` | Definido |
| 4 | `#0084b3` | Gerenciado Quantitativamente |
| 5 | `#009ccb` | Otimizado |

Mesma família de cor (matiz do `brand-accent`), variando só intensidade —
inconfundível com as 5 cores categóricas de dimensão. A escala NPLF (N/P/L/F)
usa a mesma lógica, em 4 degraus da mesma rampa (N = degrau mais claro, F = mais
escuro), por ser conceitualmente a mesma ideia ("quanto foi cumprido") em outra
granularidade.

**Pendência conhecida**: o modo escuro precisa da sua própria seleção de tons
para esta rampa (testado: reaproveitar os mesmos hex falha contraste contra
fundo escuro) — gerar uma segunda rampa de 6 degraus ancorada no mesmo matiz,
validada contra a superfície escura real (`#0B1120`), antes de aplicar em telas
dark.

#### Status — reservada, nunca reaproveitada como categórica (validada:
contraste de texto branco ≥ 4.5:1)

| Status | Hex | Uso |
|---|---|---|
| Bom / sucesso | `#047857` | validações, "aprovado" |
| Atenção | `#B45309` | avisos, "pendente" |
| Sério | `#C2410C` | risco elevado |
| Crítico | `#B91C1C` | erro, bloqueio |

Regra obrigatória: cor de status **nunca aparece sozinha** — sempre com ícone +
rótulo de texto (nunca só a cor comunicando o estado).

### 2.2 Tipografia

**Inter** (títulos e corpo) + **JetBrains Mono** (dados, labels, eyebrows,
código). Escala disciplinada — substitui os ~19 tamanhos arbitrários fragmentados
encontrados no código real por 7 degraus fixos:

| Papel | Tamanho | Peso | Fonte |
|---|---|---|---|
| Display (hero) | 56px | 800–900 | Inter |
| H1 | 44px | 800 | Inter |
| H2 | 24px | 700 | Inter |
| H3 | 17–18px | 700 | Inter |
| Corpo | 14–16px | 400–500 | Inter |
| Legenda / mono label | 11–12px | 700 | JetBrains Mono, uppercase, letter-spacing .06–.08em |
| Micro (badges) | 10px | 700 | JetBrains Mono |

### 2.3 Espaçamento e raio

Espaçamento: grid de 4px/8px do Tailwind — já é respeitado no código real, não
mudar. Raio: 4 degraus fixos — `8px` (inputs/badges), `12px` (botões/cards
pequenos), `16–20px` (cards grandes/modais), `999px` (pills/avatares).

### 2.4 Ícones

SVG stroke inline, 16–20px, `stroke-width:2`, nunca preenchido/sólido, nunca
emoji. Consistente com `lucide-react`/`react-icons` já usados no código real.

---

## 3. Componentes de referência

Já modelados no artboard **"Fundamentos"** do canvas — usar exatamente como
estão, não recriar variações:

### 3.1 Botão — 1 componente, 4 estados
Primário (`brand-accent` sólido), Secundário (outline `brand`), Ghost (texto,
sem borda), Desabilitado (`surface-deep`, `cursor:not-allowed`).

### 3.2 Badges
- **Categórica**: pill sólida na cor da dimensão, texto branco, mono 10–11px.
- **Ordinal (nível/NPLF)**: mesma forma, cor da rampa ordinal (§2.1).
- **Status**: sempre ícone + texto, nunca só cor (§2.1).

### 3.3 Card
Fundo branco, borda `1px solid surface-deep`, raio 16px, sombra sutil
(`0 1px 2px rgba(16,24,40,.04)`). Variantes: card de prática (com bloco de
critério de verificação destacado), card de insight (borda superior colorida
por status), KPI tile (label mono + valor grande).

### 3.4 Inputs
Texto/select/textarea: altura 44–46px, raio 10px, borda `surface-deep`, ícone
à esquerda quando aplicável. Estados: default, focus (`ring` `brand-accent`),
erro (borda + texto `critical`), desabilitado.

### 3.5 Tabela
Cabeçalho mono uppercase 10px cinza, linhas com borda inferior 1px, sem zebra.

### 3.6 Navegação
- **Header público**: logo + nav central (5 links, scroll-to-anchor) + toggle
  de tema + botão outline "Painel público" + CTA pill.
- **Sidebar admin**: fundo `ink` escuro, seções agrupadas (GERAL/CONTEÚDO/
  ADMINISTRAÇÃO), item ativo em `brand-accent`, badge de contagem (notícias
  pendentes), card de usuário logado, "Sair" destacado em vermelho no rodapé.

---

## 4. As 15 telas

### Público — `apps/web` (10 telas)

**1. Landing (`/`)** — *já no canvas.* Hero escuro com eyebrow, headline,
subtítulo, CTA duplo, card de score de exemplo com barras por dimensão. Seções
abaixo do fold (não ainda no canvas): metodologia resumida, tabela de
correlação/alinhamento legal, níveis de maturidade, footer institucional.

**2. Onboarding (`/onboarding`)** — timeline de 3 etapas com transição
animada:
- Etapa 1: "Natureza jurídica" — grid 2×3 de cards clicáveis (Pública federal,
  Pública estadual, Pública municipal, Privada, Terceiro setor, Academia).
- Etapa 2: duas perguntas — UF (switcher Mapa/Grade, 27 opções) + Setor (grid
  de 10 pills: Financeiro, Saúde, Gov. federal, Gov. estadual, Gov. municipal,
  Indústria, Tecnologia, Educação, Agronegócio, Outro).
- Etapa 3: Porte (4 botões: Micro/Pequena/Média/Grande) + card "Compromisso
  Anônimo de Privacidade" (2 colunas: dados gravados vs. nunca solicitado) +
  checkbox de termos obrigatório.
- Rodapé fixo: Voltar (texto) + Continuar/Gerar Código (pill, desabilitado até
  etapa válida).

**3. Avaliação / Questionário (`/avaliacao`)** — sidebar de progresso por
dimensão + card da prática ativa (nome, descrição, critério de verificação,
badge de alinhamento legal, evidência sugerida) + seletor de escala NPLF (4
opções com subtítulo descritivo cada).

**4. Revisão (`/avaliacao/revisao`)** — acordeão por dimensão (prática +
nível exigido + descrição), radar chart comparando as 5 dimensões, box "Cálculo
Aplicado" mostrando a equação ponderada com os valores reais.

**5. Resultado (`/resultado`)** — hero com score global + badge de nível +
badge de risco, barras por dimensão com meta (linha tracejada no nível 3),
radar chart + benchmark setorial, lista de gaps priorizados com ação
recomendada e esforço, downloads (PDF/relatório completo).

**6. Painel Público (`/painel`)** — 2 selects de filtro (Setor/Porte). Coluna
esquerda: mapa do Brasil (SVG real, heatmap por faixa de score) + card do
estado em foco. Coluna direita: 4 KPIs (Score Médio Brasil, Nível Modal,
Avaliações Ativas, Pilar Mais Crítico), 3 cards de insight (crítico/destaque/
meta, cada um com cor de status própria — nunca cor de dimensão), barras por
pilar, gráfico de linha (12 meses), tabela por setor, CTA para Open Data.

**7. Metodologia (`/metodologia`)** — rail lateral sticky com 6 âncoras
(Sobre, Níveis, Dimensões/45 Práticas, Fórmula de Cálculo, Alinhamento
Regulatório, Arquitetura de Privacidade). Seções: tabela dos 6 níveis com
badge de risco; acordeão das 45 práticas por dimensão (nome, descrição,
critério, artefato-chave, referência legal); bloco de fórmula com a equação e
a tabela de pesos NPLF; tabela regulatória (LGPD, PL 2338/2023, ISO/IEC 42001,
NIST AI RMF); card de garantia de privacidade.

**8. Open Data (`/opendata`)** — coluna esquerda: card de download (CSV/
JSON) + tabela de schema (campo/tipo/descrição, 7 campos). Coluna direita:
bloco terminal com exemplo de query SQL, card de licença CC BY 4.0, formulário
de solicitação de base completa (Nome, Instituição, E-mail, Motivação).

**9. Editar com código (`/editar/:codigo?`)** — card único: campo de código
(mono, uppercase) + banners condicionais de erro/sucesso + aviso âmbar sobre
irrecuperabilidade + link para nova avaliação.

**10. Notícias (`/noticias`)** — eyebrow + busca. Faixa preta de trending
hashtags (7 fixas). Pills de categoria (todas/regulação/governança/tecnologia/
mercado). Bloco de destaque (card grande + lista lateral de manchetes). Grade
final de cards (categoria, título, resumo, fonte).

### Admin — `apps/admin` (5 telas)

**11. Login (`/login`)** — *já no canvas.* Card centralizado, logo, campos
e-mail/senha, CTA sólido, nota de auditoria com ícone de escudo. Sem botão
"Voltar" (app standalone).

**12. Dashboard — Gestão de Dados (`/admin`)** — *já no canvas.* Sidebar +
breadcrumb + sessão do usuário. Título + botões Exportar PDF/Excel. 4 KPIs.
Tabela de registros (ID, natureza, UF, setor, porte, score, badge de nível).

**13. Usuários / RBAC (`/admin/usuarios`)** — título + botão "Novo Usuário".
Tabela: avatar+nome, e-mail, badge de papel (super_admin azul/gestor verde/
leitor cinza), badge de status (Ativo/Inativo), último login, ação
Inativar/Reativar. 3 cards de escopo por papel (borda superior colorida).
Modal de criação: Nome, E-mail, select de papel.

**14. Curadoria de Notícias (`/admin/noticias`)** — título + toggle
Pendentes(contagem)/Aprovados. Lista de cards (categoria+data+fonte, título,
resumo) com 2 ações por item: "Marcar Destaque" (estrela, fica âmbar se ativo)
e "Descartar" (outline vermelho).

**15. Base Legal (`/admin/base-legal`)** — *já no canvas (aba dentro do
Dashboard).* Acordeão das 45 práticas por dimensão, cada uma com referência
legal editável, botões Editar/Deletar, CTA "Novo Alinhamento Legal".

---

## 5. O que já existe no canvas vs. o que falta desenhar

**Já no canvas** (`https://claude.ai/artifact/TnTDuyy1MV63VdDVofx2HU`):
Fundamentos, Landing (hero), Admin Login, Admin Dashboard (aba Dados).

**Falta desenhar** (11 artboards novos, um por tela, mesmo padrão): Onboarding,
Questionário, Revisão, Resultado, Painel Público, Metodologia, Open Data,
Editar com código, Notícias, Admin Usuários, Admin Curadoria de Notícias. (Base
Legal já existe como aba dentro do Dashboard admin — não precisa de artboard
novo, só garantir que a aba está representada.)

Ao estender o canvas: **reaproveitar exatamente** as cores, tipografia e
componentes deste documento — não redecidir nada, só aplicar às 11 telas que
faltam, usando o conteúdo real listado na seção 4 (não inventar copy).
