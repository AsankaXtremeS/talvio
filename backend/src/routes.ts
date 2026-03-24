import { Express } from "express"
import authRoutes from "./modules/auth/auth.routes"
import adminCompaniesRoutes from "./modules/admin/companies/companies.routes";
import employerJobPostsRoutes from "./modules/employer/jobPosts/jobPosts.routes";

export const registerRoutes = (app: Express) => {
  app.use("/api/auth", authRoutes)
  app.use("/api/admin/companies", adminCompaniesRoutes)
  app.use("/api/employer/job-posts", employerJobPostsRoutes)// Employer routes 
}
