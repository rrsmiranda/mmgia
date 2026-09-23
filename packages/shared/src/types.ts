/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DimensionId = 'gov' | 'tec' | 'seg' | 'edu' | 'eco';

export interface Dimension {
  id: DimensionId;
  name: string;
  shortName: string;
  description: string;
  /** Cor categórica da dimensão — sempre var(--dim-<id>), nunca hex. */
  color: string;
  /** @deprecated usa classes Tailwind arbitrárias (bg-[#...]); nas telas migradas, use DimensionBadge/DimensionTag do design system. Remover ao final da Fase 4. */
  textColor: string;
  /** @deprecated ver textColor. */
  bgColor: string;
  /** @deprecated ver textColor. */
  borderBg: string;
}

export interface Practice {
  id: string; // e.g. "1.1"
  dimensionId: DimensionId;
  name: string;
  description: string;
  criterion: string;
  evidence: string;
  level: number;
  legalReference?: string;
}

export type ScoreLevel = 'N' | 'P' | 'L' | 'F';

export interface AssessmentMetadata {
  natureza: string;
  estado: string;
  setor: string;
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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'gestor' | 'leitor';
  status: 'Ativo' | 'Inativo';
  lastLogin: string;
}

// Global Static Data
export const DIMENSIONS: Record<DimensionId, Dimension> = {
  gov: {
    id: 'gov',
    name: 'Governança e Arcabouço Regulatório',
    shortName: 'Governança',
    description: 'Desenvolver uma cultura de governança de IA clara, flexível e baseada em risco, que promova a inovação ética e responsável, assegurando a proteção da organização e da sociedade.',
    color: 'var(--dim-gov)',
    textColor: 'text-[#0C3D6E]',
    bgColor: 'bg-[#0E2A4A]',
    borderBg: 'border-[#0C3D6E]',
  },
  tec: {
    id: 'tec',
    name: 'Desenvolvimento Tecnológico, Pesquisa e Inovação',
    shortName: 'Tecnologia',
    description: 'Impulsionar a capacidade organizacional para pesquisar, desenvolver, adquirir e aplicar tecnologias de IA de ponta, visando à competitividade e à autonomia tecnológica.',
    color: 'var(--dim-tec)',
    textColor: 'text-[#1D9E75]',
    bgColor: 'bg-[#124234]',
    borderBg: 'border-[#1D9E75]',
  },
  seg: {
    id: 'seg',
    name: 'Segurança, Confiança e Proteção da Sociedade',
    shortName: 'Segurança',
    description: 'Assegurar que a IA seja utilizada de forma segura, confiável e justa, protegendo os dados, os sistemas e os direitos dos indivíduos contra danos, vieses e usos maliciosos.',
    color: 'var(--dim-seg)',
    textColor: 'text-[#E74C3C]',
    bgColor: 'bg-[#401815]',
    borderBg: 'border-[#E74C3C]',
  },
  edu: {
    id: 'edu',
    name: 'Educação, Capacitação e Cultura Organizacional',
    shortName: 'Educação',
    description: 'Preparar a força de trabalho e a cultura da organização para as transformações impulsionadas pela IA, promovendo o letramento digital, a ética, a colaboração humano-máquina e a retenção de talentos.',
    color: 'var(--dim-edu)',
    textColor: 'text-[#8E44AD]',
    bgColor: 'bg-[#2E183B]',
    borderBg: 'border-[#8E44AD]',
  },
  eco: {
    id: 'eco',
    name: 'Cooperação e Inserção no Ecossistema',
    shortName: 'Ecossistema',
    description: 'Posicionar a organização como um ator relevante e influente no ecossistema de IA, por meio da colaboração com outras entidades para impulsionar a inovação, definir padrões e influenciar o mercado.',
    color: 'var(--dim-eco)',
    textColor: 'text-[#E67E22]',
    bgColor: 'bg-[#422612]',
    borderBg: 'border-[#E67E22]',
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
    evidence: 'Apresentações de resultados de PoCs; e-mails trocados sobre os experimentos; código-fonte em repositórios individuais.',
    level: 1,
  },
  {
    id: '2.2',
    dimensionId: 'tec',
    name: 'Gestão de Projetos de IA',
    description: 'Práticas básicas de gerenciamento de projetos (escopo, cronograma, custos) são aplicadas às iniciativas de IA. Os projetos são rastreados individualmente, mas ainda não há uma visão integrada de portfólio.',
    criterion: 'Os projetos de IA possuem planos básicos que definem o escopo, as fases, as entregas, o cronograma e os custos.',
    evidence: 'Plano de projeto, cronograma e documento de escopo para um projeto específico de IA.',
    level: 2,
  },
  {
    id: '2.3',
    dimensionId: 'tec',
    name: 'Definição do Ciclo de Vida do Modelo',
    description: 'Um ciclo de vida básico para o desenvolvimento de modelos de machine learning é esboçado e aplicado nos projetos, cobrindo, no mínimo, as fases de coleta de dados, treinamento e teste.',
    criterion: 'O ciclo de vida de desenvolvimento de modelos de machine learning está documentado e inclui a coleta de dados, o treinamento e o teste.',
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
    evidence: 'Documentação da arquitetura da plataforma de MLOps; guias de uso e processos de CI/CD para modelos de IA.',
    level: 3,
  },
  {
    id: '2.5',
    dimensionId: 'tec',
    name: 'Gestão de Portfólio de IA',
    description: 'Um processo formal é estabelecido para propor, avaliar, priorizar e gerenciar o portfólio de iniciativas de IA, com base em critérios estratégicos, de viabilidade e de risco.',
    criterion: 'Há um processo documentado de gestão de portfólio e um registro centralizado para propor, avaliar e priorizar iniciativas de IA.',
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
    evidence: 'Relatórios de análise de ROI; dashboards com métricas de desempenho dos modelos em produção.',
    level: 4,
  },
  {
    id: '2.7',
    dimensionId: 'tec',
    name: 'Gestão de Infraestrutura de IA',
    description: 'A capacidade, o desempenho e os custos da infraestrutura de dados e computação para IA são gerenciados de forma quantitativa. A demanda é prevista e a capacidade é ajustada para atender aos níveis de serviço.',
    criterion: 'Existem modelos preditivos de capacidade/custos, e o desempenho da infraestrutura computacional para IA é monitorado em relação às metas.',
    evidence: 'Relatórios de gestão de capacidade; análise de custos de infraestrutura por projeto de IA.',
    level: 4,
  },
  {
    id: '2.8',
    dimensionId: 'tec',
    name: 'Otimização do Portfólio de Inovação',
    description: 'A organização utiliza modelos preditivos e análise de cenários para otimizar continuamente o balanceamento de seu portfólio de P&D em IA, alocando recursos de forma a maximizar o valor estratégico e a inovação.',
    criterion: 'A organização utiliza técnicas quantitativas, simulações e análise de cenários para otimizar a tomada de decisão no portfólio de P&D.',
    evidence: 'Simulações de portfólio; análises de sensibilidade e cenários para decisões de investimento em P&D.',
    level: 5,
  },
  {
    id: '2.9',
    dimensionId: 'tec',
    name: 'Pesquisa Aplicada e Colaboração',
    description: 'A organização conduz pesquisa aplicada em IA, publica resultados em conferências e periódicos relevantes e colabora ativamente com a academia e com centros de pesquisa para desenvolver conhecimento de ponta e gerar propriedade intelectual.',
    criterion: 'A organização possui histórico ativo de pesquisa aplicada, de geração de propriedade intelectual, de publicações e de patentes em IA.',
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
    evidence: 'Política de Desenvolvimento Seguro atualizada; checklist de segurança para projetos de IA.',
    level: 3,
  },
  {
    id: '3.6',
    dimensionId: 'seg',
    name: 'Testes de Robustez e Ataques Adversariais',
    description: 'A organização executa testes quantitativos para medir a resiliência dos modelos a ataques adversários, envenenamento de dados e outras formas de manipulação. Métricas de robustez são definidas e monitoradas.',
    criterion: 'A organização executa e monitora testes quantitativos (com ferramentas adequadas) para medir a resiliência dos modelos contra ataques adversários e envenenamento.',
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
    evidence: 'Painéis de monitoramento de modelos em produção, com métricas de equidade; registros de alertas de desequilíbrio de equidade.',
    level: 4,
  },
  {
    id: '3.8',
    dimensionId: 'seg',
    name: 'Red Teaming para IA',
    description: 'A organização conduz exercícios de ataque simulado (Red Teaming), em que uma equipe independente tenta ativamente contornar, enganar ou quebrar os sistemas de IA em produção, a fim de identificar vulnerabilidades complexas e não previstas.',
    criterion: 'Exercícios de Red Teaming independentes para sistemas de IA são planejados, executados e utilizados periodicamente para aprimorar as defesas.',
    evidence: 'Relatório de Red Teaming para um sistema de IA, com as vulnerabilidades identificadas e as respectivas recomendações.',
    level: 5,
  },
  {
    id: '3.9',
    dimensionId: 'seg',
    name: 'Mecanismos de Contestabilidade e Remediação',
    description: 'A organização otimiza continuamente os canais para que os indivíduos afetados por decisões algorítmicas possam contestá-las, obter uma explicação significativa e, quando apropriado, buscar reparação. O feedback é usado para melhorar os modelos.',
    criterion: 'Os canais de contestação para decisões algorítmicas são claros e o feedback recebido é analisado sistematicamente para a melhoria contínua dos modelos.',
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
    evidence: 'Documento do Plano de Capacitação; cronograma de treinamentos.',
    level: 2,
  },
  {
    id: '4.3',
    dimensionId: 'edu',
    name: 'Comunicação Interna sobre IA',
    description: 'Ações de comunicação interna são realizadas para informar os colaboradores sobre os projetos de IA em andamento, seus objetivos e benefícios esperados, visando reduzir a incerteza e a resistência.',
    criterion: 'A organização emite comunicados internos periódicos para informar os colaboradores sobre os objetivos e os benefícios dos projetos de IA em andamento.',
    evidence: 'E-mails, posts na intranet ou newsletters internas sobre projetos de IA.',
    level: 2,
  },
  {
    id: '4.4',
    dimensionId: 'edu',
    name: 'Programa de Letramento em Dados e IA',
    description: 'Um programa de capacitação estruturado e contínuo é implementado em toda a organização, com trilhas de aprendizagem definidas por função (executivos, gestores, técnicos e usuários de negócio), abrangendo temas como ética, riscos e oportunidades da IA.',
    criterion: 'O programa de capacitação em IA está estruturado e documentado com trilhas de aprendizagem contínuas definidas por função (técnicos, negócio, executivos).',
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
    evidence: 'Plano de Gestão da Mudança para um projeto de IA; pesquisas sobre o clima e a prontidão para a mudança.',
    level: 3,
  },
  {
    id: '4.6',
    dimensionId: 'edu',
    name: 'Métricas de Competências em IA',
    description: 'A organização mapeia e mede quantitativamente as competências em IA na força de trabalho, por meio de avaliações e certificações. A lacuna de competências (skills gap) é medida e monitorada.',
    criterion: 'Existem um inventário (Skill Matrix) e um monitoramento quantitativo das lacunas de competências (skills gap) da força de trabalho em relação às metas.',
    evidence: 'Matriz de competências (Skill Matrix) com níveis de proficiência; relatórios de progresso da capacitação em relação às metas.',
    level: 4,
  },
  {
    id: '4.7',
    dimensionId: 'edu',
    name: 'Planejamento da Força de Trabalho',
    description: 'A organização utiliza análise de dados para prever o impacto da IA nos cargos e funções, planejando proativamente as necessidades futuras de contratação, automação e requalificação.',
    criterion: 'Existem análises e relatórios baseados em dados que preveem o impacto da IA nas funções e propõem planos proativos de transição ou de requalificação.',
    evidence: 'Relatório de Análise de Impacto da IA no Trabalho; planos de carreira e de mobilidade interna para as funções impactadas.',
    level: 4,
  },
  {
    id: '4.8',
    dimensionId: 'edu',
    name: 'Cultura de Aprendizagem Contínua',
    description: 'A organização institucionaliza uma cultura que incentiva a experimentação, o compartilhamento de conhecimento e o aprendizado contínuo em IA. Erros são vistos como oportunidades de aprendizado e a inovação é recompensada.',
    criterion: 'A avaliação de desempenho organizacional e os programas de reconhecimento formal incluem critérios relacionados à inovação e ao aprendizado em IA.',
    evidence: 'Descrição do programa de avaliação de desempenho; exemplos de reconhecimento a iniciativas inovadoras em IA.',
    level: 5,
  },
  {
    id: '4.9',
    dimensionId: 'edu',
    name: 'Atração e Retenção de Talentos de IA',
    description: 'A organização otimiza continuamente sua marca empregadora (employer branding) e suas estratégias de recrutamento, desenvolvimento e retenção para se tornar um polo de atração e desenvolvimento de talentos em IA.',
    criterion: 'A organização utiliza análise de dados de RH (como a taxa de turnover e o tempo de contratação) para otimizar continuamente suas estratégias de atração e retenção de talentos em IA.',
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
    evidence: 'Apresentações internas que citam concorrentes ou tendências de IA.',
    level: 1,
  },
  {
    id: '5.2',
    dimensionId: 'eco',
    name: 'Participação em Eventos do Setor',
    description: 'Colaboradores da organização participam de conferências, seminários e workshops sobre IA para se manterem atualizados e fazer networking. A participação é gerenciada em nível departamental.',
    criterion: 'Há registros departamentais de inscrição e de participação dos colaboradores em conferências, seminários e workshops sobre IA.',
    evidence: 'Inscrições em eventos; relatórios de despesas de viagem para conferências de IA.',
    level: 2,
  },
  {
    id: '5.3',
    dimensionId: 'eco',
    name: 'Relacionamento com Fornecedores',
    description: 'A organização estabelece um processo básico para gerenciar o relacionamento com seus principais fornecedores de tecnologia de IA, incluindo a avaliação de novos fornecedores e o acompanhamento dos contratos.',
    criterion: 'Há uma lista de fornecedores de IA aprovados e um processo básico definido para gerenciar relacionamentos, aquisições e o acompanhamento de contratos.',
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
    evidence: 'Comprovante de filiação a associações; atas de reuniões de grupos de trabalho com a presença de representantes da organização.',
    level: 3,
  },
  {
    id: '5.6',
    dimensionId: 'eco',
    name: 'Projetos de Cooperação com Métricas de Sucesso',
    description: 'Os projetos colaborativos com parceiros são executados com métricas claras de sucesso, monitoradas quantitativamente. O valor gerado pelas parcerias (financeiras, tecnológicas etc.) é mensurado.',
    criterion: 'As parcerias estratégicas possuem indicadores de desempenho (KPIs) definidos, medidos quantitativamente e reportados.',
    evidence: 'Relatórios de acompanhamento de parcerias com análise de KPIs.',
    level: 4,
  },
  {
    id: '5.7',
    dimensionId: 'eco',
    name: 'Benchmarking de Capacidades de IA',
    description: 'A organização realiza um processo de benchmarking para comparar quantitativamente seu desempenho, seus custos e sua maturidade em IA com os de organizações pares ou líderes de mercado.',
    criterion: 'Existem processos e relatórios formais de benchmarking para comparar custos, desempenho e maturidade em IA com organizações pares ou líderes do mercado.',
    evidence: 'Relatório de benchmarking; análise de lacunas (gap analysis) com base nos resultados.',
    level: 4,
  },
  {
    id: '5.8',
    dimensionId: 'eco',
    name: 'Liderança de Iniciativas no Ecossistema',
    description: 'A organização assume um papel de liderança na criação de consórcios, no desenvolvimento de padrões abertos ou na construção de plataformas setoriais de IA, buscando gerar vantagens competitivas para todo o ecossistema.',
    criterion: 'A organização demonstra liderança na criação de consórcios de grande impacto, de plataformas setoriais de IA ou de padrões abertos.',
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
    evidence: 'Registros de participação em audiências públicas; convites para reuniões com agências governamentais.',
    level: 5,
    legalReference: 'ENIA Pilar 3'
  },
];

