// Repository layer for employer job post management.
// Responsible ONLY for database access — no business logic lives here.
// All queries are built with Prisma and typed explicitly.

import { prisma } from "../../../config/db";
import { CreateJobPostInput, UpdateJobPostInput } from "./jobPosts.validation";
import { JobType, WorkMode, EmploymentType, PostStatus } from "@prisma/client";

let closingDateSchemaChecked = false;
let closingDateSchemaCheckPromise: Promise<void> | null = null;

async function ensureClosingDateColumnCompatibility(): Promise<void> {
  if (closingDateSchemaChecked) return;
  if (closingDateSchemaCheckPromise) return closingDateSchemaCheckPromise;

  closingDateSchemaCheckPromise = (async () => {
    try {
      const closingColumn = (await prisma.$queryRawUnsafe(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'JobPost'
           AND column_name = 'closingDate'
         LIMIT 1;`
      )) as Array<{ column_name: string }>;

      if (closingColumn.length > 0) {
        closingDateSchemaChecked = true;
        return;
      }

      const closedColumn = (await prisma.$queryRawUnsafe(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'JobPost'
           AND column_name = 'closedDate'
         LIMIT 1;`
      )) as Array<{ column_name: string }>;

      if (closedColumn.length > 0) {
        await prisma.$executeRawUnsafe(
          'ALTER TABLE "JobPost" RENAME COLUMN "closedDate" TO "closingDate";'
        );
      } else {
        await prisma.$executeRawUnsafe(
          'ALTER TABLE "JobPost" ADD COLUMN "closingDate" TIMESTAMP(3);'
        );
      }

      closingDateSchemaChecked = true;
    } finally {
      closingDateSchemaCheckPromise = null;
    }
  })();

  return closingDateSchemaCheckPromise;
}

