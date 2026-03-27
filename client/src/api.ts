import axios, { AxiosInstance } from 'axios';
import { secrets } from './secrets';
import toast from 'react-hot-toast';

export type LoginResponse = {
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'tenant';
  };
  redirectPath: '/admin' | '/tenant';
};

export type BasicApiResponse = {
  success: boolean;
  message: string;
};

export type AdminCreateUserResponse = {
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'tenant';
  };
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: secrets.backendEndpoint,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async ensureCsrfCookie() {
    await this.client.get('/sanctum/csrf-cookie');
  }

  private getCookieValue(name: string): string | undefined {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const prefix = `${name}=`;
    const raw = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(prefix));

    if (!raw) {
      return undefined;
    }

    return decodeURIComponent(raw.slice(prefix.length));
  }

  private async csrfHeaders() {
    await this.ensureCsrfCookie();
    const token = this.getCookieValue('XSRF-TOKEN');

    return token
      ? {
          'X-XSRF-TOKEN': token,
        }
      : undefined;
  }

  // currently, only fetches 1 session greater than current time
  async getSession() {
    try {
      const response = await this.client.get('/api/session');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createSession(name: string, duration: number, username: string, password: string) {
    try {
      const headers = await this.csrfHeaders();

      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }
      const response = await this.client.post('/api/session', { name, duration, username, password }, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateSession(session_id: number, active: boolean, username: string, password: string) {
    try {
      const headers = await this.csrfHeaders();

      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }

      const response = await this.client.put('/api/session', { session_id, active, username, password }, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async submitAttendance(roll: number) {
    try {
      const response = await this.client.post('/api/attendance', { roll });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async viewSessions(username: string, password: string) {
    try {
      const headers = await this.csrfHeaders();

      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }
      const response = await this.client.post('/api/sessions', { username, password }, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(name: string, email: string, password: string, password_confirmation: string) {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/register', {
        name,
        email,
        password,
        password_confirmation,
      }, { headers });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/login', {
        email,
        password,
      }, { headers });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async logout(): Promise<BasicApiResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/logout', {}, { headers });
      return response.data;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;

      // Logout should be idempotent from the UI perspective.
      // If the backend session is already gone, avoid showing a noisy toast.
      if (status === 401 || status === 419) {
        return {
          success: true,
          message: 'Already logged out.',
        };
      }

      this.handleError(error);
      return undefined;
    }
  }

  async createAdminUser(
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    role: 'admin' | 'tenant'
  ): Promise<AdminCreateUserResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/api/admin/users', {
        name,
        email,
        password,
        password_confirmation,
        role,
      }, { headers });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  // Handle common errors
  handleError(error: any) {
    let toastMessage = 'Something went wrong';

    if (error.response) {
      // Server responded with a status other than 2xx
      const status = error.response.status;
      const data = error.response.data ?? {};
      const errorGroups = data.errors ? Object.values(data.errors) : [];
      const firstValidationMessage =
        Array.isArray(errorGroups) && errorGroups.length > 0 && Array.isArray(errorGroups[0])
          ? String(errorGroups[0][0])
          : undefined;

      toastMessage = firstValidationMessage || data.message || `Request failed with status code ${status}`;
      console.error(`API Error: ${status} - ${toastMessage}`);
    } else if (error.request) {
      // Request was made, but no response was received
      console.error('API Error: No response received', error.request);
      toastMessage = 'No response from server. Check backend and database are running.';
    } else {
      // Something went wrong while setting up the request
      console.error('API Error:', error.message);
      toastMessage = error.message || toastMessage;
    }

    toast.error(toastMessage);
  }
}

export default ApiClient;
