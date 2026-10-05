/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Taxonomia v2 da organização respondente. Códigos = contrato de dados; não renomear.
export const TAXONOMIA_VERSAO = 2 as const;

export type Setor = 'publico' | 'privado' | 'terceiro' | 'outro';
export type Esfera = 'federal' | 'estadual' | 'municipal';
export type AreaPublica = 'gestao' | 'regulacao' | 'educacao' | 'saude' | 'seguranca' | 'justica' | 'legislativo' | 'estatal';
export type AreaPrivada = 'financas' | 'tecnologia' | 'educacao' | 'saude' | 'industria' | 'comercio';
export type AreaTerceiro = 'educacao' | 'saude' | 'causas' | 'classe';
export type Area = AreaPublica | AreaPrivada | AreaTerceiro;
export type Poder = 'executivo' | 'judiciario' | 'legislativo';
export type RelacaoIA = 'desenvolve' | 'usa' | 'nao_usa';
export type Regiao = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';

export const SETORES: { id: Setor; label: string; desc: string }[] = [
  { id: 'publico',  label: 'Setor público',  desc: 'Órgãos, autarquias, fundações, universidades e hospitais públicos, tribunais, câmaras e empresas estatais.' },
  { id: 'privado',  label: 'Setor privado',  desc: 'Empresas, startups, bancos, indústrias, escolas e hospitais particulares.' },
  { id: 'terceiro', label: 'Terceiro setor', desc: 'ONGs, fundações privadas, associações, Santas Casas, sindicatos e cooperativas.' },
  { id: 'outro',    label: 'Outro',          desc: 'Organismos internacionais, embaixadas e casos que não se encaixam acima.' },
];

export const ESFERAS: { id: Esfera; label: string; desc: string }[] = [
  { id: 'federal',   label: 'Federal',               desc: 'União' },
  { id: 'estadual',  label: 'Estadual ou Distrital', desc: 'Estados e DF' },
  { id: 'municipal', label: 'Municipal',             desc: 'Municípios' },
];

/** Áreas do setor público. `ex` traz os exemplos por esfera; `null` = área não se aplica (oculta). */
export const AREAS_PUBLICAS: { id: AreaPublica; label: string; poder: Poder; cnae: string; ex: Record<Esfera, string | null> }[] = [
  { id: 'gestao', label: 'Gestão e administração', poder: 'executivo', cnae: 'O', ex: {
    federal: 'Ministérios, Casa Civil, Receita, Tesouro, CGU, AGU, DNIT',
    estadual: 'Governo do estado, secretarias de administração, fazenda e planejamento, PGE, controladoria',
    municipal: 'Prefeitura, secretarias de administração, finanças e obras, controladoria, procuradoria, consórcios públicos' } },
  { id: 'regulacao', label: 'Regulação e fiscalização', poder: 'executivo', cnae: 'O', ex: {
    federal: 'ANPD, Anatel, Aneel, ANS, Anvisa, Anac, Banco Central, CVM, Ibama',
    estadual: 'Agências reguladoras estaduais, Detran, Procon, vigilância sanitária, órgão ambiental',
    municipal: 'Agência reguladora municipal, Procon, vigilância sanitária, fiscalização' } },
  { id: 'educacao', label: 'Educação e pesquisa', poder: 'executivo', cnae: 'P', ex: {
    federal: 'Universidades e institutos federais, MEC, Capes, CNPq, Inep',
    estadual: 'Universidades estaduais, secretaria e rede estadual de ensino, FAPs',
    municipal: 'Secretaria e rede municipal de ensino' } },
  { id: 'saude', label: 'Saúde e assistência social', poder: 'executivo', cnae: 'Q', ex: {
    federal: 'Ministério da Saúde, hospitais universitários, Fiocruz, INSS, MDS',
    estadual: 'Secretaria de saúde, hospitais estaduais, desenvolvimento social',
    municipal: 'Secretaria de saúde, UBS, hospitais municipais, CRAS' } },
  { id: 'seguranca', label: 'Segurança e defesa', poder: 'executivo', cnae: 'O', ex: {
    federal: 'Polícia Federal, PRF, Forças Armadas',
    estadual: 'Polícias Militar, Civil e Penal, Bombeiros',
    municipal: 'Guarda municipal, Defesa Civil' } },
  { id: 'justica', label: 'Justiça', poder: 'judiciario', cnae: 'O', ex: {
    federal: 'STF, tribunais superiores, TRFs, TRTs, TREs, CNJ, MPU, DPU',
    estadual: 'Tribunal de Justiça, Ministério Público, Defensoria Pública',
    municipal: null } },
  { id: 'legislativo', label: 'Legislativo e controle externo', poder: 'legislativo', cnae: 'O', ex: {
    federal: 'Câmara dos Deputados, Senado, TCU',
    estadual: 'Assembleia Legislativa, CLDF, TCE, TCDF',
    municipal: 'Câmara Municipal, TCM (SP e RJ)' } },
  { id: 'estatal', label: 'Empresa estatal', poder: 'executivo', cnae: '', ex: {
    federal: 'Serpro, Dataprev, Caixa, Banco do Brasil, Correios, Petrobras, EBSERH, Embrapa',
    estadual: 'Companhias de saneamento, energia e processamento de dados',
    municipal: 'Empresas municipais de TI, transporte e limpeza urbana' } },
];

