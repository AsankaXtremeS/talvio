import { apiClient } from '@/lib/apiClient';
import type { Company, CompanyFilters, CompanyStats, JobPost } from '@/types/admin/company.types';

interface CompaniesApiItem {
	id: string;
	companyName: string;
	email: string;
	joinedAt: string;
}

interface CompaniesApiResponse {
	data: CompaniesApiItem[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
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
	postCount: 0,
	joinedAt: formatJoinedDate(item.joinedAt),
	logoText: initialsFromName(item.companyName),
});

const stats: CompanyStats = {
	internshipPosts: 84,
	internshipCompanies: 29,
	jobPosts: 214,
	jobCompanies: 76,
};

const jobPosts: JobPost[] = [
	{
		id: '1',
		companyName: 'Nova Labs',
		companyEmail: 'contact@novalabs.com',
		companyLogoColor: '#4F46E5',
		companyLogoText: 'NL',
		category: 'Engineering',
		jobTitle: 'Frontend Developer',
	},
	{
		id: '2',
		companyName: 'Bright Stack',
		companyEmail: 'team@brightstack.ai',
		companyLogoColor: '#0EA5E9',
		companyLogoText: 'BS',
		category: 'Design',
		jobTitle: 'Product Designer',
	},
	{
		id: '3',
		companyName: 'Pixel Forge',
		companyEmail: 'hello@pixelforge.io',
		companyLogoColor: '#F97316',
		companyLogoText: 'PF',
		category: 'Marketing',
		jobTitle: 'Growth Specialist',
	},
];

export const companiesService = {
	async getStats(): Promise<CompanyStats> {
		return { ...stats };
	},

	// Backward-compatible alias used by older pages/components.
	async getJobPostStats(): Promise<CompanyStats> {
		return { ...stats };
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

	async getJobPosts(filters?: Partial<CompanyFilters>): Promise<JobPost[]> {
		if (!filters?.search) {
			return jobPosts.map((post) => ({ ...post }));
		}

		const search = filters.search.toLowerCase();
		return jobPosts
			.filter(
				(post) => post.jobTitle.toLowerCase().includes(search) || post.companyName.toLowerCase().includes(search),
			)
			.map((post) => ({ ...post }));
	},
};
