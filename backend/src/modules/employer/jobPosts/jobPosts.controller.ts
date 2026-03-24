// Controller layer for employer job post management.
//
// A controller's ONLY job is HTTP: read the request, call the service,
// send the response. No business logic or DB queries belong here.
//
// Error handling pattern (same as companies.controller.ts):
//   Services throw errors with a statusCode property for known cases (404, 403).
//   resolveStatusCode() reads that to set the right HTTP status.
//   Anything without a statusCode falls back to 500.
//
// Pattern followed from: src/modules/admin/companies/companies.controller.ts

import { Request, Response } from "express";
import { jobsService } from "./jobPosts.service";
import {
  createJobPostSchema,
  updateJobPostSchema,
  jobPostQuerySchema,
} from "./jobPosts.validation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract the HTTP status code from a thrown error.
 * Services attach err.statusCode for known cases (403, 404, etc.).
 * Defaults to 500 for unexpected errors.
 */
const resolveStatusCode = (err: any): number => {
  if (typeof err?.statusCode === "number") return err.statusCode;
  return 500;
};

/**
 * Extract the authenticated user's ID from the request.
 * The `authenticate` middleware sets req.user from the JWT payload.
 * Returns null if user is not set (should never happen after authenticate middleware).
 */
const getUserId = (req: any): string | null => {
  return req.user?.id ?? req.user?.userId ?? null;
};


// ─── GET /api/employer/job-posts/stats ────────────────────────────────────────
//
// Returns dashboard stats: total, active, draft, and closed post counts.
// Used to populate the stats cards at the top of the Job Posts page.
//
// Response: { total, active, draft, closed }

export const getJobPostStats = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const stats = await jobsService.getStats(userId);
    res.json(stats);
  } catch (err: any) {
    console.error("getJobPostStats error:", err);
    res.status(resolveStatusCode(err)).json({ message: err.message || "Failed to fetch stats." });
  }
};


// ─── GET /api/employer/job-posts ──────────────────────────────────────────────
//
// Returns a paginated, filterable list of the employer's job posts.
//
// Query params:
//   status  - optional: DRAFT | ACTIVE | CLOSED
//   type    - optional: JOB | INTERNSHIP
//   search  - optional: search by title
//   page    - optional: page number (default: 1)
//   limit   - optional: records per page (default: 20)
//
// Response: { data: JobPostDTO[], pagination: { total, page, limit, totalPages } }

export const getJobPosts = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Validate and parse query parameters using Zod
    const queryResult = jobPostQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: queryResult.error.flatten().fieldErrors,
      });
    }

    const result = await jobsService.getJobPosts(userId, queryResult.data);
    res.json(result);
  } catch (err: any) {
    console.error("getJobPosts error:", err);
    res.status(resolveStatusCode(err)).json({ message: err.message || "Failed to fetch job posts." });
  }
};


// ─── GET /api/employer/job-posts/:id ─────────────────────────────────────────
//
// Returns a single job post by ID.
// Only returns the post if it belongs to the requesting employer.
//
// Route params:
//   id - UUID of the job post
//
// Response: JobPostDTO
// Errors:   404 if not found or not owned by this employer

export const getJobPostById = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const postIdParam = req.params.id;
    const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;
    if (!postId) return res.status(400).json({ message: "Job post ID is required" });

    const post = await jobsService.getJobPostById(userId, postId);
    res.json(post);
  } catch (err: any) {
    console.error("getJobPostById error:", err);
    res.status(resolveStatusCode(err)).json({ message: err.message || "Failed to fetch job post." });
  }
};


// ─── POST /api/employer/job-posts ─────────────────────────────────────────────
//
// Create a new job post. Defaults to DRAFT status.
//
// Request body (JSON):
//   title*       - string
//   department*  - string
//   type*        - "JOB" | "INTERNSHIP"
//   description  - string (optional)
//   requirements - string (optional)
//   location     - string (optional)
//   closedDate   - ISO date string (optional)
//   status       - "DRAFT" | "ACTIVE" (optional, default: "DRAFT")
//
// Response: 201 + JobPostDTO
// Errors:   400 if validation fails | 403 if not approved employer

export const createJobPost = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Validate request body with Zod schema
    const bodyResult = createJobPostSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        // flatten() gives a clean { fieldName: [errorMessages] } object
        errors: bodyResult.error.flatten().fieldErrors,
      });
    }

    const post = await jobsService.createJobPost(userId, bodyResult.data);
    // 201 Created — standard HTTP status for successful resource creation
    res.status(201).json(post);
  } catch (err: any) {
    console.error("createJobPost error:", err);
    res.status(resolveStatusCode(err)).json({ message: err.message || "Failed to create job post." });
  }
};


// ─── PATCH /api/employer/job-posts/:id ───────────────────────────────────────
//
// Partially update an existing job post.
// Only updates fields that are provided in the request body.
//
// Route params:
//   id - UUID of the job post
//
// Request body: any subset of job post fields (all optional)
//
// Response: updated JobPostDTO
// Errors:   400 validation | 403 not approved | 404 not found / not owned

export const updateJobPost = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const postIdParam = req.params.id;
    const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;
    if (!postId) return res.status(400).json({ message: "Job post ID is required" });

    // Validate request body — all fields optional for partial update
    const bodyResult = updateJobPostSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: bodyResult.error.flatten().fieldErrors,
      });
    }

    const updated = await jobsService.updateJobPost(userId, postId, bodyResult.data);
    res.json(updated);
  } catch (err: any) {
    console.error("updateJobPost error:", err);
    res.status(resolveStatusCode(err)).json({ message: err.message || "Failed to update job post." });
  }
};


// ─── DELETE /api/employer/job-posts/:id ──────────────────────────────────────
//
// Permanently delete a job post.
// Only the owning employer can delete their own posts.
//
// Route params:
//   id - UUID of the job post
//
// Response: { message: "Job post deleted successfully." }
// Errors:   403 not approved | 404 not found / not owned

export const deleteJobPost = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const postIdParam = req.params.id;
    const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;
    if (!postId) return res.status(400).json({ message: "Job post ID is required" });

    await jobsService.deleteJobPost(userId, postId);
    res.json({ message: "Job post deleted successfully." });
  } catch (err: any) {
    console.error("deleteJobPost error:", err);
    res.status(resolveStatusCode(err)).json({ message: err.message || "Failed to delete job post." });
  }
};
