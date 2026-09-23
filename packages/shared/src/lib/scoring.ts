/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Implementação única do cálculo de maturidade do MMGIA, seguindo a
 * "Metodologia de Cálculo de Maturidade Global" do modelo oficial (Partes I e II).
 *
 * Passo 1-2: cada prática recebe o valor numérico da sua resposta NPLF.
 * Passo 3: o score de cada Nível (1-5) dentro de uma dimensão é a média das
 *          práticas respondidas naquele nível.
 * Passo 4: o score da Dimensão é a média dos scores de Nível que tiveram ao
 *          menos uma prática respondida — cada nível pesa igual, independente
 *          de quantas práticas ele contém. (O documento original divide pelo
 *          "Número Total de Práticas na Dimensão", o que é inconsistente com o
 *          próprio exemplo numérico do documento; aqui dividimos pelo número
 *          de níveis avaliados, que é a leitura consistente com esse exemplo.)
 * Passo 5: o Score Global é a média ponderada dos scores de Dimensão.
 * Conversão final: o Score Global (0-3) mapeia para um Nível de Maturidade (0-5).
 */

import { LIST_PRACTICES, DIMENSIONS, DimensionId, ScoreLevel } from '../types';

const NPLF_VALUE: Record<ScoreLevel, number> = { N: 0, P: 1, L: 2, F: 3 };

// Pesos oficiais por dimensão (página 28 da metodologia)
export const DIMENSION_WEIGHTS: Record<DimensionId, number> = {
  gov: 0.25,
  tec: 0.20,
  seg: 0.25,
  edu: 0.15,
  eco: 0.15,
};

/**
 * Score de uma dimensão (Passos 3 e 4): média dos scores de nível (1-5),
 * onde o score de cada nível é a média das práticas daquele nível que foram
 * respondidas. Níveis sem nenhuma prática respondida são excluídos do cálculo.
 */
export function getDimensionScore(dimId: DimensionId, answers: Record<string, ScoreLevel>): number {
  const dimPractices = LIST_PRACTICES.filter(p => p.dimensionId === dimId);
  const levelScores: number[] = [];

  for (let level = 1; level <= 5; level++) {
    const levelPractices = dimPractices.filter(p => p.level === level);
    const answered = levelPractices.filter(p => !!answers[p.id]);
    if (answered.length === 0) continue;

    const sum = answered.reduce((acc, p) => acc + NPLF_VALUE[answers[p.id]], 0);
    levelScores.push(sum / answered.length);
  }

  if (levelScores.length === 0) return 0;
  return levelScores.reduce((a, b) => a + b, 0) / levelScores.length;
}

/** Score de todas as 5 dimensões de uma vez, na mesma ordem usada em toda a UI. */
export function getAllDimensionScores(answers: Record<string, ScoreLevel>): Record<DimensionId, number> {
  const dimensionIds = Object.keys(DIMENSIONS) as DimensionId[];
  return dimensionIds.reduce((acc, dimId) => {
    acc[dimId] = getDimensionScore(dimId, answers);
    return acc;
  }, {} as Record<DimensionId, number>);
}

/** Score Global (Passo 5): média ponderada dos scores de dimensão. */
export function getGlobalScore(answers: Record<string, ScoreLevel>): number {
  const scores = getAllDimensionScores(answers);
  return (Object.keys(scores) as DimensionId[]).reduce(
    (acc, dimId) => acc + scores[dimId] * DIMENSION_WEIGHTS[dimId],
    0
  );
}

export interface MaturityLevelInfo {
  num: number;
  label: string;
  risk: string;
  desc: string;
  risco: string;
}

