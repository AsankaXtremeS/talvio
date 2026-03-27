import { CreateJobPostInput, UpdateJobPostInput } from "./jobPosts.validation";

interface InMemoryEmployerProfile {
  id: string;
  verificationStatus: "APPROVED" | "PENDING" | "REJECTED";
}

interface InMemoryJobPost {
  id: string;
  employerId: string;
  title: string;
  type: "JOB" | "INTERNSHIP";
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  description: string | null;
  requirements: string | null;
  closingDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const posts: InMemoryJobPost[] = [];

const toProfile = (userId: string): InMemoryEmployerProfile => ({
  id: userId,
  verificationStatus: "APPROVED",
});

export interface GetJobPostsOptions {
  employerId: string;
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const jobsRepository = {
  async findEmployerProfileByUserId(userId: string): Promise<InMemoryEmployerProfile> {
    return toProfile(userId);
  },

  async findAll(options: GetJobPostsOptions): Promise<{ posts: InMemoryJobPost[]; total: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;

    let filtered = posts.filter((p) => p.employerId === options.employerId);

    if (options.status) filtered = filtered.filter((p) => p.status === options.status);
    if (options.type) filtered = filtered.filter((p) => p.type === options.type);
    if (options.search) {
      const needle = options.search.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(needle));
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    return { posts: filtered.slice(start, start + limit), total };
  },

  async getStats(employerId: string): Promise<{ DRAFT: number; ACTIVE: number; CLOSED: number; TOTAL: number }> {
    const own = posts.filter((p) => p.employerId === employerId);
    const DRAFT = own.filter((p) => p.status === "DRAFT").length;
    const ACTIVE = own.filter((p) => p.status === "ACTIVE").length;
    const CLOSED = own.filter((p) => p.status === "CLOSED").length;
    return { DRAFT, ACTIVE, CLOSED, TOTAL: own.length };
  },

  async findById(id: string, employerId: string): Promise<InMemoryJobPost | null> {
    return posts.find((p) => p.id === id && p.employerId === employerId) ?? null;
  },

  async create(employerId: string, data: CreateJobPostInput): Promise<InMemoryJobPost> {
    const now = new Date();
    const created: InMemoryJobPost = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `jp_${Date.now()}`,
      employerId,
      title: data.title,
      type: data.type,
      status: data.status ?? "DRAFT",
      description: data.description ?? null,
      requirements: data.requirements ?? null,
      closingDate: data.closingDate ? new Date(data.closingDate) : null,
      createdAt: now,
      updatedAt: now,
    };
    posts.unshift(created);
    return created;
  },

  async update(id: string, employerId: string, data: UpdateJobPostInput): Promise<InMemoryJobPost> {
    const existing = posts.find((p) => p.id === id && p.employerId === employerId);
    if (!existing) throw new Error("Job post not found");

    if (data.title !== undefined) existing.title = data.title;
    if (data.type !== undefined) existing.type = data.type;
    if (data.status !== undefined) existing.status = data.status;
    if (data.description !== undefined) existing.description = data.description ?? null;
    if (data.requirements !== undefined) existing.requirements = data.requirements ?? null;
    if (data.closingDate !== undefined) existing.closingDate = data.closingDate ? new Date(data.closingDate) : null;
    existing.updatedAt = new Date();

    return existing;
  },

  async deleteById(id: string, employerId: string): Promise<void> {
    const idx = posts.findIndex((p) => p.id === id && p.employerId === employerId);
    if (idx >= 0) posts.splice(idx, 1);
  },
};
