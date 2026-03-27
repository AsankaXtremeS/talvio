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
  firstName?: string | null;
  lastName?: string | null;
  preferences?: {
    locale?: string;
    theme?: string;
  } | null;
  permissions?: string[];
  employerProfile?: {
    companyName: string;
    verificationStatus: string;
    rejectionReason?: string | null;
  } | null;
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
    apiClient<{ user: SessionUser; accessToken?: string; refreshToken?: string }>('/api/auth/login', {
      method: 'POST',
      data,
    }),

  me: () =>
    apiClient<{ user: SessionUser }>('/api/auth/me', {
      method: 'GET',
    }),

  updateMyRole: (targetRole: 'PROFESSIONAL') =>
    apiClient<{ message: string; user: SessionUser }>('/api/auth/me/role', {
      method: 'PATCH',
      data: { targetRole },
    }),

  logout: async () => {
    try {
      await apiClient('/api/auth/logout', {
        method: 'POST',
        retryOnAuth: false,
      });
    } catch {
      // Client state is cleared by caller; logout should stay best-effort.
    }
  },

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
