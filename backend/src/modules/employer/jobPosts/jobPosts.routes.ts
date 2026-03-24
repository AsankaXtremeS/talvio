// Route definitions for employer job post management.
//
// All routes in this file are:
//   1. Protected by `authenticate`       — user must be logged in (valid JWT)
//   2. Protected by `requireRole`        — user must have the EMPLOYER role
//
// Base path (mounted in routes.ts): /api/employer/job-posts
//
// Pattern followed from: src/modules/admin/companies/companies.routes.ts

import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/role.middleware";
import {
  getJobPostStats,
  getJobPosts,
  getJobPostById,
  createJobPost,
  updateJobPost,
  deleteJobPost,
} from "./jobPosts.controller";

const router = Router();

// Apply auth + role guard to EVERY route in this file.
// Doing it once here (rather than per-route) ensures no route is
// accidentally left unprotected.
//
// SECURITY: Only users with role=EMPLOYER can access these routes.
// Even if an ADMIN or STUDENT has a valid JWT, they will get 403.
router.use(authenticate, requireRole("EMPLOYER"));

// ─── Stats ────────────────────────────────────────────────────────────────────
// IMPORTANT: /stats must be registered BEFORE /:id
// Otherwise Express will match "stats" as an :id parameter.

// GET /api/employer/job-posts/stats
// Returns: { total, active, draft, closed } counts for dashboard cards
router.get("/stats", getJobPostStats);

// ─── Job Post CRUD ────────────────────────────────────────────────────────────

// GET    /api/employer/job-posts          — list all posts (paginated, filterable)
// POST   /api/employer/job-posts          — create a new job post
router.get("/", getJobPosts);
router.post("/", createJobPost);

// GET    /api/employer/job-posts/:id      — get a single post by ID
// PATCH  /api/employer/job-posts/:id      — partially update a post
// DELETE /api/employer/job-posts/:id      — delete a post permanently
router.get("/:id", getJobPostById);
router.patch("/:id", updateJobPost);
router.delete("/:id", deleteJobPost);

export default router;
