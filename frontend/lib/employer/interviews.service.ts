// Interview scheduling API service.
// All calls go through Next.js rewrites → backend /api/employer/interviews.
// Uses credentials:"include" to send the httpOnly cookie automatically.
// SECURITY: Never read or pass tokens manually — cookies handle it.
// AUTO-REFRESH: Automatically refreshes access token on 401 Unauthorized.
//
// Return types use the SAME names as the backend:
//   InterviewDTO     ← mirrors backend InterviewDTO
//   EmailPreviewDTO  ← mirrors backend EmailPreviewDTO

import {
  InterviewDTO,
  EmailPreviewDTO,
  CreateInterviewPayload,
  GenerateEmailPayload,
} from "@/types/employer/interview.types";

const BASE = "/api/employer/interviews";

// ─── Token Management ─────────────────────────────────────────────────────────

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  localStorage.removeItem("token");  // Clean up legacy key
  if (!token) return null;
  const jwtLike = token.split(".").length === 3;
  return jwtLike ? token : null;
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

const getHeaders = (hasBody = false) => ({
  ...(hasBody ? { "Content-Type": "application/json" } : {}),
  ...(getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : {}),
});

let refreshPromise: Promise<boolean> | null = null;

// ─── Token Refresh ────────────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const storedRefreshToken = getStoredRefreshToken();
      
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storedRefreshToken ? { refreshToken: storedRefreshToken } : {}),
        credentials: "include",
      });

      if (!refreshRes.ok) {
        if (refreshRes.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("token");
        }
        console.warn(`Token refresh failed (${refreshRes.status})`);
        return false;
      }

      const refreshPayload: Record<string, unknown> | null = await refreshRes.json().catch(() => null);
      if (
        refreshPayload &&
        typeof refreshPayload.accessToken === "string" &&
        typeof window !== "undefined"
      ) {
        localStorage.setItem("accessToken", refreshPayload.accessToken);
        if (typeof refreshPayload.refreshToken === "string") {
          localStorage.setItem("refreshToken", refreshPayload.refreshToken);
        }
        console.log("Access token refreshed");
        return true;
      }

      console.warn("Refresh response missing accessToken");
      return false;
    } catch (err) {
      console.error("Token refresh error:", err);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Fetch with Auth + Retry ──────────────────────────────────────────────────

async function fetchWithAuth(url: string, init: RequestInit = {}): Promise<Response> {
  const hasBody = Boolean(init.body);
  const firstResponse = await fetch(url, {
    ...init,
    headers: {
      ...getHeaders(hasBody),
      ...(init.headers ?? {}),
    },
    credentials: "include",
  });

  if (firstResponse.status !== 401) return firstResponse;

  // Try to refresh token
  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login/employer") {
      window.location.href = "/login/employer";
    }
    return firstResponse;
  }

  // Retry with new token
  return fetch(url, {
    ...init,
    headers: {
      ...getHeaders(hasBody),
      ...(init.headers ?? {}),
    },
    credentials: "include",
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const json = await res.json();
      console.log("[interviews.service] Error response:", json);
      
      // Handle Zod flattened error format: { message, errors: { formErrors: [], fieldErrors: { field: [msgs] } } }
      if (json?.errors?.fieldErrors || json?.errors?.formErrors) {
        const errorParts: string[] = [];
        
        // Add form-level errors
        if (json.errors.formErrors && Array.isArray(json.errors.formErrors)) {
          errorParts.push(...json.errors.formErrors);
        }
        
        // Add field-level errors
        if (json.errors.fieldErrors && typeof json.errors.fieldErrors === 'object') {
          Object.entries(json.errors.fieldErrors).forEach(([field, msgs]: [string, unknown]) => {
            if (Array.isArray(msgs)) {
              errorParts.push(`${field}: ${msgs.join(", ")}`);
            } else if (msgs) {
              errorParts.push(`${field}: ${msgs}`);
            }
          });
        }
        
        const errorDetails = errorParts.join(" | ");
        message = `${json.message || "Validation failed"}${errorDetails ? " - " + errorDetails : ""}`;
      } else if (json?.errors) {
        // Fallback for other error object formats
        const errorDetails = Object.entries(json.errors)
          .map(([field, details]: [string, unknown]) => {
            if (Array.isArray(details)) {
              return `${field}: ${details.join(", ")}`;
            }
            return `${field}: ${details}`;
          })
          .join(" | ");
        message = `${json.message || "Validation failed"} - ${errorDetails}`;
      } else if (json?.message) {
        message = json.message;
      }
    } catch (parseErr) {
      console.error("[interviews.service] Failed to parse error response:", parseErr);
      const text = await res.text().catch(() => null);
      if (text) {
        message = text;
      } else if (res.statusText) {
        message = res.statusText;
      }
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * GET /api/employer/interviews
 * List all interviews. Optionally filter by status.
 * Returns paginated InterviewDTO[].
 */
export async function getInterviews(options?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: InterviewDTO[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.page)   params.set("page",   String(options.page));
  if (options?.limit)  params.set("limit",  String(options.limit));

  const res = await fetchWithAuth(`${BASE}?${params.toString()}`, {
    cache: "no-store",
  });
  return handleResponse(res);
}

/**
 * GET /api/employer/interviews/scheduled-dates?year=&month=
 * Returns array of "YYYY-MM-DD" strings for calendar dot indicators.
 */
export async function getScheduledDates(year: number, month: number): Promise<string[]> {
  const res = await fetchWithAuth(`${BASE}/scheduled-dates?year=${year}&month=${month}`, {
    cache: "no-store",
  });
  const json = await handleResponse<{ dates: string[] }>(res);
  return json.dates;
}

/**
 * GET /api/employer/interviews/:id
 * Fetch a single InterviewDTO by ID.
 */
export async function getInterview(id: string): Promise<InterviewDTO> {
  const res = await fetchWithAuth(`${BASE}/${id}`, {
    cache: "no-store",
  });
  return handleResponse<InterviewDTO>(res);
}

/**
 * POST /api/employer/interviews
 * Create a draft interview.
 * For ONLINE: backend creates Google Calendar event + returns Meet link inside InterviewDTO.
 */
export async function createInterview(payload: CreateInterviewPayload): Promise<InterviewDTO> {
  const res = await fetchWithAuth(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse<InterviewDTO>(res);
}

/**
 * PATCH /api/employer/interviews/:id
 * Update draft fields (date, time, type, location, notes).
 * Returns updated InterviewDTO.
 */
export async function updateInterview(
  id: string,
  payload: Partial<CreateInterviewPayload>
): Promise<InterviewDTO> {
  const res = await fetchWithAuth(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return handleResponse<InterviewDTO>(res);
}

/**
 * POST /api/employer/interviews/generate-email
 * Generate email preview from current form data.
 * Does NOT save or send — purely for preview display.
 * Returns EmailPreviewDTO { subject, body }.
 */
export async function generateEmailPreview(payload: GenerateEmailPayload): Promise<EmailPreviewDTO> {
  const res = await fetchWithAuth(`${BASE}/generate-email`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse<EmailPreviewDTO>(res);
}

/**
 * PATCH /api/employer/interviews/:id/email-body
 * Save employer's custom email body to the draft.
 * Returns updated InterviewDTO.
 */
export async function saveEmailBody(id: string, emailBody: string): Promise<InterviewDTO> {
  const res = await fetchWithAuth(`${BASE}/${id}/email-body`, {
    method: "PATCH",
    body: JSON.stringify({ emailBody }),
  });
  return handleResponse<InterviewDTO>(res);
}

/**
 * POST /api/employer/interviews/:id/schedule
 * Confirm the interview — sends invitation email to candidate.
 * Changes status DRAFT → SCHEDULED.
 * Returns updated InterviewDTO with emailSentAt set.
 */
export async function scheduleAndSend(id: string): Promise<InterviewDTO> {
  const res = await fetchWithAuth(`${BASE}/${id}/schedule`, {
    method: "POST",
  });
  return handleResponse<InterviewDTO>(res);
}

/**
 * DELETE /api/employer/interviews/:id
 * Cancel and delete an interview.
 * Also removes the Google Calendar event if one exists.
 */
export async function cancelInterview(id: string): Promise<void> {
  const res = await fetchWithAuth(`${BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    await handleResponse(res);
  }
}

/**
 * POST /api/employer/interviews/:id/generate-cancel-email
 * Generate cancellation email preview.
 * Returns EmailPreviewDTO { subject, body } with cancellation message.
 */
export async function generateCancelEmailPreview(
  id: string,
  reason: string
): Promise<EmailPreviewDTO> {
  const res = await fetchWithAuth(`${BASE}/${id}/generate-cancel-email`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return handleResponse<EmailPreviewDTO>(res);
}

/**
 * POST /api/employer/interviews/:id/cancel-and-send
 * Cancel interview and send cancellation email.
 * Changes status SCHEDULED → CANCELLED.
 * Removes Google Calendar event.
 * Sends email to candidate.
 * Returns updated InterviewDTO with status="CANCELLED".
 */
export async function cancelAndSendEmail(
  id: string,
  payload: { reason: string; emailBody: string }
): Promise<InterviewDTO> {
  const res = await fetchWithAuth(`${BASE}/${id}/cancel-and-send`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse<InterviewDTO>(res);
}