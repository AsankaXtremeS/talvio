import { JobPost, JobPostFormData } from "@/types/employer/jobPost.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper to get auth token
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ── GET all job posts for this company ──
export async function getJobPosts(): Promise<JobPost[]> {
  const res = await fetch(`${BASE_URL}/employer/job-posts`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch job posts");
  return res.json();
}

// ── GET single job post ──
export async function getJobPostById(id: string): Promise<JobPost> {
  const res = await fetch(`${BASE_URL}/employer/job-posts/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch job post");
  return res.json();
}

// ── CREATE new job post ──
export async function createJobPost(data: JobPostFormData): Promise<JobPost> {
  const res = await fetch(`${BASE_URL}/employer/job-posts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create job post");
  return res.json();
}

// ── UPDATE job post ──
export async function updateJobPost(
  id: string,
  data: Partial<JobPostFormData>
): Promise<JobPost> {
  const res = await fetch(`${BASE_URL}/employer/job-posts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update job post");
  return res.json();
}

// ── DELETE job post ──
export async function deleteJobPost(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/employer/job-posts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete job post");
}