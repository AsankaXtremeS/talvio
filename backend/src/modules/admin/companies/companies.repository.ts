// Repository layer for admin company management.
// Responsible ONLY for database access — no business logic lives here.
// All queries are built with Prisma and typed explicitly.

import { prisma } from "../../../config/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetCompaniesOptions {
  search?: string;       // filter by company name or email (case-insensitive)
  page?: number;         // 1-based page number (default: 1)
  limit?: number;        // records per page (default: 20, max enforced in service)
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const companiesRepository = {

  /**
   * Return a paginated, optionally-filtered list of approved EMPLOYER accounts.
   * Each record includes the joined User + EmployerProfile data.
   *
   * Why we filter by verificationStatus = APPROVED:
   *   Pending/rejected employers are managed in the Pending Approvals module.
   *   The Companies page shows only active, approved companies.
   */
  async findAll(options: GetCompaniesOptions = {}) {
    const { search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Build a reusable "where" clause — search applies to both name and email
    const where = {
      role: "EMPLOYER" as const,
      employerProfile: {
        verificationStatus: "APPROVED" as const,
      },
      // If search term provided, also match user's email
      ...(search
        ? {
            OR: [
              {
                employerProfile: {
                  companyName: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                email: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    // Run count + data queries in parallel for performance
    const [total, companies] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          createdAt: true,
          employerProfile: {
            select: {
              id: true,
              companyName: true,
              verificationStatus: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    return { companies, total };
  },

  /**
   * Find a single company (approved employer) by their user ID.
   * Returns null if not found — the service layer decides how to handle that.
   */
  async findById(userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        role: "EMPLOYER",
        employerProfile: {
          verificationStatus: "APPROVED",
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        employerProfile: {
          select: {
            id: true,
            companyName: true,
            verificationStatus: true,
            createdAt: true,
          },
        },
      },
    });
  },

  /**
   * Hard-delete a user and all their related data.
   * Prisma Cascade (defined in schema) will remove:
   *   - EmployerProfile
   *   - RefreshTokens
   *   - PasswordResetTokens
   *   - VerificationTokens
   *   - AuthAccounts
   *
   * We verify the user is an EMPLOYER before deleting to prevent
   * accidental deletion of ADMIN or other role accounts.
   */
  async deleteById(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    });
  },

  /**
   * Verify a user is an approved employer before we allow deletion.
   * Separated from deleteById so the service can return a clear 404 vs 403.
   */
  async isApprovedEmployer(userId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "EMPLOYER",
        employerProfile: { verificationStatus: "APPROVED" },
      },
      select: { id: true },
    });
    return user !== null;
  },
};