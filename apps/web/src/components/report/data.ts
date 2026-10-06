/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Nome por extenso de cada UF — só para exibição na capa do relatório. */
export const UF_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará',
  PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

/** Faixa de colaboradores por porte — só para exibição na capa do relatório. */
export const PORTE_TRAILING: Record<string, string> = {
  Micro: 'até 19',
  Pequena: '20 a 99',
  Média: '100 a 999',
  Grande: '1.000 ou mais',
};
