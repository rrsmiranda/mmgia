/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building,
  Building2,
  Landmark,
  LayoutGrid,
  Map as MapIcon,
  School,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { AssessmentMetadata } from '@mmgia/shared/types';
import {
  ActionBar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  DsRoot,
  OptionCard,
  Page,
  PageHeader,
  Pill,
  RadioGroup,
  Segmented,
  Steps,
} from '@mmgia/shared/design-system';
import BrazilMap from './BrazilMap';

interface StateInfo { uf: string; name: string; region: string }

const STATE_INFO: StateInfo[] = [
  { uf: 'RR', name: 'Roraima', region: 'Norte' },
  { uf: 'AP', name: 'Amapá', region: 'Norte' },
  { uf: 'AM', name: 'Amazonas', region: 'Norte' },
  { uf: 'PA', name: 'Pará', region: 'Norte' },
  { uf: 'AC', name: 'Acre', region: 'Norte' },
  { uf: 'RO', name: 'Rondônia', region: 'Norte' },
  { uf: 'TO', name: 'Tocantins', region: 'Norte' },
  { uf: 'MA', name: 'Maranhão', region: 'Nordeste' },
  { uf: 'PI', name: 'Piauí', region: 'Nordeste' },
  { uf: 'CE', name: 'Ceará', region: 'Nordeste' },
  { uf: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste' },
  { uf: 'PB', name: 'Paraíba', region: 'Nordeste' },
  { uf: 'PE', name: 'Pernambuco', region: 'Nordeste' },
  { uf: 'AL', name: 'Alagoas', region: 'Nordeste' },
  { uf: 'SE', name: 'Sergipe', region: 'Nordeste' },
  { uf: 'BA', name: 'Bahia', region: 'Nordeste' },
  { uf: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste' },
  { uf: 'GO', name: 'Goiás', region: 'Centro-Oeste' },
  { uf: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste' },
  { uf: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
  { uf: 'MG', name: 'Minas Gerais', region: 'Sudeste' },
  { uf: 'ES', name: 'Espírito Santo', region: 'Sudeste' },
  { uf: 'SP', name: 'São Paulo', region: 'Sudeste' },
  { uf: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste' },
  { uf: 'PR', name: 'Paraná', region: 'Sul' },
  { uf: 'SC', name: 'Santa Catarina', region: 'Sul' },
  { uf: 'RS', name: 'Rio Grande do Sul', region: 'Sul' },
];

const UFS = [...STATE_INFO].sort((a, b) => a.uf.localeCompare(b.uf)).map((s) => s.uf);

const NATUREZAS = [
  { id: 'Pública federal', desc: 'Ministérios, agências reguladoras ou autarquias de nível federal.', icon: Building2 },
  { id: 'Pública estadual', desc: 'Secretarias de Estado, fundações ou autarquias estaduais.', icon: Building },
  { id: 'Pública municipal', desc: 'Prefeituras, secretarias municipais ou autarquias locais.', icon: Landmark },
  { id: 'Privada', desc: 'Empresas, startups, corporações independentes e comerciais.', icon: Briefcase },
  { id: 'Terceiro setor', desc: 'Fundações privadas, ONGs, institutos ou associações de classe.', icon: Users },
  { id: 'Academia', desc: 'Universidades públicas ou privadas, institutos de fomento e centros científicos.', icon: School },
];

const SETORES = [
  'Financeiro', 'Saúde', 'Gov. federal', 'Gov. estadual', 'Gov. municipal',
  'Indústria', 'Tecnologia', 'Educação', 'Agronegócio', 'Outro',
];

const PORTES = [
  { id: 'Micro', label: 'Micro (até 19)' },
  { id: 'Pequena', label: 'Pequena (20–99)' },
  { id: 'Média', label: 'Média (100–999)' },
  { id: 'Grande', label: 'Grande (1.000+)' },
];

interface OnboardingProps {
  onComplete: (metadata: AssessmentMetadata) => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

export default function Onboarding({ onComplete, onCancel }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [natureza, setNatureza] = useState('');
  const [estado, setEstado] = useState('');
  const [setor, setSetor] = useState('');
  const [porte, setPorte] = useState('');
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'grid'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 575px)').matches ? 'grid' : 'map'
  );
  const prefersReducedMotion = useReducedMotion();

  const generateUniqueCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segment = (len: number) => {
      let str = '';
      for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;
    };
    return `${segment(4)}-${segment(4)}-${segment(4)}`;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const code = generateUniqueCode();
      onComplete({ natureza, estado, setor, porte, termosAceitos, code });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const isStepValid = () => {
    if (step === 1) return natureza !== '';
    if (step === 2) return estado !== '' && setor !== '';
    if (step === 3) return porte !== '' && termosAceitos;
    return false;
  };

  const selectedState = STATE_INFO.find((s) => s.uf === estado);
  const slideProps = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { type: 'spring' as const, stiffness: 350, damping: 30 },
      };

  return (
    <DsRoot>
      <Page>
        <Card large style={{ maxWidth: 880, margin: '0 auto' }}>
          <PageHeader
            level="h2"
            title="Configurar organização"
            description="Personalize os parâmetros para obtermos grupos de benchmarking coerentes de forma anônima."
          />

          <div style={{ maxWidth: 420, margin: '0 auto 40px' }}>
            <Steps steps={['Natureza jurídica', 'Local e setor', 'Porte e privacidade']} current={step} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step-1" {...slideProps}>
                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="mg-h4" style={{ textAlign: 'center', width: '100%', marginBottom: 20 }}>
                    Qual é a natureza jurídica ou esfera da instituição?
                  </legend>
                  <RadioGroup label="Natureza jurídica" columns={['repeat(3,1fr)', 'repeat(3,1fr)', 'repeat(2,1fr)']}>
                    {NATUREZAS.map((card) => (
                      <OptionCard
                        key={card.id}
                        checked={natureza === card.id}
                        onSelect={() => setNatureza(card.id)}
                        icon={card.icon}
                        title={card.id}
                        description={card.desc}
                      />
                    ))}
                  </RadioGroup>
                </fieldset>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" {...slideProps} className="mg-stack" style={{ gap: 32 }}>
                <div className="mg-stack" style={{ gap: 16 }}>
                  <div className="mg-row mg-nowrap" style={{ justifyContent: 'space-between' }}>
                    <h3 className="mg-h4">1. Selecione o estado (UF) de atuação principal</h3>
                    <Segmented<'map' | 'grid'>
                      label="Modo de seleção do estado"
                      value={viewMode}
                      onChange={(v) => setViewMode(v)}
                      options={[
                        { value: 'map', label: 'Mapa dinâmico', icon: MapIcon },
                        { value: 'grid', label: 'Grade rápida', icon: LayoutGrid },
                      ]}
                    />
                  </div>

                  <Card flush style={{ padding: 16 }}>
                    {estado ? (
                      <p className="mg-small">
                        <strong>{selectedState ? `${selectedState.name} (${selectedState.uf})` : estado}</strong>
                        {selectedState && ` · Região ${selectedState.region}`}
                      </p>
                    ) : (
                      <p className="mg-small mg-muted">Nenhum estado selecionado. Clique no mapa ou na grade para marcar seu estado.</p>
                    )}
                  </Card>

                  {viewMode === 'map' ? (
                    <div style={{ maxWidth: 560, margin: '0 auto' }}>
                      <BrazilMap onSelectState={(uf) => setEstado(uf)} selectedState={estado} showHeatmap={false} />
                    </div>
                  ) : (
                    <RadioGroup label="Estado (UF)" columns={['repeat(9,1fr)', 'repeat(9,1fr)', 'repeat(5,1fr)']}>
                      {UFS.map((uf) => (
                        <OptionCard key={uf} centered checked={estado === uf} onSelect={() => setEstado(uf)} title={uf} />
                      ))}
                    </RadioGroup>
                  )}
                </div>

                <div className="mg-stack" style={{ gap: 16, borderTop: '1px solid var(--surface-deep)', paddingTop: 32 }}>
                  <h3 className="mg-h4" style={{ textAlign: 'center' }}>2. Selecione o setor de atividade econômica</h3>
                  <div className="mg-row" style={{ flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {SETORES.map((sec) => (
                      <Pill key={sec} pressed={setor === sec} onClick={() => setSetor(sec)}>{sec}</Pill>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" {...slideProps} className="mg-stack" style={{ gap: 32 }}>
                <div className="mg-stack" style={{ gap: 16 }}>
                  <h3 className="mg-h4" style={{ textAlign: 'center' }}>
                    Selecione o porte aproximado da organização (quantidade de colaboradores)
                  </h3>
                  <RadioGroup label="Porte" columns={['repeat(4,1fr)', 'repeat(4,1fr)', 'repeat(2,1fr)']}>
                    {PORTES.map((item) => (
                      <OptionCard key={item.id} centered checked={porte === item.id} onSelect={() => setPorte(item.id)} title={item.label} />
                    ))}
                  </RadioGroup>
                </div>

                <Card style={{ maxWidth: 560, margin: '0 auto' }}>
                  <CardHeader title={<span className="mg-row" style={{ gap: 8 }}><ShieldAlert className="mg-ico" aria-hidden="true" />Compromisso anônimo de privacidade</span>} />
                  <CardBody>
                    <p className="mg-small mg-muted">
                      Garantimos total integridade de seus dados confidenciais de negócio. Não há dados sensíveis persistidos.
                    </p>
                    <div className="mg-row" style={{ gap: 24, marginTop: 16, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p className="mg-label" style={{ color: 'var(--status-good-text)' }}>Dados gravados</p>
                        <ul className="mg-small" style={{ marginTop: 8, paddingLeft: 18 }}>
                          <li>Natureza do órgão</li>
                          <li>Estado federativo (UF)</li>
                          <li>Setor econômico</li>
                          <li>Porte da organização</li>
                        </ul>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="mg-label mg-muted">Nunca solicitado</p>
                        <ul className="mg-small mg-muted" style={{ marginTop: 8, paddingLeft: 18, textDecoration: 'line-through' }}>
                          <li>E-mail corporativo</li>
                          <li>Nomes de projetos</li>
                          <li>Chaves de sistemas</li>
                          <li>Código CNPJ</li>
                        </ul>
                      </div>
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <Checkbox checked={termosAceitos} onChange={(e) => setTermosAceitos(e.target.checked)}>
                        Entendo e aceito que os dados inseridos serão utilizados de forma anônima e agregada para traçar o Painel Nacional de Maturidade em IA brasileiro.
                      </Checkbox>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <ActionBar>
            <Button variant="ghost" icon={ArrowLeft} onClick={handlePrev}>Voltar</Button>
            <Button variant="primary" iconRight={ArrowRight} onClick={handleNext} disabled={!isStepValid()}>
              {step === 3 ? 'Gerar código e iniciar' : 'Continuar'}
            </Button>
          </ActionBar>
        </Card>
      </Page>
    </DsRoot>
  );
}
