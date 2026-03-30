import { Request, Response } from "express";
import { jobsService } from "./jobs.service";

export const getJobs = async (req: Request, res: Response) => {
  try {
    // Get the logged in user's role from the request
    // (auth middleware adds the user to req.user)
    const role = req.user?.role;

    if (!role) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Make sure only candidates can access this
    if (role !== "STUDENT" && role !== "PROFESSIONAL") {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Get jobs based on role
    const jobs = await jobsService.getJobsByRole(role);

    res.status(200).json({ jobs });

  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};