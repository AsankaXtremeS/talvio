import type {
	ApplicationStats,
	CompanyRatingDistribution,
	DashboardStats,
	RecentCandidate,
	RecentCompany,
	ReviewsActivityDataPoint,
	UserGrowthDataPoint,
} from '@/types/admin/dashboard.types';

const stats: DashboardStats = {
	totalUsers: 12480,
	totalCompanies: 326,
	reviews: 1840,
	reports: 27,
};

const userGrowth: UserGrowthDataPoint[] = [
	{ month: 'Jan', users: 7200 },
	{ month: 'Feb', users: 8100 },
	{ month: 'Mar', users: 8900 },
	{ month: 'Apr', users: 9700 },
	{ month: 'May', users: 10800 },
	{ month: 'Jun', users: 12480 },
];

const companyRatings: CompanyRatingDistribution[] = [
	{ label: '5 Stars', count: 112, color: '#6366F1' },
	{ label: '4 Stars', count: 96, color: '#818CF8' },
	{ label: '3 Stars', count: 58, color: '#A5B4FC' },
	{ label: '2 Stars', count: 24, color: '#C7D2FE' },
	{ label: '1 Star', count: 8, color: '#E0E7FF' },
];

const reviewsActivity: ReviewsActivityDataPoint[] = [
	{ month: 'Jan', posts: 140, reviews: 82 },
	{ month: 'Feb', posts: 165, reviews: 97 },
	{ month: 'Mar', posts: 182, reviews: 111 },
	{ month: 'Apr', posts: 174, reviews: 105 },
	{ month: 'May', posts: 210, reviews: 126 },
	{ month: 'Jun', posts: 238, reviews: 143 },
];

const recentCandidates: RecentCandidate[] = [
	{ id: '1', name: 'Sarah Johnson', role: 'Frontend Developer' },
	{ id: '2', name: 'Kasun Perera', role: 'Product Designer' },
	{ id: '3', name: 'Amaya Silva', role: 'QA Engineer' },
];

const recentCompanies: RecentCompany[] = [
	{ id: '1', name: 'Nova Labs', email: 'hello@novalabs.com', logoColor: '#4F46E5', logoText: 'NL' },
	{ id: '2', name: 'Pixel Forge', email: 'team@pixelforge.io', logoColor: '#0EA5E9', logoText: 'PF' },
	{ id: '3', name: 'Bright Stack', email: 'hr@brightstack.ai', logoColor: '#F97316', logoText: 'BS' },
];

const applicationStats: ApplicationStats = {
	applied: 1824,
	hired: 146,
	scheduled: 389,
	appliedGrowth: 12.4,
	hiredGrowth: 8.3,
	scheduledGrowth: 15.1,
};

export const dashboardService = {
	async getStats(): Promise<DashboardStats> {
		return stats;
	},

	async getUserGrowth(): Promise<UserGrowthDataPoint[]> {
		return userGrowth;
	},

	async getCompanyRatings(): Promise<CompanyRatingDistribution[]> {
		return companyRatings;
	},

	async getReviewsActivity(): Promise<ReviewsActivityDataPoint[]> {
		return reviewsActivity;
	},

	async getRecentCandidates(): Promise<RecentCandidate[]> {
		return recentCandidates;
	},

	async getRecentCompanies(): Promise<RecentCompany[]> {
		return recentCompanies;
	},

	async getApplicationStats(): Promise<ApplicationStats> {
		return applicationStats;
	},
};
