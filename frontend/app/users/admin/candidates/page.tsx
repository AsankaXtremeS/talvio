"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import CandidateStatsBar from '@/components/admin/candidates/CandidateStatsBar';
import CandidatesTable from '@/components/admin/candidates/CandidatesTable';
import CandidateFilterBar from '@/components/admin/candidates/CandidateFilterBar';
import DashboardPeriodDropdown, { type PeriodFilter } from '@/components/admin/dashboard/DashboardPeriodDropdown';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
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
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all-time');
  const [roleFilter, setRoleFilter] = useState<CandidateRoleFilter>('all');
  const [stats, setStats] = useState<CandidateStats>(defaultStats);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const normalizedSearch = useMemo(() => debouncedSearch.trim(), [debouncedSearch]);

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextStats, nextCandidates] = await Promise.all([
        candidatesService.getStats(),
        candidatesService.getCandidates({
          search: normalizedSearch || undefined,
          role: roleFilter,
        }),
      ]);

      setStats(nextStats);
      setCandidates(nextCandidates);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load candidates.'));
    } finally {
      setIsLoading(false);
    }
  }, [normalizedSearch, roleFilter]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

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
    window.alert(`Candidate profile for ${candidate.name} will be available soon.`);
  }, []);

  const handleRemove = useCallback(async (id: string) => {
    const confirmed = window.confirm('Are you sure to remove this candidate?');
    if (!confirmed) return;

    try {
      await candidatesService.removeCandidate(id);
      setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
      setStats((prev) => {
        const removed = candidates.find((candidate) => candidate.id === id);
        if (!removed) return prev;

        if (removed.type === 'Undergraduate') {
          const updatedInternships = Math.max(0, prev.lookingForInternships - 1);
          const total = updatedInternships + prev.lookingForJobs;
          return {
            ...prev,
            lookingForInternships: updatedInternships,
            internshipApplyingRate: total === 0 ? 0 : Math.round((updatedInternships / total) * 100),
            jobApplyingRate: total === 0 ? 0 : Math.round((prev.lookingForJobs / total) * 100),
          };
        }

        const updatedJobs = Math.max(0, prev.lookingForJobs - 1);
        const total = prev.lookingForInternships + updatedJobs;
        return {
          ...prev,
          lookingForJobs: updatedJobs,
          internshipApplyingRate: total === 0 ? 0 : Math.round((prev.lookingForInternships / total) * 100),
          jobApplyingRate: total === 0 ? 0 : Math.round((updatedJobs / total) * 100),
        };
      });
    } catch (err: unknown) {
      window.alert(getErrorMessage(err, 'Failed to remove candidate.'));
    }
  }, [candidates]);

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

      <div className="min-h-0 flex flex-1 flex-col px-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Users size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-indigo-600">Candidates</h1>
        </div>

        <CandidateStatsBar stats={stats} />

        {isLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
            Loading candidates...
          </div>
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
    </div>
  );
}
