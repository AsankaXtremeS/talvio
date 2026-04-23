// lib/employer/jobPosts.service.ts
// All API calls for employer job post management.
// credentials: "include" — cookie-based auth (token stored in httpOnly cookie after login)

import { JobPost, JobPostFormData, JobPostStats } from "@/types/employer/jobPost.types";

// Prefer same-origin /api calls so auth cookies from login are always sent.
// If NEXT_PUBLIC_API_BASE is set, it can override for custom environments.
// Fallback to NEXT_PUBLIC_API_URL for compatibility with existing env setup.
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/+$/, "");

const apiUrl = (path: string) => {
  if (!path.startsWith("/")) return API_BASE ? `${API_BASE}/${path}` : `/${path}`;
  return API_BASE ? `${API_BASE}${path}` : path;
};

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");
  // Clean up legacy key from older auth flow to avoid sending invalid Bearer tokens.
  localStorage.removeItem("token");

  if (!token) return null;
  const jwtLike = token.split(".").length === 3;
  return jwtLike ? token : null;
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

const getHeaders = () => ({
  "Content-Type": "application/json",
  ...(getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : {}),
});

let refreshPromise: Promise<boolean> | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// REFRESH ACCESS TOKEN — Automatically refreshes expired JWT when needed.
// Called when API returns 401. Uses refresh token to get new access token.
// IMPORTANT: Only refresh once per request (single-flight) to prevent race conditions.
// ═══════════════════════════════════════════════════════════════════════════════
async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, wait for the existing promise instead of starting another
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // Get stored refresh token from localStorage
      const storedRefreshToken = getStoredRefreshToken();
      
      // Call backend to refresh the access token
      const refreshRes = await fetch(apiUrl("/api/auth/refresh"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storedRefreshToken ? { refreshToken: storedRefreshToken } : {}),
        credentials: "include",  // Include httpOnly cookies in request
      });

      if (!refreshRes.ok) {
        // If refresh fails (e.g., 401), clear stored tokens
        if (refreshRes.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("token");
        }
        console.warn(`Token refresh failed with status ${refreshRes.status}`);
        return false;
      }

      // Parse new tokens from response
      const refreshPayload: unknown = await refreshRes.json().catch(() => null);
      if (
        refreshPayload &&
        typeof refreshPayload === "object" &&
        "accessToken" in refreshPayload &&
        typeof (refreshPayload as { accessToken?: unknown }).accessToken === "string" &&
        typeof window !== "undefined"
      ) {
        // Store new access token
        const newToken = (refreshPayload as { accessToken: string }).accessToken;
        localStorage.setItem("accessToken", newToken);
        
        // Also update refresh token if provided
        if (
          "refreshToken" in refreshPayload &&
          typeof (refreshPayload as { refreshToken?: unknown }).refreshToken === "string"
        ) {
          localStorage.setItem(
            "refreshToken",
            (refreshPayload as { refreshToken: string }).refreshToken
          );
        }
        console.log("Token refreshed successfully");
        return true;
      }

      console.warn("Refresh response missing accessToken field");
      return false;
    } catch (err) {
      console.error("Token refresh error:", err);
      return false;
    } finally {
      refreshPromise = null;  // Clear the promise so next refresh can proceed
    }
  })();

  return refreshPromise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FETCH WITH AUTH — Wrapper for fetch() with automatic token refresh on 401.
// If first request returns 401 (unauthorized):
//   1. Attempt to refresh the access token
//   2. Retry the request with new token
//   3. If refresh fails, redirect to employer login
// IMPORTANT: This implements the OAuth-like refresh token pattern for SPAs.
// ═══════════════════════════════════════════════════════════════════════════════
async function fetchWithAuth(url: string, init: RequestInit = {}): Promise<Response> {
  // First attempt with current token (or no token if not logged in)
  const firstResponse = await fetch(url, {
    ...init,
    headers: {
      ...getHeaders(),  // Includes "Authorization: Bearer {token}"
      ...(init.headers ?? {}),
    },
    credentials: "include",  // Include httpOnly cookies
  });

  if (firstResponse.status !== 401) return firstResponse;  // Success or other error

  // Received 401 — try to refresh token
  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    // Refresh failed — redirect to login
    if (typeof window !== "undefined" && window.location.pathname !== "/login/employer") {
      window.location.href = "/login/employer";
    }
    return firstResponse;
  }

  // Refresh succeeded — retry with new token
  return fetch(url, {
    ...init,
    headers: {
      ...getHeaders(),  // Now includes new access token
      ...(init.headers ?? {}),
    },
    credentials: "include",
  });
}

