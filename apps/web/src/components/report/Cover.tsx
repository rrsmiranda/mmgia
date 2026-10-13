/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Info } from 'lucide-react';
import type { AssessmentMetadata } from '@mmgia/shared/types';
import { LIST_PRACTICES } from '@mmgia/shared/types';
import { ESFERAS, RELACOES_IA, rotuloArea, SETORES } from '@mmgia/shared/taxonomy';
import { ReportLogo } from './ReportPage';
import { PORTE_TRAILING, UF_NAMES } from './data';

interface FieldProps { label: string; value: string }

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <dt className="rp-label">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function CoverContent({ metadata }: { metadata: AssessmentMetadata }) {
  const setorLabel = SETORES.find((s) => s.id === metadata.setor)?.label ?? 'Não informado';
  const esferaLabel = metadata.setor === 'publico' && metadata.esfera
    ? ESFERAS.find((e) => e.id === metadata.esfera)?.label
    : undefined;
  const areaLabel = rotuloArea(metadata.setor, metadata.area) ?? 'Não informado';
  const estadoLabel = UF_NAMES[metadata.estado] ?? metadata.estado;
  const porteTrailing = PORTE_TRAILING[metadata.porte];
  const porteLabel = porteTrailing ? `${metadata.porte} · ${porteTrailing}` : metadata.porte || 'Não informado';
  const relacaoLabel = metadata.relacaoIA
    ? RELACOES_IA.find((r) => r.id === metadata.relacaoIA)?.label
    : undefined;
  const dataEmissao = new Date().toLocaleDateString('pt-BR');

  return (
    <>
      <div className="rp-cover-band">
        <ReportLogo />
        <p className="rp-eyebrow" style={{ marginTop: 24 }}>Relatório de autoavaliação</p>
        <h1 className="rp-title">Maturidade em governança de inteligência artificial</h1>
        <p className="rp-cover-sub">
          Modelo de Maturidade em Governança de IA (MMGIA) · Grupo de Pesquisa em Governança e Gestão de
          Inteligência Artificial (GGIA) da Universidade de Brasília (UnB)
        </p>
      </div>
      <div className="rp-cover-body">
        <h2 className="rp-h3" style={{ marginTop: 0 }}>Organização avaliada</h2>
        <div className="rp-dl">
          <dl className="rp-dl rp-dl--1">
            <Field label="Setor" value={setorLabel} />
            {esferaLabel && <Field label="Esfera" value={esferaLabel} />}
            <Field label="Estado (UF)" value={estadoLabel} />
            {relacaoLabel && <Field label="Relação com IA" value={relacaoLabel} />}
            <Field label="Data de emissão" value={dataEmissao} />
            <div>
              <dt className="rp-label">Código da avaliação</dt>
              <dd className="rp-mono">{metadata.code}</dd>
            </div>
          </dl>
          <dl className="rp-dl rp-dl--1">
            <Field label="Área de atuação" value={areaLabel} />
            <Field label="Porte" value={porteLabel} />
            <Field label="Versão do modelo" value={`MMGIA 1.0 · ${LIST_PRACTICES.length} práticas`} />
          </dl>
        </div>

        <div className="rp-note">
          <Info className="mg-ico" aria-hidden="true" />
          <p>
            Este relatório resume as respostas informadas pela própria organização. Ele não identifica a
            organização, não constitui certificação, auditoria ou parecer jurídico e não substitui a
            avaliação de órgãos de controle.
          </p>
        </div>
      </div>
    </>
  );
}
