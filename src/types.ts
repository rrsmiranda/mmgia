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
  color: string;
  textColor: string;
  bgColor: string;
  borderBg: string;
}

export interface Practice {
  id: string; // e.g. "1.1"
  dimensionId: DimensionId;
  name: string;
  description: string;
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

export interface AssessmentState {
  code: string;
  metadata: AssessmentMetadata;
  answers: Record<string, ScoreLevel>; // practiceId -> ScoreLevel
  completed: boolean;
  createdAt: string;
  lastUpdatedAt: string;
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

export interface LegalCorrelation {
  practiceId: string;
  norm: string;
  article: string;
  description: string;
}

// Global Static Data
export const DIMENSIONS: Record<DimensionId, Dimension> = {
  gov: {
    id: 'gov',
    name: 'Governança e Inteligência',
    shortName: 'Governança',
    description: 'Diretrizes éticas, comitês, inventários e responsabilização legal sobre algoritmos.',
    color: '#0C3D6E',
    textColor: 'text-[#0C3D6E]',
    bgColor: 'bg-[#0E2A4A]',
    borderBg: 'border-[#0C3D6E]',
  },
  tec: {
    id: 'tec',
    name: 'Aspectos Tecnológicos',
    shortName: 'Tecnologia',
    description: 'Proveniência de dados, versionamento, MLOps, APIs e qualidade técnica de infraestrutura.',
    color: '#1D9E75',
    textColor: 'text-[#1D9E75]',
    bgColor: 'bg-[#124234]',
    borderBg: 'border-[#1D9E75]',
  },
  seg: {
    id: 'seg',
    name: 'Segurança e Privacidade',
    shortName: 'Segurança',
    description: 'Conformidade com a LGPD, testes de Red Teaming, criptografia e resposta a incidentes algorítmicos.',
    color: '#E74C3C',
    textColor: 'text-[#E74C3C]',
    bgColor: 'bg-[#401815]',
    borderBg: 'border-[#E74C3C]',
  },
  edu: {
    id: 'edu',
    name: 'Educação e Capacitação',
    shortName: 'Educação',
    description: 'Letramento em IA, treinamentos éticos, certificações, hackathons e reciclagem de colaboradores.',
    color: '#8E44AD',
    textColor: 'text-[#8E44AD]',
    bgColor: 'bg-[#2E183B]',
    borderBg: 'border-[#8E44AD]',
  },
  eco: {
    id: 'eco',
    name: 'Ecossistema e Parcerias',
    shortName: 'Ecossistema',
    description: 'Sandbox regulatório, modelos de código aberto, integração com universidades e compras tecnológicas.',
    color: '#E67E22',
    textColor: 'text-[#E67E22]',
    bgColor: 'bg-[#422612]',
    borderBg: 'border-[#E67E22]',
  },
};

export const LIST_PRACTICES: Practice[] = [
  // GOVERNANÇA (gov)
  {
    id: '1.1',
    dimensionId: 'gov',
    name: 'Política Institucional de IA',
    description: 'Declaração formal que estabelece diretrizes éticas, valores e propósitos institucionais ao projetar, adquirir ou operar sistemas de IA.',
    evidence: 'Documento assinado pela alta liderança contendo guia ético de uso, em conformidade com as orientações federais e da OCDE.',
    level: 1,
    legalReference: 'ISO/IEC 42001 Cl. 5.2'
  },
  {
    id: '1.2',
    dimensionId: 'gov',
    name: 'Comitê Multidisciplinar de Governança',
    description: 'Estrutura de tomada de decisão com representantes jurídicos, de tecnologia, áreas de negócio e ética para fiscalizar os sistemas baseados em inteligência artificial.',
    evidence: 'Portaria de criação de comitê com reuniões trimestrais pautadas e relatórios de recomendação emitidos.',
    level: 2,
    legalReference: 'ENIA Meta 4.1'
  },
  {
    id: '1.3',
    dimensionId: 'gov',
    name: 'Inventário Geral de Sistemas de IA',
    description: 'Registro centralizado de todos os projetos, modelos, ferramentas comerciais e sistemas de código aberto que usam IA ou aprendizado de máquina.',
    evidence: 'Catálogo eletrônico ativo identificando proprietário, impacto estimado, finalidade e tecnologias utilizadas em cada fluxo.',
    level: 2,
    legalReference: 'AI Act Art. 60'
  },
  {
    id: '1.4',
    dimensionId: 'gov',
    name: 'Relatório de Impacto Algorítmico (AIA)',
    description: 'Procedimento formal para avaliar os riscos de viés, opacidade, discriminação e impacto aos direitos dos usuários.',
    evidence: 'Laudo de impacto gerado com indicação de medidas de salvaguarda, mitigação e revisão manual de resultados críticos.',
    level: 3,
    legalReference: 'LGPD Art. 20'
  },
  {
    id: '1.5',
    dimensionId: 'gov',
    name: 'Atribuição de Responsabilidades em Ciclo de Vida',
    description: 'Linhas de reporte claras para cada etapa (concepção, homologação, deploy, monitoramento contínuo e descontinuação do sistema).',
    evidence: 'Matriz RACI mapeando cientistas de dados, encarregados de privacidade (DPO) e gestores de serviço envolvidos.',
    level: 3,
    legalReference: 'PL 2338/2023 Art. 8'
  },
  {
    id: '1.6',
    dimensionId: 'gov',
    name: 'Controle de Sistemas de Terceiros',
    description: 'Avaliação de integridade e termos de conformidade ética e técnica exigidos de provedores, parceiros e fornecedores de APIs de IA.',
    evidence: 'Anexos contratuais garantindo respeito aos Direitos Humanos, blindagem de dados e repasse de responsabilidade civil.',
    level: 4,
    legalReference: 'LGPD Art. 39'
  },
  {
    id: '1.7',
    dimensionId: 'gov',
    name: 'Análise Sistêmica de Justiça e Equidade',
    description: 'Homologação ética visando detectar e debelar vieses históricos nas amostras que prejudiquem minorias ou grupos vulneráveis.',
    evidence: 'Relatório estatístico de disparidade demográfica ajustado e histórico de reformulação de bases de teste.',
    level: 4,
    legalReference: 'Constituição Federal Art. 3'
  },
  {
    id: '1.8',
    dimensionId: 'gov',
    name: 'Política de Explicabilidade e Transparência',
    description: 'Existência de ferramentas para explicar a tomada de decisão automatizada ao cidadão de forma clara e acessível.',
    evidence: 'Painel público ou central do usuário mostrando os critérios essenciais que motivaram a concessão, recusa ou pontuação.',
    level: 5,
    legalReference: 'LGPD Art. 20 §1º'
  },
  {
    id: '1.9',
    dimensionId: 'gov',
    name: 'Auditoria Externa no Ciclo de Vida',
    description: 'Auditoria independente periódica efetuada por terceiros homologados sobre os parâmetros e os retornos sociais obtidos pelas IAs administradas.',
    evidence: 'Parecer técnico anual assinado por auditoria certificada, com plano de ação corretivo implementado pela organização.',
    level: 5,
    legalReference: 'ISO/IEC 42001 Cl. 9'
  },

  // ASPECTOS TECNOLÓGICOS (tec)
  {
    id: '2.1',
    dimensionId: 'tec',
    name: 'Linhagem e Proveniência de Dados',
    description: 'Rastreabilidade do pipeline dos dados de treino, registrando de onde vieram, transformações e como foram carregados.',
    evidence: 'Logs automatizados do banco de dados e diagramas de fluxo de extração, transformação e carregamento (ETL).',
    level: 1,
    legalReference: 'LGPD Art. 37'
  },
  {
    id: '2.2',
    dimensionId: 'tec',
    name: 'Qualidade e Higienização de Bases',
    description: 'Rotinas coordenadas para eliminar ruídos, balancear classes desproporcionais e tratar dados nulos ou corrompidos de modelagem.',
    evidence: 'Scripts de validação preventiva de integridade disparados antes de cada novo processo de re-treinamento.',
    level: 2,
    legalReference: 'Marco Legal da CTI'
  },
  {
    id: '2.3',
    dimensionId: 'tec',
    name: 'Ambiente Computacional Padronizado',
    description: 'Plataforma homologada em nuvem ou cluster local que garanta reprodutibilidade das máquinas virtuais e processamento eficaz do treino.',
    evidence: 'Documentação técnica de infraestrutura descrevendo limites de CPU, GPU, quotas e uso de containers para virtualização.',
    level: 2,
    legalReference: 'ABNT NBR ISO 22301'
  },
  {
    id: '2.4',
    dimensionId: 'tec',
    name: 'Gerenciamento e Controle de Versões',
    description: 'Armazenamento seguro não só do código-fonte (Git), mas também do dataset específico, chaves de hyperparâmetros e pesos resultantes.',
    evidence: 'Repositórios integrados via ferramentas como MLflow, DVC ou equivalentes corporativos.',
    level: 3,
    legalReference: 'ISO/IEC 19770'
  },
  {
    id: '2.5',
    dimensionId: 'tec',
    name: 'Serviço de Monitoramento de Desempenho (Drift)',
    description: 'Mapeamento constante para perceber quando o modelo perde precisão por mudança no perfil real do mundo (data/concept drift).',
    evidence: 'Painel com alarmes de decréscimo de acurácia, F1-score ou discrepância na distribuição das entradas reais.',
    level: 3,
    legalReference: 'NIST AI RMF 1.0'
  },
  {
    id: '2.6',
    dimensionId: 'tec',
    name: 'Abstração Modular de APIs e Microsserviços',
    description: 'Padrão de acoplamento fraco de modo que os modelos rodem isolados e conversem com sistemas legados apenas por requisições HTTP seguras.',
    evidence: 'API Gateway implementado com limitações de taxa (rate limiting), autenticação de chamadas e documentação no padrão OpenAPI.',
    level: 4,
    legalReference: 'Decreto Federal 10.332'
  },
  {
    id: '2.7',
    dimensionId: 'tec',
    name: 'Automação MLOps Contínua',
    description: 'Processo avançado de CI/CD para automatizar testes unitários, testes de carga, calibração contra vieses e entrega veloz do microsserviço.',
    evidence: 'Pipelines ativos no GitHub Actions ou Jenkins que realizam build automático perante novos pushes nas branches principais.',
    level: 4,
    legalReference: 'ISO 42001 Cl. 8'
  },
  {
    id: '2.8',
    dimensionId: 'tec',
    name: 'Consonância com Padrões de Interoperabilidade',
    description: 'Garantia de que barramentos de dados usem formatos agnósticos para fácil tráfego de dados e integrações com outras esferas federativas.',
    evidence: 'Arquivos em JSON/ePING com documentação de APIs integradas ao barramento gov.br ou central corporativa do setor.',
    level: 5,
    legalReference: 'Decreto e-PING 2024'
  },
  {
    id: '2.9',
    dimensionId: 'tec',
    name: 'Arquiteturas Tecnológicas de Código Aberto',
    description: 'Políticas para o uso inteligente e colaborativo de modelos de linguagem e bibliotecas open-source nacionais e internacionais.',
    evidence: 'Repositório institucional livre espelhando inovações, pesos públicos ajustados e submissão aos ecossistemas comuns.',
    level: 5,
    legalReference: 'Decreto Federal 11.531'
  },

  // SEGURANÇA E PRIVACIDADE (seg)
  {
    id: '3.1',
    dimensionId: 'seg',
    name: 'Conformidade de Consentimento e Bases Legais',
    description: 'Justificativa jurídica de conformidade ao treinar algoritmos com dados pessoais identificáveis.',
    evidence: 'Mapeamento da base legal legítima (legítimo interesse, consentimento, execução de política pública) formalizada pelo Jurídico/DPO.',
    level: 1,
    legalReference: 'LGPD Art. 7º e 23'
  },
  {
    id: '3.2',
    dimensionId: 'seg',
    name: 'Segurança contra Ataques de Injeção de Prompt',
    description: 'Implementação de filtros de entrada e blindagem para impedir que usuários quebrem salvaguardas éticas do modelo.',
    evidence: 'Mecanismos de sanitização de inputs, uso de guardrails de IA e testes periódicos documentados.',
    level: 2,
    legalReference: 'ISO/IEC 27001 Cl. A.8.12'
  },
  {
    id: '3.3',
    dimensionId: 'seg',
    name: 'Criptografia em Repouso e Trânsito',
    description: 'Chaves SSH e tokens de acesso fortemente protegidos. Dados criptografados no trânsito (SSL/TLS) e nos servidores físicos/storages.',
    evidence: 'Políticas de criptografia implementadas em todos os buckets de dados e conexões de rede dedicadas.',
    level: 2,
    legalReference: 'LGPD Art. 46'
  },
  {
    id: '3.4',
    dimensionId: 'seg',
    name: 'Mecanismos de Anonimização Avançada',
    description: 'Implementação de técnicas matemáticas para impedir a re-identificação indireta de titulares de dados nas bases de dados operadas pela IA.',
    evidence: 'Processos de k-anonimização, l-diversidade ou Privacidade Diferencial validados pela equipe de segurança.',
    level: 3,
    legalReference: 'LGPD Art. 12'
  },
  {
    id: '3.5',
    dimensionId: 'seg',
    name: 'Plano de Resposta a Incidentes de IA',
    description: 'Protocolo de contenção caso uma decisão computacional errônea ou vazada gere crises operacionais ou danos reputacionais graves.',
    evidence: 'Procedimento operacional de emergência com passos para desconexão segura e desativação célere de modelos vulneráveis.',
    level: 3,
    legalReference: 'LGPD Art. 48'
  },
  {
    id: '3.6',
    dimensionId: 'seg',
    name: 'Fomento aos Exercícios de Red Teaming',
    description: 'Testes de invasão voltados para ludibriar e estressar o algoritmo à procura de alucinações severas, saídas ofensivas ou franquezas técnicas.',
    evidence: 'Relatório consolidado de red-teaming contendo os cenários de ataque simulados e as correções incorporadas de prontidão.',
    level: 4,
    legalReference: 'NIST AI RMF 3.4'
  },
  {
    id: '3.7',
    dimensionId: 'seg',
    name: 'Controle de Acesso Fino (RBAC) e IAM',
    description: 'Concessão estrita de permissões de acesso às chaves de API, banco de dados de treinamento e modificações em checkpoints do modelo.',
    evidence: 'Identidades integradas com autenticação por MFA (Múltiplo Fator) e privilégios mínimos mapeados na nuvem.',
    level: 4,
    legalReference: 'ISO/IEC 27001 Cl. A.9.1'
  },
  {
    id: '3.8',
    dimensionId: 'seg',
    name: 'Registro Imutável de Trilha de Auditoria',
    description: 'Armazenamento de logs que guardam quem, quando e qual prompt executou determinada inferência automatizada para possibilitar apuração legal.',
    evidence: 'Histórico de log consolidado em bucket estéril (WORM) ou centralizado que impede alteração mesmo por administradores locais.',
    level: 5,
    legalReference: 'MCTI Estratégia Digital'
  },
  {
    id: '3.9',
    dimensionId: 'seg',
    name: 'Certificação de Cibersegurança Alinhada',
    description: 'Comprovação por auditorias de segurança de que todo o ciclo de desenvolvimento segue as melhores práticas vigentes mundiais.',
    evidence: 'Apresentação de certificado ativo em famílias de frameworks vigentes como ISO 27001, SOC 2 Type II ou similar governamental.',
    level: 5,
    legalReference: 'Portaria SGD/MGI'
  },

  // EDUCAÇÃO E CAPACITAÇÃO (edu)
  {
    id: '4.1',
    dimensionId: 'edu',
    name: 'Letramento Algorítmico Amplo',
    description: 'Disponibilidade de cursos online básicos sobre o que é IA, inteligência generativa e os perigos fundamentais para toda a força de trabalho.',
    evidence: 'Lista de presença ou relatórios de conclusão de treinamento básico com participação acima de 40% da equipe ativa.',
    level: 1,
    legalReference: 'ENIA Diretriz 3'
  },
  {
    id: '4.2',
    dimensionId: 'edu',
    name: 'Capacitação Ativa em Viés e Ética algorítmica',
    description: 'Workshops e imersões presenciais ou gravados focados especificamente em debater justiça, uso responsável e a vigilância humana no ciclo algorítmico.',
    evidence: 'Conteúdo programático focado em ética algorítmica e certificados distribuídos à equipe de TI e jurídica.',
    level: 2,
    legalReference: 'UNESCO Recomendações'
  },
  {
    id: '4.3',
    dimensionId: 'edu',
    name: 'Especializações e Certificações Técnicas',
    description: 'Fomento, custeio ou subvenção para que cientistas de dados conquistem pós-graduações, mestrados ou certificações de mercado na área de IA.',
    evidence: 'Plano anual de capacitação aprovado com verba executada para contratação de treinamentos externos em IA.',
    level: 2,
    legalReference: 'Marco de Competências MGI'
  },
  {
    id: '4.4',
    dimensionId: 'edu',
    name: 'Programa de Reciclagem Periódica de IA',
    description: 'Seminários curtos anuais obrigatórios para revisar mudanças legislativas globais e os novos paradigmas de segurança aplicados às redes neurais.',
    evidence: 'Cronograma executado de recertificações de pessoal com foco em ferramentas modernas de IA generativa.',
    level: 3,
    legalReference: 'Norma Técnica ISO/IEC 42001'
  },
  {
    id: '4.5',
    dimensionId: 'edu',
    name: 'Canal Perene com Centros Universitários',
    description: 'Trabalho conjunto por meio de acordos formais visando que teses de mestrado e pesquisas auxiliem no refino dos sistemas em produção.',
    evidence: 'Acordos de Cooperação Técnica (ACT) ativos com universidades federais, estaduais ou particulares sem fins lucrativos.',
    level: 3,
    legalReference: 'Lei de Inovação Art. 9º'
  },
  {
    id: '4.6',
    dimensionId: 'edu',
    name: 'Guias e Manuais de Uso Cotidiano',
    description: 'Documentação objetiva estabelecendo o que pode e o que não pode ser feito com LLMs comerciais (como imputar dados sigilosos).',
    evidence: 'Manual de Uso de IA Generativa publicado na intranet e enviado formalmente para todos os colaboradores.',
    level: 4,
    legalReference: 'Decreto Federal de Governo Digital'
  },
  {
    id: '4.7',
    dimensionId: 'edu',
    name: 'Maratonas Interdisciplinares de Inovação',
    description: 'Hackathons que mesclem programadores, juristas, gestores e cidadãos para desenharem soluções viáveis inteligentes.',
    evidence: 'Editais, fotos e repositórios contendo os MVP desenvolvidos durantes as maratonas patrocinadas.',
    level: 4,
    legalReference: 'Marco Legal das Startups'
  },
  {
    id: '4.8',
    dimensionId: 'edu',
    name: 'Célula de Mentoria e Retenção de Talentos',
    description: 'Equipe sênior focada em orientar estagiários e desenvolvedores novos no desenvolvimento de carreira voltado à inteligência artificial.',
    evidence: 'Regulamento de mentoria da corporação estruturado com reuniões agendadas mensais e planos de desenvolvimento individual.',
    level: 5,
    legalReference: 'Estratégia Nacional de Talentos'
  },
  {
    id: '4.9',
    dimensionId: 'edu',
    name: 'Comunidades Internas de Prática (CoPs)',
    description: 'Canais abertos e grupos de discussão espontânea voltados para disseminar dicas de engenharia de prompt, ferramentas inovadoras e soluções éticas.',
    evidence: 'Fórum ativo com canais no Teams, Slack ou Rocket.chat gerando dezenas de insights semanais.',
    level: 5,
    legalReference: 'ENIA Pilar 3'
  },

  // ECOSSISTEMA E PARCERIAS (eco)
  {
    id: '5.1',
    dimensionId: 'eco',
    name: 'Convênios Integrativos de Inovação',
    description: 'Acordos com outras prefeituras, órgãos consorciados ou sindicatos setoriais visando o compartilhamento tecnológico e benchmark.',
    evidence: 'Termos de adesão e de repasse mútuo de inteligência de processos homologados no Diário Oficial ou central de contratos.',
    level: 1,
    legalReference: 'Decreto de Inovação Federal'
  },
  {
    id: '5.2',
    dimensionId: 'eco',
    name: 'Disponibilização Pública de Modelos',
    description: 'Divulgação aberta das redes neurais de uso público que não contenham vulnerabilidades ou dados sigilosos das atividades fim.',
    evidence: 'Link público no HuggingFace ou GitHub oficial da organização abrigando os pesos de modelos utilizáveis.',
    level: 2,
    legalReference: 'Lei de Acesso à Informação'
  },
  {
    id: '5.3',
    dimensionId: 'eco',
    name: 'Laboratórios de Co-criação Aberta',
    description: 'Ambiente de inovação onde startups e cidadãos propõem em conjunto melhorias inteligentes para a sociedade utilizando nossa infraestrutura de teste.',
    evidence: 'Laboratório físico ou virtual em cooperação ativa gerindo testes em andamento.',
    level: 2,
    legalReference: 'Marco Legal de Startups Art. 11'
  },
  {
    id: '5.4',
    dimensionId: 'eco',
    name: 'Canais Ativos de Feedback do Cidadão',
    description: 'Conselho Consultivo, ouvidoria ou campo de avaliação onde as pessoas destinatárias das decisões automatizadas fornecem feedbacks.',
    evidence: 'Estatísticas consolidadas e relatórios emitidos pela ouvidoria contendo críticas revisadas por operadores humanos.',
    level: 3,
    legalReference: 'Decreto da Ouvidoria Federal'
  },
  {
    id: '5.5',
    dimensionId: 'eco',
    name: 'Adesão Ativa a Sandboxes Regulatórios',
    description: 'Participação voluntária em programas experimentais tutelados por órgãos fiscalizadores (ex: ANPD) para testar tecnologias fora do marco comum anterior.',
    evidence: 'Inscrição aceita ou portaria de autorização provisória emitida pelo órgão tutor competente.',
    level: 3,
    legalReference: 'LGPD Art. 55-J'
  },
  {
    id: '5.6',
    dimensionId: 'eco',
    name: 'Alocação de Verbas para IA Ética e Social',
    description: 'Criação de fundos corporativos ou linhas orçamentárias especiais focadas em impulsionar sistemas inclusivos para idosos, indígenas ou pessoas PD.',
    evidence: 'Extrato orçamentário público listando os projetos beneficiados com verbas aplicadas em inclusão algorítmica.',
    level: 4,
    legalReference: 'Marco Legal da CTI'
  },
  {
    id: '5.7',
    dimensionId: 'eco',
    name: 'Consonância Integrada à Normativa Internacional',
    description: 'Adoção estruturada dos preceitos do AI Act Europeu e decisões multilaterais buscando garantir que nossos produtos possam ser exportados livremente.',
    evidence: 'Relatório técnico atestando conformidade cruzada internacional homologada pelo compliance regulatório.',
    level: 4,
    legalReference: 'OCDE Princípios de IA'
  },
  {
    id: '5.8',
    dimensionId: 'eco',
    name: 'Atividades Perenes de Divulgação à Comunidade',
    description: 'Publish de artigos, vídeos e palestras simplificadas que aproximem o público das complexas tomadas de decisão que nós operacionalizamos.',
    evidence: 'Canal de mídia ativo e indexação de artigos em revistas técnicas do setor detalhando o uso da IA.',
    level: 5,
    legalReference: 'Decreto Transparência'
  },
  {
    id: '5.9',
    dimensionId: 'eco',
    name: 'Contratações Facilitadas pelo CPSI',
    description: 'Uso do Contrato Público de Soluções Inovadoras previsto em lei para encomendar e co-desenvolver algoritmos audaciosos de IA.',
    evidence: 'Contrato firmado legalmente e cronograma de metas alcançado com editais do Marco Legal de Startups.',
    level: 5,
    legalReference: 'Lei Complementar 182 Art. 12'
  },
];

export const INITIAL_ASSESSMENT: AssessmentState = {
  code: '',
  metadata: {
    natureza: '',
    estado: '',
    setor: '',
    porte: '',
    termosAceitos: false,
    code: '',
  },
  answers: {},
  completed: false,
  createdAt: '',
  lastUpdatedAt: '',
};

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
