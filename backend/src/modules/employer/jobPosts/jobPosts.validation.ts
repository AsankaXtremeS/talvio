import { z } from "zod";

export const jobPostStatusSchema = z.enum(["DRAFT", "ACTIVE", "CLOSED"]);
export const jobPostTypeSchema = z.enum(["JOB", "INTERNSHIP"]);

export const createJobPostSchema = z.object({
  title: z.string().min(1).max(150),
  type: jobPostTypeSchema,
  description: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  closingDate: z.string().datetime().optional().nullable(),
  status: jobPostStatusSchema.optional(),
});

export const updateJobPostSchema = createJobPostSchema.partial();

export const jobPostQuerySchema = z.object({
  status: jobPostStatusSchema.optional(),
  type: jobPostTypeSchema.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateJobPostInput = z.infer<typeof createJobPostSchema>;
export type UpdateJobPostInput = z.infer<typeof updateJobPostSchema>;
export type JobPostQueryInput = z.infer<typeof jobPostQuerySchema>;
