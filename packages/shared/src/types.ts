/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Area, AreaPrivada, Esfera, Poder, RelacaoIA, Regiao, Setor } from './lib/taxonomy';

export type DimensionId = 'gov' | 'tec' | 'seg' | 'edu' | 'eco';

export interface Dimension {
  id: DimensionId;
  name: string;
  shortName: string;
  description: string;
  /** Cor categórica da dimensão — sempre var(--dim-<id>), nunca hex. */
  color: string;
}

export interface Practice {
  id: string; // e.g. "1.1"
  dimensionId: DimensionId;
  name: string;
  description: string;
  criterion: string;
  /**
   * Reformulação em modo imperativo do `criterion`, sem adicionar passo, prazo ou
   * requisito que não esteja nele — não é texto do documento oficial do MMGIA.
   * Rascunho aprovado internamente; pendente de validação formal do GGIA.
   */
  whatToDo: string;
  evidence: string;
  level: number;
  legalReference?: string;
}

export type ScoreLevel = 'N' | 'P' | 'L' | 'F';

export interface AssessmentMetadata {
  taxonomiaVersao: 2;
  setor: Setor | '';
  /** Só setor público. */
  esfera?: Esfera;
  area?: Area;
  /** Só quando area === 'estatal'. */
  atividadeEstatal?: AreaPrivada;
  /** Opcional. */
  relacaoIA?: RelacaoIA;
  /** Registro migrado da v1 sem conversão segura — entra no painel só nos totais gerais. */
  revisar?: boolean;
  estado: string;
  porte: string;
  termosAceitos: boolean;
  code: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: 'regulação' | 'governança' | 'tecnologia' | 'mercado';
  source: string;
  date: string;
  featured?: boolean;
}

// Global Static Data
export const DIMENSIONS: Record<DimensionId, Dimension> = {
  gov: {
    id: 'gov',
    name: 'Governança e Arcabouço Regulatório',
    shortName: 'Governança',
    description: 'Desenvolver uma cultura de governança de IA clara, flexível e baseada em risco, que promova a inovação ética e responsável, assegurando a proteção da organização e da sociedade.',
    color: 'var(--dim-gov)',
  },
  tec: {
    id: 'tec',
    name: 'Desenvolvimento Tecnológico, Pesquisa e Inovação',
    shortName: 'Inovação',
    description: 'Impulsionar a capacidade organizacional para pesquisar, desenvolver, adquirir e aplicar tecnologias de IA de ponta, visando à competitividade e à autonomia tecnológica.',
    color: 'var(--dim-tec)',
  },
  seg: {
    id: 'seg',
    name: 'Segurança, Confiança e Proteção da Sociedade',
    shortName: 'Segurança',
    description: 'Assegurar que a IA seja utilizada de forma segura, confiável e justa, protegendo os dados, os sistemas e os direitos dos indivíduos contra danos, vieses e usos maliciosos.',
    color: 'var(--dim-seg)',
  },
  edu: {
    id: 'edu',
    name: 'Educação, Capacitação e Cultura Organizacional',
    shortName: 'Educação',
    description: 'Preparar a força de trabalho e a cultura da organização para as transformações impulsionadas pela IA, promovendo o letramento digital, a ética, a colaboração humano-máquina e a retenção de talentos.',
    color: 'var(--dim-edu)',
  },
  eco: {
    id: 'eco',
    name: 'Cooperação e Inserção no Ecossistema',
    shortName: 'Ecossistema',
    description: 'Posicionar a organização como um ator relevante e influente no ecossistema de IA, por meio da colaboração com outras entidades para impulsionar a inovação, definir padrões e influenciar o mercado.',
    color: 'var(--dim-eco)',
  },
};

