import { apiClient } from "@/lib/apiClient";
import { CandidateInterviewDTO } from "@/components/candidate/interviews/types";

type InterviewStatusFilter = "SCHEDULED" | "DRAFT" | "CANCELLED" | "COMPLETED" | "ALL";

type CandidateInterviewsResponse = {
  data: CandidateInterviewDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const candidateInterviewsService = {
  async getInterviews(params?: {
    page?: number;
    limit?: number;
    status?: InterviewStatusFilter;
  }): Promise<CandidateInterviewsResponse> {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiClient<CandidateInterviewsResponse>(`/api/candidate/interviews${suffix}`, {
      method: "GET",
    });
  },

  async getInterviewById(interviewId: string): Promise<CandidateInterviewDTO> {
    return apiClient<CandidateInterviewDTO>(`/api/candidate/interviews/${interviewId}`, {
      method: "GET",
    });
  },

  async getScheduledDates(year: number, month: number): Promise<string[]> {
    const response = await apiClient<{ dates: string[] }>(
      `/api/candidate/interviews/scheduled-dates?year=${year}&month=${month}`,
      { method: "GET" }
    );
    return response.dates;
  },
};
