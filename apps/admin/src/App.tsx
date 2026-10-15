import { lazy, Suspense, useEffect, useState } from 'react';
import AdminLogin from './components/AdminLogin';
import { restoreAdminSession, signOutAdmin, type AdminProfile } from '@mmgia/shared/adminApi';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

export default function App() {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Restaura a sessão ao recarregar a página — sem isso, todo F5 forçaria um novo login.
  useEffect(() => {
    restoreAdminSession().then((profile) => {
      setAdminProfile(profile);
      setCheckingSession(false);
    });
  }, []);

  if (checkingSession) {
    return <main className="mg-page" style={{ paddingBlock: 48 }} aria-live="polite">Carregando…</main>;
  }

  if (!adminProfile) {
    return <AdminLogin onSuccessLogin={(profile) => setAdminProfile(profile)} />;
  }

  return (
    <Suspense fallback={<main className="mg-page" style={{ paddingBlock: 48 }} aria-live="polite">Carregando…</main>}>
      <AdminDashboard
        adminProfile={adminProfile}
        onLogout={() => {
          signOutAdmin();
          setAdminProfile(null);
        }}
      />
    </Suspense>
  );
}
