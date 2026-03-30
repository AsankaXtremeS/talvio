import { Router } from "express";
import { getJobs } from "./jobs.controller";
import { authenticate } from "../../../middlewares/auth.middleware";

const router = Router();

// GET /api/candidate/jobs
// Protected route - only logged in candidates can access
router.get("/", authenticate, getJobs);

export default router;