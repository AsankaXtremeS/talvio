export interface CompanyStats {
	internshipPosts: number;
	internshipCompanies: number;
	jobPosts: number;
	jobCompanies: number;
}

export type JobPostStats = CompanyStats;

export interface CompanyFilters {
	search?: string;
}

export interface Company {
	id: string;
	name: string;
	email: string;
	postCount: number;
	joinedAt: string;
	logoColor?: string;
	logoText?: string;
	category?: string;
}

export interface JobPost {
	id: string;
	jobTitle: string;
	category: string;
	companyName: string;
	companyEmail: string;
	companyLogoColor?: string;
	companyLogoText?: string;
	type?: 'Job' | 'Internship';
	closedDate?: string;
	isClosed?: boolean;
	closedApplications?: number;
	companyId?: string;
}
