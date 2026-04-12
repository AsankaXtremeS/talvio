// Repository layer for employer job post management.
// Responsible ONLY for database access — no business logic lives here.
// All queries are built with Prisma and typed explicitly.

import { prisma } from "../../../config/db";
import { CreateJobPostInput, UpdateJobPostInput } from "./jobPosts.validation";
import { JobType, PostStatus } from "@prisma/client";

const toNullableString = (value: string | undefined): string | null => {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toStringArray = (value: string | undefined | null): string[] => {
  if (value === undefined || value === null) return [];
  const normalized = String(value).trim();
  if (normalized.length === 0) return [];
  return normalized
    .split(/\r?\n|,/) 
    .map((item) => item.trim())
    .filter(Boolean);
};

const toWorkMode = (value: string | undefined): "REMOTE" | "HYBRID" | "ON_SITE" | null => {
  if (value === "Remote") return "REMOTE";
  if (value === "Hybrid") return "HYBRID";
  if (value === "On site") return "ON_SITE";
  return null;
};

const toEmploymentType = (
  value: string | undefined
): "FULL_TIME" | "PART_TIME" | "CONTRACT" | null => {
  if (value === "Full-time") return "FULL_TIME";
  if (value === "Part-time") return "PART_TIME";
  if (value === "Contract") return "CONTRACT";
  return null;
};

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
          responsibilities: true,
          requirements: true,
          additionalInformation: true,
          skills: true,
          workMode: true,
          employmentType: true,
          location: true,
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

    const requirementsText = toNullableString(data.requirements);

    // Map frontend fields to currently generated Prisma schema
    const createPayload = {
      title: data.title,
      type: data.type === "Job" ? JobType.JOB : JobType.INTERNSHIP,
      description: toNullableString(data.description),
      responsibilities: toStringArray(data.responsibilities),
      requirements: toStringArray(data.requirements),
      skillsRequired: toStringArray(data.skills),
      additionalInformation: toNullableString(data.additionalInformation),
      skills: toNullableString(data.skills),
      workMode: toWorkMode(data.workMode),
      employmentType: toEmploymentType(data.employmentType),
      location: toNullableString(data.location),
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

    // Use updateMany to allow filtering by employerId alongside id for security.
    // Then fetch the updated row because updateMany only returns a count.
    const result = await prisma.jobPost.updateMany({
      where: {
        id,
        employerId, // CRITICAL: Now securely checking ownership
      },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.type !== undefined && {
          type: data.type === "Job" ? JobType.JOB : JobType.INTERNSHIP,
        }),
        ...(data.description !== undefined && { description: toNullableString(data.description) }),
        ...(data.responsibilities !== undefined && {
          responsibilities: toStringArray(data.responsibilities),
        }),
        ...(data.requirements !== undefined && { requirements: toStringArray(data.requirements) }),
        ...(data.skills !== undefined && {
          skillsRequired: toStringArray(data.skills),
          skills: toNullableString(data.skills),
        }),
        ...(data.additionalInformation !== undefined && {
          additionalInformation: toNullableString(data.additionalInformation),
        }),
        ...(data.workMode !== undefined && { workMode: toWorkMode(data.workMode) }),
        ...(data.employmentType !== undefined && {
          employmentType: toEmploymentType(data.employmentType),
        }),
        ...(data.location !== undefined && { location: toNullableString(data.location) }),
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

    if (result.count === 0) {
      throw new Error("Job post not found");
    }

    const updated = await prisma.jobPost.findUnique({
      where: { id },
    });

    if (!updated) {
      throw new Error("Job post not found");
    }

    return updated;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE BY ID — Permanently deletes a job post.
  // IMPORTANT: WHERE clause includes employerId to prevent cross-employer deletion.
  // CRITICAL: This operation is IRREVERSIBLE — no recovery possible.
  // ═══════════════════════════════════════════════════════════════════════════
  async deleteById(id: string, employerId: string) {
    await ensureClosingDateColumnCompatibility();

    // Use deleteMany to allow filtering by employerId alongside id for security
    return prisma.jobPost.deleteMany({
      where: {
        id,
        employerId, // CRITICAL: Now securely checking ownership
      },
    });
  },
};