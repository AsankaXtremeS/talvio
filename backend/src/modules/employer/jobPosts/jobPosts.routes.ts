import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import { requireRole } from "../../../middlewares/role.middleware";
import {
  createJobPost,
  deleteJobPost,
  getJobPostById,
  getJobPosts,
  getJobPostStats,
  updateJobPost,
} from "./jobPosts.controller";

const router = Router();

router.use(authenticate, requireRole("EMPLOYER"));

router.get("/stats", getJobPostStats);
router.get("/", getJobPosts);
router.post("/", createJobPost);
router.get("/:id", getJobPostById);
router.patch("/:id", updateJobPost);
router.delete("/:id", deleteJobPost);

export default router;