export const LIST_PRACTICES: Practice[] = [
  // DIMENSÃO 1 — GOVERNANÇA E ARCABOUÇO REGULATÓRIO (gov)
  {
    id: '1.1',
    dimensionId: 'gov',
    name: 'Consciência Regulatória',
    description: 'A organização identifica, de forma reativa e informal, as principais leis e normas que podem impactar seus projetos de IA. Não há um processo formal e o conhecimento está concentrado em indivíduos ou em departamentos específicos.',
    criterion: 'Existe uma lista ou um registro, ainda que informal, das principais obrigações legais relacionadas à IA.',
    whatToDo: 'Levante e registre, ainda que informalmente, as principais obrigações legais relacionadas à IA.',
    evidence: 'E-mails, atas de reunião ou documentos de projeto que mencionem a LGPD ou outras regulamentações pertinentes.',
    level: 1,
    legalReference: 'LGPD Art. 6º'
  },
  {
    id: '1.2',
    dimensionId: 'gov',
    name: 'Definição de Políticas Iniciais de IA',
    description: 'Uma política de alto nível sobre o uso aceitável de IA é criada e aprovada. O documento estabelece os primeiros princípios éticos e diretrizes gerais para o desenvolvimento e uso da tecnologia na organização.',
    criterion: 'A organização possui uma política formalizada e aprovada pela gestão com diretrizes e princípios éticos para o uso aceitável de IA.',
    whatToDo: 'Formalize e leve à aprovação da gestão uma política com diretrizes e princípios éticos para o uso aceitável de IA.',
    evidence: 'Documento formal da "Política de Uso de Inteligência Artificial", com data de aprovação e responsável.',
    level: 2,
    legalReference: 'ISO/IEC 42001 Cl. 5.2'
  },
  {
    id: '1.3',
    dimensionId: 'gov',
    name: 'Atribuição de Responsabilidades Básicas',
    description: 'Um ponto focal ou responsável (ainda que informalmente) é designado para a supervisão geral das iniciativas de IA. As responsabilidades, embora não totalmente formalizadas, são conhecidas pelas equipes de projeto.',
    criterion: 'O papel de supervisão das iniciativas de IA é atribuído a um indivíduo ou a um grupo, e essa atribuição é comunicada às equipes.',
    whatToDo: 'Atribua o papel de supervisão das iniciativas de IA a um indivíduo ou grupo, e comunique essa atribuição às equipes.',
    evidence: 'E-mail de designação, menção em ata de reunião ou descrição de papel em um documento de projeto.',
    level: 2,
    legalReference: 'ISO/IEC 42001 Cl. 5.3'
  },
  {
    id: '1.4',
    dimensionId: 'gov',
    name: 'Estruturação do Comitê de IA',
    description: 'Um comitê ou função de governança de IA é formalmente estabelecido, com um termo de referência claro, composição multissetorial (jurídico, TI, negócio, segurança) e reuniões periódicas.',
    criterion: 'Existe um comitê formalmente instituído, de composição multissetorial, com mandato e responsabilidades documentados, para a governança de IA.',
    whatToDo: 'Institua formalmente um comitê de governança de IA de composição multissetorial, com mandato e responsabilidades documentados.',
    evidence: 'Termo de Abertura ou Regimento Interno do Comitê de IA; atas das reuniões realizadas.',
    level: 3,
    legalReference: 'ENIA Meta 4.1'
  },
  {
    id: '1.5',
    dimensionId: 'gov',
    name: 'Adoção de Framework de Gestão de Riscos',
    description: 'A organização adota e padroniza um processo de gestão de riscos de IA, baseado em um framework reconhecido. O processo inclui etapas de identificação, análise, avaliação e tratamento de riscos específicos de IA.',
    criterion: 'O processo de gestão de riscos de IA está documentado, baseado em um framework reconhecido e aplicado de forma consistente em projetos relevantes.',
    whatToDo: 'Documente um processo de gestão de riscos de IA baseado em um framework reconhecido e aplique-o de forma consistente nos projetos relevantes.',
    evidence: 'Documento de processo de gestão de riscos de IA; registros de riscos de projetos-piloto.',
    level: 3,
    legalReference: 'ISO/IEC 23894'
  },
  {
    id: '1.6',
    dimensionId: 'gov',
    name: 'Monitoramento de Conformidade e KPIs',
    description: 'A organização define, coleta e analisa indicadores-chave de desempenho (KPIs) para a eficácia da governança de IA (ex.: % de projetos com avaliação de risco, tempo de aprovação da ética, nº de incidentes).',
    criterion: 'A organização mede, reporta e utiliza indicadores-chave de desempenho (KPIs) para avaliar a eficácia da governança de IA.',
    whatToDo: 'Defina, meça e reporte indicadores-chave de desempenho (KPIs) para avaliar a eficácia da governança de IA.',
    evidence: 'Painéis (dashboards) com os KPIs de governança; relatórios de análise de desempenho apresentados ao Comitê de IA.',
    level: 4,
    legalReference: 'ISO/IEC 42001 Cl. 9.1'
  },
  {
    id: '1.7',
    dimensionId: 'gov',
    name: 'Realização de Auditorias Internas de IA',
    description: 'Auditorias internas são planejadas e executadas periodicamente para verificar a conformidade com as políticas de IA e a eficácia dos controles implementados. Os resultados são documentados e os planos de ação são monitorados.',
    criterion: 'Existe um plano anual de auditoria que abrange sistemas de IA, incluindo a emissão de relatórios e o tratamento de não conformidades.',
    whatToDo: 'Elabore um plano anual de auditoria que abranja os sistemas de IA, com emissão de relatórios e tratamento das não conformidades encontradas.',
    evidence: 'Plano de Auditoria Interna; relatórios de auditoria de sistemas de IA; planos de ação para correção de achados.',
    level: 4,
    legalReference: 'ISO/IEC 42001 Cl. 9.2'
  },
  {
    id: '1.8',
    dimensionId: 'gov',
    name: 'Otimização Contínua da Governança',
    description: 'A organização utiliza dados de KPIs, auditorias e análise de causa raiz de incidentes para identificar tendências e oportunidades de melhoria, refinando proativamente as políticas, controles e processos de governança.',
    criterion: 'Existem processos formais para revisar e refinar, de forma proativa, as políticas e controles de governança de IA, com base em análise de dados e KPIs.',
    whatToDo: 'Formalize processos para revisar e refinar proativamente as políticas e controles de governança de IA, com base em análise de dados e KPIs.',
    evidence: 'Atas de reuniões de melhoria contínua; registros de mudanças nos processos de governança com justificativa baseada em dados.',
    level: 5,
    legalReference: 'ISO/IEC 42001 Cl. 10'
  },
  {
    id: '1.9',
    dimensionId: 'gov',
    name: 'Engajamento Proativo no Ecossistema',
    description: 'A organização participa ativamente de fóruns setoriais e de consultas públicas e colabora com reguladores para influenciar a evolução do arcabouço regulatório, compartilhando melhores práticas e lições aprendidas.',
    criterion: 'A organização demonstra participação ativa e contribuições relevantes para o desenvolvimento de normas e regulamentos de IA no setor.',
    whatToDo: 'Participe ativamente e contribua para o desenvolvimento de normas e regulamentos de IA no setor.',
    evidence: 'Registros de participação em consultas públicas; apresentações em eventos do setor; publicação de white papers sobre governança de IA.',
    level: 5,
    legalReference: 'ENIA Pilar 3'
  },

  // DIMENSÃO 2 — DESENVOLVIMENTO TECNOLÓGICO, PESQUISA E INOVAÇÃO (tec)
  {
    id: '2.1',
    dimensionId: 'tec',
    name: 'Experimentação Ad-Hoc',
    description: 'A organização realiza provas de conceito (PoCs) de forma isolada e reativa, geralmente impulsionada pela curiosidade das equipes técnicas, sem metodologia definida nem alinhamento estratégico.',
    criterion: 'Existem provas de conceito (PoCs) ou experimentos de IA registrados na organização, mesmo que isolados e sem metodologia definida.',
    whatToDo: 'Registre as provas de conceito (PoCs) ou experimentos de IA realizados, mesmo que isolados e sem metodologia definida.',
    evidence: 'Apresentações de resultados de PoCs; e-mails trocados sobre os experimentos; código-fonte em repositórios individuais.',
    level: 1,
  },
  {
    id: '2.2',
    dimensionId: 'tec',
    name: 'Gestão de Projetos de IA',
    description: 'Práticas básicas de gerenciamento de projetos (escopo, cronograma, custos) são aplicadas às iniciativas de IA. Os projetos são rastreados individualmente, mas ainda não há uma visão integrada de portfólio.',
    criterion: 'Os projetos de IA possuem planos básicos que definem o escopo, as fases, as entregas, o cronograma e os custos.',
    whatToDo: 'Elabore, para os projetos de IA, planos básicos que definam escopo, fases, entregas, cronograma e custos.',
    evidence: 'Plano de projeto, cronograma e documento de escopo para um projeto específico de IA.',
    level: 2,
  },
  {
    id: '2.3',
    dimensionId: 'tec',
    name: 'Definição do Ciclo de Vida do Modelo',
    description: 'Um ciclo de vida básico para o desenvolvimento de modelos de machine learning é esboçado e aplicado nos projetos, cobrindo, no mínimo, as fases de coleta de dados, treinamento e teste.',
    criterion: 'O ciclo de vida de desenvolvimento de modelos de machine learning está documentado e inclui a coleta de dados, o treinamento e o teste.',
    whatToDo: 'Documente o ciclo de vida de desenvolvimento dos modelos de machine learning, incluindo coleta de dados, treinamento e teste.',
    evidence: 'Documento que descreve as fases do ciclo de vida; templates de projeto que as incluem.',
    level: 2,
    legalReference: 'ISO/IEC 42001 Cl. 8.1'
  },
  {
    id: '2.4',
    dimensionId: 'tec',
    name: 'Padronização de MLOps',
    description: 'A organização adota e padroniza uma plataforma e um conjunto de processos para o ciclo de vida de Machine Learning (MLOps), incluindo versionamento de código, dados e modelos, e automação de pipelines de CI/CD.',
    criterion: 'Existe uma plataforma de MLOps definida como padrão, com processos documentados e utilizados pela maioria das equipes para CI/CD e versionamento.',
    whatToDo: 'Defina uma plataforma de MLOps padrão, com processos documentados para CI/CD e versionamento, e leve a maioria das equipes a utilizá-la.',
    evidence: 'Documentação da arquitetura da plataforma de MLOps; guias de uso e processos de CI/CD para modelos de IA.',
    level: 3,
  },
  {
    id: '2.5',
    dimensionId: 'tec',
    name: 'Gestão de Portfólio de IA',
    description: 'Um processo formal é estabelecido para propor, avaliar, priorizar e gerenciar o portfólio de iniciativas de IA, com base em critérios estratégicos, de viabilidade e de risco.',
    criterion: 'Há um processo documentado de gestão de portfólio e um registro centralizado para propor, avaliar e priorizar iniciativas de IA.',
    whatToDo: 'Documente um processo de gestão de portfólio e mantenha um registro centralizado para propor, avaliar e priorizar as iniciativas de IA.',
    evidence: 'Documento do processo de gestão de portfólio; ferramenta ou planilha que contém o portfólio de projetos de IA.',
    level: 3,
    legalReference: 'ISO/IEC 38507'
  },
  {
    id: '2.6',
    dimensionId: 'tec',
    name: 'Métricas de Desempenho de P&D',
    description: 'A organização mede o retorno sobre o investimento (ROI) e o impacto de negócio dos projetos de IA. As métricas de desempenho dos modelos (acurácia, precisão etc.) são coletadas e analisadas estatisticamente.',
    criterion: 'O desempenho dos modelos e o Retorno sobre o Investimento (ROI) dos projetos de IA são medidos e comparados com metas quantitativas.',
    whatToDo: 'Meça o desempenho dos modelos e o Retorno sobre o Investimento (ROI) dos projetos de IA, e compare os resultados com metas quantitativas.',
    evidence: 'Relatórios de análise de ROI; dashboards com métricas de desempenho dos modelos em produção.',
    level: 4,
  },
  {
    id: '2.7',
    dimensionId: 'tec',
    name: 'Gestão de Infraestrutura de IA',
    description: 'A capacidade, o desempenho e os custos da infraestrutura de dados e computação para IA são gerenciados de forma quantitativa. A demanda é prevista e a capacidade é ajustada para atender aos níveis de serviço.',
    criterion: 'Existem modelos preditivos de capacidade/custos, e o desempenho da infraestrutura computacional para IA é monitorado em relação às metas.',
    whatToDo: 'Crie modelos preditivos de capacidade e custos, e monitore o desempenho da infraestrutura computacional de IA em relação às metas.',
    evidence: 'Relatórios de gestão de capacidade; análise de custos de infraestrutura por projeto de IA.',
    level: 4,
  },
  {
    id: '2.8',
    dimensionId: 'tec',
    name: 'Otimização do Portfólio de Inovação',
    description: 'A organização utiliza modelos preditivos e análise de cenários para otimizar continuamente o balanceamento de seu portfólio de P&D em IA, alocando recursos de forma a maximizar o valor estratégico e a inovação.',
    criterion: 'A organização utiliza técnicas quantitativas, simulações e análise de cenários para otimizar a tomada de decisão no portfólio de P&D.',
    whatToDo: 'Utilize técnicas quantitativas, simulações e análise de cenários para otimizar as decisões sobre o portfólio de P&D em IA.',
    evidence: 'Simulações de portfólio; análises de sensibilidade e cenários para decisões de investimento em P&D.',
    level: 5,
  },
  {
    id: '2.9',
    dimensionId: 'tec',
    name: 'Pesquisa Aplicada e Colaboração',
    description: 'A organização conduz pesquisa aplicada em IA, publica resultados em conferências e periódicos relevantes e colabora ativamente com a academia e com centros de pesquisa para desenvolver conhecimento de ponta e gerar propriedade intelectual.',
    criterion: 'A organização possui histórico ativo de pesquisa aplicada, de geração de propriedade intelectual, de publicações e de patentes em IA.',
    whatToDo: 'Conduza pesquisa aplicada em IA de forma contínua, gerando propriedade intelectual, publicações e patentes.',
    evidence: 'Registros de patentes; acordos de cooperação em pesquisa com universidades.',
    level: 5,
    legalReference: 'Lei de Inovação Art. 9º'
  },

  // DIMENSÃO 3 — SEGURANÇA, CONFIANÇA E PROTEÇÃO DA SOCIEDADE (seg)
  {
    id: '3.1',
    dimensionId: 'seg',
    name: 'Controles Básicos de Acesso a Dados',
    description: 'Controles de acesso rudimentares e, muitas vezes, manuais são aplicados aos conjuntos de dados utilizados em projetos de IA. A preocupação principal é evitar o acesso não autorizado aos dados brutos.',
    criterion: 'Existem evidências e controles, ainda que rudimentares, de que o acesso aos dados brutos de treinamento/teste é restrito às equipes do projeto.',
    whatToDo: 'Implemente controles, ainda que rudimentares, que restrinjam o acesso aos dados brutos de treinamento e teste às equipes do projeto.',
    evidence: 'Logs de acesso a pastas ou bancos de dados; e-mails de solicitação ou concessão de permissões.',
    level: 1,
    legalReference: 'LGPD Art. 46'
  },
  {
    id: '3.2',
    dimensionId: 'seg',
    name: 'Conformidade com a LGPD',
    description: 'A organização implementa os requisitos básicos da Lei Geral de Proteção de Dados nos projetos de IA, como a nomeação de um DPO, a garantia dos direitos dos titulares e a elaboração de Relatórios de Impacto à Proteção de Dados (RIPD) quando necessário.',
    criterion: 'Os projetos de IA que tratam dados pessoais elaboram Relatórios de Impacto à Proteção de Dados (RIPD) ou realizam análises de legitimidade documentadas.',
    whatToDo: 'Elabore Relatórios de Impacto à Proteção de Dados (RIPD) ou análises de legitimidade documentadas para os projetos de IA que tratam dados pessoais.',
    evidence: 'RIPD aprovado; registros de atendimento às solicitações dos titulares de dados.',
    level: 2,
    legalReference: 'LGPD Art. 38'
  },
  {
    id: '3.3',
    dimensionId: 'seg',
    name: 'Análise de Segurança de Aplicações',
    description: 'Sistemas que utilizam componentes de IA são incluídos nas varreduras de segurança de aplicações (SAST/DAST) convencionais, com foco em vulnerabilidades tradicionais de software presentes em aplicações que consomem esses componentes.',
    criterion: 'Os sistemas que utilizam IA são incluídos e testados nas varreduras de segurança de aplicações convencionais (SAST/DAST).',
    whatToDo: 'Inclua os sistemas que utilizam IA nas varreduras de segurança de aplicações convencionais (SAST/DAST) e teste-os.',
    evidence: 'Relatório de ferramenta SAST/DAST que apresenta a análise de um sistema com IA.',
    level: 2,
    legalReference: 'ISO/IEC 27001 Cl. A.8.12'
  },
  {
    id: '3.4',
    dimensionId: 'seg',
    name: 'Avaliação de Impacto Algorítmico',
    description: 'A organização padroniza e executa um processo de Avaliação de Impacto Algorítmico para sistemas de IA de alto risco antes de sua implantação, visando identificar e documentar riscos de viés, discriminação e outros impactos negativos.',
    criterion: 'Existe um processo documentado de Avaliação de Impacto Algorítmico, executado como pré-requisito antes de implantar sistemas de IA de alto risco.',
    whatToDo: 'Documente um processo de Avaliação de Impacto Algorítmico e execute-o como pré-requisito antes de implantar sistemas de IA de alto risco.',
    evidence: 'Documento de Avaliação de Impacto Algorítmico preenchido para um sistema específico.',
    level: 3,
    legalReference: 'LGPD Art. 20'
  },
  {
    id: '3.5',
    dimensionId: 'seg',
    name: 'Segurança do Ciclo de Vida de IA (Secure AI Lifecycle)',
    description: 'Controles de segurança específicos para IA são integrados em cada fase do ciclo de vida de MLOps, incluindo a verificação da origem e da integridade dos dados, a segurança da plataforma de treinamento e a proteção dos modelos em produção.',
    criterion: 'A política de segurança da informação e os processos de desenvolvimento seguro incluem ameaças e controles específicos para IA.',
    whatToDo: 'Inclua ameaças e controles específicos de IA na política de segurança da informação e nos processos de desenvolvimento seguro.',
    evidence: 'Política de Desenvolvimento Seguro atualizada; checklist de segurança para projetos de IA.',
    level: 3,
  },
  {
    id: '3.6',
    dimensionId: 'seg',
    name: 'Testes de Robustez e Ataques Adversariais',
    description: 'A organização executa testes quantitativos para medir a resiliência dos modelos a ataques adversários, envenenamento de dados e outras formas de manipulação. Métricas de robustez são definidas e monitoradas.',
    criterion: 'A organização executa e monitora testes quantitativos (com ferramentas adequadas) para medir a resiliência dos modelos contra ataques adversários e envenenamento.',
    whatToDo: 'Execute e monitore testes quantitativos, com ferramentas adequadas, para medir a resiliência dos modelos contra ataques adversários e envenenamento de dados.',
    evidence: 'Relatórios de testes de robustez; ferramentas de teste adversário configuradas nos pipelines de CI/CD.',
    level: 4,
    legalReference: 'NIST AI RMF 3.4'
  },
  {
    id: '3.7',
    dimensionId: 'seg',
    name: 'Monitoramento de Vieses em Produção',
    description: 'A organização implementa monitoramento contínuo para detectar a degradação de desempenho (model drift) e os desvios de equidade (fairness drift) nos modelos em produção, com alertas automáticos para a equipe de governança.',
    criterion: 'Existem dashboards e alertas que monitoram, em tempo real ou quase real, a degradação do desempenho (model drift) e os desvios de equidade (fairness drift).',
    whatToDo: 'Implemente dashboards e alertas que monitorem, em tempo real ou quase real, a degradação de desempenho (model drift) e os desvios de equidade (fairness drift) dos modelos em produção.',
    evidence: 'Painéis de monitoramento de modelos em produção, com métricas de equidade; registros de alertas de desequilíbrio de equidade.',
    level: 4,
  },
  {
    id: '3.8',
    dimensionId: 'seg',
    name: 'Red Teaming para IA',
    description: 'A organização conduz exercícios de ataque simulado (Red Teaming), em que uma equipe independente tenta ativamente contornar, enganar ou quebrar os sistemas de IA em produção, a fim de identificar vulnerabilidades complexas e não previstas.',
    criterion: 'Exercícios de Red Teaming independentes para sistemas de IA são planejados, executados e utilizados periodicamente para aprimorar as defesas.',
    whatToDo: 'Planeje e execute periodicamente exercícios de Red Teaming independentes para os sistemas de IA, e use os resultados para aprimorar as defesas.',
    evidence: 'Relatório de Red Teaming para um sistema de IA, com as vulnerabilidades identificadas e as respectivas recomendações.',
    level: 5,
  },
  {
    id: '3.9',
    dimensionId: 'seg',
    name: 'Mecanismos de Contestabilidade e Remediação',
    description: 'A organização otimiza continuamente os canais para que os indivíduos afetados por decisões algorítmicas possam contestá-las, obter uma explicação significativa e, quando apropriado, buscar reparação. O feedback é usado para melhorar os modelos.',
    criterion: 'Os canais de contestação para decisões algorítmicas são claros e o feedback recebido é analisado sistematicamente para a melhoria contínua dos modelos.',
    whatToDo: 'Mantenha canais claros de contestação para decisões algorítmicas e analise sistematicamente o feedback recebido para melhorar continuamente os modelos.',
    evidence: 'Análise de dados sobre as contestações recebidas; registros de ajustes em modelos decorrentes do feedback dos usuários.',
    level: 5,
    legalReference: 'LGPD Art. 20 §1º'
  },

  // DIMENSÃO 4 — EDUCAÇÃO, CAPACITAÇÃO E CULTURA ORGANIZACIONAL (edu)
  {
    id: '4.1',
    dimensionId: 'edu',
    name: 'Treinamentos Pontuais',
    description: 'A organização oferece treinamentos introdutórios ou sobre ferramentas específicas de IA de forma reativa, geralmente sob demanda de equipes técnicas, sem um plano de capacitação estruturado.',
    criterion: 'Existem registros de que funcionários participaram, sob demanda ou de forma isolada, de cursos introdutórios ou de ferramentas de IA.',
    whatToDo: 'Registre a participação dos funcionários em cursos introdutórios ou de ferramentas de IA, ainda que sob demanda ou de forma isolada.',
    evidence: 'Lista de presença em treinamentos; certificados de conclusão de cursos.',
    level: 1,
    legalReference: 'ENIA Diretriz 3'
  },
  {
    id: '4.2',
    dimensionId: 'edu',
    name: 'Plano de Capacitação em IA',
    description: 'Um plano básico de treinamento em IA é elaborado, com foco principalmente nas equipes técnicas (cientistas de dados e analistas). O plano define as necessidades de treinamento e estabelece um cronograma para sua execução.',
    criterion: 'Há um plano básico de treinamento em IA elaborado para o ano corrente, contendo cronograma e necessidades definidas, especialmente técnicas.',
    whatToDo: 'Elabore um plano básico de treinamento em IA para o ano corrente, com cronograma e necessidades definidas, especialmente para as equipes técnicas.',
    evidence: 'Documento do Plano de Capacitação; cronograma de treinamentos.',
    level: 2,
  },
  {
    id: '4.3',
    dimensionId: 'edu',
    name: 'Comunicação Interna sobre IA',
    description: 'Ações de comunicação interna são realizadas para informar os colaboradores sobre os projetos de IA em andamento, seus objetivos e benefícios esperados, visando reduzir a incerteza e a resistência.',
    criterion: 'A organização emite comunicados internos periódicos para informar os colaboradores sobre os objetivos e os benefícios dos projetos de IA em andamento.',
    whatToDo: 'Emita comunicados internos periódicos informando os colaboradores sobre os objetivos e os benefícios dos projetos de IA em andamento.',
    evidence: 'E-mails, posts na intranet ou newsletters internas sobre projetos de IA.',
    level: 2,
  },
  {
    id: '4.4',
    dimensionId: 'edu',
    name: 'Programa de Letramento em Dados e IA',
    description: 'Um programa de capacitação estruturado e contínuo é implementado em toda a organização, com trilhas de aprendizagem definidas por função (executivos, gestores, técnicos e usuários de negócio), abrangendo temas como ética, riscos e oportunidades da IA.',
    criterion: 'O programa de capacitação em IA está estruturado e documentado com trilhas de aprendizagem contínuas definidas por função (técnicos, negócio, executivos).',
    whatToDo: 'Estruture e documente um programa de capacitação em IA com trilhas de aprendizagem contínuas definidas por função (técnicos, negócio, executivos).',
    evidence: 'Matriz de competências e treinamentos por função; conteúdo dos cursos das trilhas de aprendizagem.',
    level: 3,
    legalReference: 'ISO/IEC 42001 Cl. 7.2'
  },
  {
    id: '4.5',
    dimensionId: 'edu',
    name: 'Gestão de Mudança Organizacional',
    description: 'Uma metodologia formal de Gestão da Mudança Organizacional (GMO) é aplicada aos projetos de IA de alto impacto, incluindo a análise de stakeholders, a comunicação direcionada e ações para mitigar resistências.',
    criterion: 'Projetos de IA de alto impacto possuem e executam um plano formal de Gestão da Mudança Organizacional, com análise de stakeholders e mitigação de resistências.',
    whatToDo: 'Elabore e execute, para os projetos de IA de alto impacto, um plano formal de Gestão da Mudança Organizacional, com análise de stakeholders e mitigação de resistências.',
    evidence: 'Plano de Gestão da Mudança para um projeto de IA; pesquisas sobre o clima e a prontidão para a mudança.',
    level: 3,
  },
  {
    id: '4.6',
    dimensionId: 'edu',
    name: 'Métricas de Competências em IA',
    description: 'A organização mapeia e mede quantitativamente as competências em IA na força de trabalho, por meio de avaliações e certificações. A lacuna de competências (skills gap) é medida e monitorada.',
    criterion: 'Existem um inventário (Skill Matrix) e um monitoramento quantitativo das lacunas de competências (skills gap) da força de trabalho em relação às metas.',
    whatToDo: 'Crie um inventário de competências (Skill Matrix) e monitore quantitativamente as lacunas de competências da força de trabalho em relação às metas.',
    evidence: 'Matriz de competências (Skill Matrix) com níveis de proficiência; relatórios de progresso da capacitação em relação às metas.',
    level: 4,
  },
  {
    id: '4.7',
    dimensionId: 'edu',
    name: 'Planejamento da Força de Trabalho',
    description: 'A organização utiliza análise de dados para prever o impacto da IA nos cargos e funções, planejando proativamente as necessidades futuras de contratação, automação e requalificação.',
    criterion: 'Existem análises e relatórios baseados em dados que preveem o impacto da IA nas funções e propõem planos proativos de transição ou de requalificação.',
    whatToDo: 'Produza análises e relatórios baseados em dados que prevejam o impacto da IA nas funções e proponha planos proativos de transição ou requalificação.',
    evidence: 'Relatório de Análise de Impacto da IA no Trabalho; planos de carreira e de mobilidade interna para as funções impactadas.',
    level: 4,
  },
  {
    id: '4.8',
    dimensionId: 'edu',
    name: 'Cultura de Aprendizagem Contínua',
    description: 'A organização institucionaliza uma cultura que incentiva a experimentação, o compartilhamento de conhecimento e o aprendizado contínuo em IA. Erros são vistos como oportunidades de aprendizado e a inovação é recompensada.',
    criterion: 'A avaliação de desempenho organizacional e os programas de reconhecimento formal incluem critérios relacionados à inovação e ao aprendizado em IA.',
    whatToDo: 'Inclua critérios relacionados à inovação e ao aprendizado em IA na avaliação de desempenho organizacional e nos programas de reconhecimento formal.',
    evidence: 'Descrição do programa de avaliação de desempenho; exemplos de reconhecimento a iniciativas inovadoras em IA.',
    level: 5,
  },
  {
    id: '4.9',
    dimensionId: 'edu',
    name: 'Atração e Retenção de Talentos de IA',
    description: 'A organização otimiza continuamente sua marca empregadora (employer branding) e suas estratégias de recrutamento, desenvolvimento e retenção para se tornar um polo de atração e desenvolvimento de talentos em IA.',
    criterion: 'A organização utiliza análise de dados de RH (como a taxa de turnover e o tempo de contratação) para otimizar continuamente suas estratégias de atração e retenção de talentos em IA.',
    whatToDo: 'Utilize análise de dados de RH, como taxa de turnover e tempo de contratação, para otimizar continuamente as estratégias de atração e retenção de talentos em IA.',
    evidence: 'Análise de dados de RH sobre talentos em IA; pesquisas sobre engajamento com equipes de IA.',
    level: 5,
  },

  // DIMENSÃO 5 — COOPERAÇÃO E INSERÇÃO NO ECOSSISTEMA (eco)
  {
    id: '5.1',
    dimensionId: 'eco',
    name: 'Monitoramento Passivo do Mercado',
    description: 'A organização acompanha, de forma informal e não estruturada, as notícias, os concorrentes e as tendências de IA em seu setor, principalmente por meio de publicações e relatórios de mercado.',
    criterion: 'As equipes demonstram, mesmo de forma informal, conhecimento básico sobre tendências e concorrentes do mercado de IA no seu setor.',
    whatToDo: 'Acompanhe, mesmo que de forma informal, as tendências e os concorrentes do mercado de IA no seu setor.',
    evidence: 'Apresentações internas que citam concorrentes ou tendências de IA.',
    level: 1,
  },
  {
    id: '5.2',
    dimensionId: 'eco',
    name: 'Participação em Eventos do Setor',
    description: 'Colaboradores da organização participam de conferências, seminários e workshops sobre IA para se manterem atualizados e fazer networking. A participação é gerenciada em nível departamental.',
    criterion: 'Há registros departamentais de inscrição e de participação dos colaboradores em conferências, seminários e workshops sobre IA.',
    whatToDo: 'Registre, em nível departamental, a inscrição e a participação dos colaboradores em conferências, seminários e workshops sobre IA.',
    evidence: 'Inscrições em eventos; relatórios de despesas de viagem para conferências de IA.',
    level: 2,
  },
  {
    id: '5.3',
    dimensionId: 'eco',
    name: 'Relacionamento com Fornecedores',
    description: 'A organização estabelece um processo básico para gerenciar o relacionamento com seus principais fornecedores de tecnologia de IA, incluindo a avaliação de novos fornecedores e o acompanhamento dos contratos.',
    criterion: 'Há uma lista de fornecedores de IA aprovados e um processo básico definido para gerenciar relacionamentos, aquisições e o acompanhamento de contratos.',
    whatToDo: 'Mantenha uma lista de fornecedores de IA aprovados e defina um processo básico para gerenciar relacionamentos, aquisições e acompanhamento de contratos.',
    evidence: 'Lista de fornecedores homologados; contratos com fornecedores de IA.',
    level: 2,
    legalReference: 'LGPD Art. 39'
  },
  {
    id: '5.4',
    dimensionId: 'eco',
    name: 'Parcerias Estratégicas com Academia e Startups',
    description: 'A organização formaliza convênios e parcerias com universidades, centros de pesquisa e startups para a execução de projetos de P&D em IA. A estratégia de parceria está documentada.',
    criterion: 'A estratégia de parceria está documentada e há acordos formais de cooperação com universidades, centros de pesquisa e startups para P&D em IA.',
    whatToDo: 'Documente a estratégia de parcerias e formalize acordos de cooperação com universidades, centros de pesquisa e startups para P&D em IA.',
    evidence: 'Acordos de cooperação técnica assinados; planos de projeto de P&D em parceria.',
    level: 3,
    legalReference: 'Lei de Inovação Art. 9º'
  },
  {
    id: '5.5',
    dimensionId: 'eco',
    name: 'Participação em Associações Setoriais',
    description: 'A organização participa ativamente de grupos de trabalho sobre IA em associações de classe ou consórcios setoriais, contribuindo para as discussões e os posicionamentos do setor.',
    criterion: 'A organização atua ativamente como membro de associações de classe, com representantes alocados em grupos de trabalho ou em comitês de IA.',
    whatToDo: 'Atue ativamente como membro de associações de classe, alocando representantes em grupos de trabalho ou comitês de IA.',
    evidence: 'Comprovante de filiação a associações; atas de reuniões de grupos de trabalho com a presença de representantes da organização.',
    level: 3,
  },
  {
    id: '5.6',
    dimensionId: 'eco',
    name: 'Projetos de Cooperação com Métricas de Sucesso',
    description: 'Os projetos colaborativos com parceiros são executados com métricas claras de sucesso, monitoradas quantitativamente. O valor gerado pelas parcerias (financeiras, tecnológicas etc.) é mensurado.',
    criterion: 'As parcerias estratégicas possuem indicadores de desempenho (KPIs) definidos, medidos quantitativamente e reportados.',
    whatToDo: 'Defina indicadores de desempenho (KPIs) para as parcerias estratégicas, meça-os quantitativamente e reporte os resultados.',
    evidence: 'Relatórios de acompanhamento de parcerias com análise de KPIs.',
    level: 4,
  },
  {
    id: '5.7',
    dimensionId: 'eco',
    name: 'Benchmarking de Capacidades de IA',
    description: 'A organização realiza um processo de benchmarking para comparar quantitativamente seu desempenho, seus custos e sua maturidade em IA com os de organizações pares ou líderes de mercado.',
    criterion: 'Existem processos e relatórios formais de benchmarking para comparar custos, desempenho e maturidade em IA com organizações pares ou líderes do mercado.',
    whatToDo: 'Realize processos formais de benchmarking, com relatórios, para comparar custos, desempenho e maturidade em IA com organizações pares ou líderes de mercado.',
    evidence: 'Relatório de benchmarking; análise de lacunas (gap analysis) com base nos resultados.',
    level: 4,
  },
  {
    id: '5.8',
    dimensionId: 'eco',
    name: 'Liderança de Iniciativas no Ecossistema',
    description: 'A organização assume um papel de liderança na criação de consórcios, no desenvolvimento de padrões abertos ou na construção de plataformas setoriais de IA, buscando gerar vantagens competitivas para todo o ecossistema.',
    criterion: 'A organização demonstra liderança na criação de consórcios de grande impacto, de plataformas setoriais de IA ou de padrões abertos.',
    whatToDo: 'Assuma a liderança na criação de consórcios de grande impacto, plataformas setoriais de IA ou padrões abertos.',
    evidence: 'Atas de fundação de um consórcio; publicação de um padrão aberto liderado pela organização.',
    level: 5,
    legalReference: 'OCDE Princípios de IA'
  },
  {
    id: '5.9',
    dimensionId: 'eco',
    name: 'Contribuição para o Desenvolvimento de Políticas Públicas',
    description: 'A organização colabora ativamente com reguladores e o governo, fornecendo dados, insights e expertise técnica para subsidiar a elaboração de políticas públicas e de regulamentações de IA mais eficazes e baseadas em evidências.',
    criterion: 'A organização é consultada formalmente por órgãos reguladores ou governamentais e participa de diálogos de alto nível sobre políticas de IA baseadas em evidências.',
    whatToDo: 'Participe de diálogos de alto nível e de consultas formais com órgãos reguladores ou governamentais sobre políticas de IA baseadas em evidências.',
    evidence: 'Registros de participação em audiências públicas; convites para reuniões com agências governamentais.',
    level: 5,
    legalReference: 'ENIA Pilar 3'
  },
];

