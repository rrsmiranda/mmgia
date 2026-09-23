/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { ScoreLevel } from '@mmgia/shared/types';
import { Banner, Button, Card, DsRoot, Field, Input, Page } from '@mmgia/shared/design-system';

interface EditAssessmentProps {
  onLoadAssessment: (code: string, answers: Record<string, ScoreLevel>, metadata: any) => void;
  onGoToOnboarding: () => void;
}

export default function EditAssessment({ onLoadAssessment, onGoToOnboarding }: EditAssessmentProps) {
  const [sessionCode, setSessionCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const handleSearchCode = (e: FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    const trimmed = sessionCode.trim();
    if (!trimmed) {
      setErrorText('Por favor, informe o seu código de avaliação.');
      return;
    }

    // A valid simulated session loader, plus fallback checks on local storage
    const stored = localStorage.getItem(`mmgia_session_${trimmed}`);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSuccessText('Avaliação integrada com sucesso! Redirecionando...');
        setTimeout(() => {
          onLoadAssessment(trimmed, parsed.answers, parsed.metadata);
        }, 1200);
        return;
      } catch {
        // fail silently or fallback
      }
    }

    // Default code simulators so users can test immediately with sample values
    const staticSampleCodes = ['a3f8-2b91-4c7d', 'exmp-code-2026', 'demo-test-1234'];

    if (staticSampleCodes.includes(trimmed.toLowerCase())) {
      // Load mocked completed assessment answers
      const mockAnswers: Record<string, ScoreLevel> = {
        '1.1': 'F', '1.2': 'L', '1.3': 'P', '1.4': 'N', '1.5': 'P', '1.6': 'N',
        '2.1': 'F', '2.2': 'L', '2.3': 'L', '2.4': 'P',
        '3.1': 'F', '3.2': 'P', '3.3': 'L', '3.4': 'N',
        '4.1': 'P', '4.2': 'P', '4.3': 'N',
        '5.1': 'L', '5.2': 'N',
      };

      const mockMeta = {
        natureza: 'Pública estadual',
        estado: 'SP',
        setor: 'Saúde',
        porte: 'Grande',
        termosAceitos: true,
        code: trimmed,
      };

      setSuccessText('Sessão de demonstração identificada! Carregando respostas...');
      setTimeout(() => {
        onLoadAssessment(trimmed, mockAnswers, mockMeta);
      }, 1200);
    } else {
      setErrorText('Código de avaliação não identificado localmente no navegador. Certifique-se de que digitou corretamente.');
    }
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
                  />
                )}
              </Field>

              <p className="mg-small mg-muted" style={{ marginTop: -8 }}>
                Dica: use o código demo <span className="mg-code">a3f8-2b91-4c7d</span> para carregar testes.
              </p>

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

              <Button type="submit" variant="primary" fullWidth>Buscar e restaurar respostas</Button>
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
