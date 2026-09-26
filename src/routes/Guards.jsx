import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState } from '../components/ui/States';
import { NAV_ITEMS } from '../components/layout/navigation';

/** Sends signed-out users to the login page and remembers where they were going. */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Loading…" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Shows a friendly message when the role has no access (the backend enforces this too). */
export function RequireModule({ module, level = 'READ', children }) {
  const { can } = useAuth();
  if (can(module, level)) return children;
  return (
    <EmptyState
      icon={ShieldAlert}
      title="You don't have access to this page"
      message="Ask your administrator if you need access."
    />
  );
}

/** Home: dashboard if allowed, otherwise the first module this role can open. */
export function HomeRedirect({ children }) {
  const { can } = useAuth();
  if (can('DASHBOARD')) return children;
  const first = NAV_ITEMS.find((item) => can(item.module));
  return first ? <Navigate to={first.to} replace /> : <RequireModule module="DASHBOARD" />;
}

/** Shows the page only when the role has at least one of the actions (Settings -> Permissions). */
export function RequireAction({ actions, children }) {
  const { canDo } = useAuth();
  if (actions.some(canDo)) return children;
  return <EmptyState icon={ShieldAlert} title="You don't have access to prescriptions" message="Ask your administrator if you need access." />;
}
