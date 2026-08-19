import { ChevronDown, MoreHorizontal } from 'lucide-react';
import type { CompanyStats } from '@/types/admin/company.types';

interface CompanyStatsBarProps {
  stats: CompanyStats;
}

export default function CompanyStatsBar({ stats }: CompanyStatsBarProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="bg-indigo-100 rounded-2xl p-5 flex-1 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-800">Internships</span>
            <button className="flex items-center gap-1 text-xs bg-indigo-200/60 text-indigo-700 px-2 py-0.5 rounded-full">
              This Month <ChevronDown size={11} />
            </button>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={18} />
          </button>
        </div>
        <p className="text-4xl font-bold text-gray-900">{stats.internshipPosts}</p>
        <p className="text-sm text-gray-500 mt-1">Posts</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.internshipCompanies}</p>
        <p className="text-sm text-gray-500 mt-1">Companies posted</p>
      </div>

      <div className="bg-indigo-100 rounded-2xl p-5 flex-1 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-800">Jobs</span>
            <button className="flex items-center gap-1 text-xs bg-indigo-200/60 text-indigo-700 px-2 py-0.5 rounded-full">
              This Month <ChevronDown size={11} />
            </button>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={18} />
          </button>
        </div>
        <p className="text-4xl font-bold text-gray-900">{stats.jobPosts}</p>
        <p className="text-sm text-gray-500 mt-1">posts</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.jobCompanies}</p>
        <p className="text-sm text-gray-500 mt-1">Companies posted</p>
      </div>
    </div>
  );
}
