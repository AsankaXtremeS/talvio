import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import { 
  getApplications, 
  getStats,
  getApplicationDetail,
  applyForJob, 
  withdrawApplication,
  getApplicationWithHistory
} from "./applications.controller";

const router = Router();

// GET /api/candidate/applications
router.get("/", authenticate, getApplicationhttps://github.com/AsankaXtremeS/talvio/pull/107/conflict?name=backend%252Fsrc%252Fmodules%252Fcandidate%252Fapplications%252Fapplications.routes.ts&ancestor_oid=fa81ae4ab6b18215cdbed179e373bc73a91844dc&base_oid=d7554a3cff078a3717f647d49bbebeae93c0ee01&head_oid=57d53b608325705b507f79516979b4acb790d1das);

// GET /api/candidate/applications/stats
router.get("/stats", authenticate, getStats);

// GET /api/candidate/applications/:applicationId (with status history)
router.get("/:applicationId", authenticate, getApplicationWithHistory);

// POST /api/candidate/applications/apply/:jobPostId
router.post("/apply/:jobPostId", authenticate, applyForJob);

// DELETE /api/candidate/applications/withdraw/:applicationId
router.delete("/withdraw/:applicationId", authenticate, withdrawApplication);

export default router;
