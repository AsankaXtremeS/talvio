import { apiClient } from '@/lib/apiClient';
import { DashboardJob } from '@/components/candidate/dashboard/RecommendationRow';

export interface ApplicationResponse {
  message: string;
  applicationId: string;
  analysis: {
    overallScore: number;
    suggestions: string[];
    coverLetter: string;
  };
  cvUrl: string;
}

export interface RecommendationResponse {
  recommendations: any[];
}

export interface Application {
  id: string;
  appliedAt: string;
  status: string;
  job: DashboardJob;
}

export interface MyApplicationsResponse {
  total: number;
  applications: Application[];
}

export const candidateJobService = {
  async getRecommendations(): Promise<DashboardJob[]> {
    const response = await apiClient<RecommendationResponse>('/api/ai/recommendations', {
      method: 'GET',
    });

    if (!response.recommendations) return [];

    return response.recommendations.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      postedAgo: this.timeAgo(job.createdAt),
      matchPercent: job.matchPercent,
      tags: job.tags || [],
      companyLogoUrl: job.companyLogoUrl,
      isAiRecommended: true,
    }));
  },

  async applyToJob(jobId: string, cvUrl: string, cvFileName: string, coverLetter?: string): Promise<ApplicationResponse> {
    return apiClient<ApplicationResponse>(`/api/candidate/applications/apply/${jobId}`, {
      method: 'POST',
      data: { cvUrl, cvFileName, coverLetter },
    });
  },

  async generateCoverLetter(jobId: string): Promise<string> {
    const response = await apiClient<{ coverLetter: string }>(`/api/ai/generate-cover-letter/${jobId}`, {
      method: 'POST',
    });
    return response.coverLetter;
  },

  async getMyApplications(): Promise<Application[]> {
    const response = await apiClient<MyApplicationsResponse>('/api/candidate/applications', {
      method: 'GET',
    });
    
    // Map backend jobPost to frontend job property
    return response.applications.map((app: any) => ({
      id: app.id,
      appliedAt: app.appliedAt,
      status: app.applicationStatus,
      job: {
        id: app.jobPost.id,
        title: app.jobPost.title,
        company: app.jobPost.employer.companyName,
        location: app.jobPost.location,
        postedAgo: this.timeAgo(app.jobPost.createdAt),
        matchPercent: app.aiScore || 0,
        tags: [app.jobPost.workMode, app.jobPost.employmentType].filter(Boolean),
        companyLogoUrl: app.jobPost.employer.companyLogoUrl,
      }
    }));
  },

  async withdrawApplication(applicationId: string): Promise<void> {
    await apiClient(`/api/candidate/applications/withdraw/${applicationId}`, {
      method: 'DELETE',
    });
  },

  timeAgo(date: string | Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }
};
