import { createContext } from 'react';
import type { AuthUser, AuthResponse } from '../api';

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: AuthResponse) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);