import type { Company, CompanyFilters, CompanyStats, JobPost } from '@/types/admin/company.types';

const stats: CompanyStats = {
	internshipPosts: 352,
	internshipCompanies: 41,
	jobPosts: 631,
	jobCompanies: 57,
};

const companies: Company[] = [
	{
		id: '1',
		name: 'Tech Solutions',
		email: 'JohnD2024@gmail.com',
		postCount: 5,
		joinedAt: 'Dec 26,2025 10:00AM',
		category: 'Employee',
		logoText: 'Tech',
		logoColor: '#1e3a8a',
	},
	{
		id: '2',
		name: 'Tech Solutions',
		email: 'SarahWilson@email.com',
		postCount: 3,
		joinedAt: 'Dec 26,2025 09:07AM',
		category: 'Employee',
		logoText: 'Tech',
		logoColor: '#1e3a8a',
	},
	{
		id: '3',
		name: 'Tech Solutions',
		email: 'KimDavid@Email.com',
		postCount: 2,
		joinedAt: 'Dec 26,2025 09:01AM',
		category: 'Student',
		logoText: 'Tech',
		logoColor: '#1e3a8a',
	},
	{
		id: '4',
		name: 'Tech Solutions',
		email: 'Rody123Em@gmail.com',
		postCount: 4,
		joinedAt: 'Dec 26,2025 07:50AM',
		category: 'Employee',
		logoText: 'Tech',
		logoColor: '#1e3a8a',
	},
	{
		id: '5',
		name: 'Tech Solutions',
		email: 'Chen2020.Michel@gmail.com',
		postCount: 6,
		joinedAt: 'Dec 26,2025 07:06AM',
		category: 'Employee',
		logoText: 'Tech',
		logoColor: '#1e3a8a',
	},
	{
		id: '6',
		name: 'Tech Solutions',
		email: 'LeeJess.12@gmail.com',
		postCount: 1,
		joinedAt: 'Dec 25,2025 11:32PM',
		category: 'Student',
		logoText: 'Tech',
		logoColor: '#1e3a8a',
	},
];

const posts: JobPost[] = [
	{
		id: '1',
		jobTitle: 'Frontend Developer',
		category: 'Engineering',
		type: 'Job',
		closedDate: 'Apr 26,2024',
		isClosed: false,
		companyId: '1',
		companyName: 'Tech Solutions',
		companyEmail: 'techSol@gmail.com',
		companyLogoText: 'Tech',
		companyLogoColor: '#1e3a8a',
	},
	{
		id: '2',
		jobTitle: 'UI/UX Designer',
		category: 'Design',
		type: 'Internship',
		closedDate: 'Apr 26,2024',
		isClosed: false,
		companyId: '1',
		companyName: 'Tech Solutions',
		companyEmail: 'techSol@gmail.com',
		companyLogoText: 'Tech',
		companyLogoColor: '#1e3a8a',
	},
	{
		id: '3',
		jobTitle: 'Data Analyst',
		category: 'Engineering',
		type: 'Job',
		closedDate: 'Apr 26,2024',
		isClosed: false,
		companyId: '1',
		companyName: 'Tech Solutions',
		companyEmail: 'techSol@gmail.com',
		companyLogoText: 'Tech',
		companyLogoColor: '#1e3a8a',
	},
	{
		id: '4',
		jobTitle: 'Marketing Intern',
		category: 'Marketing',
		type: 'Job',
		closedDate: 'Apr 26,2024',
		isClosed: true,
		closedApplications: 210,
		companyId: '1',
		companyName: 'Tech Solutions',
		companyEmail: 'techSol@gmail.com',
		companyLogoText: 'Tech',
		companyLogoColor: '#1e3a8a',
	},
	{
		id: '5',
		jobTitle: 'QA Engineer',
		category: 'Engineering',
		type: 'Job',
		closedDate: 'Apr 26,2024',
		isClosed: false,
		companyId: '1',
		companyName: 'Tech Solutions',
		companyEmail: 'techSol@gmail.com',
		companyLogoText: 'Tech',
		companyLogoColor: '#1e3a8a',
	},
	{
		id: '6',
		jobTitle: 'Product Manager',
		category: 'Management',
		type: 'Job',
		closedDate: 'Apr 26,2024',
		isClosed: false,
		companyId: '1',
		companyName: 'Tech Solutions',
		companyEmail: 'techSol@gmail.com',
		companyLogoText: 'Tech',
		companyLogoColor: '#1e3a8a',
	},
];

export const companiesService = {
	async getStats(): Promise<CompanyStats> {
		return { ...stats };
	},

	async getJobPostStats(): Promise<CompanyStats> {
		return { ...stats };
	},

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
	},
};
