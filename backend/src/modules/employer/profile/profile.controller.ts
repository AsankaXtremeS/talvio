// Controller layer for employer profile management.
//
// A controller's ONLY job is HTTP: read the request, call the service,
// send the response. No business logic or DB queries belong here.
//
// Error handling pattern (same as jobPosts.controller.ts):
//   Services throw errors with a statusCode property for known cases (403, 404).
//   resolveStatusCode() reads that to set the right HTTP status.
//   Anything without a statusCode falls back to 500.

import { Request, Response } from "express";
import { profileService } from "./profile.service";
import { updateProfileSchema } from "./profile.validation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveStatusCode = (err: any): number => {
  if (isDbUnavailableError(err)) return 503;
  if (typeof err?.statusCode === "number") return err.statusCode;
  return 500;
};

const isDbUnavailableError = (err: any): boolean => {
  const message = typeof err?.message === "string" ? err.message.toLowerCase() : "";
  const name = typeof err?.name === "string" ? err.name : "";
  return (
    name === "PrismaClientInitializationError" ||
    name === "PrismaClientKnownRequestError" ||
    message.includes("can't reach database server") ||
    message.includes("database") ||
    message.includes("p1001")
  );
};

const getPublicErrorMessage = (err: any, fallback: string): string => {
  if (isDbUnavailableError(err)) {
    return "Service temporarily unavailable. Please try again in a moment.";
  }
  if (typeof err?.message === "string" && err.message.trim()) {
    return err.message;
  }
  return fallback;
};

const logControllerError = (scope: string, err: any): void => {
  if (isDbUnavailableError(err)) {
    console.error(`${scope} error: database unavailable`);
    return;
  }
  console.error(`${scope} error:`, err);
};

// userId always comes from the verified JWT payload set by the authenticate
// middleware — never from req.body or req.params. This is the key IDOR guard.
const getUserId = (req: Request): string | null => {
  return (req.user as any)?.id ?? (req.user as any)?.userId ?? null;
};


// ─── GET /api/employer/profile ────────────────────────────────────────────────
//
// Returns the authenticated employer's own profile.
//
// Response: EmployerProfileDTO
// Errors:   401 if not authenticated | 404 if profile missing
//
// Available to PENDING and REJECTED employers too (they need to read their
// profile and rejection reason without being able to change anything).

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await profileService.getProfile(userId);
    res.json(profile);
  } catch (err: any) {
    logControllerError("getProfile", err);
    res.status(resolveStatusCode(err)).json({
      message: getPublicErrorMessage(err, "Failed to fetch profile."),
    });
  }
};


// ─── PATCH /api/employer/profile ─────────────────────────────────────────────
//
// Partially updates the authenticated employer's own profile.
// Only whitelisted fields (companyName, description, website, location,
// companyLogoUrl) can be changed. Status, registration docs, and IDs
// are immutable from this endpoint.
//
// Request body: any subset of the whitelisted fields (all optional)
// Response: updated EmployerProfileDTO
// Errors:   400 validation | 401 unauthorized | 403 not approved | 404 no profile

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Validate input with Zod — unknown fields are stripped automatically
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const updated = await profileService.updateProfile(userId, parseResult.data);
    res.json(updated);
  } catch (err: any) {
    logControllerError("updateProfile", err);
    res.status(resolveStatusCode(err)).json({
      message: getPublicErrorMessage(err, "Failed to update profile."),
    });
  }
};