export interface Company {
	id: string;
	name: string;
	email: string;
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
	companyLogoColor?: string;
	companyLogoText?: string;
	category: string;
	jobTitle: string;
	type?: 'Job' | 'Internship' | string;
	closedDate?: string;
	isClosed?: boolean;
	closedApplications?: number;
}

export interface CompanyStats {
	internshipPosts: number;
	internshipCompanies: number;
	jobPosts: number;
	jobCompanies: number;
}

export type JobPostStats = CompanyStats;

export interface CompanyFilters {
	search?: string;
	category?: string;
	status?: string;
}
