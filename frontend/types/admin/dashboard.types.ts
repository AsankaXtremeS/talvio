export interface DashboardStats {
	totalUsers: number;
	totalCompanies: number;
	reviews: number;
	reports: number;
}

export interface UserGrowthDataPoint {
	month: string;
	users: number;
}

export interface CompanyRatingDistribution {
	label: string;
	count: number;
	color: string;
}

export interface ReviewsActivityDataPoint {
	month: string;
	posts: number;
	reviews: number;
}

export interface RecentCandidate {
	id: string;
	name: string;
	role: string;
}

export interface RecentCompany {
	id: string;
	name: string;
	email: string;
	logoColor?: string;
	logoText?: string;
}

export interface ApplicationStats {
	applied: number;
	hired: number;
	scheduled: number;
	appliedGrowth: number;
	hiredGrowth: number;
	scheduledGrowth: number;
}