interface BackendJobPost {
  id: string;
  title: string;
  type: "JOB" | "INTERNSHIP";
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  closingDate?: string | null;
  company?: {
    name?: string;
    logoUrl?: string | null;
  };
  [key: string]: unknown;
}

const buildExtrasStorageKey = (id: string) => `employerJobPostExtras:${id}`;
const OFFLINE_JOB_POSTS_KEY = "employerOfflineJobPosts";

function readOfflinePosts(): JobPost[] {
  // Browser-only: offline functionality only works in browser environment
  if (typeof window === "undefined") return [];

  // Retrieve job posts from localStorage
  const raw = localStorage.getItem(OFFLINE_JOB_POSTS_KEY);
  if (!raw) return [];

  try {
    // Parse JSON and validate it's an array
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as JobPost[]) : [];
  } catch {
    // If JSON parsing fails, return empty array (corrupted data)
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE OFFLINE POSTS — Persists job posts to localStorage.
// Called when:
//   - Creating a new job post (on 503 response)
//   - Updating an existing job post (on 503 response)
//   - Deleting a job post (on 503 response)
// ═══════════════════════════════════════════════════════════════════════════════
function writeOfflinePosts(posts: JobPost[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OFFLINE_JOB_POSTS_KEY, JSON.stringify(posts));
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTE OFFLINE STATS — Recalculates dashboard stats from in-memory posts.
// Returns: { total, active, closed, draft } for dashboard cards.
// Called when backend /api/employer/job-posts/stats returns 503.
// ═══════════════════════════════════════════════════════════════════════════════
function computeOfflineStats(posts: JobPost[]): JobPostStats {
  // Count posts by status using reduce
  return posts.reduce(
    (acc, post) => {
      acc.total += 1;
      if (post.status === "Active") acc.active += 1;
      if (post.status === "Closed") acc.closed += 1;
      if (post.status === "Draft") acc.draft += 1;
      return acc;
    },
    { total: 0, active: 0, closed: 0, draft: 0 }
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD OFFLINE POST — Converts form data into a complete JobPost object
// for storage in localStorage.
// IMPORTANT: Generates a UUID (or fallback offline-{timestamp} for compatibility).
// ═══════════════════════════════════════════════════════════════════════════════
function buildOfflinePost(data: JobPostFormData): JobPost {
  const now = new Date().toISOString();
  return {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `offline-${Date.now()}`,  // Fallback for older browsers
    title: data.title,
    type: data.type,
    closingDate: data.closingDate,
    status: data.status,
    location: data.location,
    description: data.description,
    responsibilities: data.responsibilities,
    requirements: data.requirements,
    workMode: data.workMode,
    employmentType: data.employmentType,
    additionalInformation: data.additionalInformation,
    skills: data.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    companyName: "",
    createdAt: now,
    updatedAt: now,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPLY FORM DATA TO POST — Merges partial updates into an existing post.
// Only updates fields that are explicitly provided (undefined values are skipped).
// Used for PATCH-style updates in offline mode.
// ═══════════════════════════════════════════════════════════════════════════════
function applyFormDataToPost(post: JobPost, data: Partial<JobPostFormData>): JobPost {
  return {
    ...post,
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.type !== undefined ? { type: data.type } : {}),
    ...(data.closingDate !== undefined ? { closingDate: data.closingDate } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.location !== undefined ? { location: data.location } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.responsibilities !== undefined
      ? { responsibilities: data.responsibilities }
      : {}),
    ...(data.requirements !== undefined ? { requirements: data.requirements } : {}),
    ...(data.workMode !== undefined ? { workMode: data.workMode } : {}),
    ...(data.employmentType !== undefined ? { employmentType: data.employmentType } : {}),
    ...(data.additionalInformation !== undefined
      ? { additionalInformation: data.additionalInformation }
      : {}),
    ...(data.skills !== undefined
      ? {
          skills: data.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }
      : {}),
    updatedAt: new Date().toISOString(),  // Track when it was last modified
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET OFFLINE POST BY ID — Find a specific post in the offline store.
// Returns null if post doesn't exist.
// ═══════════════════════════════════════════════════════════════════════════════
function getOfflinePostById(id: string): JobPost | null {
  const posts = readOfflinePosts();
  return posts.find((post) => post.id === id) ?? null;
}

function persistPostExtras(postId: string, data: Partial<JobPostFormData>): void {
  if (typeof window === "undefined") return;

  const payload = {
    location: data.location ?? "",
    workMode: data.workMode ?? "",
    employmentType: data.employmentType ?? "",
    requirements: data.requirements ?? "",
    responsibilities: data.responsibilities ?? "",
    additionalInformation: data.additionalInformation ?? "",
    skills: data.skills ?? "",
  };

  if (
    !payload.location &&
    !payload.workMode &&
    !payload.employmentType &&
    !payload.requirements &&
    !payload.responsibilities &&
    !payload.additionalInformation &&
    !payload.skills
  ) {
    return;
  }

  localStorage.setItem(buildExtrasStorageKey(postId), JSON.stringify(payload));
}

function mergeStoredExtras(post: JobPost): JobPost {
  if (typeof window === "undefined") return post;

  const raw = localStorage.getItem(buildExtrasStorageKey(post.id));
  if (!raw) return post;

  try {
    const parsed = JSON.parse(raw) as {
      location?: string;
      workMode?: string;
      employmentType?: string;
      requirements?: string;
      responsibilities?: string;
      additionalInformation?: string;
      skills?: string;
    };

    const mergedWorkMode =
      post.workMode ??
      (parsed.workMode === "On site" || parsed.workMode === "Remote" || parsed.workMode === "Hybrid"
        ? parsed.workMode
        : undefined);

    const mergedEmploymentType =
      post.employmentType ??
      (parsed.employmentType === "Full-time" ||
      parsed.employmentType === "Part-time" ||
      parsed.employmentType === "Contract"
        ? parsed.employmentType
        : undefined);

    return {
      ...post,
      location: post.location ?? parsed.location ?? "",
      workMode: mergedWorkMode,
      employmentType: mergedEmploymentType,
      requirements: post.requirements ?? parsed.requirements ?? "",
      responsibilities: post.responsibilities ?? parsed.responsibilities ?? "",
      additionalInformation: parsed.additionalInformation ?? "",
      skills: (parsed.skills ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };
  } catch {
    return post;
  }
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
  return mergeStoredExtras({
    ...post,
    // Convert "ACTIVE" → "Active", "DRAFT" → "Draft", "CLOSED" → "Closed"
    status: post.status.charAt(0) + post.status.slice(1).toLowerCase() as JobPost["status"],
    // Convert "JOB" → "Job", "INTERNSHIP" → "Internship"
    type: post.type === "JOB" ? "Job" : "Internship",
    // Keep as yyyy-mm-dd for date input and format in UI where needed.
    closingDate: post.closingDate ? post.closingDate.slice(0, 10) : "",
    // Map company data from backend response
    companyName: post.company?.name ?? "",
    companyLogoUrl: post.company?.logoUrl ?? undefined,
  });
}

// ─── Helper: normalize frontend form data to backend format ──────────────────
// Frontend sends title case: "Active", "Job"
// Backend expects uppercase: "ACTIVE", "JOB"

function toBackendFormat(data: Partial<JobPostFormData>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (data.title !== undefined) result.title = data.title;
  if (data.description !== undefined) result.description = data.description;
  if (data.responsibilities !== undefined) result.responsibilities = data.responsibilities;
  if (data.requirements !== undefined) result.requirements = data.requirements;
  if (data.additionalInformation !== undefined) result.additionalInformation = data.additionalInformation;
  if (data.skills !== undefined) {
    // Accept comma or space separated, normalize to comma-separated string
    const skillsArr = data.skills
      .split(/[,\s]+/)
      .map((skill) => skill.trim())
      .filter(Boolean);
    result.skills = skillsArr.join(", ");
  }
  if (data.location !== undefined) result.location = data.location;


  // Send status as title case (e.g., "Active", "Draft", "Closed")
  if (data.status) {
    result.status = data.status;
  }

  // Send type as title case (e.g., "Job", "Internship")
  if (data.type) {
    result.type = data.type;
  }

  // Send workMode as title case (e.g., "On site", "Remote", "Hybrid")
  if (data.workMode) {
    result.workMode = data.workMode;
  }

  // Send employmentType as title case (e.g., "Full-time", "Part-time", "Contract")
  if (data.employmentType) {
    result.employmentType = data.employmentType;
  }

  // Send closingDate only when non-empty; empty string fails backend datetime validation.
  if (data.closingDate && data.closingDate.trim() !== "") {
    result.closingDate = new Date(data.closingDate).toISOString();
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL JOB POSTS — Fetches all job posts for the logged-in employer.
// Returns: Normalized JobPost[] from backend API.
// On 503 (database unavailable): Falls back to offline localStorage posts.
// ═══════════════════════════════════════════════════════════════════════════════
export async function getJobPosts(): Promise<JobPost[]> {
  // Call backend API with auth token
  const res = await fetchWithAuth(apiUrl("/api/employer/job-posts"));
  const payload: unknown = await res.json().catch(() => null);
  
  // Check for database unavailability (503) and fallback to offline
  if (res.status === 503) {
    console.warn("Job posts API unavailable; using offline posts.");
    return readOfflinePosts();
  }
  
  // Handle other errors
  if (!res.ok) throw new Error(getErrorMessage(payload, "Failed to fetch job posts"));

  // Backend wraps posts in { data: [], pagination: {} }
  // Extract data array and normalize each post (convert "ACTIVE" → "Active", etc)
  const json = payload as { data?: BackendJobPost[] };
  return (json.data ?? []).map(normalizePost);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET JOB POST STATS — Fetches dashboard stats (total, active, draft, closed).
// Returns: { total, active, draft, closed } for dashboard cards.
// On 503 (database unavailable): Computes stats from offline localStorage posts.
// ═══════════════════════════════════════════════════════════════════════════════
export async function getJobPostStats(): Promise<JobPostStats> {
  const res = await fetchWithAuth(apiUrl("/api/employer/job-posts/stats"));
  const payload: unknown = await res.json().catch(() => null);
  
  // Check for database unavailability (503) and compute offline stats
  if (res.status === 503) {
    console.warn("Job post stats API unavailable; using offline stats.");
    return computeOfflineStats(readOfflinePosts());
  }
  
  // Handle other errors
  if (!res.ok) throw new Error(getErrorMessage(payload, "Failed to fetch stats"));
  return payload as JobPostStats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SINGLE JOB POST BY ID — Fetches a specific job post for view/edit.
// Returns: Normalized JobPost for the given ID.
// On 503 (database unavailable): Retrieves from offline localStorage.
// ═══════════════════════════════════════════════════════════════════════════════
export async function getJobPostById(id: string): Promise<JobPost> {
  const res = await fetchWithAuth(apiUrl(`/api/employer/job-posts/${id}`));
  const payload: unknown = await res.json().catch(() => null);
  
  // Check for database unavailability (503) or missing backend record (404)
  // and try the offline store if the post was created locally.
  if (res.status === 503 || res.status === 404) {
    const offline = getOfflinePostById(id);
    if (offline) return mergeStoredExtras({ ...offline, isOffline: true });
  }
  
  // Handle other errors
  if (!res.ok) {
    throw new Error(getErrorMessage(payload, "Failed to fetch job post"));
  }
  return normalizePost(payload as BackendJobPost);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE JOB POST — Creates a new job post (starts as DRAFT).
// Input: JobPostFormData from form submission.
// Returns: Created JobPost with server-assigned ID.
// On 503 (database unavailable): Saves locally to offline store with pseudo-UUID.
// IMPORTANT: Offline posts can be edited/deleted locally but only sync when DB online.
// ═══════════════════════════════════════════════════════════════════════════════
export async function createJobPost(data: JobPostFormData): Promise<JobPost> {
  // Convert frontend format ("Active", "Job") to backend format ("ACTIVE", "JOB")
  const payload = toBackendFormat(data);

  // Call backend API
  const res = await fetchWithAuth(apiUrl("/api/employer/job-posts"), {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const json: unknown = await res.json().catch(() => null);
  
  // Check for database unavailability (503) and save to offline store
  if (res.status === 503) {
    // Create offline post with pseudo-UUID
    const createdOffline = buildOfflinePost(data);
    
    // Prepend to list (newest first)
    const current = readOfflinePosts();
    writeOfflinePosts([createdOffline, ...current]);
    
    // Store extended attributes separately
    persistPostExtras(createdOffline.id, data);
    return mergeStoredExtras(createdOffline);
  }
  
  // Handle other errors
  if (!res.ok) {
    throw new Error(getErrorMessage(json, "Failed to create job post"));
  }
  
  // Success: normalize response and store extended attributes
  const created = normalizePost(json as BackendJobPost);
  persistPostExtras(created.id, data);
  return created;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE JOB POST — Partially updates a job post (PATCH).
// Input: Post ID and partial JobPostFormData (only changed fields).
// Returns: Updated JobPost.
// On 503 (database unavailable): Updates locally in offline store.
// IMPORTANT: Uses PATCH (not PUT) — only provided fields are updated.
// ═══════════════════════════════════════════════════════════════════════════════
export async function updateJobPost(
  id: string,
  data: Partial<JobPostFormData>
): Promise<JobPost> {
  // Call backend API with PATCH
  const res = await fetchWithAuth(apiUrl(`/api/employer/job-posts/${id}`), {
    method: "PATCH",  // PATCH not PUT — backend uses PATCH for partial updates
    body: JSON.stringify(toBackendFormat(data)),
  });
  
  // Check for database unavailability (503) and use offline store
  if (res.status === 503) {
    const current = readOfflinePosts();
    const index = current.findIndex((post) => post.id === id);
    if (index < 0) {
      throw new Error("Job post not found");
    }
    
    // Apply partial update to existing post
    const updatedOffline = applyFormDataToPost(current[index], data);
    current[index] = updatedOffline;
    writeOfflinePosts(current);
    persistPostExtras(updatedOffline.id, data);
    return mergeStoredExtras(updatedOffline);
  }
  
  // Handle other errors
  if (!res.ok) {
    const errPayload: unknown = await res.json().catch(() => null);
    throw new Error(getErrorMessage(errPayload, "Failed to update job post"));
  }
  
  // Success: normalize response and update extended attributes
  const payload: unknown = await res.json().catch(() => null);
  const updated = normalizePost(payload as BackendJobPost);
  persistPostExtras(updated.id, data);
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLOSE JOB POST — Sets a job post status to CLOSED (shorthand for updateJobPost).
// Used when employer wants to stop hiring without deleting the post.
// Input: Post ID.
// Returns: Updated JobPost with status="Closed".
// On 503 (database unavailable): Updates locally in offline store.
// ═══════════════════════════════════════════════════════════════════════════════
export async function closeJobPost(id: string): Promise<JobPost> {
  const res = await fetchWithAuth(apiUrl(`/api/employer/job-posts/${id}`), {
    method: "PATCH",
    body: JSON.stringify({ status: "Closed" }),
  });
  
  // Check for database unavailability (503) and update offline store
  if (res.status === 503) {
    const current = readOfflinePosts();
    const index = current.findIndex((post) => post.id === id);
    if (index < 0) {
      throw new Error("Job post not found");
    }
    
    // Set status to "Closed" (frontend format)
    const updatedOffline = {
      ...current[index],
      status: "Closed" as JobPost["status"],
      updatedAt: new Date().toISOString(),
    };
    current[index] = updatedOffline;
    writeOfflinePosts(current);
    return mergeStoredExtras(updatedOffline);
  }
  
  // Handle other errors
  if (!res.ok) {
    const payload: unknown = await res.json().catch(() => null);
    throw new Error(getErrorMessage(payload, "Failed to close job post"));
  }
  
  // Success: normalize response
  const payload: unknown = await res.json().catch(() => null);
  return normalizePost(payload as BackendJobPost);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SET JOB POST STATUS — Updates a job post status to Draft/Active/Closed.
// Input: Post ID and status ("Draft", "Active", or "Closed").
// Returns: Updated JobPost.
// On 503 (database unavailable): Updates locally in offline store.
// Used by dropdown in JobPostsTable component to change status.
// ═══════════════════════════════════════════════════════════════════════════════
export async function setJobPostStatus(
  id: string,
  status: "Draft" | "Active" | "Closed"
): Promise<JobPost> {
  const res = await fetchWithAuth(apiUrl(`/api/employer/job-posts/${id}`), {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  // Check for database unavailability (503) and update offline store
  if (res.status === 503) {
    const current = readOfflinePosts();
    const index = current.findIndex((post) => post.id === id);
    if (index < 0) {
      throw new Error("Job post not found");
    }

    const updatedOffline = {
      ...current[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    current[index] = updatedOffline;
    writeOfflinePosts(current);
    return mergeStoredExtras(updatedOffline);
  }

  // Handle other errors
  if (!res.ok) {
    const payload: unknown = await res.json().catch(() => null);
    throw new Error(getErrorMessage(payload, "Failed to update job post status"));
  }

  // Success: normalize response
  const payload: unknown = await res.json().catch(() => null);
  return normalizePost(payload as BackendJobPost);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE JOB POST — Permanently deletes a job post.
// Input: Post ID.
// Returns: void (no response body expected).
// On 503 (database unavailable): Removes from offline store.
// IMPORTANT: This operation is IRREVERSIBLE — deleted posts cannot be recovered.
// ═══════════════════════════════════════════════════════════════════════════════
export async function deleteJobPost(id: string): Promise<void> {
  const res = await fetchWithAuth(apiUrl(`/api/employer/job-posts/${id}`), {
    method: "DELETE",
  });
  
  // Check for database unavailability (503) and remove from offline store
  if (res.status === 503) {
    const current = readOfflinePosts();
    const next = current.filter((post) => post.id !== id);
    writeOfflinePosts(next);
    return;
  }
  
  // Handle other errors
  if (!res.ok) {
    const payload: unknown = await res.json().catch(() => null);
    throw new Error(getErrorMessage(payload, "Failed to delete job post"));
  }
}