/** Conversão do Score Global (0-3) para o Nível de Maturidade (0-5). */
export function getMaturityLevel(score: number): MaturityLevelInfo {
  if (score < 0.5) return {
    num: 0,
    label: 'Inexistente',
    risk: 'Risco Crítico',
    desc: 'A organização não possui, nem reconhece, a necessidade de práticas de governança de IA. As atividades são inexistentes, não documentadas ou realizadas de forma caótica, sem qualquer controle ou supervisão.',
    risco: 'Neste nível, a organização opera em estado de total desconhecimento e descontrole quanto às atividades de IA. A ausência completa de governança expõe a organização a um nível de risco crítico. A proliferação de Shadow AI — o uso de ferramentas e sistemas de IA por funcionários sem aprovação ou supervisão formais — é inevitável, criando pontos cegos significativos para a segurança e a gestão.'
  };
  if (score < 1.0) return {
    num: 1,
    label: 'Inicial',
    risk: 'Risco Crítico / Alto',
    desc: 'As práticas são ad hoc, reativas e dependentes de indivíduos. O sucesso em iniciativas de IA é imprevisível e ocorre apesar da ausência de processos formais, geralmente impulsionado por "heróis" organizacionais. Há uma conscientização da necessidade de práticas de governança de IA.',
    risco: 'No nível Inicial, a organização começa a ter bolsões de atividade de IA, mas de forma desorganizada. O nível de risco permanece crítico, pois não há uma abordagem sistemática para a gestão. A dependência de "heróis" cria um ponto único de falha; o conhecimento não é institucionalizado e se perde com a saída desses indivíduos.'
  };
  if (score < 1.5) return {
    num: 2,
    label: 'Gerenciado',
    risk: 'Risco Alto',
    desc: 'Práticas básicas de gestão de projetos e de supervisão são aplicadas às iniciativas de IA. Políticas e responsabilidades começam a ser definidas em nível de projeto ou de departamento, mas a aplicação ainda é inconsistente em toda a organização.',
    risco: 'Neste estágio, a governança é predominantemente reativa, sempre um passo atrás das capacidades tecnológicas. Embora existam práticas básicas de gestão, a sua aplicação inconsistente em silos organizacionais cria lacunas perigosas. O nível de risco é alto, pois a ausência de uma estrutura de governança centralizada e uniforme implica que as regras aplicadas a um projeto podem ser completamente diferentes das de outro projeto.'
  };
  if (score < 2.0) return {
    num: 3,
    label: 'Definido',
    risk: 'Risco Moderado',
    desc: 'Processos de governança de IA são padronizados, documentados e disseminados em toda a organização, constituindo um "jeito organizacional" de fazer com IA. Há um entendimento comum sobre papéis, responsabilidades e procedimentos.',
    risco: 'O estabelecimento de processos padronizados e documentados reduz significativamente a ambiguidade e o caos dos níveis anteriores, reduzindo o risco para um nível moderado. A organização agora possui uma base sólida para a governança. No entanto, um risco fundamental neste estágio é a rigidez das regras estáticas perante a velocidade da evolução tecnológica.'
  };
  if (score < 2.5) return {
    num: 4,
    label: 'Gerenciado Quantitativamente',
    risk: 'Risco Baixo',
    desc: 'A organização mede e controla o desempenho de seus processos de governança de IA por meio de métricas e dados estatísticos. O desempenho é previsível e os desvios são gerenciados proativamente.',
    risco: 'Neste nível, a governança deixa de basear-se em suposições e passa a ser orientada por dados, reduzindo o risco. O monitoramento contínuo substitui as revisões periódicas. O principal risco neste estágio é a complacência e o foco exclusivo em métricas numéricas simples que ignoram aspectos éticos complexos.'
  };
  return {
    num: 5,
    label: 'Otimizado',
    risk: 'Risco Otimizado / Mínimo',
    desc: 'A organização foca na melhoria contínua e proativa dos processos de governança de IA. O feedback, tanto quantitativo quanto qualitativo, é utilizado para identificar oportunidades de inovação e refinar as práticas em um ciclo virtuoso.',
    risco: 'No nível mais alto de maturidade, a governança de IA se torna inteligente, adaptativa e totalmente integrada à estratégia de negócio, trazendo um exponencial diferencial competitivo. O risco residual é a de eventuais disrupções globais de regulação ou infraestrutura técnica onde reações refinadas demandam extrema flexibilidade.'
  };
}

/**
 * Nível de Maturidade (0-5) por eixo estratégico: aplica a mesma tabela de
 * conversão do Score Global (getMaturityLevel) ao score de cada dimensão.
 * Puramente aditivo — não altera o Score Global nem os pesos entre dimensões;
 * é apenas uma segunda leitura, por eixo, da mesma matemática já documentada.
 */
export function getAllDimensionLevels(answers: Record<string, ScoreLevel>): Record<DimensionId, MaturityLevelInfo> {
  const scores = getAllDimensionScores(answers);
  return (Object.keys(scores) as DimensionId[]).reduce((acc, dimId) => {
    acc[dimId] = getMaturityLevel(scores[dimId]);
    return acc;
  }, {} as Record<DimensionId, MaturityLevelInfo>);
}

/**
 * Benchmark ilustrativo de pares do setor (dado sintético, não vem de submissões
 * reais — usado até o painel público ter dados agregados suficientes).
 */
export function getSectorBenchmarks(sector: string): Record<DimensionId, number> {
  const isSectorStrong = ['Financeiro', 'Tecnologia'].includes(sector);
  const scale = isSectorStrong ? 1.25 : 0.88;
  return {
    gov: 1.45 * scale,
    tec: 1.38 * scale,
    seg: 1.52 * scale,
    edu: 1.10 * scale,
    eco: 1.22 * scale,
  };
}

/** Média simples dos 5 benchmarks setoriais — usada como referência de comparação nacional. */
export function getPeerAverageGlobal(sector: string): number {
  const benchmarks = getSectorBenchmarks(sector);
  return Object.values(benchmarks).reduce((a, b) => a + b, 0) / 5;
}
