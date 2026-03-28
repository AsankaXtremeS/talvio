// types/employer/jobPost.types.ts
// TypeScript types for employer job post feature.

export type JobStatus = "Draft" | "Active" | "Closed";
export type JobType = "Job" | "Internship";

// ─── JobPost ──────────────────────────────────────────────────────────────────
// Matches the normalized response from the backend (after normalizePost()).

export interface JobPost {
  id: string;
  title: string;
  type: JobType;
  closingDate: string;        // Date input value e.g. "2026-03-30"
  status: JobStatus;
  location?: string;
  description?: string;
  requirements?: string;
  applicantsCount?: number;
  companyName?: string;
  salaryMin?: number;
  salaryMax?: number;
  workMode?: "On site" | "Remote" | "Hybrid";
  employmentType?: "Full-time" | "Part-time" | "Contract";
  additionalInformation?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── JobPostFormData ──────────────────────────────────────────────────────────
// Data shape used in the create/edit form.

export interface JobPostFormData {
  title: string;
  type: JobType;
  closingDate: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
  additionalInformation: string;
  skills: string;
  workMode: "On site" | "Remote" | "Hybrid";
  employmentType: "Full-time" | "Part-time" | "Contract";
  status: JobStatus;
}

// ─── JobPostStats ─────────────────────────────────────────────────────────────
// Matches the backend /stats endpoint response.

export interface JobPostStats {
  total: number;
  active: number;
  closed: number;
  draft: number;
}