export interface GetJobPostsOptions {
  employerId: string;
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const jobsRepository = {
  // ═══════════════════════════════════════════════════════════════════════════
  // FIND EMPLOYER PROFILE — Used to verify employer exists and is approved.
  // Called by service layer to check if user has an employer account.
  // ═══════════════════════════════════════════════════════════════════════════
  async findEmployerProfileByUserId(userId: string) {
    // Query employer profile by user ID; only fetch id and verification status
    return prisma.employerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        verificationStatus: true,
      },
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FIND ALL JOB POSTS — Returns paginated, filtered list of job posts.
  // Supports filtering by status, type, and text search in title.
  // IMPORTANT: Always filters by employerId to ensure data isolation.
  // ═══════════════════════════════════════════════════════════════════════════
  async findAll(options: GetJobPostsOptions) {
    // Ensure 'closingDate' column exists (schema migration for backward compatibility)
    await ensureClosingDateColumnCompatibility();

    const { employerId, status, type, search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Build WHERE clause dynamically: always includes employerId, optionally includes filters
    const where: any = {
      employerId,                                            // CRITICAL: Filter by owner employer
      ...(status ? { status: status as any } : {}),        // Optional: Filter by status
      ...(type ? { type: type as any } : {}),              // Optional: Filter by type (JOB/INTERNSHIP)
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}), // Optional: Search title
    };

    // Execute count and find in parallel for efficiency
    const [total, posts] = await Promise.all([
      prisma.jobPost.count({ where }),
      prisma.jobPost.findMany({
        where,
        orderBy: { createdAt: "desc" },  // Newest posts first
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          description: true,
          requirements: true,
          responsibilities: true,
          skillsRequired: true,
          workMode: true,
          employmentType: true,
          stipendType: true,
          location: true,
          duration: true,
          experienceLevel: true,
          closingDate: true,
          createdAt: true,
          updatedAt: true,
          employer: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      }),
    ]);

    return { posts, total };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GET STATS — Returns count of job posts by status.
  // Used by dashboard to show: Total | Active | Draft | Closed
  // ═══════════════════════════════════════════════════════════════════════════
  async getStats(employerId: string) {
    await ensureClosingDateColumnCompatibility();

    // Use GROUP BY to count posts per status
    const stats = await prisma.jobPost.groupBy({
      by: ["status"],
      where: { employerId },
      _count: { id: true },
    });

    // Initialize result object with all statuses
    const result = { DRAFT: 0, ACTIVE: 0, CLOSED: 0, TOTAL: 0 };

    // Populate with counts from query results
    for (const row of stats) {
      result[row.status] = row._count.id;
      result.TOTAL += row._count.id;
    }

    return result;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FIND BY ID — Returns a single job post by ID.
  // IMPORTANT: WHERE clause includes employerId to enforce ownership.
  // CRITICAL: If post exists but doesn't belong to employerId, returns null.
  // ═══════════════════════════════════════════════════════════════════════════
  async findById(id: string, employerId: string) {
    await ensureClosingDateColumnCompatibility();

    // findFirst with two WHERE conditions: both id AND employerId must match
    return prisma.jobPost.findFirst({
      where: {
        id,
        employerId,  // CRITICAL: Ownership check
      },
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE — Inserts a new job post into the database.
  // Defaults to DRAFT status if not specified.
  // ═══════════════════════════════════════════════════════════════════════════
  async create(employerId: string, data: CreateJobPostInput) {
    await ensureClosingDateColumnCompatibility();

    // Map frontend fields to backend schema (Prisma enums)
    const createPayload = {
      title: data.title,
      type: data.type === "Job" ? JobType.JOB : JobType.INTERNSHIP,
      description: data.description,
      requirements: data.requirements ? [data.requirements] : [],
      responsibilities: data.additionalInformation
        ? data.additionalInformation.split(/\r?\n|,/).map((item: string) => item.trim()).filter(Boolean)
        : [],
      skillsRequired: data.skills
        ? data.skills.split(/[\s,]+/).map((s: string) => s.trim()).filter(Boolean)
        : [],
      workMode:
        data.workMode === "Remote"
          ? WorkMode.REMOTE
          : data.workMode === "Hybrid"
          ? WorkMode.HYBRID
          : data.workMode === "On site"
          ? WorkMode.ON_SITE
          : undefined,
      employmentType:
        data.employmentType === "Full-time"
          ? EmploymentType.FULL_TIME
          : data.employmentType === "Part-time"
          ? EmploymentType.PART_TIME
          : data.employmentType === "Contract"
          ? EmploymentType.CONTRACT
          : undefined,
      stipendType: undefined,
      location: data.location,
      duration: undefined,
      experienceLevel: undefined,
      closingDate: data.closingDate ? new Date(data.closingDate) : null,
      status:
        data.status === "Active"
          ? PostStatus.ACTIVE
          : data.status === "Draft"
          ? PostStatus.DRAFT
          : data.status === "Closed"
          ? PostStatus.CLOSED
          : PostStatus.DRAFT,
      employerId,
    };

    try {
      return await prisma.jobPost.create({ data: createPayload });
    } catch (err: unknown) {
      // Backward-compatibility: handle old schema with NOT NULL department column
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("department")) {
        await prisma.$executeRawUnsafe(
          "ALTER TABLE \"JobPost\" ALTER COLUMN \"department\" SET DEFAULT 'General';"
        );
        return prisma.jobPost.create({ data: createPayload });
      }
      throw err;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE — Partially updates a job post.
  // Only updates fields that are provided (all fields optional for partial PATCH).
  // IMPORTANT: WHERE clause includes employerId to prevent cross-employer updates.
  // ═══════════════════════════════════════════════════════════════════════════
  async update(id: string, employerId: string, data: UpdateJobPostInput) {
    await ensureClosingDateColumnCompatibility();

    // Conditionally update: only set fields if they were provided in data
    return prisma.jobPost.update({
      where: {
        id,
        employerId,  // CRITICAL: Ownership check in WHERE clause
      },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.type !== undefined && {
          type: data.type === "Job" ? JobType.JOB : JobType.INTERNSHIP,
        }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.requirements !== undefined && { requirements: data.requirements ? [data.requirements] : [] }),
        ...(data.additionalInformation !== undefined && {
          responsibilities: data.additionalInformation
            ? data.additionalInformation.split(/\r?\n|,/).map((item: string) => item.trim()).filter(Boolean)
            : [],
        }),
        ...(data.skills !== undefined && {
          skillsRequired: data.skills
            ? data.skills.split(/[\s,]+/).map((s: string) => s.trim()).filter(Boolean)
            : [],
        }),
        ...(data.workMode !== undefined && {
          workMode:
            data.workMode === "Remote"
              ? WorkMode.REMOTE
              : data.workMode === "Hybrid"
              ? WorkMode.HYBRID
              : data.workMode === "On site"
              ? WorkMode.ON_SITE
              : undefined,
        }),
        ...(data.employmentType !== undefined && {
          employmentType:
            data.employmentType === "Full-time"
              ? EmploymentType.FULL_TIME
              : data.employmentType === "Part-time"
              ? EmploymentType.PART_TIME
              : data.employmentType === "Contract"
              ? EmploymentType.CONTRACT
              : undefined,
        }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.closingDate !== undefined && {
          closingDate: data.closingDate ? new Date(data.closingDate) : null,
        }),
        ...(data.status !== undefined && {
          status:
            data.status === "Active"
              ? PostStatus.ACTIVE
              : data.status === "Draft"
              ? PostStatus.DRAFT
              : data.status === "Closed"
              ? PostStatus.CLOSED
              : PostStatus.DRAFT,
        }),
      },
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE BY ID — Permanently deletes a job post.
  // IMPORTANT: WHERE clause includes employerId to prevent cross-employer deletion.
  // CRITICAL: This operation is IRREVERSIBLE — no recovery possible.
  // ═══════════════════════════════════════════════════════════════════════════
  async deleteById(id: string, employerId: string) {
    await ensureClosingDateColumnCompatibility();

    // Delete post where both id AND employerId match
    // If post doesn't exist or doesn't belong to employerId, Prisma throws error
    return prisma.jobPost.delete({
      where: {
        id,
        employerId,  // CRITICAL: Ownership check prevents cross-employer deletion
      },
    });
  },
};
