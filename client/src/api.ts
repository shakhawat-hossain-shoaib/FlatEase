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

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: secrets.backendEndpoint,
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }
      const response = await this.client.post('/api/session', { name, duration, username, password });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateSession(session_id: number, active: boolean, username: string, password: string) {
    try {
      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }

      const response = await this.client.put('/api/session', { session_id, active, username, password });
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
      if (!username || !password) {
        toast.error('Credentials are required');
        return;
      }
      const response = await this.client.post('/api/sessions', { username, password });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(name: string, email: string, password: string, password_confirmation: string) {
    try {
      const response = await this.client.post('/register', {
        name,
        email,
        password,
        password_confirmation,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse | undefined> {
    try {
      const response = await this.client.post('/login', {
        email,
        password,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async logout(): Promise<BasicApiResponse | undefined> {
    try {
      const response = await this.client.post('/logout');
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
