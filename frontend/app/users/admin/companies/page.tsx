"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2 } from 'lucide-react';
import CompaniesTable from '@/components/admin/companies/CompaniesTable';
import DashboardPeriodDropdown, { type PeriodFilter } from '@/components/admin/dashboard/DashboardPeriodDropdown';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import { companiesService } from '@/lib/admin/companies.service';
import type { Company } from '@/types/admin/company.types';

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all-time');
  const [companies, setCompanies] = useState<Company[]>([]);
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

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await companiesService.getCompanies({
        search: normalizedSearch || undefined,
      });
      setCompanies(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load companies.'));
    } finally {
      setIsLoading(false);
    }
  }, [normalizedSearch]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

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

  const handleRemove = useCallback(async (id: string) => {
    const confirmed = window.confirm('Are you sure to remove this company?');
    if (!confirmed) return;

    try {
      await companiesService.removeCompany(id);
      setCompanies((prev) => prev.filter((company) => company.id !== id));
    } catch (err: unknown) {
      window.alert(getErrorMessage(err, 'Failed to remove company.'));
    }
  }, []);

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
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
            Loading companies...
          </div>
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
