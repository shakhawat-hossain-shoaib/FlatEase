// https://vite.dev/guide/env-and-mode.html

const isLoopbackHost = (host: string) => host === 'localhost' || host === '127.0.0.1';

const normalizeBackendBasePath = (endpoint: string): string => {
  try {
    const url = new URL(endpoint);

    // ApiClient methods already prepend "/api" where needed.
    // Keep the configured base URL at origin-level to avoid "/api/api" and broken auth paths like "/api/login".
    if (url.pathname === '/api' || url.pathname === '/api/') {
      url.pathname = '/';
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return endpoint.replace(/\/$/, '');
  }
};

const normalizeLoopbackEndpoint = (endpoint: string): string => {
  if (typeof window === 'undefined') {
    return normalizeBackendBasePath(endpoint);
  }

  try {
    const url = new URL(endpoint);
    const frontendHost = window.location.hostname;

    // Keep CSRF/session cookies first-party when frontend and backend are both local loopback.
    if (isLoopbackHost(url.hostname) && isLoopbackHost(frontendHost) && url.hostname !== frontendHost) {
      url.hostname = frontendHost;
      return normalizeBackendBasePath(url.toString());
    }

    return normalizeBackendBasePath(endpoint);
  } catch {
    return normalizeBackendBasePath(endpoint);
  }
};

const defaultBackendEndpoint =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'http://127.0.0.1:8000';

const configuredBackendEndpoint =
  (import.meta.env.VITE_BACKEND_ENDPOINT as string | undefined)?.trim() || defaultBackendEndpoint;

export const secrets = {
  backendEndpoint: normalizeLoopbackEndpoint(configuredBackendEndpoint),
};
