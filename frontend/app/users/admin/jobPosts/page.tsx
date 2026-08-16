'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import AdminLoadingCard from '@/components/admin/layout/AdminLoadingCard';
import JobPostStatBar from '@/components/admin/jobPosts/JobPostStatBar';
import JobPostsTable from '@/components/admin/jobPosts/JobPostsTable';
import AdminDetailModal from '@/components/admin/shared/AdminDetailModal';
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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Detail Modal State
  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const normalizedSearch = useMemo(() => debouncedSearch.trim(), [debouncedSearch]);

  const { data: statsData } = useQuery({
    queryKey: ['adminJobPostStats'],
    queryFn: async () => {
      try {
        return await companiesService.getJobPostStats();
      } catch {
        return emptyStats;
      }
    },
  });

  const { data: postsData, isLoading: isPostsLoading, error: postsError } = useQuery({
    queryKey: ['adminJobPosts', normalizedSearch, page],
    queryFn: async () => {
      return await companiesService.getJobPosts({
        search: normalizedSearch || undefined,
        page,
        limit: PAGE_LIMIT,
      });
    },
  });

  const stats = statsData ?? emptyStats;
  const posts = postsData?.data ?? [];
  const pagination = postsData?.pagination ?? { ...emptyPagination, page };
  const isLoading = isPostsLoading;
  const error = postsError ? getErrorMessage(postsError, 'Failed to load job posts.') : null;

  const handlePrevious = useCallback(() => {
    if (page <= 1) return;
    setPage((p) => p - 1);
  }, [page]);

  const handleNext = useCallback(() => {
    if (page >= pagination.totalPages) return;
    setPage((p) => p + 1);
  }, [page, pagination.totalPages]);

  const handleView = useCallback((post: JobPost) => {
    setSelectedPost(post);
    setIsDetailOpen(true);
  }, []);

  const removeMutation = useMutation({
    mutationFn: (id: string) => companiesService.removeJobPost(id),
    onSuccess: () => {
      if (posts.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
      void queryClient.invalidateQueries({ queryKey: ['adminJobPosts'] });
      void queryClient.invalidateQueries({ queryKey: ['adminJobPostStats'] });
    },
    onError: (err: unknown) => {
      window.alert(getErrorMessage(err, 'Failed to remove job post.'));
    },
  });

  const handleRemove = useCallback((post: JobPost) => {
    const confirmed = window.confirm(`Are you sure to remove "${post.jobTitle}"?`);
    if (!confirmed) return;
    removeMutation.mutate(post.id);
  }, [removeMutation]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AdminTopbar
        searchPlaceholder="Search job posts"
        searchValue={search}
        onSearchChange={setSearch}
        showSearch
      />

      <div className="min-h-0 flex flex-1 flex-col px-4 sm:px-6 pb-6">
        <div className="mb-4 sm:mb-6 flex items-center gap-2">
          <MessageSquare size={24} className="text-indigo-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">Job Posts</h1>
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
              onView={handleView}
              onDelete={handleRemove}
              pagination={pagination}
              onPreviousPage={handlePrevious}
              onNextPage={handleNext}
              isPaginationDisabled={isLoading}
            />
          )}
        </div>
      </div>

      <AdminDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedPost?.jobTitle || 'Job Post Details'}
        type="jobPost"
        data={selectedPost}
      />
    </div>
  );
}