export const AREAS_PRIVADAS: { id: AreaPrivada; label: string; desc: string; cnae: string }[] = [
  { id: 'financas',   label: 'Finanças e seguros',               desc: 'Bancos, cooperativas de crédito, seguradoras, fintechs.', cnae: 'K' },
  { id: 'tecnologia', label: 'Tecnologia e comunicação',         desc: 'Software, serviços de TI, telecom, mídia, editoras.', cnae: 'J' },
  { id: 'educacao',   label: 'Educação',                         desc: 'Escolas, faculdades, universidades e cursos particulares.', cnae: 'P' },
  { id: 'saude',      label: 'Saúde',                            desc: 'Hospitais, clínicas, laboratórios, farmácias, planos de saúde.', cnae: 'Q' },
  { id: 'industria',  label: 'Indústria, agro e infraestrutura', desc: 'Indústria, construção, agronegócio, mineração, energia, saneamento, transporte.', cnae: 'C' },
  { id: 'comercio',   label: 'Comércio e serviços',              desc: 'Varejo, atacado, e-commerce, consultorias, escritórios, turismo, imobiliárias.', cnae: 'G' },
];

export const AREAS_TERCEIRO: { id: AreaTerceiro; label: string; desc: string; cnae: string }[] = [
  { id: 'educacao', label: 'Educação e pesquisa',                desc: 'Universidades comunitárias e confessionais, institutos de pesquisa, fundações educacionais.', cnae: 'P' },
  { id: 'saude',    label: 'Saúde e assistência social',         desc: 'Santas Casas, hospitais filantrópicos, entidades de assistência.', cnae: 'Q' },
  { id: 'causas',   label: 'Causas sociais e ambientais',        desc: 'ONGs de meio ambiente, cultura, esporte, direitos humanos e cidadania.', cnae: 'S' },
  { id: 'classe',   label: 'Entidades de classe e cooperativas', desc: 'Associações profissionais e empresariais, sindicatos, conselhos, cooperativas.', cnae: 'S' },
];

export const RELACOES_IA: { id: RelacaoIA; label: string; desc: string }[] = [
  { id: 'desenvolve', label: 'Desenvolve ou fornece IA', desc: 'Cria, treina ou vende soluções de IA.' },
  { id: 'usa',        label: 'Contrata ou usa IA',       desc: 'Usa soluções de IA de terceiros ou próprias.' },
  { id: 'nao_usa',    label: 'Ainda não usa IA',         desc: 'Não há uso de IA em operação.' },
];

export const REGIAO_POR_UF: Record<string, Regiao> = {
  AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  DF: 'Centro-Oeste', GO: 'Centro-Oeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul',
};

