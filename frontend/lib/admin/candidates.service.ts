import type { Candidate, CandidateStats } from '@/types/admin/candidate.types';

const stats: CandidateStats = {
	lookingForInternships: 1420,
	lookingForJobs: 3890,
	internshipApplyingRate: 24,
	internshipHiringRate: 9,
	jobApplyingRate: 38,
	jobHiringRate: 14,
};

const candidates: Candidate[] = [
	{
		id: '1',
		name: 'Sarah Johnson',
		role: 'Frontend Developer',
		type: 'Professional',
		joinedAt: 'Mar 08 2026',
		email: 'sarah.johnson@example.com',
	},
	{
		id: '2',
		name: 'Kasun Perera',
		role: 'UI/UX Designer',
		type: 'Undergraduate',
		joinedAt: 'Mar 05 2026',
		email: 'kasun.perera@example.com',
	},
	{
		id: '3',
		name: 'Nimasha Silva',
		role: 'Data Analyst',
		type: 'Professional',
		joinedAt: 'Feb 28 2026',
		email: 'nimasha.silva@example.com',
	},
	{
		id: '4',
		name: 'Amila Fernando',
		role: 'Backend Engineer',
		type: 'Undergraduate',
		joinedAt: 'Feb 24 2026',
		email: 'amila.fernando@example.com',
	},
];

export const candidatesService = {
	async getStats(): Promise<CandidateStats> {
		return stats;
	},

	async getCandidates(): Promise<Candidate[]> {
		return candidates;
	},
};
