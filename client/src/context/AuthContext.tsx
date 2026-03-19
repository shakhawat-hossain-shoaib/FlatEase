import { useEffect, useMemo, useState } from 'react';
import { AuthUser, clearAuth, persistAuth, readStoredToken, readStoredUser } from '../api';
import { AuthContext, AuthContextValue } from './AuthContextObject';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
      clearAuth();
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', onUnauthorized);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login: (payload) => {
        persistAuth(payload.access_token, payload.user);
        setToken(payload.access_token);
        setUser(payload.user);
      },
      logout: () => {
        clearAuth();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}