// Candidates service for employer views.
// getCandidates() fetches from the backend — falls back to MOCK_CANDIDATES
// if the backend returns nothing or errors (useful during development).
// SECURITY: Only fields needed for display are exposed — no raw DB rows.

import { CandidateInfo, CandidateStatus, FullCandidateProfile } from "@/types/candidate/candidate.types";

const apiUrl = (path: string) => {
  // Use relative /api paths so requests go through Next.js rewrites proxy and browser auth cookies are sent.
  if (!path.startsWith("/")) return `/${path}`;
  return path;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  localStorage.removeItem("token");
  if (!token) return null;
  return token.split(".").length === 3 ? token : null;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = typeof window === "undefined" ? null : localStorage.getItem("refreshToken");
      const refreshRes = await fetch(apiUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      });

      if (!refreshRes.ok) {
        if (refreshRes.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("token");
        }
        return false;
      }

      const payload = await refreshRes.json().catch(() => null);
      if (
        payload &&
        typeof payload === "object" &&
        "accessToken" in payload &&
        typeof (payload as { accessToken?: unknown }).accessToken === "string" &&
        typeof window !== "undefined"
      ) {
        localStorage.setItem("accessToken", (payload as { accessToken: string }).accessToken);
        if (
          "refreshToken" in payload &&
          typeof (payload as { refreshToken?: unknown }).refreshToken === "string"
        ) {
          localStorage.setItem("refreshToken", (payload as { refreshToken: string }).refreshToken);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("[refreshAccessToken] Error:", err);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchWithAuth(url: string, init: RequestInit = {}): Promise<Response> {
  const firstResponse = await fetch(url, {
    ...init,
    headers: {
      ...((init.headers ?? {}) as Record<string, string>),
      ...(getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : {}),
    },
    credentials: "include",
  });

  if (firstResponse.status !== 401) return firstResponse;

  const refreshed = await refreshAccessToken();
  if (!refreshed) return firstResponse;

  return fetch(url, {
    ...init,
    headers: {
      ...((init.headers ?? {}) as Record<string, string>),
      ...(getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : {}),
    },
    credentials: "include",
  });
}

// ─── Avatar gradient helper ───────────────────────────────────────────────────

const GRADIENTS = [
  "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)",
  "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)",
  "linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)",
  "linear-gradient(135deg,#fa709a 0%,#fee140 100%)",
  "linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)",
  "linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)",
  "linear-gradient(135deg,#e0c3fc 0%,#8ec5fc 100%)",
];

/** Return a consistent gradient for a candidate card based on its list index */
export function getAvatarGradient(index: number): string {
  return GRADIENTS[index % GRADIENTS.length];
}

// ─── 5 Dummy Candidates for Development/Testing ───────────────────────────────
// These use proper UUIDs to pass backend validation.
// Replace with real API calls once the backend candidates endpoint is ready.

export const MOCK_CANDIDATES: CandidateInfo[] = [
  {
    id: "a1b2c3d4-e5f6-47a8-9b1c-2d3e4f5a6b7c",
    name: "Sachini Perera",
    role: "Frontend Developer",
    initial: "S",
    avatarGradient: GRADIENTS[0],
    experience: "3 years",
    appliedDaysAgo: 2,
    matchScore: 94,
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    email: "deheminayanamini@gmail.com",
    status: "Applied",
  },
  {
    id: "b2c3d4e5-f6a7-48b9-8c2d-3e4f5a6b7c8d",
    name: "Ravindu Jayasinghe",
    role: "Full Stack Engineer",
    initial: "R",
    avatarGradient: GRADIENTS[1],
    experience: "5 years",
    appliedDaysAgo: 4,
    matchScore: 88,
    skills: ["Node.js", "React", "PostgreSQL", "Docker"],
    email: "deheminayanamini@gmail.com",
    status: "Applied",
  },
  {
    id: "c3d4e5f6-a7b8-49ca-8d3e-4f5a6b7c8d9e",
    name: "Nishani Fernando",
    role: "UI/UX Designer",
    initial: "N",
    avatarGradient: GRADIENTS[2],
    experience: "2 years",
    appliedDaysAgo: 1,
    matchScore: 81,
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    email: "deheminayanamini@gmail.com",
    status: "Shortlisted",
  },
  {
    id: "d4e5f6a7-b8c9-40db-8e4f-5a6b7c8d9e0f",
    name: "Kasun Bandara",
    role: "DevOps Engineer",
    initial: "K",
    avatarGradient: GRADIENTS[3],
    experience: "4 years",
    appliedDaysAgo: 7,
    matchScore: 76,
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
    email: "deheminayanamini@gmail.com",
    status: "Shortlisted",
  },
  {
    id: "e5f6a7b8-c9d0-41ec-8f50-6b7c8d9e0f1a",
    name: "Tharushi Amarasinghe",
    role: "Data Analyst",
    initial: "T",
    avatarGradient: GRADIENTS[4],
    experience: "2 years",
    appliedDaysAgo: 3,
    matchScore: 85,
    skills: ["Python", "SQL", "Power BI", "Pandas"],
    email: "deheminayanamini@gmail.com",
    status: "Interview Scheduled",
  },
];

type BackendApplicationStatus = "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED" | "HIRED";

interface BackendApplicant {
  id: string;
  name: string;
  email: string;
  headline: string;
  skills: string[];
  status: BackendApplicationStatus;
  appliedAt: string;
  cvUrl: string;
  aiScore: number;
  profilePictureUrl?: string | null;
}

const mapBackendStatusToFrontend = (status: BackendApplicationStatus): CandidateStatus | null => {
  if (status === "SHORTLISTED") return "Shortlisted";
  if (status === "HIRED") return "Hired";
  if (status === "REVIEWED") return "Interview Scheduled";
  if (status === "PENDING") return "Applied";
  return null;
};

const toAppliedDaysAgo = (appliedAt: string): number => {
  const appliedDate = new Date(appliedAt);
  if (Number.isNaN(appliedDate.getTime())) return 0;
  const now = Date.now();
  const diffMs = Math.max(0, now - appliedDate.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

const toCandidateInfo = (applicant: BackendApplicant): CandidateInfo | null => {
  const status = mapBackendStatusToFrontend(applicant.status);
  if (!status) return null;

  const safeName = applicant.name?.trim() || "Unknown Applicant";
  const role = applicant.headline?.trim() || "Applicant";

  return {
    id: applicant.id,
    name: safeName,
    role,
    initial: safeName.charAt(0).toUpperCase() || "A",
    experience: "Not specified",
    appliedDaysAgo: toAppliedDaysAgo(applicant.appliedAt),
    matchScore: Number.isFinite(applicant.aiScore) ? applicant.aiScore : 0,
    skills: Array.isArray(applicant.skills) ? applicant.skills : [],
    email: applicant.email,
    status,
    avatarUrl: applicant.profilePictureUrl || undefined,
  };
};

const filterCandidatesByStatus = (
  candidates: CandidateInfo[],
  status: CandidateStatus
): CandidateInfo[] => {
  if (status === "AI Matches") {
    return candidates
      .filter((candidate) => candidate.status !== "Shortlisted")
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  return candidates.filter((candidate) => candidate.status === status);
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Fetch candidates for a specific job post.
 * Falls back to MOCK_CANDIDATES filtered by status if the API is unavailable.
 */
export async function getCandidates(
  status: CandidateStatus,
  jobPostId?: string
): Promise<CandidateInfo[]> {
  // If jobPostId provided, fetch from API
  if (jobPostId) {
    try {
      const url = apiUrl(`/api/employer/job-posts/${jobPostId}/applications`);
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = (await res.json()) as BackendApplicant[];
        const mapped = data
          .map(toCandidateInfo)
          .filter((candidate): candidate is CandidateInfo => candidate !== null);
        const filtered = filterCandidatesByStatus(mapped, status);

        console.log(
          `[getCandidates] Fetched ${filtered.length} candidates for job post ${jobPostId} with status ${status}`
        );
        return filtered;
      } else {
        console.error(`[getCandidates] Failed to fetch candidates: ${res.status}, falling back to mock data`);
        return filterCandidatesByStatus(MOCK_CANDIDATES, status);
      }
    } catch (err) {
      console.error("[getCandidates] Error fetching from API, falling back to mock data:", err);
      return filterCandidatesByStatus(MOCK_CANDIDATES, status);
    }
  }

  // Fallback: return mock data filtered by status, including AI Matches based on score.
  console.log(`[getCandidates] Using mock data for status ${status}`);
  return Promise.resolve(filterCandidatesByStatus(MOCK_CANDIDATES, status));
}

/**
 * Fetch a single candidate's profile by their candidateProfile ID.
 * When jobPostId is provided, also fetches the AI match score from the application.
 * Used in the schedule interview page to display applicant info.
 */
export async function getCandidateById(
  candidateProfileId: string,
  jobPostId?: string
): Promise<FullCandidateProfile | null> {
  if (!candidateProfileId || !isUuid(candidateProfileId)) {
    console.warn(
      `[getCandidateById] Skipping API fetch for invalid candidate profile id: ${candidateProfileId}`
    );
    return MOCK_CANDIDATES.find((c) => c.id === candidateProfileId) as FullCandidateProfile ?? null;
  }

  try {
    // If jobPostId is provided, fetch from applications endpoint to get AI score
    if (jobPostId && isUuid(jobPostId)) {
      try {
        const applicationsRes = await fetchWithAuth(
          apiUrl(`/api/employer/job-posts/${jobPostId}/applications`)
        );

        if (applicationsRes.ok) {
          const applications = (await applicationsRes.json()) as BackendApplicant[];
          const match = applications.find((app) => app.id === candidateProfileId);

          if (match) {
            const candidateFromApp = toCandidateInfo(match);
            if (candidateFromApp) {
              console.log(
                `[getCandidateById] Found candidate ${candidateProfileId} in job post ${jobPostId} applications with AI score ${candidateFromApp.matchScore}`
              );
              return candidateFromApp;
            }
          }
        }
      } catch (err) {
        console.error(
          `[getCandidateById] Error fetching from applications endpoint:`,
          err
        );
        // Fall through to fetch candidate profile separately
      }
    }

    // Fetch candidate profile info
    const res = await fetch(`/api/employer/interviews/candidates/${candidateProfileId}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status !== 404) {
        console.error(`[getCandidateById] Failed to fetch candidate: ${res.status}`);
      }
      return MOCK_CANDIDATES.find((c) => c.id === candidateProfileId) as FullCandidateProfile ?? null;
    }

    const data = (await res.json()) as {
      id: string;
      name: string;
      email: string;
      headline: string;
      skills: string[];
      location?: string | null;
      bio?: string | null;
      linkedinUrl?: string | null;
      githubUrl?: string | null;
      portfolioUrl?: string | null;
      cvUrl?: string | null;
      profilePictureUrl?: string | null;
    };

    const safeName = data.name?.trim() || "Candidate";

    return {
      id: data.id,
      name: safeName,
      role: data.headline?.trim() || "Applicant",
      initial: safeName.charAt(0).toUpperCase() || "C",
      experience: "Not specified",
      appliedDaysAgo: 0,
      matchScore: 0,
      skills: Array.isArray(data.skills) ? data.skills : [],
      email: data.email,
      status: "Applied",
      avatarUrl: data.profilePictureUrl || undefined,
      location: data.location,
      bio: data.bio,
      linkedinUrl: data.linkedinUrl,
      githubUrl: data.githubUrl,
      portfolioUrl: data.portfolioUrl,
      cvUrl: data.cvUrl,
    };
  } catch (err) {
    console.error("[getCandidateById] Error fetching candidate:", err);
    return MOCK_CANDIDATES.find((c) => c.id === candidateProfileId) as FullCandidateProfile ?? null;
  }
}

/**
 * Mark a candidate's application as reviewed by the employer.
 * POST /api/employer/job-posts/:jobPostId/applications/:candidateProfileId/reviewed
 * Returns: { id, isReviewed, isShortlisted, applicationStatus }
 */
export async function markReviewed(
  jobPostId: string,
  candidateProfileId: string
): Promise<{ id: string; isReviewed: boolean; isShortlisted: boolean; applicationStatus: string } | null> {
  try {
    const url = apiUrl(
      `/api/employer/job-posts/${jobPostId}/applications/${candidateProfileId}/reviewed`
    );
    const res = await fetchWithAuth(url, { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("[markReviewed] Failed:", res.status, err);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[markReviewed] Error:", err);
    return null;
  }
}

/**
 * Shortlist a candidate's application.
 * POST /api/employer/job-posts/:jobPostId/applications/:candidateProfileId/shortlisted
 * Returns: { id, isReviewed, isShortlisted, applicationStatus }
 */
export async function markShortlisted(
  jobPostId: string,
  candidateProfileId: string
): Promise<{ id: string; isReviewed: boolean; isShortlisted: boolean; applicationStatus: string } | null> {
  try {
    const url = apiUrl(
      `/api/employer/job-posts/${jobPostId}/applications/${candidateProfileId}/shortlisted`
    );
    const res = await fetchWithAuth(url, { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("[markShortlisted] Failed:", res.status, err);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[markShortlisted] Error:", err);
    return null;
  }
}