/** Áreas exibidas para uma esfera (Justiça some no municipal). */
export function areasPublicasPara(esfera: Esfera) {
  return AREAS_PUBLICAS.filter((a) => a.ex[esfera] !== null);
}

export interface ClassificacaoMeta {
  setor: Setor | '';
  esfera?: Esfera;
  area?: Area;
  atividadeEstatal?: AreaPrivada;
}

/** Deriva o Poder (só setor público). */
export function derivarPoder(setor: Setor | '', area: Area | undefined): Poder | undefined {
  if (setor !== 'publico' || !area) return undefined;
  const info = AREAS_PUBLICAS.find((a) => a.id === area);
  if (!info) return undefined;
  if (area === 'justica') return 'judiciario';
  if (area === 'legislativo') return 'legislativo';
  return info.poder;
}

export function derivarRegiao(uf: string): Regiao | undefined {
  return REGIAO_POR_UF[uf];
}

/** Letra da seção CNAE correspondente à área (estatal usa a atividade declarada; "outro" não tem). */
export function derivarCnaeSecao(meta: ClassificacaoMeta): string | undefined {
  if (meta.setor === 'outro' || !meta.area) return undefined;
  if (meta.setor === 'publico') {
    if (meta.area === 'estatal') {
      if (!meta.atividadeEstatal) return undefined;
      return AREAS_PRIVADAS.find((a) => a.id === meta.atividadeEstatal)?.cnae;
    }
    return AREAS_PUBLICAS.find((a) => a.id === meta.area)?.cnae || undefined;
  }
  if (meta.setor === 'privado') return AREAS_PRIVADAS.find((a) => a.id === meta.area)?.cnae;
  if (meta.setor === 'terceiro') return AREAS_TERCEIRO.find((a) => a.id === meta.area)?.cnae;
  return undefined;
}

/** Rótulo da área dentro do setor informado. */
export function rotuloArea(setor: Setor | '', area: Area | undefined): string | undefined {
  if (!area) return undefined;
  if (setor === 'publico') return AREAS_PUBLICAS.find((a) => a.id === area)?.label;
  if (setor === 'privado') return AREAS_PRIVADAS.find((a) => a.id === area)?.label;
  if (setor === 'terceiro') return AREAS_TERCEIRO.find((a) => a.id === area)?.label;
  return undefined;
}

/**
 * Descrição legível da classificação completa.
 * Ex.: "Setor público · Federal · Regulação e fiscalização",
 *      "Setor público · Federal · Empresa estatal (Tecnologia e comunicação)",
 *      "Setor privado · Saúde".
 */
export function descreverClassificacao(meta: ClassificacaoMeta): string {
  const setorLabel = SETORES.find((s) => s.id === meta.setor)?.label ?? 'Não informado';
  if (meta.setor === 'publico') {
    const esferaLabel = meta.esfera ? ESFERAS.find((e) => e.id === meta.esfera)?.label : undefined;
    const areaLabel = rotuloArea(meta.setor, meta.area);
    const parts = [setorLabel, esferaLabel, areaLabel].filter(Boolean) as string[];
    if (meta.area === 'estatal' && meta.atividadeEstatal) {
      const atividadeLabel = AREAS_PRIVADAS.find((a) => a.id === meta.atividadeEstatal)?.label;
      if (atividadeLabel && parts.length > 0) {
        parts[parts.length - 1] = `${parts[parts.length - 1]} (${atividadeLabel})`;
      }
    }
    return parts.join(' · ');
  }
  const areaLabel = rotuloArea(meta.setor, meta.area);
  return [setorLabel, areaLabel].filter(Boolean).join(' · ');
}

