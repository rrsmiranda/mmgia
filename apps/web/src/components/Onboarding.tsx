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
  HeartHandshake,
  Info,
  Landmark,
  Layers,
  LayoutGrid,
  Map as MapIcon,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { AssessmentMetadata } from '@mmgia/shared/types';
import {
  Area,
  AreaPrivada,
  AreaPublica,
  AreaTerceiro,
  AREAS_PRIVADAS,
  AREAS_TERCEIRO,
  areasPublicasPara,
  classificacaoValida,
  Esfera,
  ESFERAS,
  RelacaoIA,
  RELACOES_IA,
  Setor,
  SETORES,
} from '@mmgia/shared/taxonomy';
import {
  ActionBar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  DsRoot,
  OptionCard,
  OptionList,
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

const SETOR_ICONS: Record<Setor, LucideIcon> = {
  publico: Landmark,
  privado: Briefcase,
  terceiro: HeartHandshake,
  outro: Layers,
};

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
  const [setor, setSetor] = useState<Setor | ''>('');
  const [esfera, setEsfera] = useState<Esfera | undefined>(undefined);
  const [area, setArea] = useState<Area | undefined>(undefined);
  const [atividadeEstatal, setAtividadeEstatal] = useState<AreaPrivada | undefined>(undefined);
  const [relacaoIA, setRelacaoIA] = useState<RelacaoIA | undefined>(undefined);
  const [estado, setEstado] = useState('');
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

  const handleSelectSetor = (id: Setor) => {
    setSetor(id);
    setEsfera(undefined);
    setArea(undefined);
    setAtividadeEstatal(undefined);
  };

  const handleSelectEsfera = (id: Esfera) => {
    setEsfera(id);
    const permitido = areasPublicasPara(id).map((a) => a.id) as string[];
    if (area && !permitido.includes(area)) {
      setArea(undefined);
      setAtividadeEstatal(undefined);
    }
  };

  const handleSelectAreaPublica = (id: AreaPublica) => {
    setArea(id);
    if (id !== 'estatal') setAtividadeEstatal(undefined);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(setor === 'outro' ? 3 : 2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (step === 2) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (step === 3) {
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const code = generateUniqueCode();
    onComplete({
      taxonomiaVersao: 2,
      setor,
      ...(setor === 'publico' && esfera ? { esfera } : {}),
      ...(area ? { area } : {}),
      ...(area === 'estatal' && atividadeEstatal ? { atividadeEstatal } : {}),
      ...(relacaoIA ? { relacaoIA } : {}),
      estado,
      porte,
      termosAceitos,
      code,
    });
  };

  const handlePrev = () => {
    if (step === 1) {
      onCancel();
      return;
    }
    if (step === 4) {
      setStep(3);
    } else if (step === 3 && setor === 'outro') {
      setStep(1);
    } else {
      setStep(step - 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStepValid = () => {
    if (step === 1) return setor !== '';
    if (step === 2) return classificacaoValida({ setor, esfera, area, atividadeEstatal });
    if (step === 3) return estado !== '' && porte !== '';
    if (step === 4) return relacaoIA !== undefined && termosAceitos;
    return false;
  };

  const selectedState = STATE_INFO.find((s) => s.uf === estado);
  const setorInfo = SETORES.find((s) => s.id === setor);
  const SetorIcon = setorInfo ? SETOR_ICONS[setorInfo.id] : undefined;
  const esferaLabel = esfera ? ESFERAS.find((e) => e.id === esfera)?.label : undefined;
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
            <Steps steps={['Setor', 'Área de atuação', 'Local e porte', 'IA e privacidade']} current={step} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step-1" {...slideProps}>
                <p className="mg-eyebrow">Etapa 1 de 4</p>
                <h3 className="mg-h4" style={{ marginTop: 4 }}>A organização é do…</h3>
                <p className="mg-small mg-muted" style={{ marginTop: 4, marginBottom: 20 }}>
                  Escolha o setor. Na próxima etapa você indica a área de atuação.
                </p>
                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <RadioGroup label="Setor" columns={['repeat(2,1fr)', 'repeat(2,1fr)', '1fr']}>
                    {SETORES.map((s) => (
                      <OptionCard
                        key={s.id}
                        checked={setor === s.id}
                        onSelect={() => handleSelectSetor(s.id)}
                        icon={SETOR_ICONS[s.id]}
                        title={s.label}
                        description={s.desc}
                      />
                    ))}
                  </RadioGroup>
                </fieldset>

                <details className="mg-hint">
                  <summary><Info className="mg-ico mg-ico-sm" aria-hidden="true" />Em dúvida? Veja casos comuns</summary>
                  <div className="mg-stack" style={{ gap: 8 }}>
                    <p className="mg-small"><strong>Universidade federal, hospital municipal, tribunal:</strong> Setor público.</p>
                    <p className="mg-small"><strong>Caixa, Serpro, Correios:</strong> Setor público (empresa estatal).</p>
                    <p className="mg-small"><strong>Faculdade ou hospital particular, fintech:</strong> Setor privado.</p>
                    <p className="mg-small"><strong>Santa Casa, universidade comunitária, sindicato:</strong> Terceiro setor.</p>
                  </div>
                </details>
              </motion.div>
            )}

            {step === 2 && setor !== '' && setor !== 'outro' && (
              <motion.div key="step-2" {...slideProps} className="mg-stack" style={{ gap: 24 }}>
                <div>
                  <p className="mg-eyebrow">Etapa 2 de 4</p>
                  <div className="mg-row mg-nowrap" style={{ gap: 12, marginTop: 4, marginBottom: 12 }}>
                    <span className="mg-row" style={{ gap: 6, padding: '6px 12px', border: '1px solid var(--surface-deep)', borderRadius: 'var(--radius-pill)', fontSize: 'var(--font-size-scale-down-01)', fontWeight: 600 }}>
                      {SetorIcon && <SetorIcon className="mg-ico mg-ico-sm" aria-hidden="true" />}
                      {setorInfo?.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{ background: 'none', border: 0, padding: 0, color: 'var(--brand)', fontWeight: 600, fontSize: 'var(--font-size-scale-down-01)', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Alterar setor
                    </button>
                  </div>
                  <h3 className="mg-h4">
                    {setor === 'publico' && 'Qual é a esfera e a área da organização?'}
                    {setor === 'privado' && 'Qual é a área de atuação da empresa?'}
                    {setor === 'terceiro' && 'Qual é a área de atuação da organização?'}
                  </h3>
                </div>

                {setor === 'publico' && (
                  <>
                    <div className="mg-stack" style={{ gap: 12 }}>
                      <p className="mg-label">Esfera</p>
                      <RadioGroup label="Esfera" columns={['repeat(3,1fr)', 'repeat(3,1fr)', '1fr']}>
                        {ESFERAS.map((e) => (
                          <OptionCard key={e.id} centered checked={esfera === e.id} onSelect={() => handleSelectEsfera(e.id)} title={e.label} description={e.desc} />
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="mg-stack" style={{ gap: 8 }}>
                      <div>
                        <p className="mg-label">Área principal</p>
                        <p className="mg-small mg-muted">{esfera ? `Exemplos da esfera ${esferaLabel?.toLowerCase()}.` : 'Selecione a esfera para ver as áreas disponíveis.'}</p>
                      </div>
                      <div aria-disabled={!esfera} style={{ opacity: esfera ? 1 : 0.5, pointerEvents: esfera ? 'auto' : 'none' }}>
                        <OptionList
                          label="Área principal"
                          footer={area === 'estatal' ? (
                            <div className="mg-stack" style={{ gap: 8 }}>
                              <p className="mg-label" style={{ margin: 0 }}>Atividade principal da empresa</p>
                              <div className="mg-row" style={{ flexWrap: 'wrap', gap: 8 }} role="radiogroup" aria-label="Atividade principal da empresa">
                                {AREAS_PRIVADAS.map((a) => (
                                  <Pill key={a.id} pressed={atividadeEstatal === a.id} onClick={() => setAtividadeEstatal(a.id)}>{a.label}</Pill>
                                ))}
                              </div>
                            </div>
                          ) : undefined}
                        >
                          {esfera && areasPublicasPara(esfera).map((a) => (
                            <OptionCard
                              key={a.id}
                              row
                              disabled={!esfera}
                              checked={area === a.id}
                              onSelect={() => handleSelectAreaPublica(a.id)}
                              title={a.label}
                              description={a.ex[esfera]}
                            />
                          ))}
                        </OptionList>
                      </div>
                      {esfera === 'municipal' && (
                        <p className="mg-small mg-muted">No nível municipal, Justiça não aparece: o município não tem Poder Judiciário.</p>
                      )}
                    </div>
                  </>
                )}

                {setor === 'privado' && (
                  <RadioGroup label="Área de atuação" columns={['repeat(3,1fr)', 'repeat(2,1fr)', '1fr']}>
                    {AREAS_PRIVADAS.map((a) => (
                      <OptionCard key={a.id} checked={area === a.id} onSelect={() => setArea(a.id)} title={a.label} description={a.desc} />
                    ))}
                  </RadioGroup>
                )}

                {setor === 'terceiro' && (
                  <RadioGroup label="Área de atuação" columns={['repeat(2,1fr)', 'repeat(2,1fr)', '1fr']}>
                    {AREAS_TERCEIRO.map((a) => (
                      <OptionCard key={a.id} checked={area === a.id} onSelect={() => setArea(a.id)} title={a.label} description={a.desc} />
                    ))}
                  </RadioGroup>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" {...slideProps} className="mg-stack" style={{ gap: 32 }}>
                <div>
                  <p className="mg-eyebrow">Etapa 3 de 4</p>
                  <h3 className="mg-h4" style={{ marginTop: 4 }}>Onde a organização atua e qual é o porte?</h3>
                </div>

                <div className="mg-grid" style={{ ['--cols-d' as string]: '1fr 280px', ['--cols-t' as string]: '1fr', ['--cols-m' as string]: '1fr', gap: 24, alignItems: 'start' }}>
                  <div className="mg-stack" style={{ gap: 16 }}>
                    <div className="mg-row mg-nowrap" style={{ justifyContent: 'space-between' }}>
                      <h4 className="mg-title">Estado (UF) de atuação principal</h4>
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
                      <BrazilMap onSelectState={(uf) => setEstado(uf)} selectedState={estado} showHeatmap={false} theme="light" />
                    ) : (
                      <RadioGroup label="Estado (UF)" columns={['repeat(9,1fr)', 'repeat(9,1fr)', 'repeat(5,1fr)']}>
                        {UFS.map((uf) => (
                          <OptionCard key={uf} centered checked={estado === uf} onSelect={() => setEstado(uf)} title={uf} />
                        ))}
                      </RadioGroup>
                    )}
                  </div>

                  <div className="mg-stack" style={{ gap: 16 }}>
                    <div>
                      <h4 className="mg-title">Porte aproximado</h4>
                      <p className="mg-small mg-muted">Quantidade de colaboradores.</p>
                    </div>
                    <RadioGroup label="Porte" columns={['1fr', '1fr', '1fr']}>
                      {PORTES.map((item) => (
                        <OptionCard key={item.id} checked={porte === item.id} onSelect={() => setPorte(item.id)} title={item.label} />
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4" {...slideProps} className="mg-stack" style={{ gap: 32 }}>
                <div>
                  <p className="mg-eyebrow">Etapa 4 de 4</p>
                  <h3 className="mg-h4" style={{ marginTop: 4 }}>Relação com IA e compromisso de privacidade</h3>
                </div>

                <div className="mg-stack" style={{ gap: 16 }}>
                  <div>
                    <h3 className="mg-h4" style={{ textAlign: 'center' }}>Relação da organização com IA</h3>
                    <p className="mg-small mg-muted" style={{ textAlign: 'center' }}>Ajuda a interpretar os resultados no painel nacional.</p>
                  </div>
                  <RadioGroup label="Relação com IA" columns={['repeat(3,1fr)', 'repeat(3,1fr)', '1fr']}>
                    {RELACOES_IA.map((r) => (
                      <OptionCard key={r.id} checked={relacaoIA === r.id} onSelect={() => setRelacaoIA(r.id)} title={r.label} description={r.desc} />
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
                          <li>Setor, esfera e área de atuação</li>
                          <li>Estado federativo (UF)</li>
                          <li>Porte e relação com IA</li>
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
              {step === 4 ? 'Gerar código e iniciar' : 'Continuar'}
            </Button>
          </ActionBar>
        </Card>
      </Page>
    </DsRoot>
  );
}
