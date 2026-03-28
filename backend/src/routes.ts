import { Express } from "express"
import authRoutes from "./modules/auth/auth.routes"
import adminCompaniesRoutes from "./modules/admin/companies/companies.routes";
import adminCandidatesRoutes from "./modules/admin/candidates/candidates.routes";
import adminDashboardRoutes from "./modules/admin/dashboard/dashboard.routes";
import aiRoutes from "./modules/ai/ai.routes";

export const registerRoutes = (app: Express) => {
  app.use("/api/auth", authRoutes)
  app.use("/api/admin/companies", adminCompaniesRoutes)
  app.use("/api/admin/candidates", adminCandidatesRoutes);
  app.use("/api/admin/dashboard", adminDashboardRoutes);
  app.use("/api/ai", aiRoutes);
}
