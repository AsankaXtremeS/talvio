import { apiClient } from './apiClient';

export interface EmployerProfile {
  companyName: string;
  registrationFileUrl: string;
  registrationFileName: string;
  verificationStatus: string;
  createdAt: string;
  rejectionReason?: string | null;
}

export interface PendingEmployer {
  id: string;
  email: string;
  createdAt: string;
  employerProfile: EmployerProfile;
}

export interface SessionUser {
  id: string;
  role: 'STUDENT' | 'PROFESSIONAL' | 'EMPLOYER' | 'ADMIN';
  email: string;
}

export const authService = {
  register: (data: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'STUDENT' | 'PROFESSIONAL';
  }) =>
    apiClient('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerEmployer: (formData: FormData) =>
    fetch('/api/auth/register-employer', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data?.message || 'Registration failed');
      return data;
    }),

  getOAuthSignupUrl: (provider: 'google' | 'linkedin', role: 'STUDENT' | 'PROFESSIONAL') =>
    `/api/auth/oauth/${provider}?role=${role}`,

  login: (data: { email: string; password: string }) =>
    apiClient<{ user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiClient('/api/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    apiClient('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  getPendingEmployers: (_accessToken?: string) =>
    apiClient<PendingEmployer[]>('/api/auth/pending-employers', {
      method: 'GET',
    }),

  getEmployers: (status: 'pending' | 'approved' | 'rejected', _accessToken?: string) =>
    apiClient<PendingEmployer[]>(`/api/auth/employers?status=${status}`, {
      method: 'GET',
    }),

  approveEmployer: (userId: string, _accessToken?: string) =>
    apiClient('/api/auth/approve-employer', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  rejectEmployer: (userId: string, _accessToken?: string, reason?: string) =>
    apiClient('/api/auth/reject-employer', {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    }),
};
