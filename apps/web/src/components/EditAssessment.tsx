/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { AssessmentMetadata, ScoreLevel } from '@mmgia/shared/types';
import { findAssessmentByCode } from '@mmgia/shared/submissionsApi';
import { Banner, Button, Card, DsRoot, Field, Input, Page } from '@mmgia/shared/design-system';

interface EditAssessmentProps {
  onLoadAssessment: (code: string, answers: Record<string, ScoreLevel>, metadata: AssessmentMetadata) => void;
  onGoToOnboarding: () => void;
}

export default function EditAssessment({ onLoadAssessment, onGoToOnboarding }: EditAssessmentProps) {
  const [sessionCode, setSessionCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearchCode = async (e: FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    const trimmed = sessionCode.trim();
    if (!trimmed) {
      setErrorText('Por favor, informe o seu código de avaliação.');
      return;
    }

    setLoading(true);
    const found = await findAssessmentByCode(trimmed);
    setLoading(false);

    if (!found) {
      // Mensagem propositalmente genérica — não dá pra diferenciar "código não existe"
      // de "erro de rede" sem vazar informação sobre a existência do código.
      setErrorText('Código de avaliação não identificado. Certifique-se de que digitou corretamente.');
      return;
    }

    setSuccessText('Avaliação encontrada! Carregando respostas...');
    setTimeout(() => {
      onLoadAssessment(trimmed, found.answers, found.metadata);
    }, 800);
  };

  return (
    <DsRoot>
      <Page>
        <div style={{ maxWidth: 440, margin: '48px auto' }} id="edit-assessment-root">
          <Card large id="edit-box-card">
            <div style={{ textAlign: 'center' }}>
              <p className="mg-eyebrow">Recuperar diagnóstico</p>
              <h1 className="mg-h3" style={{ marginTop: 6 }}>Editar avaliação existente</h1>
              <p className="mg-lead" style={{ marginTop: 6 }}>
                Cole o código alfanumérico que foi gerado ao final de sua sessão para recuperar as respostas.
              </p>
            </div>

            <form onSubmit={handleSearchCode} className="mg-stack" style={{ gap: 16, marginTop: 24 }} id="recovery-form">
              <Field label="Código de avaliação" help="Formato: xxxx-xxxx-xxxx">
                {({ id, describedBy }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    code
                    icon={Search}
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    placeholder="xxxx-xxxx-xxxx"
                    disabled={loading}
                  />
                )}
              </Field>

              {errorText && (
                <Banner tone="critical" title="Não foi possível localizar a avaliação">
                  {errorText}
                </Banner>
              )}

              {successText && (
                <Banner tone="good" title="Avaliação encontrada">
                  {successText}
                </Banner>
              )}

              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Buscando…' : 'Buscar e restaurar respostas'}
              </Button>
            </form>

            <div style={{ marginTop: 24 }} id="recovery-code-warning">
              <Banner tone="attention" title="Aviso importante">
                Como garantimos privacidade anônima absoluta, não guardamos e-mails de cadastro nem cookies de sessão. Sem o código, é impossível recuperar seu progresso.
              </Banner>
            </div>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--surface-deep)', textAlign: 'center' }}>
              <Button variant="ghost" iconRight={ArrowRight} onClick={onGoToOnboarding}>
                Iniciar nova avaliação de maturidade
              </Button>
            </div>
          </Card>
        </div>
      </Page>
    </DsRoot>
  );
}
