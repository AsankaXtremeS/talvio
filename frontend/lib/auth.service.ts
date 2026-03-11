import { apiClient } from './apiClient';

export interface EmployerProfile {
  companyName: string;
  registrationFileUrl: string;
  registrationFileName: string;
  verificationStatus: string;
  createdAt: string;
}

export interface PendingEmployer {
  id: string;
  email: string;
  createdAt: string;
  employerProfile: EmployerProfile;
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

  login: (data: { email: string; password: string }) =>
    apiClient<{ accessToken: string }>('/api/auth/login', {
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

  getPendingEmployers: (accessToken: string) =>
    apiClient<PendingEmployer[]>('/api/auth/pending-employers', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  approveEmployer: (userId: string, accessToken: string) =>
    apiClient('/api/auth/approve-employer', {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  rejectEmployer: (userId: string, accessToken: string) =>
    apiClient('/api/auth/reject-employer', {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
