import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/endpoints';
import { onSessionExpired } from '../api/client';

const AuthContext = createContext(null);
const LEVELS = { NONE: 0, READ: 1, WRITE: 2 };

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
    return onSessionExpired(() => setUser(null));
  }, []);

  const login = useCallback(async (credentials) => setUser(await authApi.login(credentials)), []);
  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    queryClient.clear();
    setUser(null);
  }, [queryClient]);
  const refresh = useCallback(() => authApi.me().then(setUser), []);

  /** can('PATIENT', 'WRITE') – mirrors the backend permission check. */
  const can = useCallback((module, level = 'READ') => {
    const granted = user?.permissions?.[module] || 'NONE';
    return LEVELS[granted] >= LEVELS[level];
  }, [user]);

  /** canDo('APPOINTMENT_COMPLETE') - individual actions allowed for the role (Settings -> Permissions). */
  const canDo = useCallback((action) => user?.role === 'ADMIN' || Boolean(user?.actions?.includes(action)), [user]);

  const value = useMemo(() => ({
    user, loading, login, logout, refresh, can, canDo, isAdmin: user?.role === 'ADMIN',
  }), [user, loading, login, logout, refresh, can, canDo]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
