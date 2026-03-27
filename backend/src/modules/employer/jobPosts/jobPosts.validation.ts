// Validation schemas for employer job post endpoints.
// We use Zod to validate and sanitize all incoming request bodies BEFORE
// they reach the service or database layer.
//
// Why validate here?
//   - Prevents garbage data from entering the DB
//   - Returns clear, structured error messages to the client
//   - Acts as a security boundary (rejects unexpected fields)

import { z } from "zod";

// ─── Create Job Post Schema ───────────────────────────────────────────────────
// Used when employer submits POST /api/employer/job-posts
// All required fields must be present; optional fields can be omitted.

export const createJobPostSchema = z.object({
  // title must be a non-empty string, max 150 chars to prevent abuse
  title: z
    .string()
    .min(1, "Job title cannot be empty")
    .max(150, "Job title cannot exceed 150 characters")
    .trim(),

  // type must be exactly "JOB" or "INTERNSHIP" — no other values accepted
  type: z.enum(["JOB", "INTERNSHIP"]),

  // description is optional at draft stage, max 5000 chars
  description: z
    .string()
    .max(5000, "Description cannot exceed 5000 characters")
    .trim()
    .optional(),

  // requirements is optional, max 3000 chars
  requirements: z
    .string()
    .max(3000, "Requirements cannot exceed 3000 characters")
    .trim()
    .optional(),

  // closingDate must be a valid ISO date string if provided
  // We coerce it to a Date object for DB storage
  closingDate: z
    .string()
    .datetime({ message: "Closing date must be a valid ISO 8601 date" })
    .optional(),

  // status defaults to DRAFT if not provided
  // Employer can only set DRAFT or ACTIVE when creating — not CLOSED
  status: z
    .enum(["DRAFT", "ACTIVE"])
    .optional()
    .default("DRAFT"),
});

// ─── Update Job Post Schema ───────────────────────────────────────────────────
// Used when employer submits PATCH /api/employer/job-posts/:id
// All fields are optional — employer can update just one field at a time.
// We use .partial() to make all fields from createJobPostSchema optional,
// then override status to allow CLOSED as well (can close an existing post).

export const updateJobPostSchema = createJobPostSchema
  .partial()  // Makes all fields optional for partial updates
  .extend({
    // On update, employer can also set status to CLOSED
    status: z
      .enum(["DRAFT", "ACTIVE", "CLOSED"])
      .optional(),
  });

// ─── Query Filter Schema ──────────────────────────────────────────────────────
// Used to validate query parameters for GET /api/employer/job-posts
// All filters are optional — employer can filter by any combination.

export const jobPostQuerySchema = z.object({
  // Filter by status — must be a valid PostStatus value if provided
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).optional(),

  // Filter by type — JOB or INTERNSHIP
  type: z.enum(["JOB", "INTERNSHIP"]).optional(),

  // Search by job title (case-insensitive substring match)
  search: z.string().max(100).trim().optional(),

  // Pagination — default page 1, limit 20
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
});

// ─── Exported Types ───────────────────────────────────────────────────────────
// These types are inferred from the schemas so the service and repository
// layers are always in sync with validation — no manual type duplication.

export type CreateJobPostInput = z.infer<typeof createJobPostSchema>;
export type UpdateJobPostInput = z.infer<typeof updateJobPostSchema>;
export type JobPostQueryInput = z.infer<typeof jobPostQuerySchema>;
