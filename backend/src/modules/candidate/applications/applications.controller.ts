import { Request, Response } from "express";
import { applicationsService } from "./applications.service";

export const getApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Ensure user is a candidate
    if (role !== "STUDENT" && role !== "PROFESSIONAL") {
      res.status(403).json({ message: "Access denied. Only candidates can view applications." });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await applicationsService.getCandidateApplications(userId, page, limit);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
