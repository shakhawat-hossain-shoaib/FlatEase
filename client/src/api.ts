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
    role: 'admin' | 'tenant' | 'technician';
  };
  redirectPath: '/admin' | '/tenant' | '/technician';
};

export type OtpChallengePurpose = 'registration_verification' | 'password_reset';

export type OtpChallengeResponse = {
  success: boolean;
  status: string;
  message: string;
  challenge_token?: string;
  purpose?: OtpChallengePurpose;
  channel?: 'email' | 'sms';
  masked_destination?: string;
  expires_in_seconds?: number;
  resend_available_in_seconds?: number;
  attempts_remaining?: number;
  verification_required?: boolean;
  locked_until?: string;
  retry_after_seconds?: number;
  user?: UserEntity;
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
    role: 'admin' | 'tenant' | 'technician';
  };
};

export type ComplaintStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved';
export type ComplaintPriority = 'low' | 'medium' | 'high';

export type TechnicianEntity = {
  id: number;
  user_id: number;
  name: string;
  phone?: string | null;
  email: string;
  specialization: string;
  active: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: 'technician';
  };
};

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
  technicians?: TechnicianEntity[];
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

export type ComplaintSummary = {
  total: number;
  pending: number;
  assigned?: number;
  in_progress: number;
  resolved: number;
  high_priority: number;
};

export type TenantProfileEntity = {
  id: number;
  user_id: number;
  phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
};

export type UserEntity = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'tenant' | 'technician';
};

export type UnitAssignmentEntity = {
  id: number;
  unit_id: number;
  tenant_user_id: number;
  status: 'active' | 'ended' | 'terminated' | 'pending_move_in';
  lease_start_date?: string | null;
  lease_end_date?: string | null;
  rent_amount?: string | null;
  tenant?: {
    id: number;
    name: string;
    email: string;
    tenant_profile?: TenantProfileEntity;
    tenantProfile?: TenantProfileEntity;
  };
};

export type UnitEntity = {
  id: number;
  building_id: number;
  floor_id: number;
  unit_number: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqft?: number | null;
  occupancy_status: 'vacant' | 'occupied' | 'blocked';
  active_assignment?: UnitAssignmentEntity | null;
  activeAssignment?: UnitAssignmentEntity | null;
};

export type FloorEntity = {
  id: number;
  building_id: number;
  floor_number: number;
  floor_label: string;
  sort_order: number;
  units: UnitEntity[];
};

export type BuildingEntity = {
  id: number;
  name: string;
  code?: string | null;
  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  total_floors: number;
  units_count?: number;
  occupied_units_count?: number;
  vacant_units_count?: number;
  floors?: FloorEntity[];
};

export type CreateBuildingPayload = {
  name: string;
  code?: string;
  address_line?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  total_floors: number;
  units_per_floor: number;
};