// Seed Fake News (Screen 10 & 14)
export const SEED_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'ANPD publica novas diretrizes de segurança de dados em modelos fundacionais',
    excerpt: 'A Autoridade Nacional de Proteção de Dados publicou as orientações prioritárias referentes ao uso do legítimo interesse na coleta automatizada para o treino de LLMs.',
    category: 'regulação',
    source: 'ANPD Oficial',
    date: '08 de Junho de 2026',
    featured: true,
  },
  {
    id: 'n2',
    title: 'Comissão aprova emenda crucial sobre impacto de IA generativa no PL 2338',
    excerpt: 'A comissão especial que regula a inteligência artificial no Senado aprovou alteração de texto isentando microempresas de auditorias redundantes no nível 1.',
    category: 'regulação',
    source: 'Senado Federal',
    date: '05 de Junho de 2026',
  },
  {
    id: 'n3',
    title: 'Modelo de Governança de IA Brasileiro vence prêmio internacional de inovação',
    excerpt: 'Plataforma MMGIA foi coroada pelo comitê regional de ética como um modelo exemplar de conscientização e transparência cidadã algorítmica.',
    category: 'governança',
    source: 'IberoAI Organização',
    date: '02 de Junho de 2026',
  },
  {
    id: 'n4',
    title: 'Nova biblioteca de MLOps de código aberto otimiza inferência em servidores legados',
    excerpt: 'Consórcio de universidades lançou um pacote alternativo que reduz em 35% o consumo de energia no recalibramento de previsões estruturadas.',
    category: 'tecnologia',
    source: 'GitHub Community',
    date: '30 de Maio de 2026',
  },
  {
    id: 'n5',
    title: 'Corporações aumentam investimento em Red Teaming no primeiro trimestre',
    excerpt: 'Mapeamento de tendências de cibersegurança aponta alta de 42% na demanda por hackers éticos especialistas em quebrar barreiras de sistemas inteligentes empresariais.',
    category: 'mercado',
    source: 'CyberSecurity Outlook',
    date: '28 de Maio de 2026',
  }
];

