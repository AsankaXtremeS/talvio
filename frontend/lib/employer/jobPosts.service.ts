// lib/employer/jobPosts.service.ts
// All API calls for employer job post management.
// credentials: "include" — cookie-based auth (token stored in httpOnly cookie after login)

import { JobPost, JobPostFormData, JobPostStats } from "@/types/employer/jobPost.types";

// Base URL from .env.local — NEXT_PUBLIC_API_URL=http://localhost:8000
const BASE_URL = "http://localhost:8000";

const getHeaders = () => ({
  "Content-Type": "application/json",
});

interface BackendJobPost {
  id: string;
  title: string;
  department: string;
  type: "JOB" | "INTERNSHIP";
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  closedDate?: string | null;
  company?: {
    name?: string;
  };
  [key: string]: unknown;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }
  return fallback;
}

// ─── Helper: normalize backend response to frontend types ────────────────────
// Backend returns uppercase: "ACTIVE", "JOB"
// Frontend types use title case: "Active", "Job"
// This function converts backend data to match frontend types.

function normalizePost(post: BackendJobPost): JobPost {
  return {
    ...post,
    // Convert "ACTIVE" → "Active", "DRAFT" → "Draft", "CLOSED" → "Closed"
    status: post.status.charAt(0) + post.status.slice(1).toLowerCase() as JobPost["status"],
    // Convert "JOB" → "Job", "INTERNSHIP" → "Internship"
    type: post.type === "JOB" ? "Job" : "Internship",
    // Convert ISO date to readable format for display
    closedDate: post.closedDate
      ? new Date(post.closedDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    // Map company name from backend response
    companyName: post.company?.name ?? "",
  };
}

// ─── Helper: normalize frontend form data to backend format ──────────────────
// Frontend sends title case: "Active", "Job"
// Backend expects uppercase: "ACTIVE", "JOB"

function toBackendFormat(data: Partial<JobPostFormData>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };

  // Convert status "Active" → "ACTIVE"
  if (data.status) {
    result.status = data.status.toUpperCase();
  }

  // Convert type "Job" → "JOB", "Internship" → "INTERNSHIP"
  if (data.type) {
    result.type = data.type.toUpperCase();
  }

  // Convert closedDate to ISO string if provided
  if (data.closedDate) {
    result.closedDate = new Date(data.closedDate).toISOString();
  }

  return result;
}

// ─── GET all job posts for this employer ─────────────────────────────────────
// Backend returns: { data: JobPost[], pagination: {} }
// We extract the data array and normalize each post.

export async function getJobPosts(): Promise<JobPost[]> {
  const res = await fetch(`${BASE_URL}/api/employer/job-posts`, {
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch job posts");

  // Backend wraps posts in { data: [], pagination: {} }
  const json = await res.json();
  return (json.data ?? []).map(normalizePost);
}

// ─── GET stats for dashboard cards ───────────────────────────────────────────

export async function getJobPostStats(): Promise<JobPostStats> {
  const res = await fetch(`${BASE_URL}/api/employer/job-posts/stats`, {
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

// ─── GET single job post by ID ───────────────────────────────────────────────

export async function getJobPostById(id: string): Promise<JobPost> {
  const res = await fetch(`${BASE_URL}/api/employer/job-posts/${id}`, {
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch job post");
  return normalizePost(await res.json());
}

// ─── CREATE new job post ──────────────────────────────────────────────────────

export async function createJobPost(data: JobPostFormData): Promise<JobPost> {
  const payload = toBackendFormat(data);
  
  // Debug — console  exact payload 
  console.log("Sending payload:", JSON.stringify(payload, null, 2));

  const res = await fetch(`/api/employer/job-posts`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  
  // Debug — exact response 
  console.log("Response:", JSON.stringify(json, null, 2));

  if (!res.ok) {
    throw new Error(json.message || "Failed to create job post");
  }
  return normalizePost(json);
}

// ─── UPDATE job post (PATCH — partial update) ────────────────────────────────
// Using PATCH not PUT — backend only accepts PATCH for partial updates.

export async function updateJobPost(
  id: string,
  data: Partial<JobPostFormData>
): Promise<JobPost> {
  const res = await fetch(`${BASE_URL}/api/employer/job-posts/${id}`, {
    method: "PATCH", // PATCH not PUT — backend uses PATCH
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(toBackendFormat(data)),
  });
  if (!res.ok) {
    const errPayload: unknown = await res.json().catch(() => null);
    throw new Error(getErrorMessage(errPayload, "Failed to update job post"));
  }
  return normalizePost(await res.json());
}

// ─── DELETE job post ──────────────────────────────────────────────────────────

export async function deleteJobPost(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/employer/job-posts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete job post");
}
