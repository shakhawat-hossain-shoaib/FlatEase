export type UserRole = 'admin' | 'tenant';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

const AUTH_USER_KEY = 'flatease.auth.user';

export const setStoredAuthUser = (user: AuthUser) => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearStoredAuthUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getStoredAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;

    if (!parsed || (parsed.role !== 'admin' && parsed.role !== 'tenant')) {
      clearStoredAuthUser();
      return null;
    }

    return {
      id: Number(parsed.id),
      name: String(parsed.name ?? ''),
      email: String(parsed.email ?? ''),
      role: parsed.role,
    };
  } catch {
    clearStoredAuthUser();
    return null;
  }
};

export const getDefaultPathForRole = (role: UserRole): '/admin' | '/tenant' => {
  return role === 'admin' ? '/admin' : '/tenant';
};