// Seed Admin Users (Screen 13)
export const SEED_ADMIN_USERS: AdminUser[] = [
  {
    id: 'u1',
    name: 'Júlia Costa',
    email: 'julia.costa@instituto.gov.br',
    role: 'super_admin',
    status: 'Ativo',
    lastLogin: '08/06/2026 10:14',
  },
  {
    id: 'u2',
    name: 'Rafael Miranda',
    email: 'rafaelmirandanpd@gmail.com',
    role: 'gestor',
    status: 'Ativo',
    lastLogin: '07/06/2026 18:42',
  },
  {
    id: 'u3',
    name: 'Mateus Azevedo',
    email: 'mateus.azevedo@advocacia.com',
    role: 'leitor',
    status: 'Ativo',
    lastLogin: '05/06/2026 09:30',
  },
  {
    id: 'u4',
    name: 'Patrícia Rocha',
    email: 'patricia.r@inteligencia.com',
    role: 'gestor',
    status: 'Inativo',
    lastLogin: '12/05/2026 15:10',
  }
];

// Seed Historical Scores (Screen 6 for Panel)
export interface HistoricalRecord {
  id: string;
  periodo: string;
  natureza: string;
  estado: string;
  setor: string;
  porte: string;
  score_global: number;
  score_gov: number;
  score_tec: number;
  score_seg: number;
  score_edu: number;
  score_eco: number;
}

