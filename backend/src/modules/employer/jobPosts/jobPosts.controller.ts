import { Request, Response } from "express";
import { jobsService } from "./jobPosts.service";
import { createJobPostSchema, jobPostQuerySchema, updateJobPostSchema } from "./jobPosts.validation";

const statusFromError = (err: unknown): number => {
  const code = (err as { statusCode?: unknown })?.statusCode;
  return typeof code === "number" ? code : 500;
};

const messageFromError = (err: unknown, fallback: string): string => {
  const message = (err as { message?: unknown })?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

const userIdFromRequest = (req: Request): string | null => {
  const user = req.user as { id?: string; userId?: string } | undefined;
  return user?.id ?? user?.userId ?? null;
};

export const getJobPostStats = async (req: Request, res: Response) => {
  try {
    const userId = userIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const stats = await jobsService.getStats(userId);
    res.json(stats);
  } catch (err: unknown) {
    res.status(statusFromError(err)).json({ message: messageFromError(err, "Failed to fetch stats.") });
  }
};

export const getJobPosts = async (req: Request, res: Response) => {
  try {
    const userId = userIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const parsed = jobPostQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await jobsService.getJobPosts(userId, parsed.data);
    res.json(result);
  } catch (err: unknown) {
    res.status(statusFromError(err)).json({ message: messageFromError(err, "Failed to fetch job posts.") });
  }
};

export const getJobPostById = async (req: Request, res: Response) => {
  try {
    const userId = userIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) return res.status(400).json({ message: "Job post ID is required" });

    const post = await jobsService.getJobPostById(userId, id);
    res.json(post);
  } catch (err: unknown) {
    res.status(statusFromError(err)).json({ message: messageFromError(err, "Failed to fetch job post.") });
  }
};

export const createJobPost = async (req: Request, res: Response) => {
  try {
    const userId = userIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const parsed = createJobPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const post = await jobsService.createJobPost(userId, parsed.data);
    res.status(201).json(post);
  } catch (err: unknown) {
    res.status(statusFromError(err)).json({ message: messageFromError(err, "Failed to create job post.") });
  }
};

export const updateJobPost = async (req: Request, res: Response) => {
  try {
    const userId = userIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) return res.status(400).json({ message: "Job post ID is required" });

    const parsed = updateJobPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const post = await jobsService.updateJobPost(userId, id, parsed.data);
    res.json(post);
  } catch (err: unknown) {
    res.status(statusFromError(err)).json({ message: messageFromError(err, "Failed to update job post.") });
  }
};

export const deleteJobPost = async (req: Request, res: Response) => {
  try {
    const userId = userIdFromRequest(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) return res.status(400).json({ message: "Job post ID is required" });

    await jobsService.deleteJobPost(userId, id);
    res.json({ message: "Job post deleted successfully." });
  } catch (err: unknown) {
    res.status(statusFromError(err)).json({ message: messageFromError(err, "Failed to delete job post.") });
  }
};