/** Valida se a classificação está completa o suficiente para prosseguir. */
export function classificacaoValida(meta: ClassificacaoMeta): boolean {
  if (meta.setor === 'publico') {
    if (!meta.esfera || !meta.area) return false;
    const disponiveis = areasPublicasPara(meta.esfera).map((a) => a.id);
    if (!disponiveis.includes(meta.area as AreaPublica)) return false;
    if (meta.area === 'estatal' && !meta.atividadeEstatal) return false;
    return true;
  }
  if (meta.setor === 'privado') return !!meta.area && AREAS_PRIVADAS.some((a) => a.id === meta.area);
  if (meta.setor === 'terceiro') return !!meta.area && AREAS_TERCEIRO.some((a) => a.id === meta.area);
  if (meta.setor === 'outro') return true;
  return false;
}

// ===== Migração de registros v1 (Fase 4) =====

interface MetadataV1 {
  natureza: string;
  estado: string;
  setor: string;
  porte: string;
  termosAceitos: boolean;
  code: string;
}

interface MetadataV2 {
  taxonomiaVersao: 2;
  setor: Setor | '';
  esfera?: Esfera;
  area?: Area;
  atividadeEstatal?: AreaPrivada;
  relacaoIA?: RelacaoIA;
  revisar?: boolean;
  estado: string;
  porte: string;
  termosAceitos: boolean;
  code: string;
}

/**
 * Converte um metadata v1 (`natureza` + `setor` fixos) para a taxonomia v2.
 * Quando a combinação antiga não tem conversão segura, marca `revisar: true`
 * (o registro permanece válido para o score, só entra no painel pelos totais gerais).
 */
export function migrarMetadataV1(old: MetadataV1): MetadataV2 {
  const base = { estado: old.estado, porte: old.porte, termosAceitos: old.termosAceitos, code: old.code };

  let setor: Setor | '' = 'outro';
  let esfera: Esfera | undefined;
  let revisar = false;

  switch (old.natureza) {
    case 'Pública federal': setor = 'publico'; esfera = 'federal'; break;
    case 'Pública estadual': setor = 'publico'; esfera = 'estadual'; break;
    case 'Pública municipal': setor = 'publico'; esfera = 'municipal'; break;
    case 'Privada': setor = 'privado'; break;
    case 'Terceiro setor': setor = 'terceiro'; break;
    case 'Academia': setor = 'outro'; revisar = true; break;
    default: setor = 'outro'; revisar = true;
  }

  let area: Area | undefined;
  let atividadeEstatal: AreaPrivada | undefined;

  const setorAntigo = old.setor;

  if (setor === 'publico') {
    if (['Gov. federal', 'Gov. estadual', 'Gov. municipal'].includes(setorAntigo)) {
      area = 'gestao';
    } else if (setorAntigo === 'Saúde') {
      area = 'saude';
    } else if (setorAntigo === 'Educação') {
      area = 'educacao';
    } else if (setorAntigo === 'Financeiro') {
      area = 'estatal'; atividadeEstatal = 'financas';
    } else if (setorAntigo === 'Tecnologia') {
      area = 'estatal'; atividadeEstatal = 'tecnologia';
    } else if (setorAntigo === 'Indústria' || setorAntigo === 'Agronegócio') {
      area = 'estatal'; atividadeEstatal = 'industria';
    } else {
      revisar = true;
    }
  } else if (setor === 'privado') {
    if (setorAntigo === 'Saúde') area = 'saude';
    else if (setorAntigo === 'Educação') area = 'educacao';
    else if (setorAntigo === 'Financeiro') area = 'financas';
    else if (setorAntigo === 'Tecnologia') area = 'tecnologia';
    else if (setorAntigo === 'Indústria' || setorAntigo === 'Agronegócio') area = 'industria';
    else revisar = true;
  } else if (setor === 'terceiro') {
    if (setorAntigo === 'Saúde') area = 'saude';
    else if (setorAntigo === 'Educação') area = 'educacao';
    else if (setorAntigo === 'Outro') area = 'causas';
    else revisar = true;
  }

  return {
    taxonomiaVersao: 2,
    setor,
    ...(esfera ? { esfera } : {}),
    ...(area ? { area } : {}),
    ...(atividadeEstatal ? { atividadeEstatal } : {}),
    ...(revisar ? { revisar: true } : {}),
    ...base,
  };
}
