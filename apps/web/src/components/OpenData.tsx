/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { Database, Download, Table, Terminal } from 'lucide-react';
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DsRoot,
  Field,
  Input,
  Page,
  PageHeader,
  Textarea,
} from '@mmgia/shared/design-system';

interface SchemaField { name: string; type: string; desc: string; ex: string }
const SCHEMA_FIELDS: SchemaField[] = [
  { name: 'id', type: 'string', desc: 'Hash UUID de 12 caracteres anonimizado que indexa a avaliação.', ex: 'a3f8-2b91-4c7d' },
  { name: 'periodo', type: 'string', desc: 'Mês e ano consolidados de submissão do formulário.', ex: 'Jun/2026' },
  { name: 'natureza', type: 'string', desc: 'Esfera jurídica ou institucional declarada.', ex: 'Pública federal' },
  { name: 'estado', type: 'string', desc: 'Unidade Federativa de atuação principal.', ex: 'SP' },
  { name: 'setor', type: 'string', desc: 'Vertical econômica ou atividade prática principal.', ex: 'Financeiro' },
  { name: 'score_global', type: 'float', desc: 'Média global recalculada de 0.00 a 3.00.', ex: '1.82' },
  { name: 'nivel_global', type: 'integer', desc: 'Maturidade apurada de nível 0 a 5.', ex: '3' },
];

