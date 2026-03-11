export type JobStatus = "Draft" | "Active" | "Closed";
export type JobType = "Job" | "Internship";

export interface JobPost {
  id: string;
  title: string;
  department: string;
  type: JobType;
  closedDate: string;
  status: JobStatus;
  applicantsCount?: number;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  description?: string;
  requirements?: string;
  workMode?: "On site" | "Remote" | "Hybrid";
  employmentType?: "Full-time" | "Part-time" | "Contract";
  postedDate?: string;
}

export interface JobPostFormData {
  title: string;
  department: string;
  type: JobType;
  closedDate: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  requirements: string;
  workMode: "On site" | "Remote" | "Hybrid";
  employmentType: "Full-time" | "Part-time" | "Contract";
  status: JobStatus;
}