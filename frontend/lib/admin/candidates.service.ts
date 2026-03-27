import { apiClient } from '@/lib/apiClient';
import type { Candidate, CandidateStats } from '@/types/admin/candidate.types';

export type CandidateRoleFilter = 'all' | 'STUDENT' | 'PROFESSIONAL';

interface CandidateApiItem {
	id: string;
	fullName: string;
	email: string;
	role: 'STUDENT' | 'PROFESSIONAL';
	joinedAt: string;
	isVerified: boolean;
	authProvider: string;
}

interface CandidateApiResponse {
	data: CandidateApiItem[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

interface CandidateQuery {
	search?: string;
	role?: CandidateRoleFilter;
	page?: number;
	limit?: number;
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

const toCandidateType = (role: CandidateApiItem['role']): Candidate['type'] =>
	role === 'STUDENT' ? 'Undergraduate' : 'Professional';

const toCandidateRoleLabel = (role: CandidateApiItem['role']): string =>
	role === 'STUDENT' ? 'Student Candidate' : 'Professional Candidate';

const mapCandidate = (item: CandidateApiItem): Candidate => ({
	id: item.id,
	name: item.fullName,
	role: toCandidateRoleLabel(item.role),
	type: toCandidateType(item.role),
	joinedAt: formatJoinedDate(item.joinedAt),
	email: item.email,
});

const buildQueryString = (query?: CandidateQuery): string => {
	if (!query) return '';

	const params = new URLSearchParams();

	if (query.search?.trim()) {
		params.set('search', query.search.trim());
	}

	if (query.role && query.role !== 'all') {
		params.set('role', query.role);
	}

	if (typeof query.page === 'number') {
		params.set('page', String(query.page));
	}

	if (typeof query.limit === 'number') {
		params.set('limit', String(query.limit));
	}

	const queryString = params.toString();
	return queryString ? `?${queryString}` : '';
};

const fetchCandidates = async (query?: CandidateQuery): Promise<CandidateApiResponse> => {
	const queryString = buildQueryString(query);
	return apiClient<CandidateApiResponse>(`/api/admin/candidates${queryString}`, {
		method: 'GET',
	});
};

export const candidatesService = {
	async getStats(): Promise<CandidateStats> {
		return apiClient<CandidateStats>('/api/admin/candidates/stats', {
			method: 'GET',
		});
	},

	async getCandidates(filters?: CandidateQuery): Promise<Candidate[]> {
		const result = await fetchCandidates({
			...filters,
			page: filters?.page ?? 1,
			limit: filters?.limit ?? 100,
		});

		return result.data.map(mapCandidate);
	},

	async getCandidateById(id: string): Promise<Candidate> {
		const item = await apiClient<CandidateApiItem>(`/api/admin/candidates/${id}`, {
			method: 'GET',
		});

		return mapCandidate(item);
	},

	async removeCandidate(id: string): Promise<void> {
		await apiClient<{ message: string }>(`/api/admin/candidates/${id}`, {
			method: 'DELETE',
		});
	},
};
