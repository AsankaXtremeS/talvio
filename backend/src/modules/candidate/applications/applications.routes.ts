import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import { 
  getApplications, 
  applyForJob, 
  withdrawApplication 
} from "./applications.controller";

const router = Router();

// GET /api/candidate/applications
router.get("/", authenticate, getApplications);

// POST /api/candidate/applications/apply/:jobPostId
router.post("/apply/:jobPostId", authenticate, applyForJob);

// DELETE /api/candidate/applications/withdraw/:applicationId
router.delete("/withdraw/:applicationId", authenticate, withdrawApplication);

export default router;
