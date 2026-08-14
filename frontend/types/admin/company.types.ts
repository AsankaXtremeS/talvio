export interface Company {
	id: string;
	name: string;
	email: string;
	companyLogoUrl?: string | null;
	postCount: number;
	joinedAt: string;
	category?: string;
	logoColor?: string;
	logoText?: string;
}

export interface JobPost {
	id: string;
	companyId?: string;
	companyName: string;
	companyEmail: string;
	companyLogoUrl?: string | null;
	companyLogoColor?: string;
	companyLogoText?: string;
	category: string;
	jobTitle: string;
	type?: 'Job' | 'Internship' | string;
	closedDate?: string;
	isClosed?: boolean;
	closedApplications?: number;
	description?: string;
}

export interface CompanyStats {
	internshipPosts: number;
	internshipCompanies: number;
	jobPosts: number;
	jobCompanies: number;
}

export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface JobPostListResponse {
	data: JobPost[];
	pagination: PaginationMeta;
}

export type JobPostStats = CompanyStats;

export interface CompanyFilters {
	search?: string;
	category?: string;
	status?: string;
	page?: number;
	limit?: number;
}
