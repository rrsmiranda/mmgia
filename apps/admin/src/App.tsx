import { lazy, Suspense, useState } from 'react';
import AdminLogin from './components/AdminLogin';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

export default function App() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  if (!adminEmail) {
    return <AdminLogin onSuccessLogin={(email) => setAdminEmail(email)} />;
  }

  return (
    <Suspense fallback={<main className="mg-page" style={{ paddingBlock: 48 }} aria-live="polite">Carregando…</main>}>
      <AdminDashboard
        adminEmail={adminEmail}
        onLogout={() => setAdminEmail(null)}
      />
    </Suspense>
  );
}
