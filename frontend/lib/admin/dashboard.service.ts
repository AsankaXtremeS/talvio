import { apiClient } from '@/lib/apiClient';
import type {
	ApplicationStats,
	CandidatesCompaniesActivityDataPoint,
	DashboardOverview,
	DashboardStats,
	RecentCandidate,
	UserGrowthDataPoint,
} from '@/types/admin/dashboard.types';

const getOverview = async (): Promise<DashboardOverview> => {
	return apiClient<DashboardOverview>('/api/admin/dashboard/overview', {
		method: 'GET',
	});
};

export const dashboardService = {
	async getOverview(): Promise<DashboardOverview> {
		return getOverview();
	},

	async getStats(): Promise<DashboardStats> {
		const overview = await getOverview();
		return overview.stats;
	},

	async getUserGrowth(): Promise<UserGrowthDataPoint[]> {
		const overview = await getOverview();
		return overview.userGrowth;
	},

	async getCandidatesCompaniesActivity(): Promise<CandidatesCompaniesActivityDataPoint[]> {
		const overview = await getOverview();
		return overview.candidatesCompaniesActivity;
	},

	async getRecentCandidates(): Promise<RecentCandidate[]> {
		const overview = await getOverview();
		return overview.recentCandidates;
	},

	async getApplicationStats(): Promise<ApplicationStats> {
		const overview = await getOverview();
		return overview.applicationStats;
	},
};
