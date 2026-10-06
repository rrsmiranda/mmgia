/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Practice, ScoreLevel } from '@mmgia/shared/types';
import { LIST_PRACTICES } from '@mmgia/shared/types';
import { NplfBadge } from '@mmgia/shared/design-system';

function AnnexTable({ practices, answers }: { practices: Practice[]; answers: Record<string, ScoreLevel> }) {
  return (
    <table className="rp-table rp-annex">
      <thead>
        <tr>
          <th scope="col">Código</th>
          <th scope="col">Prática</th>
          <th scope="col">Nível</th>
          <th scope="col">Resposta</th>
        </tr>
      </thead>
      <tbody>
        {practices.map((p) => {
          const ans = answers[p.id];
          return (
            <tr key={p.id}>
              <td className="rp-mono">{p.id}</td>
              <td>{p.name}</td>
              <td>{p.level}</td>
              <td>{ans ? <NplfBadge value={ans} /> : '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function AnnexContent({ answers }: { answers: Record<string, ScoreLevel> }) {
  const split = 23; // 23 práticas na primeira coluna, 22 na segunda
  const colA = LIST_PRACTICES.slice(0, split);
  const colB = LIST_PRACTICES.slice(split);

  return (
    <>
      <p className="rp-eyebrow">Anexo</p>
      <h1 className="rp-h1">Respostas informadas</h1>
      <div className="rp-cols">
        <AnnexTable practices={colA} answers={answers} />
        <AnnexTable practices={colB} answers={answers} />
      </div>
    </>
  );
}
