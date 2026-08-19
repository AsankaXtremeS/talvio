export interface Candidate {
	id: string;
	name: string;
	role: string;
	type: string;
	joinedAt: string;
	email: string;
}

export interface CandidateStats {
	lookingForInternships: number;
	lookingForJobs: number;
	internshipApplyingRate: number;
	internshipHiringRate: number;
	jobApplyingRate: number;
	jobHiringRate: number;
}
