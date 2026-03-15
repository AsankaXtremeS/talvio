import { ChevronDown, MoreHorizontal } from 'lucide-react';

interface JobPostStatsBarProps {
  internshipPosts: number;
  internshipCompanies: number;
  jobPosts: number;
  jobCompanies: number;
}

export default function JobPostStatBar({
  internshipPosts,
  internshipCompanies,
  jobPosts,
  jobCompanies,
}: JobPostStatsBarProps) {
  return (
    <div className="mb-6 flex gap-4">
      <div className="bg-[#7C6FCD] rounded-2xl p-5 flex-1 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-white">Internships</span>
            <button className="flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
              This Month <ChevronDown size={11} />
            </button>
          </div>
          <button className="text-white/60 hover:text-white/90">
            <MoreHorizontal size={18} />
          </button>
        </div>
        <p className="text-4xl font-bold text-white">{internshipPosts}</p>
        <p className="text-sm text-white/70 mt-1">Posts</p>
        <p className="text-3xl font-bold text-white mt-2">{internshipCompanies}</p>
        <p className="text-sm text-white/70 mt-1">Companies posted</p>
      </div>

      <div className="bg-[#4A3FA6] rounded-2xl p-5 flex-1 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-white">Jobs</span>
            <button className="flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
              This Month <ChevronDown size={11} />
            </button>
          </div>
          <button className="text-white/60 hover:text-white/90">
            <MoreHorizontal size={18} />
          </button>
        </div>
        <p className="text-4xl font-bold text-white">{jobPosts}</p>
        <p className="text-sm text-white/70 mt-1">Posts</p>
        <p className="text-3xl font-bold text-white mt-2">{jobCompanies}</p>
        <p className="text-sm text-white/70 mt-1">Companies posted</p>
      </div>
    </div>
  );
}