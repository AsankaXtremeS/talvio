import { Express } from "express"
import authRoutes from "./modules/auth/auth.routes"
import adminCompaniesRoutes from "./modules/admin/companies/companies.routes";
import adminCandidatesRoutes from "./modules/admin/candidates/candidates.routes";
import adminDashboardRoutes from "./modules/admin/dashboard/dashboard.routes";
import adminJobPostsRoutes from "./modules/admin/jobposts/jobpost.routes";
import employerJobPostsRoutes from "./modules/employer/jobPosts/jobPosts.routes";
import candidateJobsRoutes from "./modules/candidate/jobs/jobs.routes";
import candidateApplicationsRoutes from "./modules/candidate/applications/applications.routes";
import candidateProfileRoutes from "./modules/candidate/profile/profile.routes";
import aiRoutes from "./modules/ai/ai.routes";

export const registerRoutes = (app: Express) => {
  app.use("/api/auth", authRoutes)
  app.use("/api/admin/companies", adminCompaniesRoutes)
  app.use("/api/admin/candidates", adminCandidatesRoutes);
  app.use("/api/admin/dashboard", adminDashboardRoutes);
  app.use("/api/admin/job-posts", adminJobPostsRoutes);
  app.use("/api/employer/job-posts", employerJobPostsRoutes);
  app.use("/api/candidate/jobs", candidateJobsRoutes);
  app.use("/api/candidate/applications", candidateApplicationsRoutes);
  app.use("/api/candidate/profile", candidateProfileRoutes);
  app.use("/api/ai", aiRoutes);
}