// Seed Historical Scores (Screen 6 for Panel)
export interface HistoricalRecord {
  id: string;
  periodo: string;
  taxonomiaVersao: 2;
  setor: Setor | '';
  esfera?: Esfera;
  area?: Area;
  atividadeEstatal?: AreaPrivada;
  relacaoIA?: RelacaoIA;
  revisar?: boolean;
  /** Materializado na migração para filtrar sem recalcular (só setor público). */
  poder?: Poder;
  /** Materializado a partir de `estado`. */
  regiao: Regiao;
  estado: string;
  porte: string;
  score_global: number;
  score_gov: number;
  score_tec: number;
  score_seg: number;
  score_edu: number;
  score_eco: number;
}

export const SEED_HISTORICAL_RECORDS: HistoricalRecord[] = [
  { id: 'av1', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'gestao', poder: 'executivo', estado: 'DF', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 2.12, score_gov: 2.33, score_tec: 1.88, score_seg: 2.44, score_edu: 2.11, score_eco: 1.95 },
  { id: 'av2', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'financas', estado: 'SP', regiao: 'Sudeste', porte: 'Grande', score_global: 1.89, score_gov: 2.05, score_tec: 1.77, score_seg: 2.10, score_edu: 1.66, score_eco: 1.88 },
  { id: 'av3', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'outro', revisar: true, estado: 'RJ', regiao: 'Sudeste', porte: 'Grande', score_global: 1.54, score_gov: 1.20, score_tec: 2.05, score_seg: 1.10, score_edu: 2.10, score_eco: 1.25 },
  { id: 'av4', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'saude', poder: 'executivo', estado: 'MG', regiao: 'Sudeste', porte: 'Média', score_global: 1.34, score_gov: 1.45, score_tec: 1.22, score_seg: 1.55, score_edu: 1.10, score_eco: 1.40 },
  { id: 'av5', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', estado: 'RS', regiao: 'Sul', porte: 'Pequena', score_global: 0.98, score_gov: 1.10, score_tec: 0.88, score_seg: 0.90, score_edu: 1.20, score_eco: 0.80 },
  { id: 'av6', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'causas', estado: 'BA', regiao: 'Nordeste', porte: 'Micro', score_global: 0.72, score_gov: 0.80, score_tec: 0.66, score_seg: 0.70, score_edu: 0.88, score_eco: 0.55 },
  { id: 'av7', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'privado', area: 'tecnologia', estado: 'SC', regiao: 'Sul', porte: 'Pequena', score_global: 1.62, score_gov: 1.44, score_tec: 1.88, score_seg: 1.50, score_edu: 1.40, score_eco: 1.88 },
  { id: 'av8', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'saude', poder: 'executivo', estado: 'AM', regiao: 'Norte', porte: 'Grande', score_global: 1.11, score_gov: 1.20, score_tec: 1.05, score_seg: 1.30, score_edu: 0.90, score_eco: 1.10 },
  { id: 'av9', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'desenvolve', estado: 'RS', regiao: 'Sul', porte: 'Grande', score_global: 1.84, score_gov: 1.88, score_tec: 1.87, score_seg: 1.89, score_edu: 1.74, score_eco: 1.82 },
  { id: 'av10', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'PI', regiao: 'Nordeste', porte: 'Média', score_global: 1.53, score_gov: 1.52, score_tec: 1.68, score_seg: 1.38, score_edu: 1.55, score_eco: 1.53 },
  { id: 'av11', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'educacao', relacaoIA: 'desenvolve', estado: 'SP', regiao: 'Sudeste', porte: 'Grande', score_global: 1.48, score_gov: 1.43, score_tec: 1.51, score_seg: 1.43, score_edu: 1.44, score_eco: 1.57 },
  { id: 'av12', periodo: 'Ago/2025', taxonomiaVersao: 2, setor: 'privado', area: 'tecnologia', relacaoIA: 'desenvolve', estado: 'DF', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.61, score_gov: 1.45, score_tec: 1.74, score_seg: 1.77, score_edu: 1.57, score_eco: 1.51 },
  { id: 'av13', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'comercio', relacaoIA: 'usa', estado: 'CE', regiao: 'Nordeste', porte: 'Média', score_global: 1.44, score_gov: 1.59, score_tec: 1.54, score_seg: 1.39, score_edu: 1.3, score_eco: 1.4 },
  { id: 'av14', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'causas', relacaoIA: 'nao_usa', estado: 'TO', regiao: 'Norte', porte: 'Média', score_global: 1.18, score_gov: 1.21, score_tec: 1.19, score_seg: 1.12, score_edu: 1.26, score_eco: 1.11 },
  { id: 'av15', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'nao_usa', estado: 'SE', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.39, score_gov: 1.35, score_tec: 1.49, score_seg: 1.34, score_edu: 1.44, score_eco: 1.33 },
  { id: 'av16', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'usa', estado: 'MT', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.54, score_gov: 1.52, score_tec: 1.62, score_seg: 1.5, score_edu: 1.58, score_eco: 1.49 },
  { id: 'av17', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'saude', poder: 'executivo', relacaoIA: 'usa', estado: 'GO', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.52, score_gov: 1.46, score_tec: 1.45, score_seg: 1.69, score_edu: 1.39, score_eco: 1.61 },
  { id: 'av18', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'seguranca', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'PR', regiao: 'Sul', porte: 'Pequena', score_global: 1.32, score_gov: 1.49, score_tec: 1.32, score_seg: 1.17, score_edu: 1.2, score_eco: 1.43 },
  { id: 'av19', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'regulacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'PB', regiao: 'Nordeste', porte: 'Grande', score_global: 1.6, score_gov: 1.52, score_tec: 1.67, score_seg: 1.75, score_edu: 1.54, score_eco: 1.51 },
  { id: 'av20', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'classe', relacaoIA: 'usa', estado: 'SE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.27, score_gov: 1.3, score_tec: 1.16, score_seg: 1.11, score_edu: 1.39, score_eco: 1.38 },
  { id: 'av21', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'regulacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'MA', regiao: 'Nordeste', porte: 'Grande', score_global: 1.56, score_gov: 1.59, score_tec: 1.5, score_seg: 1.42, score_edu: 1.7, score_eco: 1.6 },
  { id: 'av22', periodo: 'Ago/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'educacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'GO', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.19, score_gov: 1.1, score_tec: 1.08, score_seg: 1.33, score_edu: 1.11, score_eco: 1.34 },
  { id: 'av23', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'privado', area: 'tecnologia', relacaoIA: 'desenvolve', estado: 'SP', regiao: 'Sudeste', porte: 'Média', score_global: 1.44, score_gov: 1.31, score_tec: 1.39, score_seg: 1.58, score_edu: 1.62, score_eco: 1.29 },
  { id: 'av24', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'justica', poder: 'judiciario', relacaoIA: 'desenvolve', estado: 'MS', regiao: 'Centro-Oeste', porte: 'Micro', score_global: 1.26, score_gov: 1.16, score_tec: 1.19, score_seg: 1.39, score_edu: 1.22, score_eco: 1.34 },
  { id: 'av25', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'classe', relacaoIA: 'usa', estado: 'BA', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.01, score_gov: 0.98, score_tec: 1.04, score_seg: 0.97, score_edu: 1.05, score_eco: 0.99 },
  { id: 'av26', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'gestao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'SP', regiao: 'Sudeste', porte: 'Média', score_global: 1.69, score_gov: 1.68, score_tec: 1.73, score_seg: 1.76, score_edu: 1.77, score_eco: 1.49 },
  { id: 'av27', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'usa', estado: 'CE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.69, score_gov: 1.78, score_tec: 1.61, score_seg: 1.69, score_edu: 1.69, score_eco: 1.69 },
  { id: 'av28', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'justica', poder: 'judiciario', relacaoIA: 'nao_usa', estado: 'PB', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.09, score_gov: 1.13, score_tec: 0.97, score_seg: 1.15, score_edu: 1.13, score_eco: 1.05 },
  { id: 'av29', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'regulacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'AL', regiao: 'Nordeste', porte: 'Média', score_global: 1.49, score_gov: 1.54, score_tec: 1.37, score_seg: 1.39, score_edu: 1.55, score_eco: 1.58 },
  { id: 'av30', periodo: 'Ago/2025', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'nao_usa', estado: 'PA', regiao: 'Norte', porte: 'Pequena', score_global: 1.15, score_gov: 1.24, score_tec: 1.14, score_seg: 1.08, score_edu: 1.07, score_eco: 1.22 },
  { id: 'av31', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'educacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'AC', regiao: 'Norte', porte: 'Grande', score_global: 1.76, score_gov: 1.97, score_tec: 1.61, score_seg: 1.83, score_edu: 1.67, score_eco: 1.71 },
  { id: 'av32', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'nao_usa', estado: 'CE', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.57, score_gov: 1.64, score_tec: 1.45, score_seg: 1.55, score_edu: 1.52, score_eco: 1.68 },
  { id: 'av33', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'DF', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.36, score_gov: 1.3, score_tec: 1.22, score_seg: 1.53, score_edu: 1.39, score_eco: 1.37 },
  { id: 'av34', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'PI', regiao: 'Nordeste', porte: 'Grande', score_global: 1.46, score_gov: 1.5, score_tec: 1.46, score_seg: 1.53, score_edu: 1.44, score_eco: 1.39 },
  { id: 'av35', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'educacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'AM', regiao: 'Norte', porte: 'Grande', score_global: 1.49, score_gov: 1.42, score_tec: 1.68, score_seg: 1.36, score_edu: 1.53, score_eco: 1.46 },
  { id: 'av36', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'nao_usa', estado: 'TO', regiao: 'Norte', porte: 'Grande', score_global: 1.71, score_gov: 1.71, score_tec: 1.71, score_seg: 1.87, score_edu: 1.67, score_eco: 1.61 },
  { id: 'av37', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'nao_usa', estado: 'ES', regiao: 'Sudeste', porte: 'Grande', score_global: 2.02, score_gov: 2.09, score_tec: 2.21, score_seg: 2.03, score_edu: 1.93, score_eco: 1.85 },
  { id: 'av38', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'usa', estado: 'RS', regiao: 'Sul', porte: 'Média', score_global: 1.74, score_gov: 1.9, score_tec: 1.56, score_seg: 1.8, score_edu: 1.79, score_eco: 1.65 },
  { id: 'av39', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'usa', estado: 'AP', regiao: 'Norte', porte: 'Pequena', score_global: 1.27, score_gov: 1.26, score_tec: 1.26, score_seg: 1.38, score_edu: 1.25, score_eco: 1.21 },
  { id: 'av40', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'usa', estado: 'MS', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.51, score_gov: 1.52, score_tec: 1.57, score_seg: 1.65, score_edu: 1.37, score_eco: 1.44 },
  { id: 'av41', periodo: 'Ago/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'legislativo', poder: 'legislativo', relacaoIA: 'desenvolve', estado: 'PB', regiao: 'Nordeste', porte: 'Média', score_global: 1.05, score_gov: 1.15, score_tec: 1.2, score_seg: 0.98, score_edu: 0.91, score_eco: 1.01 },
  { id: 'av42', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'desenvolve', estado: 'PB', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.46, score_gov: 1.66, score_tec: 1.36, score_seg: 1.56, score_edu: 1.4, score_eco: 1.33 },
  { id: 'av43', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'legislativo', poder: 'legislativo', relacaoIA: 'nao_usa', estado: 'ES', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.56, score_gov: 1.65, score_tec: 1.34, score_seg: 1.57, score_edu: 1.66, score_eco: 1.56 },
  { id: 'av44', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'estatal', atividadeEstatal: 'industria', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'PA', regiao: 'Norte', porte: 'Pequena', score_global: 1.39, score_gov: 1.47, score_tec: 1.26, score_seg: 1.28, score_edu: 1.37, score_eco: 1.57 },
  { id: 'av45', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'usa', estado: 'AM', regiao: 'Norte', porte: 'Pequena', score_global: 1.47, score_gov: 1.55, score_tec: 1.46, score_seg: 1.52, score_edu: 1.58, score_eco: 1.26 },
  { id: 'av46', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'nao_usa', estado: 'MG', regiao: 'Sudeste', porte: 'Grande', score_global: 1.39, score_gov: 1.22, score_tec: 1.33, score_seg: 1.47, score_edu: 1.51, score_eco: 1.42 },
  { id: 'av47', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'desenvolve', estado: 'SC', regiao: 'Sul', porte: 'Pequena', score_global: 1.31, score_gov: 1.23, score_tec: 1.45, score_seg: 1.28, score_edu: 1.5, score_eco: 1.11 },
  { id: 'av48', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'usa', estado: 'RJ', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.31, score_gov: 1.16, score_tec: 1.42, score_seg: 1.43, score_edu: 1.36, score_eco: 1.16 },
  { id: 'av49', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'regulacao', poder: 'executivo', relacaoIA: 'usa', estado: 'MG', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.06, score_gov: 1.03, score_tec: 1.27, score_seg: 1.08, score_edu: 0.96, score_eco: 0.95 },
  { id: 'av50', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'nao_usa', estado: 'RS', regiao: 'Sul', porte: 'Grande', score_global: 1.44, score_gov: 1.49, score_tec: 1.51, score_seg: 1.54, score_edu: 1.35, score_eco: 1.31 },
  { id: 'av51', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'privado', area: 'tecnologia', relacaoIA: 'desenvolve', estado: 'SP', regiao: 'Sudeste', porte: 'Média', score_global: 1.36, score_gov: 1.31, score_tec: 1.34, score_seg: 1.36, score_edu: 1.37, score_eco: 1.44 },
  { id: 'av52', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'usa', estado: 'AC', regiao: 'Norte', porte: 'Média', score_global: 1.3, score_gov: 1.16, score_tec: 1.42, score_seg: 1.34, score_edu: 1.27, score_eco: 1.3 },
  { id: 'av53', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'causas', relacaoIA: 'desenvolve', estado: 'PR', regiao: 'Sul', porte: 'Média', score_global: 1.18, score_gov: 1.01, score_tec: 1.33, score_seg: 1.19, score_edu: 1.09, score_eco: 1.27 },
  { id: 'av54', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'saude', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'MG', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.43, score_gov: 1.36, score_tec: 1.48, score_seg: 1.57, score_edu: 1.41, score_eco: 1.34 },
  { id: 'av55', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'saude', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'CE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.8, score_gov: 1.68, score_tec: 1.87, score_seg: 1.87, score_edu: 1.75, score_eco: 1.85 },
  { id: 'av56', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'privado', area: 'comercio', relacaoIA: 'usa', estado: 'BA', regiao: 'Nordeste', porte: 'Média', score_global: 1.62, score_gov: 1.76, score_tec: 1.63, score_seg: 1.51, score_edu: 1.51, score_eco: 1.71 },
  { id: 'av57', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'nao_usa', estado: 'CE', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.48, score_gov: 1.67, score_tec: 1.47, score_seg: 1.38, score_edu: 1.42, score_eco: 1.45 },
  { id: 'av58', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'legislativo', poder: 'legislativo', relacaoIA: 'nao_usa', estado: 'PI', regiao: 'Nordeste', porte: 'Média', score_global: 1.09, score_gov: 1.01, score_tec: 1.15, score_seg: 0.97, score_edu: 1.2, score_eco: 1.1 },
  { id: 'av59', periodo: 'Ago/2025', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'nao_usa', estado: 'RN', regiao: 'Nordeste', porte: 'Média', score_global: 1.35, score_gov: 1.45, score_tec: 1.34, score_seg: 1.28, score_edu: 1.33, score_eco: 1.34 },
  { id: 'av60', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'desenvolve', estado: 'PB', regiao: 'Nordeste', porte: 'Média', score_global: 1.24, score_gov: 1.33, score_tec: 1.17, score_seg: 1.03, score_edu: 1.37, score_eco: 1.32 },
  { id: 'av61', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'causas', relacaoIA: 'nao_usa', estado: 'SP', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.03, score_gov: 1.07, score_tec: 1.16, score_seg: 0.89, score_edu: 1.02, score_eco: 1.03 },
  { id: 'av62', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'privado', area: 'comercio', relacaoIA: 'desenvolve', estado: 'AC', regiao: 'Norte', porte: 'Pequena', score_global: 1.36, score_gov: 1.46, score_tec: 1.22, score_seg: 1.16, score_edu: 1.42, score_eco: 1.52 },
  { id: 'av63', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'justica', poder: 'judiciario', relacaoIA: 'usa', estado: 'RJ', regiao: 'Sudeste', porte: 'Média', score_global: 1.6, score_gov: 1.47, score_tec: 1.63, score_seg: 1.55, score_edu: 1.63, score_eco: 1.73 },
  { id: 'av64', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'desenvolve', estado: 'SP', regiao: 'Sudeste', porte: 'Grande', score_global: 1.54, score_gov: 1.62, score_tec: 1.59, score_seg: 1.63, score_edu: 1.37, score_eco: 1.51 },
  { id: 'av65', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'educacao', relacaoIA: 'usa', estado: 'DF', regiao: 'Centro-Oeste', porte: 'Média', score_global: 0.95, score_gov: 1.04, score_tec: 1.14, score_seg: 0.84, score_edu: 0.9, score_eco: 0.85 },
  { id: 'av66', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'usa', estado: 'PE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.54, score_gov: 1.53, score_tec: 1.65, score_seg: 1.33, score_edu: 1.62, score_eco: 1.58 },
  { id: 'av67', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'nao_usa', estado: 'RO', regiao: 'Norte', porte: 'Média', score_global: 1.05, score_gov: 1, score_tec: 1.05, score_seg: 0.98, score_edu: 1.23, score_eco: 1 },
  { id: 'av68', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'saude', poder: 'executivo', relacaoIA: 'usa', estado: 'PB', regiao: 'Nordeste', porte: 'Média', score_global: 1.18, score_gov: 1.03, score_tec: 1.2, score_seg: 1.26, score_edu: 1.28, score_eco: 1.14 },
  { id: 'av69', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'gestao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'AM', regiao: 'Norte', porte: 'Média', score_global: 1.4, score_gov: 1.39, score_tec: 1.54, score_seg: 1.31, score_edu: 1.38, score_eco: 1.38 },
  { id: 'av70', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'tecnologia', relacaoIA: 'usa', estado: 'SP', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.45, score_gov: 1.38, score_tec: 1.57, score_seg: 1.31, score_edu: 1.47, score_eco: 1.54 },
  { id: 'av71', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'regulacao', poder: 'executivo', relacaoIA: 'usa', estado: 'AM', regiao: 'Norte', porte: 'Grande', score_global: 1.82, score_gov: 1.83, score_tec: 1.85, score_seg: 1.96, score_edu: 1.6, score_eco: 1.87 },
  { id: 'av72', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'legislativo', poder: 'legislativo', relacaoIA: 'usa', estado: 'PI', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.62, score_gov: 1.61, score_tec: 1.64, score_seg: 1.5, score_edu: 1.66, score_eco: 1.71 },
  { id: 'av73', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'nao_usa', estado: 'SC', regiao: 'Sul', porte: 'Grande', score_global: 1.5, score_gov: 1.71, score_tec: 1.41, score_seg: 1.33, score_edu: 1.54, score_eco: 1.51 },
  { id: 'av74', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'MT', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.41, score_gov: 1.53, score_tec: 1.3, score_seg: 1.25, score_edu: 1.38, score_eco: 1.57 },
  { id: 'av75', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'nao_usa', estado: 'RJ', regiao: 'Sudeste', porte: 'Média', score_global: 1.76, score_gov: 1.69, score_tec: 1.77, score_seg: 1.66, score_edu: 1.84, score_eco: 1.86 },
  { id: 'av76', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'justica', poder: 'judiciario', relacaoIA: 'nao_usa', estado: 'BA', regiao: 'Nordeste', porte: 'Grande', score_global: 1.74, score_gov: 1.67, score_tec: 1.89, score_seg: 1.75, score_edu: 1.73, score_eco: 1.68 },
  { id: 'av77', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'AL', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.56, score_gov: 1.49, score_tec: 1.7, score_seg: 1.65, score_edu: 1.33, score_eco: 1.64 },
  { id: 'av78', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'usa', estado: 'SP', regiao: 'Sudeste', porte: 'Grande', score_global: 1.32, score_gov: 1.14, score_tec: 1.32, score_seg: 1.52, score_edu: 1.36, score_eco: 1.25 },
  { id: 'av79', periodo: 'Jul/2025', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'desenvolve', estado: 'TO', regiao: 'Norte', porte: 'Micro', score_global: 1.05, score_gov: 0.92, score_tec: 1.19, score_seg: 1.19, score_edu: 0.98, score_eco: 0.97 },
  { id: 'av80', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'nao_usa', estado: 'RR', regiao: 'Norte', porte: 'Grande', score_global: 1.68, score_gov: 1.8, score_tec: 1.79, score_seg: 1.71, score_edu: 1.52, score_eco: 1.57 },
  { id: 'av81', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'nao_usa', estado: 'MT', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.61, score_gov: 1.54, score_tec: 1.76, score_seg: 1.52, score_edu: 1.62, score_eco: 1.6 },
  { id: 'av82', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'justica', poder: 'judiciario', relacaoIA: 'nao_usa', estado: 'PE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.61, score_gov: 1.54, score_tec: 1.62, score_seg: 1.52, score_edu: 1.7, score_eco: 1.68 },
  { id: 'av83', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'PA', regiao: 'Norte', porte: 'Grande', score_global: 1.6, score_gov: 1.64, score_tec: 1.58, score_seg: 1.68, score_edu: 1.43, score_eco: 1.65 },
  { id: 'av84', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'RJ', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.39, score_gov: 1.41, score_tec: 1.34, score_seg: 1.4, score_edu: 1.39, score_eco: 1.42 },
  { id: 'av85', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'usa', estado: 'RO', regiao: 'Norte', porte: 'Média', score_global: 1.63, score_gov: 1.6, score_tec: 1.75, score_seg: 1.46, score_edu: 1.78, score_eco: 1.57 },
  { id: 'av86', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'SP', regiao: 'Sudeste', porte: 'Grande', score_global: 1.5, score_gov: 1.32, score_tec: 1.58, score_seg: 1.67, score_edu: 1.5, score_eco: 1.43 },
  { id: 'av87', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'privado', area: 'comercio', relacaoIA: 'nao_usa', estado: 'AP', regiao: 'Norte', porte: 'Média', score_global: 1.54, score_gov: 1.67, score_tec: 1.66, score_seg: 1.42, score_edu: 1.34, score_eco: 1.6 },
  { id: 'av88', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'usa', estado: 'AP', regiao: 'Norte', porte: 'Pequena', score_global: 1.43, score_gov: 1.27, score_tec: 1.32, score_seg: 1.56, score_edu: 1.57, score_eco: 1.45 },
  { id: 'av89', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'desenvolve', estado: 'AP', regiao: 'Norte', porte: 'Grande', score_global: 1.65, score_gov: 1.79, score_tec: 1.44, score_seg: 1.73, score_edu: 1.7, score_eco: 1.61 },
  { id: 'av90', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'usa', estado: 'RN', regiao: 'Nordeste', porte: 'Média', score_global: 1.31, score_gov: 1.19, score_tec: 1.4, score_seg: 1.29, score_edu: 1.45, score_eco: 1.24 },
  { id: 'av91', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', relacaoIA: 'usa', estado: 'RS', regiao: 'Sul', porte: 'Pequena', score_global: 1.31, score_gov: 1.11, score_tec: 1.29, score_seg: 1.4, score_edu: 1.47, score_eco: 1.29 },
  { id: 'av92', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'saude', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'PE', regiao: 'Nordeste', porte: 'Média', score_global: 1.4, score_gov: 1.4, score_tec: 1.53, score_seg: 1.36, score_edu: 1.36, score_eco: 1.35 },
  { id: 'av93', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'justica', poder: 'judiciario', relacaoIA: 'usa', estado: 'SP', regiao: 'Sudeste', porte: 'Média', score_global: 1.48, score_gov: 1.57, score_tec: 1.29, score_seg: 1.54, score_edu: 1.54, score_eco: 1.47 },
  { id: 'av94', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'desenvolve', estado: 'SE', regiao: 'Nordeste', porte: 'Média', score_global: 1.53, score_gov: 1.36, score_tec: 1.62, score_seg: 1.69, score_edu: 1.45, score_eco: 1.53 },
  { id: 'av95', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'usa', estado: 'PE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.45, score_gov: 1.59, score_tec: 1.3, score_seg: 1.37, score_edu: 1.57, score_eco: 1.42 },
  { id: 'av96', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'justica', poder: 'judiciario', relacaoIA: 'desenvolve', estado: 'RN', regiao: 'Nordeste', porte: 'Média', score_global: 1.72, score_gov: 1.59, score_tec: 1.9, score_seg: 1.86, score_edu: 1.74, score_eco: 1.53 },
  { id: 'av97', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'TO', regiao: 'Norte', porte: 'Grande', score_global: 1.64, score_gov: 1.61, score_tec: 1.48, score_seg: 1.7, score_edu: 1.7, score_eco: 1.72 },
  { id: 'av98', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'SC', regiao: 'Sul', porte: 'Média', score_global: 1.36, score_gov: 1.31, score_tec: 1.29, score_seg: 1.43, score_edu: 1.5, score_eco: 1.27 },
  { id: 'av99', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'educacao', poder: 'executivo', relacaoIA: 'usa', estado: 'AC', regiao: 'Norte', porte: 'Grande', score_global: 1.32, score_gov: 1.44, score_tec: 1.2, score_seg: 1.39, score_edu: 1.2, score_eco: 1.39 },
  { id: 'av100', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'nao_usa', estado: 'MG', regiao: 'Sudeste', porte: 'Média', score_global: 1.47, score_gov: 1.32, score_tec: 1.49, score_seg: 1.57, score_edu: 1.62, score_eco: 1.36 },
  { id: 'av101', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'nao_usa', estado: 'GO', regiao: 'Centro-Oeste', porte: 'Pequena', score_global: 1.33, score_gov: 1.36, score_tec: 1.31, score_seg: 1.33, score_edu: 1.39, score_eco: 1.28 },
  { id: 'av102', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'desenvolve', estado: 'AC', regiao: 'Norte', porte: 'Pequena', score_global: 1.51, score_gov: 1.53, score_tec: 1.28, score_seg: 1.59, score_edu: 1.59, score_eco: 1.58 },
  { id: 'av103', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'gestao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'AM', regiao: 'Norte', porte: 'Grande', score_global: 1.43, score_gov: 1.18, score_tec: 1.44, score_seg: 1.54, score_edu: 1.48, score_eco: 1.49 },
  { id: 'av104', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'TO', regiao: 'Norte', porte: 'Média', score_global: 1.26, score_gov: 1.24, score_tec: 1.27, score_seg: 1.3, score_edu: 1.24, score_eco: 1.26 },
  { id: 'av105', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'estatal', atividadeEstatal: 'tecnologia', poder: 'executivo', relacaoIA: 'usa', estado: 'PR', regiao: 'Sul', porte: 'Grande', score_global: 1.47, score_gov: 1.36, score_tec: 1.53, score_seg: 1.31, score_edu: 1.54, score_eco: 1.59 },
  { id: 'av106', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'RN', regiao: 'Nordeste', porte: 'Grande', score_global: 1.47, score_gov: 1.62, score_tec: 1.28, score_seg: 1.43, score_edu: 1.59, score_eco: 1.45 },
  { id: 'av107', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'usa', estado: 'RN', regiao: 'Nordeste', porte: 'Grande', score_global: 1.1, score_gov: 1.05, score_tec: 1.13, score_seg: 1.05, score_edu: 1.07, score_eco: 1.2 },
  { id: 'av108', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'legislativo', poder: 'legislativo', relacaoIA: 'usa', estado: 'BA', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.38, score_gov: 1.5, score_tec: 1.29, score_seg: 1.39, score_edu: 1.18, score_eco: 1.53 },
  { id: 'av109', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'nao_usa', estado: 'RR', regiao: 'Norte', porte: 'Média', score_global: 1.39, score_gov: 1.55, score_tec: 1.32, score_seg: 1.3, score_edu: 1.28, score_eco: 1.48 },
  { id: 'av110', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'usa', estado: 'MS', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.56, score_gov: 1.45, score_tec: 1.33, score_seg: 1.66, score_edu: 1.68, score_eco: 1.67 },
  { id: 'av111', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'desenvolve', estado: 'BA', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.43, score_gov: 1.33, score_tec: 1.39, score_seg: 1.34, score_edu: 1.53, score_eco: 1.58 },
  { id: 'av112', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'educacao', poder: 'executivo', relacaoIA: 'usa', estado: 'GO', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.61, score_gov: 1.72, score_tec: 1.6, score_seg: 1.67, score_edu: 1.48, score_eco: 1.56 },
  { id: 'av113', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'usa', estado: 'ES', regiao: 'Sudeste', porte: 'Média', score_global: 1.3, score_gov: 1.29, score_tec: 1.33, score_seg: 1.22, score_edu: 1.3, score_eco: 1.37 },
  { id: 'av114', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'regulacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'RJ', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.45, score_gov: 1.44, score_tec: 1.58, score_seg: 1.52, score_edu: 1.4, score_eco: 1.3 },
  { id: 'av115', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'usa', estado: 'PE', regiao: 'Nordeste', porte: 'Média', score_global: 1.76, score_gov: 1.61, score_tec: 1.85, score_seg: 1.83, score_edu: 1.64, score_eco: 1.85 },
  { id: 'av116', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'desenvolve', estado: 'RS', regiao: 'Sul', porte: 'Pequena', score_global: 1.4, score_gov: 1.42, score_tec: 1.22, score_seg: 1.4, score_edu: 1.49, score_eco: 1.47 },
  { id: 'av117', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'privado', area: 'comercio', relacaoIA: 'desenvolve', estado: 'GO', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.56, score_gov: 1.54, score_tec: 1.69, score_seg: 1.61, score_edu: 1.43, score_eco: 1.53 },
  { id: 'av118', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'DF', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.37, score_gov: 1.28, score_tec: 1.3, score_seg: 1.5, score_edu: 1.57, score_eco: 1.22 },
  { id: 'av119', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', relacaoIA: 'usa', estado: 'BA', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.43, score_gov: 1.59, score_tec: 1.29, score_seg: 1.32, score_edu: 1.51, score_eco: 1.43 },
  { id: 'av120', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'causas', relacaoIA: 'desenvolve', estado: 'PR', regiao: 'Sul', porte: 'Pequena', score_global: 0.72, score_gov: 0.71, score_tec: 0.78, score_seg: 0.77, score_edu: 0.67, score_eco: 0.67 },
  { id: 'av121', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'desenvolve', estado: 'RJ', regiao: 'Sudeste', porte: 'Grande', score_global: 1.51, score_gov: 1.55, score_tec: 1.52, score_seg: 1.49, score_edu: 1.64, score_eco: 1.35 },
  { id: 'av122', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'estatal', atividadeEstatal: 'educacao', poder: 'executivo', relacaoIA: 'usa', estado: 'ES', regiao: 'Sudeste', porte: 'Pequena', score_global: 1, score_gov: 0.92, score_tec: 0.99, score_seg: 1.02, score_edu: 1.18, score_eco: 0.9 },
  { id: 'av123', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'legislativo', poder: 'legislativo', relacaoIA: 'usa', estado: 'SP', regiao: 'Sudeste', porte: 'Grande', score_global: 1.39, score_gov: 1.29, score_tec: 1.19, score_seg: 1.56, score_edu: 1.36, score_eco: 1.54 },
  { id: 'av124', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'regulacao', poder: 'executivo', relacaoIA: 'usa', estado: 'MA', regiao: 'Nordeste', porte: 'Média', score_global: 1.25, score_gov: 1.39, score_tec: 1.19, score_seg: 1.37, score_edu: 1.04, score_eco: 1.25 },
  { id: 'av125', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'educacao', relacaoIA: 'nao_usa', estado: 'MG', regiao: 'Sudeste', porte: 'Média', score_global: 1.28, score_gov: 1.35, score_tec: 1.17, score_seg: 1.34, score_edu: 1.18, score_eco: 1.38 },
  { id: 'av126', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'saude', poder: 'executivo', relacaoIA: 'usa', estado: 'RO', regiao: 'Norte', porte: 'Pequena', score_global: 1.09, score_gov: 0.9, score_tec: 0.95, score_seg: 1.21, score_edu: 1.19, score_eco: 1.19 },
  { id: 'av127', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'estatal', atividadeEstatal: 'tecnologia', poder: 'executivo', relacaoIA: 'usa', estado: 'SE', regiao: 'Nordeste', porte: 'Média', score_global: 1.4, score_gov: 1.38, score_tec: 1.22, score_seg: 1.5, score_edu: 1.53, score_eco: 1.37 },
  { id: 'av128', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'educacao', relacaoIA: 'desenvolve', estado: 'SP', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.19, score_gov: 1.12, score_tec: 1.09, score_seg: 1.25, score_edu: 1.3, score_eco: 1.17 },
  { id: 'av129', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'desenvolve', estado: 'GO', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.33, score_gov: 1.42, score_tec: 1.55, score_seg: 1.23, score_edu: 1.28, score_eco: 1.17 },
  { id: 'av130', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'legislativo', poder: 'legislativo', relacaoIA: 'desenvolve', estado: 'SC', regiao: 'Sul', porte: 'Grande', score_global: 1.37, score_gov: 1.49, score_tec: 1.49, score_seg: 1.23, score_edu: 1.38, score_eco: 1.26 },
  { id: 'av131', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'MA', regiao: 'Nordeste', porte: 'Grande', score_global: 1.36, score_gov: 1.23, score_tec: 1.5, score_seg: 1.36, score_edu: 1.26, score_eco: 1.44 },
  { id: 'av132', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'gestao', poder: 'executivo', relacaoIA: 'usa', estado: 'PE', regiao: 'Nordeste', porte: 'Pequena', score_global: 0.91, score_gov: 0.87, score_tec: 1.06, score_seg: 0.91, score_edu: 0.93, score_eco: 0.76 },
  { id: 'av133', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'estatal', atividadeEstatal: 'educacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'SC', regiao: 'Sul', porte: 'Grande', score_global: 1.53, score_gov: 1.35, score_tec: 1.58, score_seg: 1.49, score_edu: 1.61, score_eco: 1.6 },
  { id: 'av134', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'classe', relacaoIA: 'nao_usa', estado: 'GO', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.61, score_gov: 1.7, score_tec: 1.45, score_seg: 1.79, score_edu: 1.48, score_eco: 1.61 },
  { id: 'av135', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'saude', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'SE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.67, score_gov: 1.67, score_tec: 1.56, score_seg: 1.9, score_edu: 1.62, score_eco: 1.62 },
  { id: 'av136', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'classe', relacaoIA: 'usa', estado: 'RR', regiao: 'Norte', porte: 'Grande', score_global: 1.43, score_gov: 1.39, score_tec: 1.39, score_seg: 1.58, score_edu: 1.31, score_eco: 1.5 },
  { id: 'av137', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'privado', area: 'comercio', relacaoIA: 'desenvolve', estado: 'SP', regiao: 'Sudeste', porte: 'Grande', score_global: 1.33, score_gov: 1.27, score_tec: 1.5, score_seg: 1.32, score_edu: 1.29, score_eco: 1.27 },
  { id: 'av138', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'seguranca', poder: 'executivo', relacaoIA: 'usa', estado: 'AM', regiao: 'Norte', porte: 'Média', score_global: 1.49, score_gov: 1.43, score_tec: 1.35, score_seg: 1.52, score_edu: 1.53, score_eco: 1.6 },
  { id: 'av139', periodo: 'Ago/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'justica', poder: 'judiciario', relacaoIA: 'desenvolve', estado: 'PR', regiao: 'Sul', porte: 'Micro', score_global: 0.86, score_gov: 0.75, score_tec: 0.77, score_seg: 1.11, score_edu: 0.77, score_eco: 0.88 },
  { id: 'av140', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'regulacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'TO', regiao: 'Norte', porte: 'Pequena', score_global: 1.17, score_gov: 1.05, score_tec: 1.22, score_seg: 1.09, score_edu: 1.38, score_eco: 1.1 },
  { id: 'av141', periodo: 'Jul/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'regulacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'MA', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.15, score_gov: 1.27, score_tec: 1.29, score_seg: 1.08, score_edu: 1.04, score_eco: 1.09 },
  { id: 'av142', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', relacaoIA: 'usa', estado: 'RS', regiao: 'Sul', porte: 'Grande', score_global: 1.74, score_gov: 1.78, score_tec: 1.58, score_seg: 1.86, score_edu: 1.63, score_eco: 1.86 },
  { id: 'av143', periodo: 'Ago/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'educacao', poder: 'executivo', relacaoIA: 'usa', estado: 'RJ', regiao: 'Sudeste', porte: 'Grande', score_global: 1.25, score_gov: 1.14, score_tec: 1.23, score_seg: 1.47, score_edu: 1.16, score_eco: 1.27 },
  { id: 'av144', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', relacaoIA: 'usa', estado: 'AP', regiao: 'Norte', porte: 'Grande', score_global: 1.58, score_gov: 1.5, score_tec: 1.76, score_seg: 1.54, score_edu: 1.59, score_eco: 1.52 },
  { id: 'av145', periodo: 'Nov/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'seguranca', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'RJ', regiao: 'Sudeste', porte: 'Grande', score_global: 1.5, score_gov: 1.53, score_tec: 1.45, score_seg: 1.65, score_edu: 1.49, score_eco: 1.36 },
  { id: 'av146', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'desenvolve', estado: 'MS', regiao: 'Centro-Oeste', porte: 'Pequena', score_global: 1.33, score_gov: 1.33, score_tec: 1.43, score_seg: 1.25, score_edu: 1.31, score_eco: 1.33 },
  { id: 'av147', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'privado', area: 'comercio', relacaoIA: 'usa', estado: 'PA', regiao: 'Norte', porte: 'Média', score_global: 1.47, score_gov: 1.36, score_tec: 1.36, score_seg: 1.55, score_edu: 1.5, score_eco: 1.56 },
  { id: 'av148', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'gestao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'PA', regiao: 'Norte', porte: 'Média', score_global: 1.37, score_gov: 1.25, score_tec: 1.51, score_seg: 1.25, score_edu: 1.28, score_eco: 1.58 },
  { id: 'av149', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'privado', area: 'tecnologia', relacaoIA: 'desenvolve', estado: 'AP', regiao: 'Norte', porte: 'Média', score_global: 1.58, score_gov: 1.51, score_tec: 1.59, score_seg: 1.69, score_edu: 1.58, score_eco: 1.54 },
  { id: 'av150', periodo: 'Ago/2025', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'desenvolve', estado: 'PI', regiao: 'Nordeste', porte: 'Média', score_global: 1.19, score_gov: 1.28, score_tec: 1.16, score_seg: 1, score_edu: 1.17, score_eco: 1.36 },
  { id: 'av151', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'MG', regiao: 'Sudeste', porte: 'Grande', score_global: 1.57, score_gov: 1.48, score_tec: 1.52, score_seg: 1.59, score_edu: 1.53, score_eco: 1.74 },
  { id: 'av152', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'saude', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'PR', regiao: 'Sul', porte: 'Pequena', score_global: 1.03, score_gov: 0.93, score_tec: 1.1, score_seg: 1.18, score_edu: 0.97, score_eco: 0.96 },
  { id: 'av153', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'nao_usa', estado: 'RN', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.45, score_gov: 1.4, score_tec: 1.44, score_seg: 1.49, score_edu: 1.34, score_eco: 1.59 },
  { id: 'av154', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'educacao', poder: 'executivo', relacaoIA: 'usa', estado: 'RJ', regiao: 'Sudeste', porte: 'Grande', score_global: 1.39, score_gov: 1.32, score_tec: 1.54, score_seg: 1.42, score_edu: 1.31, score_eco: 1.35 },
  { id: 'av155', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'desenvolve', estado: 'AL', regiao: 'Nordeste', porte: 'Média', score_global: 1.26, score_gov: 1.38, score_tec: 1.33, score_seg: 1.27, score_edu: 1.1, score_eco: 1.24 },
  { id: 'av156', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'causas', relacaoIA: 'nao_usa', estado: 'DF', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.29, score_gov: 1.22, score_tec: 1.25, score_seg: 1.46, score_edu: 1.17, score_eco: 1.34 },
  { id: 'av157', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'AL', regiao: 'Nordeste', porte: 'Grande', score_global: 1.78, score_gov: 1.59, score_tec: 1.96, score_seg: 1.89, score_edu: 1.66, score_eco: 1.78 },
  { id: 'av158', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'educacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'RS', regiao: 'Sul', porte: 'Grande', score_global: 1.42, score_gov: 1.31, score_tec: 1.34, score_seg: 1.47, score_edu: 1.41, score_eco: 1.55 },
  { id: 'av159', periodo: 'Jul/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'estatal', atividadeEstatal: 'industria', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'BA', regiao: 'Nordeste', porte: 'Grande', score_global: 1.4, score_gov: 1.51, score_tec: 1.34, score_seg: 1.31, score_edu: 1.45, score_eco: 1.38 },
  { id: 'av160', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'nao_usa', estado: 'BA', regiao: 'Nordeste', porte: 'Média', score_global: 1.72, score_gov: 1.76, score_tec: 1.8, score_seg: 1.73, score_edu: 1.76, score_eco: 1.57 },
  { id: 'av161', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'SP', regiao: 'Sudeste', porte: 'Média', score_global: 1.59, score_gov: 1.52, score_tec: 1.6, score_seg: 1.77, score_edu: 1.48, score_eco: 1.59 },
  { id: 'av162', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'classe', relacaoIA: 'nao_usa', estado: 'PE', regiao: 'Nordeste', porte: 'Média', score_global: 1.22, score_gov: 1.08, score_tec: 1.21, score_seg: 1.32, score_edu: 1.38, score_eco: 1.11 },
  { id: 'av163', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'educacao', relacaoIA: 'nao_usa', estado: 'PE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.62, score_gov: 1.36, score_tec: 1.62, score_seg: 1.72, score_edu: 1.74, score_eco: 1.67 },
  { id: 'av164', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'justica', poder: 'judiciario', relacaoIA: 'nao_usa', estado: 'DF', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.34, score_gov: 1.42, score_tec: 1.53, score_seg: 1.32, score_edu: 1.14, score_eco: 1.28 },
  { id: 'av165', periodo: 'Jul/2025', taxonomiaVersao: 2, setor: 'terceiro', area: 'educacao', relacaoIA: 'desenvolve', estado: 'ES', regiao: 'Sudeste', porte: 'Média', score_global: 1, score_gov: 0.87, score_tec: 1, score_seg: 0.95, score_edu: 1.13, score_eco: 1.04 },
  { id: 'av166', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'justica', poder: 'judiciario', relacaoIA: 'usa', estado: 'MT', regiao: 'Centro-Oeste', porte: 'Média', score_global: 1.62, score_gov: 1.45, score_tec: 1.78, score_seg: 1.59, score_edu: 1.54, score_eco: 1.72 },
  { id: 'av167', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'desenvolve', estado: 'MT', regiao: 'Centro-Oeste', porte: 'Pequena', score_global: 1.09, score_gov: 1.11, score_tec: 1.03, score_seg: 1.04, score_edu: 1.11, score_eco: 1.18 },
  { id: 'av168', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'MS', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.46, score_gov: 1.45, score_tec: 1.46, score_seg: 1.46, score_edu: 1.54, score_eco: 1.39 },
  { id: 'av169', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'nao_usa', estado: 'RO', regiao: 'Norte', porte: 'Média', score_global: 1.7, score_gov: 1.79, score_tec: 1.68, score_seg: 1.79, score_edu: 1.57, score_eco: 1.69 },
  { id: 'av170', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'desenvolve', estado: 'SP', regiao: 'Sudeste', porte: 'Grande', score_global: 1.47, score_gov: 1.49, score_tec: 1.49, score_seg: 1.35, score_edu: 1.51, score_eco: 1.53 },
  { id: 'av171', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'estatal', atividadeEstatal: 'industria', poder: 'executivo', relacaoIA: 'usa', estado: 'MT', regiao: 'Centro-Oeste', porte: 'Pequena', score_global: 1.29, score_gov: 1.44, score_tec: 1.26, score_seg: 1.45, score_edu: 1.2, score_eco: 1.12 },
  { id: 'av172', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'usa', estado: 'AL', regiao: 'Nordeste', porte: 'Média', score_global: 1.32, score_gov: 1.28, score_tec: 1.33, score_seg: 1.37, score_edu: 1.25, score_eco: 1.39 },
  { id: 'av173', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'nao_usa', estado: 'CE', regiao: 'Nordeste', porte: 'Média', score_global: 1.3, score_gov: 1.15, score_tec: 1.35, score_seg: 1.19, score_edu: 1.33, score_eco: 1.49 },
  { id: 'av174', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'regulacao', poder: 'executivo', relacaoIA: 'usa', estado: 'RS', regiao: 'Sul', porte: 'Média', score_global: 1.64, score_gov: 1.67, score_tec: 1.65, score_seg: 1.74, score_edu: 1.51, score_eco: 1.63 },
  { id: 'av175', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'legislativo', poder: 'legislativo', relacaoIA: 'usa', estado: 'PI', regiao: 'Nordeste', porte: 'Pequena', score_global: 1.27, score_gov: 1.18, score_tec: 1.43, score_seg: 1.13, score_edu: 1.38, score_eco: 1.21 },
  { id: 'av176', periodo: 'Dez/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'justica', poder: 'judiciario', relacaoIA: 'desenvolve', estado: 'ES', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.05, score_gov: 1.2, score_tec: 1.05, score_seg: 1.17, score_edu: 0.91, score_eco: 0.94 },
  { id: 'av177', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'seguranca', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'CE', regiao: 'Nordeste', porte: 'Média', score_global: 1.54, score_gov: 1.57, score_tec: 1.41, score_seg: 1.68, score_edu: 1.44, score_eco: 1.58 },
  { id: 'av178', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'justica', poder: 'judiciario', relacaoIA: 'nao_usa', estado: 'MA', regiao: 'Nordeste', porte: 'Média', score_global: 1.47, score_gov: 1.66, score_tec: 1.42, score_seg: 1.45, score_edu: 1.33, score_eco: 1.51 },
  { id: 'av179', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'estatal', atividadeEstatal: 'tecnologia', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'MG', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.19, score_gov: 1.05, score_tec: 1.32, score_seg: 1.32, score_edu: 1.17, score_eco: 1.09 },
  { id: 'av180', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'privado', area: 'tecnologia', relacaoIA: 'desenvolve', estado: 'BA', regiao: 'Nordeste', porte: 'Média', score_global: 1.37, score_gov: 1.51, score_tec: 1.35, score_seg: 1.47, score_edu: 1.21, score_eco: 1.31 },
  { id: 'av181', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'MG', regiao: 'Sudeste', porte: 'Grande', score_global: 1.4, score_gov: 1.45, score_tec: 1.47, score_seg: 1.37, score_edu: 1.33, score_eco: 1.36 },
  { id: 'av182', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'causas', relacaoIA: 'nao_usa', estado: 'RO', regiao: 'Norte', porte: 'Grande', score_global: 1.51, score_gov: 1.51, score_tec: 1.47, score_seg: 1.5, score_edu: 1.55, score_eco: 1.52 },
  { id: 'av183', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'privado', area: 'saude', relacaoIA: 'nao_usa', estado: 'RO', regiao: 'Norte', porte: 'Grande', score_global: 1.36, score_gov: 1.15, score_tec: 1.43, score_seg: 1.3, score_edu: 1.51, score_eco: 1.41 },
  { id: 'av184', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'usa', estado: 'SC', regiao: 'Sul', porte: 'Média', score_global: 1.43, score_gov: 1.63, score_tec: 1.36, score_seg: 1.43, score_edu: 1.36, score_eco: 1.37 },
  { id: 'av185', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'educacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'PR', regiao: 'Sul', porte: 'Média', score_global: 1.6, score_gov: 1.57, score_tec: 1.47, score_seg: 1.55, score_edu: 1.76, score_eco: 1.63 },
  { id: 'av186', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'privado', area: 'industria', relacaoIA: 'desenvolve', estado: 'MS', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.68, score_gov: 1.89, score_tec: 1.6, score_seg: 1.82, score_edu: 1.55, score_eco: 1.52 },
  { id: 'av187', periodo: 'Jun/2026', taxonomiaVersao: 2, setor: 'outro', relacaoIA: 'nao_usa', estado: 'MA', regiao: 'Nordeste', porte: 'Média', score_global: 1.62, score_gov: 1.85, score_tec: 1.49, score_seg: 1.54, score_edu: 1.47, score_eco: 1.74 },
  { id: 'av188', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'usa', estado: 'PR', regiao: 'Sul', porte: 'Grande', score_global: 1.66, score_gov: 1.72, score_tec: 1.79, score_seg: 1.69, score_edu: 1.56, score_eco: 1.54 },
  { id: 'av189', periodo: 'Abr/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'seguranca', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'MG', regiao: 'Sudeste', porte: 'Pequena', score_global: 1.44, score_gov: 1.49, score_tec: 1.3, score_seg: 1.5, score_edu: 1.59, score_eco: 1.34 },
  { id: 'av190', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'privado', area: 'tecnologia', relacaoIA: 'desenvolve', estado: 'DF', regiao: 'Centro-Oeste', porte: 'Grande', score_global: 1.4, score_gov: 1.34, score_tec: 1.53, score_seg: 1.53, score_edu: 1.19, score_eco: 1.39 },
  { id: 'av191', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'terceiro', area: 'saude', relacaoIA: 'nao_usa', estado: 'RR', regiao: 'Norte', porte: 'Grande', score_global: 1.35, score_gov: 1.41, score_tec: 1.29, score_seg: 1.35, score_edu: 1.29, score_eco: 1.43 },
  { id: 'av192', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'publico', esfera: 'estadual', area: 'seguranca', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'RJ', regiao: 'Sudeste', porte: 'Grande', score_global: 1.56, score_gov: 1.64, score_tec: 1.39, score_seg: 1.55, score_edu: 1.53, score_eco: 1.67 },
  { id: 'av193', periodo: 'Set/2025', taxonomiaVersao: 2, setor: 'privado', area: 'financas', relacaoIA: 'usa', estado: 'RR', regiao: 'Norte', porte: 'Pequena', score_global: 1.06, score_gov: 1.08, score_tec: 1.27, score_seg: 0.95, score_edu: 1.07, score_eco: 0.92 },
  { id: 'av194', periodo: 'Mai/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'estatal', atividadeEstatal: 'educacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'AC', regiao: 'Norte', porte: 'Grande', score_global: 1.79, score_gov: 1.87, score_tec: 1.84, score_seg: 1.67, score_edu: 1.87, score_eco: 1.71 },
  { id: 'av195', periodo: 'Jan/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'gestao', poder: 'executivo', relacaoIA: 'usa', estado: 'AL', regiao: 'Nordeste', porte: 'Grande', score_global: 1.68, score_gov: 1.72, score_tec: 1.48, score_seg: 1.77, score_edu: 1.6, score_eco: 1.82 },
  { id: 'av196', periodo: 'Fev/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'municipal', area: 'saude', poder: 'executivo', relacaoIA: 'nao_usa', estado: 'RR', regiao: 'Norte', porte: 'Pequena', score_global: 1.44, score_gov: 1.59, score_tec: 1.31, score_seg: 1.46, score_edu: 1.6, score_eco: 1.24 },
  { id: 'av197', periodo: 'Out/2025', taxonomiaVersao: 2, setor: 'privado', area: 'educacao', relacaoIA: 'usa', estado: 'PA', regiao: 'Norte', porte: 'Grande', score_global: 1.25, score_gov: 1.36, score_tec: 1.15, score_seg: 1.18, score_edu: 1.45, score_eco: 1.12 },
  { id: 'av198', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'publico', esfera: 'federal', area: 'regulacao', poder: 'executivo', relacaoIA: 'desenvolve', estado: 'MG', regiao: 'Sudeste', porte: 'Grande', score_global: 1.36, score_gov: 1.34, score_tec: 1.27, score_seg: 1.48, score_edu: 1.33, score_eco: 1.38 },
  { id: 'av199', periodo: 'Mar/2026', taxonomiaVersao: 2, setor: 'privado', area: 'comercio', relacaoIA: 'usa', estado: 'SE', regiao: 'Nordeste', porte: 'Grande', score_global: 1.58, score_gov: 1.42, score_tec: 1.61, score_seg: 1.53, score_edu: 1.58, score_eco: 1.75 },
];
