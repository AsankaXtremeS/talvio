'use client';

import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { JobPost } from '@/types/admin/company.types';

interface JobPostsTableProps {
  posts: JobPost[];
  onView?: (post: JobPost) => void;
}

export default function JobPostsTable({ posts, onView }: JobPostsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Job Posts</h2>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-indigo-300 transition-all">
          <SlidersHorizontal size={14} />
          View
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">Company</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                <div className="flex items-center gap-1">Category <ChevronDown size={12} /></div>
              </th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Job Title</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: post.companyLogoColor || '#6b7280' }}
                    >
                      {post.companyLogoText?.slice(0, 2) || post.companyName.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.companyName}</p>
                      <p className="text-xs text-gray-400">{post.companyEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{post.category}</td>
                <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{post.jobTitle}</td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => onView?.(post)}
                    className="px-4 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-50">
        <Link
          href="/users/admin/companies"
          className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          View all
        </Link>
      </div>
    </div>
  );
}
