import { apiClient } from "../apiClient";

export interface CandidateApplication {
  id: string;
  appliedAt: string;
  applicationStatus: string;
  jobPost: {
    id: string;
    title: string;
    location: string;
    workMode: string;
    employmentType: string;
    employer: {
      companyName: string;
    };
  };
}

export interface PaginatedApplications {
  applications: CandidateApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApplicationStatusHistoryEntry {
  id: string;
  status: string;
  changedAt: string;
  note?: string | null;
}

export interface ApplicationWithHistory {
  id: string;
  appliedAt: string;
  applicationStatus: string;
  jobPost: {
    id: string;
    title: string;
    location: string;
    workMode: string;
    employmentType: string;
    createdAt: string;
    employer: {
      companyName: string;
    };
  };
  statusHistory: ApplicationStatusHistoryEntry[];
}

export const getApplications = async (page: number = 1, limit: number = 10): Promise<PaginatedApplications> => {
  return apiClient<PaginatedApplications>(`/api/candidate/applications?page=${page}&limit=${limit}`);
};

export const getApplicationWithHistory = async (applicationId: string): Promise<ApplicationWithHistory> => {
  const response = await apiClient<{ application: ApplicationWithHistory }>(`/api/candidate/applications/${applicationId}`);
  return response.application;
};
