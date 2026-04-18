import { apiClient } from "../apiClient";

export interface CandidateProfile {
  id: string;
  userId: string;
  headline?: string;
  location?: string;
  skills: string[];
  bio?: string;
  cvUrl?: string;
  cvFileName?: string;
  extractedSkills: string[];
  updatedAt: string;
}

export const profileService = {
  /**
   * Get the current candidate's profile
   */
  async getProfile(): Promise<CandidateProfile | null> {
    try {
      const response = await apiClient<{ profile: CandidateProfile | null }>("/api/candidate/profile");
      return response.profile;
    } catch (error) {
      console.error("Failed to fetch candidate profile:", error);
      return null;
    }
  },

  /**
   * Update the current candidate's profile
   */

  async updateProfile(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  headline?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}): Promise<CandidateProfile> {
  const res = await fetch("/api/candidate/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update profile");
  return json.profile;
},

  /**
   * Update the candidate's default resume
   */
  async updateResume(cvUrl: string, cvFileName: string): Promise<CandidateProfile> {
    const response = await apiClient<{ profile: CandidateProfile }>("/api/candidate/profile/resume", {
      method: "POST",
      data: { cvUrl, cvFileName },
    });
    return response.profile;
  },

  /**
   * Remove the candidate's default resume
   */
  async removeResume(): Promise<CandidateProfile> {
    const response = await apiClient<{ profile: CandidateProfile }>("/api/candidate/profile/resume", {
      method: "DELETE",
    });
    return response.profile;
  },
};
