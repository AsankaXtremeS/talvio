'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import AdminLoadingCard from '@/components/admin/layout/AdminLoadingCard';
import JobPostStatBar from '@/components/admin/jobPosts/JobPostStatBar';
import JobPostsTable from '@/components/admin/jobPosts/JobPostsTable';
import { companiesService } from '@/lib/admin/companies.service';
import type { CompanyStats, JobPost, PaginationMeta } from '@/types/admin/company.types';

const PAGE_LIMIT = 20;

const emptyStats: CompanyStats = {
  internshipPosts: 0,
  internshipCompanies: 0,
  jobPosts: 0,
  jobCompanies: 0,
};

const emptyPagination: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
  totalPages: 1,
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
};

export default function JobPostsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stats, setStats] = useState<CompanyStats>(emptyStats);
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
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

  const loadData = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const [statsData, postsResponse] = await Promise.all([
          companiesService.getJobPostStats(),
          companiesService.getJobPosts({
            search: normalizedSearch || undefined,
            page,
            limit: PAGE_LIMIT,
          }),
        ]);

        setStats(statsData);
        setPosts(postsResponse.data);
        setPagination(postsResponse.pagination);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load job posts.'));
      } finally {
        setIsLoading(false);
      }
    },
    [normalizedSearch],
  );

  useEffect(() => {
    void loadData(1);
  }, [loadData]);

  const handlePrevious = useCallback(() => {
    if (pagination.page <= 1 || isLoading) return;
    void loadData(pagination.page - 1);
  }, [isLoading, loadData, pagination.page]);

  const handleNext = useCallback(() => {
    if (pagination.page >= pagination.totalPages || isLoading) return;
    void loadData(pagination.page + 1);
  }, [isLoading, loadData, pagination.page, pagination.totalPages]);

  const handleRemove = useCallback(
    async (post: JobPost) => {
      const confirmed = window.confirm(`Are you sure to remove \"${post.jobTitle}\"?`);
      if (!confirmed) return;

      try {
        await companiesService.removeJobPost(post.id);

        const shouldLoadPreviousPage = posts.length === 1 && pagination.page > 1;
        const targetPage = shouldLoadPreviousPage ? pagination.page - 1 : pagination.page;
        await loadData(targetPage);
      } catch (err: unknown) {
        window.alert(getErrorMessage(err, 'Failed to remove job post.'));
      }
    },
    [loadData, pagination.page, posts.length],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AdminTopbar
        searchPlaceholder="Search job posts"
        searchValue={search}
        onSearchChange={setSearch}
        showSearch
      />

      <div className="min-h-0 flex flex-1 flex-col px-6 pb-6">
        <div className="mb-6 flex items-center gap-2">
          <MessageSquare size={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-indigo-600">Job Posts</h1>
        </div>

        <JobPostStatBar
          internshipPosts={stats.internshipPosts}
          internshipCompanies={stats.internshipCompanies}
          jobPosts={stats.jobPosts}
          jobCompanies={stats.jobCompanies}
        />

        <div className="min-h-0 flex-1">
          {isLoading ? (
            <AdminLoadingCard label="Loading job posts..." />
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-500">
              {error}
            </div>
          ) : (
            <JobPostsTable
              posts={posts}
              onDelete={handleRemove}
              pagination={pagination}
              onPreviousPage={handlePrevious}
              onNextPage={handleNext}
              isPaginationDisabled={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}