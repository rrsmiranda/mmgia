/**
 * Exemplo de referência: a tela do questionário montada só com o design system.
 * Não está ligado ao App — serve de modelo para migrar src/components/Questionnaire.tsx.
 */
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { LIST_PRACTICES, type ScoreLevel } from '../../types';
import {
  ActionBar, Button, Card, DsRoot, NplfBadge, NPLF, OptionCard, Page, PracticeCard, RadioGroup, Grid,
} from '..';

const ORDER: ScoreLevel[] = ['N', 'P', 'L', 'F'];

export function QuestionStepExample() {
  const practice = LIST_PRACTICES[3];
  const [answer, setAnswer] = useState<ScoreLevel | null>('L');
  const move = (dir: 1 | -1) => {
    const i = answer ? ORDER.indexOf(answer) : -1;
    setAnswer(ORDER[Math.max(0, Math.min(ORDER.length - 1, i + dir))]);
  };
  return (
    <DsRoot>
      <Page>
        <Grid columns={['300px 1fr', '1fr', '1fr']} gap={40}>
          <nav aria-label="Dimensões" className="mg-only-desktop">{/* lista de dimensões */}</nav>
          <div className="mg-stack" style={{ gap: 24 }}>
            <Card className="mg-qprogress mg-only-mobile" style={{ padding: 16 }}>
              <div className="mg-row mg-nowrap" style={{ gap: 10 }}>
                <span className="mg-title" style={{ flex: 1 }}>Governança · prática 4 de 9</span>
                <Button size="sm" icon={Layers}>Dimensões</Button>
              </div>
            </Card>
            <PracticeCard practice={practice} position="prática 4 de 9" headingLevel={1} />
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="mg-field-label" style={{ marginBottom: 12 }}>Em que grau a prática está implementada?</legend>
              <RadioGroup label="Escala NPLF" columns={['repeat(4,1fr)', 'repeat(2,1fr)', '1fr']} onKeyNav={move}>
                {ORDER.map((v) => (
                  <OptionCard
                    key={v}
                    list
                    checked={answer === v}
                    onSelect={() => setAnswer(v)}
                    leading={<NplfBadge value={v} />}
                    title={`${NPLF[v].label} (${v})`}
                    description={`${NPLF[v].subtitle}. ${NPLF[v].description}`}
                  />
                ))}
              </RadioGroup>
            </fieldset>
            <ActionBar inline>
              <Button variant="ghost" icon={ArrowLeft}>Anterior</Button>
              <Button variant="primary" size="lg" iconRight={ArrowRight} disabled={!answer}>Próxima prática</Button>
            </ActionBar>
          </div>
        </Grid>
      </Page>
    </DsRoot>
  );
}