export default function OpenData() {
  const [downloadType, setDownloadType] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', institution: '', email: '', message: '' });

  const handleDownload = (format: string) => {
    setDownloadType(format);
    setTimeout(() => {
      setDownloadType(null);

      // Simulate download dispatch
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ status: 'success', data: 'microdata_mmgia_2026' }));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `microdados_mmgia_2026.${format}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }, 1200);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', institution: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <DsRoot>
      <Page>
        <PageHeader
          eyebrow="Repositório de dados abertos"
          title="Dados abertos e microdados"
          description="Acesse a base agregada, anônima e segmentada das avaliações sob licença internacional CC BY 4.0."
        />

        <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 1.3fr', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 24, alignItems: 'start' }}>
          {/* ESQUERDA: DOWNLOADS + ESQUEMA */}
          <div className="mg-stack" style={{ gap: 16 }}>
            <Card id="downloads-pulp">
              <div className="mg-row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--brand-accent)', color: 'var(--on-accent)', flexShrink: 0 }}>
                  <Database className="mg-ico" aria-hidden="true" />
                </span>
                <div>
                  <p className="mg-title">Download de datasets</p>
                  <p className="mg-small mg-muted" style={{ marginTop: 4 }}>
                    Baixe o painel completo atualizado contendo os índices ponderados de mais de 1.800 avaliações nacionais.
                  </p>
                </div>
              </div>
              <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(2,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: 'repeat(2,1fr)', gap: 12, marginTop: 20 }}>
                <Button variant="primary" icon={Download} disabled={downloadType !== null} onClick={() => handleDownload('csv')}>Baixar CSV</Button>
                <Button variant="secondary" icon={Download} disabled={downloadType !== null} onClick={() => handleDownload('json')}>Baixar JSON</Button>
              </div>
            </Card>

            <Card id="schema-description">
              <CardHeader title={<span className="mg-row" style={{ gap: 8 }}><Table className="mg-ico mg-ico-sm" aria-hidden="true" />Esquema dos dados</span>} />
              <CardBody>
                <DataTable<SchemaField>
                  caption="Campos, tipos e descrições do dataset de microdados"
                  rowKey={(r) => r.name}
                  columns={[
                    { key: 'name', header: 'Campo', render: (r) => <span className="mg-code" style={{ fontWeight: 700 }}>{r.name}</span> },
                    { key: 'type', header: 'Tipo', render: (r) => <span className="mg-code">{r.type}</span> },
                    { key: 'desc', header: 'Descrição', render: (r) => (
                      <>
                        {r.desc} <span className="mg-code mg-muted" style={{ display: 'block', marginTop: 2 }}>Ex: {r.ex}</span>
                      </>
                    ) },
                  ]}
                  rows={SCHEMA_FIELDS}
                />
              </CardBody>
            </Card>
          </div>

          {/* DIREITA: SQL + LICENÇA + FORMULÁRIO */}
          <div className="mg-stack" style={{ gap: 16 }}>
            <Card style={{ background: 'var(--ink)', color: 'var(--on-ink)' }} id="sql-block-console">
              <div className="mg-row" style={{ justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--ink-raised)' }}>
                <span className="mg-row" style={{ gap: 8 }}>
                  <Terminal className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--on-ink-accent)' }} />
                  <span style={{ fontWeight: 700 }}>Exemplo consulta SQL (PostgreSQL)</span>
                </span>
                <span className="mg-code" style={{ color: 'var(--on-ink-muted)', textTransform: 'uppercase' }}>Read-only API console</span>
              </div>
              <pre className="mg-code" style={{ marginTop: 16, whiteSpace: 'pre-wrap', overflowX: 'auto', color: 'var(--on-ink)' }}>
{`-- Consulta média de score global por setor governamental
SELECT
  setor,
  COUNT(id) AS amostras,
  ROUND(AVG(score_global)::numeric, 2) AS score_medio_geral
FROM microdados_mmgia
WHERE natureza LIKE 'Pública%'
GROUP BY setor
ORDER BY score_medio_geral DESC;`}
              </pre>
            </Card>

            <Card id="cc-license-card">
              <div className="mg-row" style={{ gap: 16, alignItems: 'flex-start' }}>
                <span className="mg-code" style={{ fontSize: 16, fontWeight: 800, border: '1px solid var(--border-control)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', flexShrink: 0 }}>CC BY 4.0</span>
                <div>
                  <p className="mg-title">Atribuição Creative Commons 4.0</p>
                  <p className="mg-small mg-muted" style={{ marginTop: 4 }}>
                    Você é livre para compartilhar, compor, copiar e redistribuir os dados em qualquer suporte ou formato para fins acadêmicos ou comerciais, desde que atribua o crédito devido à plataforma oficial do MMGIA.
                  </p>
                </div>
              </div>
            </Card>

            <Card id="downloads-request-form">
              <CardHeader title="Solicitar base completa consolidada" />
              <CardBody>
                <p className="mg-small mg-muted" style={{ marginTop: -8, marginBottom: 16 }}>Pesquisadores e centros de auditoria podem requerer cortes microdemográficos específicos.</p>

                {formSubmitted ? (
                  <div id="form-success-banner">
                    <Banner tone="good" title="Requisição enviada">
                      Seu formulário de solicitação técnica de dados foi processado. Retornaremos com o link definitivo no e-mail corporativo informado em até 48 horas.
                    </Banner>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="mg-stack" style={{ gap: 16 }} id="php-email-form">
                    <div className="mg-grid" style={{ ['--cols-d' as string]: 'repeat(2,1fr)', ['--cols-t' as string]: 'repeat(2,1fr)', ['--cols-m' as string]: '1fr', gap: 16 }}>
                      <Field label="Seu nome" help="Obrigatório">
                        {({ id }) => (
                          <Input id={id} required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. Carlos Silva" />
                        )}
                      </Field>
                      <Field label="Instituição / sigla" help="Obrigatório">
                        {({ id }) => (
                          <Input id={id} required value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} placeholder="Universidade Federal (UFC)" />
                        )}
                      </Field>
                    </div>

                    <Field label="E-mail de contato acadêmico" help="Obrigatório">
                      {({ id }) => (
                        <Input id={id} type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="carlos.silva@academia.edu.br" />
                      )}
                    </Field>

                    <Field label="Motivação da pesquisa / justificativa" help="Obrigatório">
                      {({ id }) => (
                        <Textarea id={id} required rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Quais recortes demográficos ou hipóteses estatísticas você pretende validar com estas informações?" />
                      )}
                    </Field>

                    <Button type="submit" variant="primary" fullWidth>Enviar requisição de acesso</Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </Page>
    </DsRoot>
  );
}