export const SEED_HISTORICAL_RECORDS: HistoricalRecord[] = [
  { id: 'av1', periodo: 'Jun/2026', natureza: 'Pública federal', estado: 'DF', setor: 'Gov. federal', porte: 'Grande', score_global: 2.12, score_gov: 2.33, score_tec: 1.88, score_seg: 2.44, score_edu: 2.11, score_eco: 1.95 },
  { id: 'av2', periodo: 'Jun/2026', natureza: 'Privada', estado: 'SP', setor: 'Financeiro', porte: 'Grande', score_global: 1.89, score_gov: 2.05, score_tec: 1.77, score_seg: 2.10, score_edu: 1.66, score_eco: 1.88 },
  { id: 'av3', periodo: 'Mai/2026', natureza: 'Academia', estado: 'RJ', setor: 'Educação', porte: 'Grande', score_global: 1.54, score_gov: 1.20, score_tec: 2.05, score_seg: 1.10, score_edu: 2.10, score_eco: 1.25 },
  { id: 'av4', periodo: 'Mai/2026', natureza: 'Pública estadual', estado: 'MG', setor: 'Saúde', porte: 'Média', score_global: 1.34, score_gov: 1.45, score_tec: 1.22, score_seg: 1.55, score_edu: 1.10, score_eco: 1.40 },
  { id: 'av5', periodo: 'Abr/2026', natureza: 'Pública municipal', estado: 'RS', setor: 'Gov. municipal', porte: 'Pequena', score_global: 0.98, score_gov: 1.10, score_tec: 0.88, score_seg: 0.90, score_edu: 1.20, score_eco: 0.80 },
  { id: 'av6', periodo: 'Abr/2026', natureza: 'Terceiro setor', estado: 'BA', setor: 'Outro', porte: 'Micro', score_global: 0.72, score_gov: 0.80, score_tec: 0.66, score_seg: 0.70, score_edu: 0.88, score_eco: 0.55 },
  { id: 'av7', periodo: 'Mar/2026', natureza: 'Privada', estado: 'SC', setor: 'Tecnologia', porte: 'Pequena', score_global: 1.62, score_gov: 1.44, score_tec: 1.88, score_seg: 1.50, score_edu: 1.40, score_eco: 1.88 },
  { id: 'av8', periodo: 'Mar/2026', natureza: 'Pública estadual', estado: 'AM', setor: 'Saúde', porte: 'Grande', score_global: 1.11, score_gov: 1.20, score_tec: 1.05, score_seg: 1.30, score_edu: 0.90, score_eco: 1.10 },
];
