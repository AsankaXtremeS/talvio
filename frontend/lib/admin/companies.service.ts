import { apiClient } from '@/lib/apiClient';
import type {
	Company,
	CompanyFilters,
	CompanyStats,
	JobPost,
	JobPostListResponse,
	PaginationMeta,
} from '@/types/admin/company.types';

interface CompaniesApiItem {
	id: string;
	companyName: string;
	email: string;
	postCount: number;
	joinedAt: string;
}

interface CompaniesApiResponse {
	data: CompaniesApiItem[];
	pagination: PaginationMeta;
}

interface JobPostsApiItem {
	id: string;
	companyName: string;
	companyEmail: string;
	companyLogoColor: string;
	companyLogoText: string;
	category: string;
	jobTitle: string;
	type: 'Job' | 'Internship';
	closedDate?: string;
	isClosed: boolean;
	closedApplications: number;
}

interface JobPostsApiResponse {
	data: JobPostsApiItem[];
	pagination: PaginationMeta;
}

const formatJoinedDate = (isoDate: string): string => {
	const date = new Date(isoDate);
	if (Number.isNaN(date.getTime())) return isoDate;

	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
	});
};

const initialsFromName = (name: string): string => {
	const parts = name
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	if (parts.length === 0) return 'CO';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const mapCompany = (item: CompaniesApiItem): Company => ({
	id: item.id,
	name: item.companyName,
	email: item.email,
	postCount: item.postCount,
	joinedAt: formatJoinedDate(item.joinedAt),
	logoText: initialsFromName(item.companyName),
});

const mapJobPost = (item: JobPostsApiItem): JobPost => ({
	id: item.id,
	companyName: item.companyName,
	companyEmail: item.companyEmail,
	companyLogoColor: item.companyLogoColor,
	companyLogoText: item.companyLogoText,
	category: item.category,
	jobTitle: item.jobTitle,
	type: item.type,
	closedDate: item.closedDate,
	isClosed: item.isClosed,
	closedApplications: item.closedApplications,
});

export const companiesService = {
	async getStats(): Promise<CompanyStats> {
		return apiClient<CompanyStats>('/api/admin/job-posts/stats', {
			method: 'GET',
		});
	},

	// Backward-compatible alias used by older pages/components.
	async getJobPostStats(): Promise<CompanyStats> {
		return this.getStats();
	},

	async getCompanies(filters?: Partial<CompanyFilters>): Promise<Company[]> {
		const params = new URLSearchParams();

		if (filters?.search?.trim()) {
			params.set('search', filters.search.trim());
		}

		const query = params.toString();
		const endpoint = `/api/admin/companies${query ? `?${query}` : ''}`;

		const result = await apiClient<CompaniesApiResponse>(endpoint, {
			method: 'GET',
		});

		return result.data.map(mapCompany);
	},

	async getCompanyById(id: string): Promise<Company> {
		const item = await apiClient<CompaniesApiItem>(`/api/admin/companies/${id}`, {
			method: 'GET',
		});

		return mapCompany(item);
	},

	async removeCompany(id: string): Promise<void> {
		await apiClient<{ message: string }>(`/api/admin/companies/${id}`, {
			method: 'DELETE',
		});
	},

	async removeJobPost(id: string): Promise<void> {
		await apiClient<{ message: string }>(`/api/admin/job-posts/${id}`, {
			method: 'DELETE',
		});
	},

	async getJobPosts(filters?: Partial<CompanyFilters>): Promise<JobPostListResponse> {
		const params = new URLSearchParams();

		if (filters?.search?.trim()) {
			params.set('search', filters.search.trim());
		}

		if (typeof filters?.page === 'number' && Number.isFinite(filters.page)) {
			params.set('page', String(filters.page));
		}

		if (typeof filters?.limit === 'number' && Number.isFinite(filters.limit)) {
			params.set('limit', String(filters.limit));
		}

		const query = params.toString();
		const endpoint = `/api/admin/job-posts${query ? `?${query}` : ''}`;

		const result = await apiClient<JobPostsApiResponse>(endpoint, {
			method: 'GET',
		});

		return {
			data: result.data.map(mapJobPost),
			pagination: result.pagination,
		};
	},
};
