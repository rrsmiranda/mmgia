/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DIMENSIONS } from '@mmgia/shared/types';
import { DIMENSION_WEIGHTS } from '@mmgia/shared/scoring';
import { DIMENSION_ORDER, LEVEL_RISK, LevelBadge, NplfBadge, NPLF, cx, type Level } from '@mmgia/shared/design-system';

const NPLF_ORDER: Array<'N' | 'P' | 'L' | 'F'> = ['N', 'P', 'L', 'F'];
const LEVELS: Level[] = [0, 1, 2, 3, 4, 5];
const SCORE_RANGES: Record<Level, string> = {
  0: '< 0,50',
  1: '0,50 a 0,99',
  2: '1,00 a 1,49',
  3: '1,50 a 1,99',
  4: '2,00 a 2,49',
  5: '≥ 2,50',
};

interface MethodologyContentProps {
  /** Nível de maturidade (0–5) do score global desta avaliação — destaca a linha correspondente na tabela de referência. */
  currentLevel?: Level;
}

export default function MethodologyContent({ currentLevel }: MethodologyContentProps) {
  const weightsText = DIMENSION_ORDER
    .map((id, i) => {
      const pct = Math.round(DIMENSION_WEIGHTS[id] * 100);
      const label = `${DIMENSIONS[id].shortName} ${pct}%`;
      if (i === DIMENSION_ORDER.length - 1) return `e ${label}`;
      return label;
    })
    .join(', ');

  return (
    <>
      <p className="rp-eyebrow">4 · Metodologia e privacidade</p>
      <h1 className="rp-h1">Como o resultado foi calculado</h1>
      <p>
        O MMGIA avalia 45 práticas distribuídas em cinco dimensões, com nove práticas cada, organizadas em cinco
        níveis de maturidade. Para cada prática, a organização informa o grau de implementação na escala NPLF.
      </p>

      <table className="rp-table">
        <thead>
          <tr>
            <th scope="col">Resposta</th>
            <th scope="col">Significado</th>
            <th scope="col" className="num">Valor</th>
          </tr>
        </thead>
        <tbody>
          {NPLF_ORDER.map((key) => (
            <tr key={key}>
              <td><NplfBadge value={key} /> {NPLF[key].label}</td>
              <td>{NPLF[key].subtitle}. {NPLF[key].description}</td>
              <td className="num">{NPLF[key].value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="rp-h2">Cálculo</h2>
      <p>
        O score de cada nível é a média das respostas das suas práticas; o score da dimensão é a média dos scores
        dos níveis respondidos; o score global é a média ponderada das dimensões — {weightsText}. O nível de
        maturidade é atribuído por faixas do score global:
      </p>

      <table className="rp-table">
        <thead>
          <tr>
            <th scope="col">Nível</th>
            <th scope="col">Faixa de score</th>
            <th scope="col">Risco associado</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {LEVELS.map((lvl) => (
            <tr key={lvl} className={cx(lvl === currentLevel && 'rp-current-row')}>
              <td><LevelBadge level={lvl} /></td>
              <td>{SCORE_RANGES[lvl]}</td>
              <td>{LEVEL_RISK[lvl].label}</td>
              <td className="rp-small">{lvl === currentLevel ? 'Você está aqui' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="rp-h2">Privacidade</h2>
      <p>
        A avaliação é anônima. Foram registrados apenas o setor, a esfera e a área de atuação, o estado, o porte,
        a relação com IA e as respostas. Não foram solicitados nome, e-mail, CNPJ, nomes de projetos ou chaves de
        sistemas. O código da avaliação permite editá-la e não pode ser recuperado. Os dados entram no painel
        nacional apenas de forma agregada, em grupos com cinco ou mais avaliações.
      </p>
    </>
  );
}
