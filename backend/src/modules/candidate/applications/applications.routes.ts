import { Router } from "express";
import { getApplications } from "./applications.controller";
import { authenticate } from "../../../middlewares/auth.middleware";

const router = Router();

// GET /api/candidate/applications
// Protected route - only logged in candidates can access
router.get("/", authenticate, getApplications);

export default router;
