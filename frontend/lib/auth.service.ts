import { apiClient } from './apiClient';
import axios from 'axios';

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
      data, // Axios uses `data` instead of `body`
    }),

  registerEmployer: (formData: FormData) =>
    axios.post('/api/auth/register-employer', formData, { withCredentials: true })
      .then(res => res.data)
      .catch(err => {
        const errorMessage = err.response?.data?.message || 'Registration failed';
        throw new Error(errorMessage);
      }),

  getOAuthSignupUrl: (provider: 'google' | 'linkedin', role: 'STUDENT' | 'PROFESSIONAL') =>
    `/api/auth/oauth/${provider}?role=${role}`,

  login: (data: { email: string; password: string }) =>
    apiClient<{ user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      data,
    }),

  logout: () =>
    apiClient('/api/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    apiClient('/api/auth/forgot-password', {
      method: 'POST',
      data: { email },
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient('/api/auth/reset-password', {
      method: 'POST',
      data: { token, newPassword },
    }),

  getPendingEmployers: () =>
    apiClient<PendingEmployer[]>('/api/auth/pending-employers', {
      method: 'GET',
    }),

  getEmployers: (status: 'pending' | 'approved' | 'rejected') =>
    apiClient<PendingEmployer[]>(`/api/auth/employers?status=${status}`, {
      method: 'GET',
    }),

  approveEmployer: (userId: string) =>
    apiClient('/api/auth/approve-employer', {
      method: 'POST',
      data: { userId },
    }),

  rejectEmployer: (userId: string, reason?: string) =>
    apiClient('/api/auth/reject-employer', {
      method: 'POST',
      data: { userId, reason },
    }),
};
