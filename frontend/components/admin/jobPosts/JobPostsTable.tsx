'use client';

import { ExternalLink, X } from 'lucide-react';
import type { JobPost, PaginationMeta } from '@/types/admin/company.types';

interface JobPostsTableProps {
  posts: JobPost[];
  onView?: (post: JobPost) => void;
  onDelete?: (post: JobPost) => void;
  pagination: PaginationMeta;
  onPreviousPage: () => void;
  onNextPage: () => void;
  isPaginationDisabled?: boolean;
}

export default function JobPostsTable({
  posts,
  onView,
  onDelete,
  pagination,
  onPreviousPage,
  onNextPage,
  isPaginationDisabled = false,
}: JobPostsTableProps) {
  const canGoPrevious = pagination.page > 1 && !isPaginationDisabled;
  const canGoNext = pagination.page < pagination.totalPages && !isPaginationDisabled;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4">
        <h2 className="text-base font-semibold text-gray-800">Job Posts</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 table-fixed">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[16%]" />
            <col className="w-[24%]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Job Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Job Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-gray-400 uppercase">Email</th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wide text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
        </table>
      </div>

      <div className="admin-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[16%]" />
            <col className="w-[24%]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
          </colgroup>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{post.jobTitle}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{post.type === 'Internship' ? 'Internship' : 'Job'}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {post.companyLogoUrl ? (
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                        <img
                          src={post.companyLogoUrl}
                          alt={`${post.companyName} logo`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          className="hidden h-full w-full items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: post.companyLogoColor || '#1e3a8a' }}
                          aria-hidden="true"
                        >
                          {post.companyLogoText?.slice(0, 4) || post.companyName.slice(0, 2)}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                        style={{ backgroundColor: post.companyLogoColor || '#1e3a8a' }}
                      >
                        {post.companyLogoText?.slice(0, 4) || post.companyName.slice(0, 2)}
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-800">{post.companyName}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">{post.companyEmail}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView?.(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-600 text-xs font-semibold hover:bg-indigo-50 transition-colors duration-150 whitespace-nowrap"
                    >
                      <ExternalLink size={12} />
                      View
                    </button>
                    <button
                      onClick={() => onDelete?.(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors duration-150 whitespace-nowrap"
                    >
                      <X size={12} />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No job posts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
        <p className="text-xs text-gray-500">
          Page {pagination.page} of {Math.max(1, pagination.totalPages)}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={!canGoPrevious}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canGoNext}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}