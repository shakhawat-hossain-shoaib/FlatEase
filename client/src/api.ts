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

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';
export type ComplaintPriority = 'low' | 'medium' | 'high';

export type ComplaintEntity = {
  id: number;
  tenant_id: number;
  assigned_technician_id: number | null;
  assigned_by_id?: number | null;
  assigned_at?: string | null;
  sla_due_at?: string | null;
  title: string;
  category: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  tenant?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  assigned_technician?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  assignedTechnician?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  status_histories?: Array<{
    id: number;
    old_status: ComplaintStatus | null;
    new_status: ComplaintStatus;
    changed_by_id: number;
    changed_at: string;
    reason?: string | null;
  }>;
  statusHistories?: Array<{
    id: number;
    old_status: ComplaintStatus | null;
    new_status: ComplaintStatus;
    changed_by_id: number;
    changed_at: string;
    reason?: string | null;
  }>;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

export type ComplaintCommentEntity = {
  id: number;
  complaint_id: number;
  user_id: number;
  comment: string;
  is_internal?: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export type AssignableUser = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'technician';
};

export type ComplaintSummary = {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  high_priority: number;
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
          'X-CSRF-TOKEN': token,
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

  async getComplaints(role: 'Admin' | 'Tenant'): Promise<PaginatedResponse<ComplaintEntity> | undefined> {
    try {
      const endpoint = role === 'Admin' ? '/api/admin/complaints' : '/api/complaints';
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async createComplaint(payload: {
    title: string;
    category: string;
    description: string;
    priority: ComplaintPriority;
  }): Promise<ComplaintEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.post('/api/complaints', payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async updateComplaintStatus(
    complaintId: number,
    payload: { new_status: ComplaintStatus; reason?: string }
  ): Promise<ComplaintEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.patch(`/api/admin/complaints/${complaintId}/status`, payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async assignComplaint(
    complaintId: number,
    payload: { assigned_technician_id: number; sla_due_at?: string; reason?: string }
  ): Promise<ComplaintEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.patch(`/api/admin/complaints/${complaintId}/assign`, payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getComplaintComments(complaintId: number): Promise<ComplaintCommentEntity[] | undefined> {
    try {
      const response = await this.client.get(`/api/complaints/${complaintId}/comments`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async addComplaintComment(
    complaintId: number,
    payload: { comment: string; is_internal?: boolean }
  ): Promise<ComplaintCommentEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.post(`/api/complaints/${complaintId}/comments`, payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getAssignableUsers(): Promise<AssignableUser[] | undefined> {
    try {
      const response = await this.client.get('/api/admin/users/assignable');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getComplaintSummary(): Promise<ComplaintSummary | undefined> {
    try {
      const response = await this.client.get('/api/admin/complaints/summary');
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

      if (status === 419) {
        toastMessage = 'CSRF token mismatch. Please refresh and sign in again.';
      } else {
        toastMessage = firstValidationMessage || data.message || `Request failed with status code ${status}`;
      }
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
