export type CandidateStatus =
  | "Applied"
  | "Shortlisted"
  | "Interview Scheduled"
  | "Hired";

export interface CandidateInfo {
  id: string;
  name: string;
  role: string;
  initial: string;
  avatarGradient?: string; // CSS gradient string — optional, falls back to default
  experience: string;      // e.g. "5 years"
  appliedDaysAgo: number;
  matchScore: number;      // 0-100
  skills: string[];
  email: string;
  status: CandidateStatus;
}