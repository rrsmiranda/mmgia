/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { requestAdminPasswordReset, signInAdmin, type AdminProfile } from '@mmgia/shared/adminApi';
import { Banner, Button, Card, DsRoot, Field, Input, Page } from '@mmgia/shared/design-system';

interface AdminLoginProps {
  onSuccessLogin: (profile: AdminProfile) => void;
  onCancel?: () => void;
}

export default function AdminLogin({ onSuccessLogin, onCancel }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    setErrorText('');
    setSuccessText('');
    if (!email) {
      setErrorText('Digite seu e-mail funcional no campo acima para receber o link de redefinição.');
      return;
    }
    const ok = await requestAdminPasswordReset(email);
    setSuccessText(ok
      ? 'Se este e-mail tiver uma conta ativa, enviamos um link de redefinição de senha.'
      : 'Não foi possível solicitar a redefinição agora. Tente novamente em instantes.');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    if (!email) {
      setErrorText('Por favor, digite seu e-mail funcional.');
      return;
    }
    if (!password) {
      setErrorText('Por favor, digite sua senha de acesso.');
      return;
    }

    setLoading(true);
    const result = await signInAdmin(email, password);
    setLoading(false);

    if ('error' in result) {
      setErrorText(result.error);
      return;
    }
    onSuccessLogin(result.profile);
  };

  return (
    <DsRoot>
      <main>
      <Page>
        <div style={{ maxWidth: 400, margin: '80px auto' }} id="admin-login-root">
          <Card large id="login-form-card" style={{ position: 'relative' }}>
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={onCancel}
                style={{ position: 'absolute', top: 16, left: 16 }}
              >
                Voltar
              </Button>
            )}

            <div style={{ textAlign: 'center', marginTop: onCancel ? 24 : 0, marginBottom: 32 }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--brand)', color: 'var(--on-brand)', fontWeight: 800, margin: '0 auto' }}>M</span>
              <h1 className="mg-h3" style={{ marginTop: 12 }}>
                MM<span style={{ color: 'var(--brand-accent)' }}>GIA</span> <span className="mg-code">admin</span>
              </h1>
              <p className="mg-code" style={{ marginTop: 4, textTransform: 'uppercase' }}>Área restrita administrativa</p>
            </div>

            <form onSubmit={handleSubmit} className="mg-stack" style={{ gap: 16 }} id="admin-login-form">
              <Field label="E-mail corporativo">
                {({ id }) => (
                  <Input id={id} type="email" required icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@orgao.gov.br" />
                )}
              </Field>

              <Field label="Senha privada" help={
                <button
                  type="button"
                  className="mg-small"
                  style={{ float: 'right', background: 'none', border: 0, padding: 0, color: 'var(--brand)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={handleForgotPassword}
                >
                  Esqueceu?
                </button>
              }>
                {({ id }) => (
                  <div style={{ position: 'relative' }}>
                    <Input id={id} type={showPassword ? 'text' : 'password'} required icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" style={{ paddingRight: 40 }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="mg-iconbtn"
                      style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="mg-ico mg-ico-sm" aria-hidden="true" /> : <Eye className="mg-ico mg-ico-sm" aria-hidden="true" />}
                    </button>
                  </div>
                )}
              </Field>

              {errorText && (
                <div id="login-error-log">
                  <Banner tone="critical" title="Não foi possível entrar">{errorText}</Banner>
                </div>
              )}

              {successText && (
                <div id="login-success-log">
                  <Banner tone="good" title="Verifique seu e-mail">{successText}</Banner>
                </div>
              )}

              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Autenticando...' : 'Entrar no painel admin'}
              </Button>
            </form>

            <div className="mg-row" style={{ gap: 8, justifyContent: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--surface-deep)' }}>
              <ShieldCheck className="mg-ico mg-ico-sm" aria-hidden="true" style={{ color: 'var(--status-good)' }} />
              <span className="mg-small mg-muted">Acesso restrito a administradores autorizados da plataforma.</span>
            </div>
          </Card>
        </div>
      </Page>
      </main>
    </DsRoot>
  );
}
