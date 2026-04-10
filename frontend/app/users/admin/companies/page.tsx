"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import CompaniesTable from '@/components/admin/companies/CompaniesTable';
import DashboardPeriodDropdown, { type PeriodFilter } from '@/components/admin/dashboard/DashboardPeriodDropdown';
import AdminLoadingCard from '@/components/admin/layout/AdminLoadingCard';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import { companiesService } from '@/lib/admin/companies.service';
import type { Company } from '@/types/admin/company.types';

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all-time');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const normalizedSearch = useMemo(() => debouncedSearch.trim(), [debouncedSearch]);

  const { data: companiesData, isLoading, error: companiesError } = useQuery({
    queryKey: ['adminCompanies', normalizedSearch],
    queryFn: async () => {
      return await companiesService.getCompanies({
        search: normalizedSearch || undefined,
      });
    },
  });

  const companies = companiesData ?? [];
  const error = companiesError ? getErrorMessage(companiesError, 'Failed to load companies.') : null;

  const filteredCompanies = useMemo(() => {
    if (periodFilter === 'all-time') return companies;

    const now = new Date();

    return companies.filter((company) => {
      const joinedDate = new Date(company.joinedAt);
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
  }, [companies, periodFilter]);

  const handleView = useCallback((company: Company) => {
    window.alert(`Company profile for ${company.name} will be available after the company module is implemented.`);
  }, []);

  const removeMutation = useMutation({
    mutationFn: (id: string) => companiesService.removeCompany(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminCompanies'] });
    },
    onError: (err: unknown) => {
      window.alert(getErrorMessage(err, 'Failed to remove company.'));
    },
  });

  const handleRemove = useCallback((id: string) => {
    const confirmed = window.confirm('Are you sure to remove this company?');
    if (!confirmed) return;
    removeMutation.mutate(id);
  }, [removeMutation]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AdminTopbar
        searchPlaceholder="Search companies"
        searchValue={search}
        onSearchChange={setSearch}
        rightControl={
          <DashboardPeriodDropdown value={periodFilter} onChange={setPeriodFilter} />
        }
      />

      <div className="admin-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        {/* Page Header */}
        <div className="flex items-center gap-2 mb-6">
          <Building2 size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-indigo-600">Companies</h1>
        </div>

        {isLoading ? (
          <AdminLoadingCard label="Loading companies..." />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-500">
            {error}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
            No companies found for the selected period.
          </div>
        ) : (
          <CompaniesTable companies={filteredCompanies} onView={handleView} onRemove={handleRemove} />
        )}
      </div>
    </div>
  );
}
