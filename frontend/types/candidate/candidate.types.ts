export type CandidateStatus =
  | "Applied"
  | "AI Matches"
  | "Reviewed"
  | "Shortlisted"
  | "Interview Scheduled"
  | "Hired";

export interface CandidateInfo {
  id: string;
  name: string;
  role: string;
  initial: string;
  avatarUrl?: string;
  avatarGradient?: string; // CSS gradient string — optional, falls back to default
  experience: string;      // e.g. "5 years"
  appliedDaysAgo: number;
  matchScore: number;      // 0-100
  skills: string[];
  email: string;
  status: CandidateStatus;
  jobPostId?: string;
  jobPostTitle?: string;
}

export interface FullCandidateProfile extends CandidateInfo {
  location?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  cvUrl?: string | null;
  // Application-level fields (present when viewing from a job post context)
  applicationStatus?: string | null;
  applicationId?: string | null;
  applicationCvUrl?: string | null;  // cv submitted with this specific application
  isReviewed?: boolean;
  isShortlisted?: boolean;
}
