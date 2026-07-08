import { apiClient } from '@/lib/apiClient';

export interface EmployerProfileDTO {
  id: string;
  companyName: string;
  companyDescription: string | null;
  companyWebsite: string | null;
  companyLocation: string | null;
  companyLogoUrl: string | null;
  coverImageUrl: string | null;
  industry: string | null;
  companyType: string | null;
  companySize: string | null;
  foundedYear: number | null;
  specialties: string | null;
  linkedInUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  registrationFileUrl: string;
  registrationFileName: string;
  verificationStatus: string;
  rejectionReason: string | null;
  googleCalendarConnected: boolean;
  microsoftCalendarConnected: boolean;
  calendarProvider: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface UpdateProfilePayload {
  companyName?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLocation?: string;
  companyLogoUrl?: string;
  coverImageUrl?: string;
  industry?: string;
  companyType?: string;
  companySize?: string;
  foundedYear?: number | null;
  specialties?: string;
  linkedInUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
}

export const profileService = {
  getProfile: () =>
    apiClient<EmployerProfileDTO>('/api/employer/profile', { method: 'GET' }),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient<EmployerProfileDTO>('/api/employer/profile', {
      method: 'PATCH',
      data,
    }),

  getCalendarAuthUrl: (email: string) =>
    apiClient<{ url: string; provider: string }>('/api/employer/profile/calendar/auth-url', {
      method: 'GET',
      params: { email }
    }),

  connectCalendar: (code: string, provider: string) =>
    apiClient<EmployerProfileDTO>('/api/employer/profile/calendar/connect', {
      method: 'POST',
      data: { code, provider },
    }),

  disconnectCalendar: () =>
    apiClient<EmployerProfileDTO>('/api/employer/profile/calendar/disconnect', { method: 'POST' }),
};