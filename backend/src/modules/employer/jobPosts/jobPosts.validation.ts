export type CreateJobPostInput = z.infer<typeof createJobPostSchema>;
export type UpdateJobPostInput = z.infer<typeof updateJobPostSchema>;
export type JobPostQueryInput = z.infer<typeof jobPostQuerySchema>;
import { z } from "zod";
const normalizeStringList = (value: string | string[]): string[] => {
  const parts = Array.isArray(value) ? value : value.split(/\r?\n|,/);
  return parts.map((item) => item.trim()).filter(Boolean);
};


// Accept exactly the frontend's field names and types
export const createJobPostSchema = z.object({
  title: z.string().min(1).max(150).trim(),
  type: z.enum(["Job", "Internship"]),
  closingDate: z.string().max(30),
  location: z.string().max(255),
  description: z.string().min(20).max(700),
  responsibilities: z.string().min(20).max(700).optional().or(z.literal("")).default(""),
  requirements: z.string().min(20).max(700),
  additionalInformation: z.string().min(20).max(700).optional().or(z.literal("")).default(""),
  skills: z.string().max(1000),
  workMode: z.enum(["On site", "Remote", "Hybrid"]),
  employmentType: z.enum(["Full-time", "Part-time", "Contract"]),
  status: z.enum(["Draft", "Active", "Closed"]),
});

export const updateJobPostSchema = createJobPostSchema.partial();

export const jobPostQuerySchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).optional(),
  type: z.enum(["JOB", "INTERNSHIP"]).optional(),
  search: z.string().max(100).trim().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
});


