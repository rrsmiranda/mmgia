import { useState } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  if (!adminEmail) {
    return <AdminLogin onSuccessLogin={(email) => setAdminEmail(email)} />;
  }

  return (
    <AdminDashboard
      adminEmail={adminEmail}
      onLogout={() => setAdminEmail(null)}
    />
  );
}
