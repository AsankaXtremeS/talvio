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

export const getApplications = async (page: number = 1, limit: number = 10): Promise<PaginatedApplications> => {
  return apiClient<PaginatedApplications>(`/api/candidate/applications?page=${page}&limit=${limit}`);
};
