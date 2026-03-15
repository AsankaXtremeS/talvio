import type { Company, CompanyStats, JobPost } from '@/types/admin/company.types';

const stats: CompanyStats = {
	internshipPosts: 84,
	internshipCompanies: 29,
	jobPosts: 214,
	jobCompanies: 76,
};

const companies: Company[] = [
	{
		id: '1',
		name: 'Nova Labs',
		email: 'contact@novalabs.com',
		postCount: 12,
		joinedAt: 'Mar 04 2026',
		logoColor: '#4F46E5',
		logoText: 'NL',
	},
	{
		id: '2',
		name: 'Bright Stack',
		email: 'team@brightstack.ai',
		postCount: 8,
		joinedAt: 'Feb 27 2026',
		logoColor: '#0EA5E9',
		logoText: 'BS',
	},
	{
		id: '3',
		name: 'Pixel Forge',
		email: 'hello@pixelforge.io',
		postCount: 5,
		joinedAt: 'Feb 21 2026',
		logoColor: '#F97316',
		logoText: 'PF',
	},
];

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

<<<<<<< HEAD
=======
	// Backward-compatible alias used by older pages/components.
>>>>>>> feat/admin-frontend
	async getJobPostStats(): Promise<CompanyStats> {
		return { ...stats };
	},

<<<<<<< HEAD
	async getCompanies(filters?: Partial<CompanyFilters>): Promise<Company[]> {
		if (!filters?.search) {
			return companies.map((company) => ({ ...company }));
		}

		const search = filters.search.toLowerCase();
		return companies
			.filter(
				(company) =>
					company.name.toLowerCase().includes(search) || company.email.toLowerCase().includes(search),
			)
			.map((company) => ({ ...company }));
	},

	async removeCompany(id: string): Promise<void> {
		console.log('Remove company:', id);
	},

	async getJobPosts(filters?: Partial<CompanyFilters>): Promise<JobPost[]> {
		if (!filters?.search) {
			return posts.map((post) => ({ ...post }));
		}

		const search = filters.search.toLowerCase();
		return posts
			.filter(
				(post) => post.jobTitle.toLowerCase().includes(search) || post.companyName.toLowerCase().includes(search),
			)
			.map((post) => ({ ...post }));
=======
	async getCompanies(filters?: { search?: string }): Promise<Company[]> {
		if (filters?.search) {
			const search = filters.search.toLowerCase();
			return companies
				.filter(
					(company) =>
						company.name.toLowerCase().includes(search) ||
						company.email.toLowerCase().includes(search),
				)
				.map((company) => ({ ...company }));
		}

		return companies.map((company) => ({ ...company }));
	},

	async getJobPosts(filters?: { search?: string }): Promise<JobPost[]> {
		if (filters?.search) {
			const search = filters.search.toLowerCase();
			return jobPosts
				.filter(
					(post) =>
						post.jobTitle.toLowerCase().includes(search) ||
						post.companyName.toLowerCase().includes(search),
				)
				.map((post) => ({ ...post }));
		}

		return jobPosts.map((post) => ({ ...post }));
>>>>>>> feat/admin-frontend
	},
};
