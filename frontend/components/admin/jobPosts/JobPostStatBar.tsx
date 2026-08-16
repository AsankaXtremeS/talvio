import { MoreHorizontal } from 'lucide-react';

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
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Internships Card */}
      <div className="relative w-full rounded-2xl bg-[#7C6FCD] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Internships</span>
          <button className="text-white/60 hover:text-white/90">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <div className="flex gap-10 sm:gap-20">
          <div>
            <p className="text-2xl sm:text-3xl font-bold leading-none text-white">{internshipPosts}</p>
            <p className="mt-1 text-xs text-white/70">Posts</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold leading-none text-white">{internshipCompanies}</p>
            <p className="mt-1 text-xs text-white/70">Companies posted</p>
          </div>
        </div>
      </div>

      {/* Jobs Card */}
      <div className="relative w-full rounded-2xl bg-[#4A3FA6] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Jobs</span>
          <button className="text-white/60 hover:text-white/90">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <div className="flex gap-10 sm:gap-20">
          <div>
            <p className="text-2xl sm:text-3xl font-bold leading-none text-white">{jobPosts}</p>
            <p className="mt-1 text-xs text-white/70">Posts</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold leading-none text-white">{jobCompanies}</p>
            <p className="mt-1 text-xs text-white/70">Companies posted</p>
          </div>
        </div>
      </div>
    </div>
  );
}