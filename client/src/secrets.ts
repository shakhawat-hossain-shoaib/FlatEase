// https://vite.dev/guide/env-and-mode.html

const isLoopbackHost = (host: string) => host === 'localhost' || host === '127.0.0.1';

const normalizeLoopbackEndpoint = (endpoint: string): string => {
  if (typeof window === 'undefined') {
    return endpoint;
  }

  try {
    const url = new URL(endpoint);
    const frontendHost = window.location.hostname;

    // Keep CSRF/session cookies first-party when frontend and backend are both local loopback.
    if (isLoopbackHost(url.hostname) && isLoopbackHost(frontendHost) && url.hostname !== frontendHost) {
      url.hostname = frontendHost;
      return url.toString().replace(/\/$/, '');
    }

    return endpoint;
  } catch {
    return endpoint;
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
