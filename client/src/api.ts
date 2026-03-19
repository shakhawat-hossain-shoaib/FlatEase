// /client/src/api.ts
import axios from 'axios';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Automatically attach the token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            window.dispatchEvent(new Event('auth:unauthorized'));

            const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
            if (!isAuthPage) {
                window.location.assign('/login');
            }
        }

        return Promise.reject(error);
    }
);

export const authStorageKeys = {
    token: TOKEN_KEY,
    user: USER_KEY,
};

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'tenant';
};

export type AuthResponse = {
    access_token: string;
    token_type: 'bearer';
    expires_in: number;
    user: AuthUser;
};

export const persistAuth = (token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const readStoredUser = (): AuthUser | null => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
        return null;
    }

    try {
        return JSON.parse(stored) as AuthUser;
    } catch {
        return null;
    }
};

export const readStoredToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export default api;