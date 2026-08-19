"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import CandidateStatsBar from '@/components/admin/candidates/CandidateStatsBar';
import CandidatesTable from '@/components/admin/candidates/CandidatesTable';
import CandidateFilterBar from '@/components/admin/candidates/CandidateFilterBar';
import DashboardPeriodDropdown, { type PeriodFilter } from '@/components/admin/dashboard/DashboardPeriodDropdown';
import AdminLoadingCard from '@/components/admin/layout/AdminLoadingCard';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import AdminDetailModal from '@/components/admin/shared/AdminDetailModal';
import { candidatesService, type CandidateRoleFilter } from '@/lib/admin/candidates.service';
import type { Candidate, CandidateStats } from '@/types/admin/candidate.types';

const defaultStats: CandidateStats = {
  lookingForInternships: 0,
  lookingForJobs: 0,
  internshipApplyingRate: 0,
  internshipHiringRate: 0,
  jobApplyingRate: 0,
  jobHiringRate: 0,
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

export default function CandidatesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all-time');
  const [roleFilter, setRoleFilter] = useState<CandidateRoleFilter>('all');

  // Detail Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const normalizedSearch = useMemo(() => debouncedSearch.trim(), [debouncedSearch]);

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminCandidatesStats'],
    queryFn: async () => {
      try {
        return await candidatesService.getStats();
      } catch {
        return defaultStats;
      }
    },
  });

  const { data: candidatesData, isLoading: isCandidatesLoading, error: candidatesError } = useQuery({
    queryKey: ['adminCandidates', normalizedSearch, roleFilter],
    queryFn: async () => {
      return await candidatesService.getCandidates({
        search: normalizedSearch || undefined,
        role: roleFilter,
      });
    },
  });

  const stats = statsData ?? defaultStats;
  const candidates = candidatesData ?? [];
  const isLoading = isCandidatesLoading;
  const error = candidatesError ? getErrorMessage(candidatesError, 'Failed to load candidates.') : null;

  const filteredCandidates = useMemo(() => {
    if (periodFilter === 'all-time') return candidates;

    const now = new Date();

    return candidates.filter((candidate) => {
      const joinedDate = new Date(candidate.joinedAt);
      if (Number.isNaN(joinedDate.getTime())) return false;

      if (periodFilter === 'this-month') {
        return (
          joinedDate.getFullYear() === now.getFullYear() &&
          joinedDate.getMonth() === now.getMonth()
        );
      }

      if (periodFilter === 'this-year') {
        return joinedDate.getFullYear() === now.getFullYear();
      }

      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      return joinedDate >= startOfWeek && joinedDate < endOfWeek;
    });
  }, [candidates, periodFilter]);

  const handleView = useCallback((candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  }, []);

  const removeMutation = useMutation({
    mutationFn: (id: string) => candidatesService.removeCandidate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminCandidates'] });
      void queryClient.invalidateQueries({ queryKey: ['adminCandidatesStats'] });
    },
    onError: (err: unknown) => {
      window.alert(getErrorMessage(err, 'Failed to remove candidate.'));
    },
  });

  const handleRemove = useCallback((id: string) => {
    const confirmed = window.confirm('Are you sure to remove this candidate?');
    if (!confirmed) return;
    removeMutation.mutate(id);
  }, [removeMutation]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AdminTopbar
        searchPlaceholder="Search candidates"
        searchValue={search}
        onSearchChange={setSearch}
        rightControl={
          <div className="flex items-center gap-3">
            <CandidateFilterBar roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} />
            <DashboardPeriodDropdown value={periodFilter} onChange={setPeriodFilter} />
          </div>
        }
      />

      <div className="min-h-0 flex flex-1 flex-col px-4 sm:px-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Users size={24} className="text-indigo-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">Candidates</h1>
        </div>

        <CandidateStatsBar stats={stats} />

        {isLoading || isStatsLoading ? (
          <AdminLoadingCard label="Loading candidates..." />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-500">
            {error}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
            No candidates found for the selected filters.
          </div>
        ) : (
          <div className="min-h-0 flex-1">
            <CandidatesTable candidates={filteredCandidates} onView={handleView} onRemove={handleRemove} />
          </div>
        )}
      </div>

      <AdminDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedCandidate?.name || 'Candidate Details'}
        type="candidate"
        data={selectedCandidate}
      />
    </div>
  );
}
