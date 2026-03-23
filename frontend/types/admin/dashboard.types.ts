export interface DashboardStats {
	totalUsers: number;
	totalCompanies: number;
	undergraduates: number;
	professionals: number;
	pendingApprovals: number;
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

export interface CandidatesCompaniesActivityDataPoint {
	month: string;
	candidates: number;
	companies: number;
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