export type UpdateBuildingPayload = {
  name: string;
  code?: string;
  address_line?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

export type DocumentTypeEntity = {
  id: number;
  type_key: 'nid' | 'personal_photo' | 'job_id_card' | string;
  label: string;
  is_sensitive?: boolean;
  admin_only_access?: boolean;
};

export type TenantDocumentEntity = {
  id: number;
  tenant_user_id: number;
  document_type_id: number;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  status: 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'expired';
  can_view?: boolean;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  document_type?: DocumentTypeEntity;
  documentType?: DocumentTypeEntity;
};

export type TenantDocumentChecklistItem = {
  document_type_id: number;
  type_key: string;
  label: string;
  is_required: boolean;
  is_sensitive?: boolean;
  admin_only_access?: boolean;
  max_size_mb: number;
  allowed_mimes: string[];
  uploaded: boolean;
  latest_document?: TenantDocumentEntity | null;
};

export type CreateTenantWithAssignmentResponse = {
  success: boolean;
  message: string;
  tenant: {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'tenant';
  };
  assignment: {
    id: number;
    unit_id: number;
    unit_number: string;
  };
};

export type TenantPaymentCharge = {
  key: string;
  label: string;
  category: 'rent' | 'utility';
  amount: number;
};

export type TenantRecentPayment = {
  id: number;
  month: string;
  due_date: string;
  amount: number;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
  paid_at?: string | null;
};

export type TenantNotice = {
  id: string;
  title: string;
  message: string;
  created_at?: string;
  read_at?: string | null;
  is_read: boolean;
};

export type AppNotificationEntity = {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    type?: string;
    title?: string;
    message?: string;
    created_at?: string;
  };
  read_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminTenantPaymentOption = {
  id: number;
  name: string;
  email: string;
  unit_number?: string | null;
  assignment_id: number;
};

export type TenantPaymentRecordEntity = {
  id: number;
  tenant_user_id: number;
  unit_tenant_assignment_id?: number | null;
  billing_month: string;
  due_date: string;
  rent_amount: string;
  utility_amount: string;
  total_amount: string;
  amount_paid: string;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
  paid_at?: string | null;
  payment_method?: string | null;
  transaction_ref?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type TenantMonthlyPaymentSummary = {
  month: string;
  currency: string;
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  next_payment?: {
    date: string;
    amount: number;
    status?: 'pending' | 'partially_paid' | 'paid' | 'overdue';
  };
  unit: {
    id: number;
    unit_number?: string | null;
    floor_label?: string | null;
    building_name?: string | null;
  };
  charges: TenantPaymentCharge[];
  subtotal_rent: number;
  subtotal_utility: number;
  total_due: number;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
  recent_payments?: TenantRecentPayment[];
  notice_count?: number;
  unread_notice_count?: number;
  notices?: TenantNotice[];
};

export type AdminDashboardStats = {
  total_tenants: number;
  active_leases: number;
  vacant_units: number;
  total_complaints: number;
};

export type AdminRevenueByBuilding = {
  building_id: number;
  building_name: string;
  active_leases: number;
  rent_expected: number;
  utility_expected: number;
  total_expected: number;
};

export type AdminDashboardActivity = {
  type: 'payment' | 'complaint';
  title: string;
  description: string;
  meta: string;
  created_at: string;
};

export type AdminDashboardSummary = {
  stats: AdminDashboardStats;
  revenue_overview: {
    currency: string;
    total_expected: number;
    by_building: AdminRevenueByBuilding[];
  };
  recent_activity: AdminDashboardActivity[];
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

  async register(
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    phone?: string,
    preferred_contact_method: 'email' | 'sms' = 'email'
  ): Promise<OtpChallengeResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/register', {
        name,
        email,
        phone,
        preferred_contact_method,
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

  async requestPasswordResetOtp(
    identifier: string,
    preferred_contact_method: 'email' | 'sms' = 'email'
  ): Promise<OtpChallengeResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/forgot-password', {
        identifier,
        preferred_contact_method,
      }, { headers });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async verifyOtp(challenge_token: string, otp: string): Promise<OtpChallengeResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/verify-otp', {
        challenge_token,
        otp,
      }, { headers });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async resendOtp(challenge_token: string): Promise<OtpChallengeResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/resend-otp', {
        challenge_token,
      }, { headers });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getOtpStatus(challenge_token: string): Promise<OtpChallengeResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.get('/otp-status', {
        params: { challenge_token },
        headers,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async resetPasswordWithOtp(payload: {
    challenge_token: string;
    otp: string;
    password: string;
    password_confirmation: string;
  }): Promise<OtpChallengeResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();

      const response = await this.client.post('/reset-password', payload, { headers });

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
    role: 'admin' | 'tenant' | 'technician'
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

  async getComplaints(role: 'Admin' | 'Tenant' | 'Technician'): Promise<PaginatedResponse<ComplaintEntity> | undefined> {
    try {
      const endpoint = role === 'Admin'
        ? '/api/admin/complaints'
        : role === 'Technician'
        ? '/api/technician/complaints'
        : '/api/complaints';
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
    payload: { technician_ids: number[]; sla_due_at?: string; reason?: string }
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

  async getAssignableTechnicians(): Promise<TechnicianEntity[] | undefined> {
    try {
      const response = await this.client.get('/api/admin/technicians');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async updateTechnicianComplaintStatus(
    complaintId: number,
    payload: { new_status: Extract<ComplaintStatus, 'in_progress' | 'resolved'>; reason?: string }
  ): Promise<ComplaintEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.patch(`/api/technician/complaints/${complaintId}/status`, payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async markComplaintResolvedByTenant(complaintId: number): Promise<ComplaintEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.patch(`/api/complaints/${complaintId}/resolve`, {}, { headers });
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

  async getNotifications(perPage = 10): Promise<PaginatedResponse<AppNotificationEntity> | undefined> {
    try {
      const response = await this.client.get('/api/notifications', {
        params: { per_page: perPage },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getAdminDashboardSummary(): Promise<AdminDashboardSummary | undefined> {
    try {
      const response = await this.client.get('/api/admin/dashboard/summary');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async createAdminBroadcastNotification(payload: {
    title: string;
    message: string;
  }): Promise<BasicApiResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.post('/api/admin/notifications/broadcast', payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getAdminBuildings(): Promise<BuildingEntity[] | undefined> {
    try {
      const response = await this.client.get('/api/admin/buildings');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getAdminBuilding(buildingId: number): Promise<BuildingEntity | undefined> {
    try {
      const response = await this.client.get(`/api/admin/buildings/${buildingId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async createAdminBuilding(payload: CreateBuildingPayload): Promise<BuildingEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.post('/api/admin/buildings', payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async deleteAdminBuilding(buildingId: number): Promise<BasicApiResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.delete(`/api/admin/buildings/${buildingId}`, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async updateAdminBuilding(buildingId: number, payload: UpdateBuildingPayload): Promise<BuildingEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.patch(`/api/admin/buildings/${buildingId}`, payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getAssignableTenants(): Promise<UserEntity[] | undefined> {
    try {
      const response = await this.client.get('/api/admin/users/assignable-tenants');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async assignTenantToUnit(unitId: number, tenantUserId: number): Promise<BasicApiResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.post(`/api/admin/units/${unitId}/assign`, 
        { tenant_user_id: tenantUserId }, 
        { headers }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async unassignTenantFromUnit(assignmentId: number): Promise<BasicApiResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.patch(`/api/admin/assignments/${assignmentId}/end`, {}, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async createTenantWithAssignment(data: {
    name: string;
    email: string;
    phone?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    nid_number?: string;
    job_title?: string;
    employer?: string;
    unit_id: number;
    lease_start_date?: string;
    lease_end_date?: string;
    rent_amount?: string;
  }): Promise<CreateTenantWithAssignmentResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.post('/api/admin/tenants/create-with-assignment', data, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getVacantUnits(buildingId: number): Promise<UnitEntity[] | undefined> {
    try {
      const response = await this.client.get(`/api/admin/buildings/${buildingId}/vacant-units`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getAdminTenantPaymentOptions(): Promise<AdminTenantPaymentOption[] | undefined> {
    try {
      const response = await this.client.get('/api/admin/tenants/payment-options');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getAdminTenantPayments(tenantId: number): Promise<PaginatedResponse<TenantPaymentRecordEntity> | undefined> {
    try {
      const response = await this.client.get(`/api/admin/tenants/${tenantId}/payments`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async updateAdminPayment(
    paymentId: number,
    payload: {
      amount_paid?: number;
      payment_method?: string;
      transaction_ref?: string;
      notes?: string;
      mark_paid?: boolean;
    }
  ): Promise<TenantPaymentRecordEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.patch(`/api/admin/payments/${paymentId}`, payload, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getTenantDocumentChecklist(): Promise<TenantDocumentChecklistItem[] | undefined> {
    try {
      const response = await this.client.get('/api/tenant/documents/checklist');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getTenantCurrentPaymentSummary(): Promise<TenantMonthlyPaymentSummary | undefined> {
    try {
      const response = await this.client.get('/api/tenant/payments/current-summary');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getTenantDocuments(): Promise<TenantDocumentEntity[] | undefined> {
    try {
      const response = await this.client.get('/api/tenant/documents');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async uploadTenantDocument(documentTypeId: number, file: File): Promise<TenantDocumentEntity | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const formData = new FormData();
      formData.append('document_type_id', String(documentTypeId));
      formData.append('file', file);

      const response = await this.client.post('/api/tenant/documents', formData, {
        headers: {
          ...(headers ?? {}),
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async deleteTenantDocument(documentId: number): Promise<BasicApiResponse | undefined> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.delete(`/api/tenant/documents/${documentId}`, { headers });
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async getAdminTenantDocuments(tenantId: number): Promise<TenantDocumentEntity[] | undefined> {
    try {
      const response = await this.client.get(`/api/admin/tenants/${tenantId}/documents`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async openTenantDocument(documentId: number): Promise<void> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.get(`/api/tenant/documents/${documentId}/download`, {
        responseType: 'blob',
        headers,
      });

      const blobUrl = window.URL.createObjectURL(response.data as Blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
      this.handleError(error);
    }
  }

  async openAdminDocument(documentId: number): Promise<void> {
    try {
      const headers = await this.csrfHeaders();
      const response = await this.client.get(`/api/admin/documents/${documentId}/download`, {
        responseType: 'blob',
        headers,
      });

      const blobUrl = window.URL.createObjectURL(response.data as Blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
      this.handleError(error);
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
