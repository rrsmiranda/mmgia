# MMGIA Design System — pacote para o código

Pacote feito para o repositório `rrsmiranda/mmgia` como ele está hoje: um app único em Vite + React 19 + Tailwind v4 + `lucide-react`. Foi testado numa cópia do repositório: `tsc --noEmit --strict` sem erros no pacote e `vite build` concluído, com o tema claro/escuro existente (`.dark`) funcionando.

## Conteúdo

```
src/design-system/
  styles/
    tokens.css       variáveis dos temas claro e escuro + @font-face (gerado de tokens.json)
    components.css   classes mg-* (botão, badge, card, tabela, formulários, grid responsivo…)
    theme.css        utilitários Tailwind v4 com prefixo ds- (bg-ds-brand, text-ds-up-01…)
    index.css        importa tokens + componentes
  fonts/             Raleway (substituta da Rawline) e JetBrains Mono — OFL
  components/        Button, Badge, Data, Card, Form, Selection, Layout (React + TypeScript)
  tokens.ts          rótulos de nível, risco, NPLF, formatação pt-BR, levelFromScore
  index.ts           ponto de entrada único
  examples/          QuestionStep.example.tsx — o questionário montado só com o sistema
tokens.json          fonte única dos tokens
docs/design-system.md  guia completo (regras, cor, tipografia gov.br, responsividade, telas)
```

## Instalação (5 passos)

1. Copie a pasta `src/design-system` para `src/` do projeto.
2. Instale os tipos do React — hoje o projeto não os tem, então o `npm run lint` não verifica nenhum JSX:
   ```bash
   npm i -D @types/react@19 @types/react-dom@19
   ```
3. Em `src/index.css`, logo depois de `@import "tailwindcss";`:
   ```css
   @import "./design-system/styles/theme.css";
   ```
   e em `src/main.tsx`, depois de `import './index.css';`:
   ```ts
   import './design-system/styles/index.css';
   ```
4. Fonte oficial (Rawline): em `index.html`, dentro de `<head>`:
   ```html
   <link rel="stylesheet" href="https://cdngovbr-ds.estaleiro.serpro.gov.br/design-system/fonts/rawline/css/rawline.css">
   ```
   Sem isso, o sistema usa a Raleway local — visualmente muito próxima.
5. Envolva cada tela migrada em `<DsRoot>`. As regras globais do sistema (fonte, cor do texto) valem só dentro dele, então as telas antigas continuam iguais até serem migradas.

## Uso

```tsx
import { ArrowRight } from 'lucide-react';
import { Button, DimensionBars, KpiCard, LevelBadge, RiskBadge, levelFromScore, formatNumber } from './design-system';
import { getAllDimensionScores, getGlobalScore } from './lib/scoring';

const score = getGlobalScore(answers);          // 0–3
const level = levelFromScore(score);            // 0–5

<KpiCard label="Score global" value={formatNumber(score)} unit="/ 3" />
<LevelBadge level={level} /> <RiskBadge level={level} />
<DimensionBars scores={getAllDimensionScores(answers)} />
<Button variant="primary" size="lg" iconRight={ArrowRight}>Próxima prática</Button>
```

| Componente | Para quê |
|---|---|
| `Button`, `LinkButton` | único botão: `primary`, `secondary`, `ghost`, `danger`; `sm`/`md`/`lg`; `disabled` |
| `DimensionBadge`, `LevelBadge`, `StatusBadge`, `RiskBadge`, `NplfBadge`, `LegalBadge`, `Badge` | etiquetas neutras com a cor só no marcador ou ícone |
| `LevelMeter`, `DimensionTag`, `DimensionBars`, `DataTable` | dados: nível, dimensão, barras 0–3 com meta em 1,50, tabela que empilha no celular |
| `Card` + `CardHeader`/`CardBody`/`CardFooter`, `KpiCard`, `InsightCard`, `PracticeCard` | superfícies |
| `Field`, `Input`, `Select`, `Textarea`, `Checkbox` | formulários com rótulo, ajuda, erro e `aria-*` automáticos |
| `OptionCard`, `RadioGroup`, `Pill`, `Segmented`, `Tabs` | seleção (natureza, porte, NPLF, setor, Mapa/Grade) |
| `DsRoot`, `Page`, `PageHeader`, `Grid`, `ActionBar`, `Steps`, `Banner` | estrutura, grid responsivo, rodapé fixo no celular, trilha de etapas, avisos |

`Grid` e `RadioGroup` recebem as colunas por faixa: `columns={['repeat(4,1fr)', 'repeat(2,1fr)', '1fr']}` (desktop ≥ 992px, tablet, celular < 576px).

## Ordem de migração sugerida

1. `Questionnaire.tsx` — use `examples/QuestionStep.example.tsx` como modelo.
2. `Onboarding.tsx`, `Revision.tsx`, `Result.tsx`, `EditAssessment.tsx` — fecha o fluxo de quem responde, inclusive no celular.
3. `LandingPage.tsx`, `PublicPanel.tsx`, `Methodology.tsx`, `OpenData.tsx`, `NewsBlog.tsx`.
4. `AdminLogin.tsx`, `AdminDashboard.tsx`.
5. Ao final, remover de `index.css` os tons avulsos (`slate-105`, `red-650`…) e as cores `--color-mm-*` que ficarem sem uso.

## Pontos do código que divergem do modelo

Encontrados ao ler o repositório. Nenhum foi alterado.

1. **Cores das dimensões em `types.ts`**: `gov` ainda usa `#0C3D6E` e `eco` `#E67E22`, os dois valores reprovados na validação. Trocar `color` por `var(--dim-gov)` … `var(--dim-eco)` e deixar de usar `textColor`/`bgColor`/`borderBg` com classes arbitrárias.
2. **Cores de nível em `scoring.ts` (`getMaturityLevel`)**: vermelho, céu, ciano, azul, esmeralda e índigo — um arco-íris que mistura cor de status com cor ordinal. Usar `LevelBadge`/`LevelMeter` (rampa `level-0…5`).
3. **Escala NPLF no `Questionnaire.tsx`** usa vermelho/ciano/azul/verde (cores de status) para N/P/L/F. O sistema usa a rampa ordinal (`NplfBadge`).
4. **Painel público**: o DF aparece como "2.12 / 3.00 (Nível 3)", mas pela regra de `getMaturityLevel` 2,12 é nível 4. E "Diferença para Meta: 0.58 pts" não bate com a meta do nível 3 (1,50): a partir da média 1,42 faltam 0,08.
5. **Open Data**: o schema descreve `nivel_global` como "nível 1 a 5"; o modelo vai de 0 a 5.
6. **Landing**: "O score é *calculated* no seu navegador" (palavra em inglês).
7. **Tipografia**: o `CLAUDE.md` define Plus Jakarta Sans + Geist Mono, o `index.css` carrega Inter + JetBrains Mono, e o design system adota Rawline (gov.br). Vale atualizar o `CLAUDE.md` para uma única decisão.
8. **Estrutura**: o `CLAUDE.md` descreve um monorepo (`apps/web`, `apps/admin`, `packages/shared`), mas o repositório é um app único. O pacote segue o repositório real.
9. **Tipos do React ausentes**: sem `@types/react`, o `tsc` aceita qualquer JSX — por isso o lint passa. Ver passo 2.
10. **Privacidade**: `SEED_ADMIN_USERS` em `types.ts` inclui um e-mail pessoal real num repositório público. Recomendo trocar por um endereço fictício.
