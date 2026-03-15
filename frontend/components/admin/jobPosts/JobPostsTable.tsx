'use client';

import { SlidersHorizontal } from 'lucide-react';
import type { JobPost } from '@/types/admin/company.types';

interface JobPostsTableProps {
  posts: JobPost[];
  onView?: (post: JobPost) => void;
  onEdit?: (post: JobPost) => void;
}

export default function JobPostsTable({ posts, onView, onEdit }: JobPostsTableProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">Job Posts</h2>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-all hover:border-indigo-300">
          <SlidersHorizontal size={14} />
          View
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">Job Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="transition-colors hover:bg-gray-50/50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{post.jobTitle}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{post.category}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                      style={{ backgroundColor: post.companyLogoColor || '#1e3a8a' }}
                    >
                      {post.companyLogoText?.slice(0, 4) || post.companyName.slice(0, 2)}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{post.companyName}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">{post.companyEmail}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView?.(post)}
                      className="rounded-lg border border-indigo-300 px-4 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit?.(post)}
                      className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Edit
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
    </div>
  );
}