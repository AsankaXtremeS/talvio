// Repository layer for employer job post management.
// Responsible ONLY for database access — no business logic lives here.
// All queries are built with Prisma and typed explicitly.
//
// Pattern followed from: src/modules/admin/companies/companies.repository.ts

import { prisma } from "../../../config/db";
import { CreateJobPostInput, UpdateJobPostInput, JobPostQueryInput } from "./jobPosts.validation";

// ─── Types ────────────────────────────────────────────────────────────────────

// Options passed to findAll() for filtering and pagination
export interface GetJobPostsOptions {
  employerId: string;          // Always filter by the requesting employer's profile ID
  status?: string;             // Optional status filter: DRAFT | ACTIVE | CLOSED
  type?: string;               // Optional type filter: JOB | INTERNSHIP
  search?: string;             // Optional title search (case-insensitive)
  page?: number;               // 1-based page number
  limit?: number;              // Records per page
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const jobsRepository = {

  /**
   * Return a paginated, filtered list of job posts belonging to ONE employer.
   *
   * Security note:
   *   We ALWAYS filter by employerId. This ensures an employer can NEVER
   *   see or access another employer's job posts, even if they guess an ID.
   */
  async findAll(options: GetJobPostsOptions) {
    const { employerId, status, type, search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Build the where clause dynamically based on provided filters
    const where: any = {
      // SECURITY: Always scope to the requesting employer's posts only
      employerId,

      // Apply optional filters only when values are provided
      ...(status ? { status: status as any } : {}),
      ...(type ? { type: type as any } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    // Run count + data queries in parallel for better performance
    const [total, posts] = await Promise.all([
      prisma.jobPost.count({ where }),
      prisma.jobPost.findMany({
        where,
        orderBy: { createdAt: "desc" }, // Newest first
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          department: true,
          type: true,
          status: true,
          closedDate: true,
          createdAt: true,
          updatedAt: true,
          // Include minimal employer info for display (company name)
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

  /**
   * Get dashboard stats for the employer's job posts.
   * Returns counts grouped by status for the stats cards in the UI.
   *
   * Security: Always scoped to employerId — never returns cross-employer data.
   */
  async getStats(employerId: string) {
    // Use groupBy to count posts per status in a single DB query
    const stats = await prisma.jobPost.groupBy({
      by: ["status"],
      where: { employerId },  // SECURITY: scope to this employer only
      _count: { id: true },
    });

    // Transform array into an easy-to-read object
    // e.g. { DRAFT: 2, ACTIVE: 8, CLOSED: 4 }
    const result = { DRAFT: 0, ACTIVE: 0, CLOSED: 0, TOTAL: 0 };

    for (const row of stats) {
      result[row.status] = row._count.id;
      result.TOTAL += row._count.id;
    }

    return result;
  },

  /**
   * Find a single job post by ID.
   *
   * Security: We always check BOTH the post ID AND the employerId.
   * This prevents an employer from accessing another employer's post
   * by guessing a valid UUID.
   */
  async findById(id: string, employerId: string) {
    return prisma.jobPost.findFirst({
      where: {
        id,
        employerId, // SECURITY: ownership check — post must belong to this employer
      },
    });
  },

  /**
   * Create a new job post for an employer.
   * closedDate is converted from string to Date if provided.
   */
  async create(employerId: string, data: CreateJobPostInput) {
    return prisma.jobPost.create({
      data: {
        title: data.title,
        department: data.department,
        type: data.type,
        description: data.description,
        requirements: data.requirements,
        // Convert ISO string to Date object for Prisma
        closedDate: data.closedDate ? new Date(data.closedDate) : null,
        status: data.status ?? "DRAFT",
        employerId, // Link to the employer's profile
      },
    });
  },

  /**
   * Update an existing job post.
   *
   * Security: The findById check in the service layer already verified
   * ownership before this is called. We still pass employerId to the
   * where clause as a defense-in-depth measure.
   */
  async update(id: string, employerId: string, data: UpdateJobPostInput) {
    return prisma.jobPost.update({
      where: {
        id,
        // SECURITY: double-check ownership even on update
        employerId,
      },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
        ...(data.closedDate !== undefined && {
          closedDate: data.closedDate ? new Date(data.closedDate) : null,
        }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
  },

  /**
   * Delete a job post permanently.
   *
   * Security: employerId is included in the where clause to prevent
   * an employer from deleting another employer's post.
   */
  async deleteById(id: string, employerId: string) {
    return prisma.jobPost.delete({
      where: {
        id,
        employerId, // SECURITY: ownership check on delete
      },
    });
  },
};
