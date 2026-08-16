import { TrendingUp, TrendingDown, GraduationCap, Briefcase } from 'lucide-react';
import type { CandidateStats } from '@/types/candidate/candidate.stats.types';

interface CandidateStatsBarProps {
  stats: CandidateStats;
}

function RateBox({ label, rate, isUp }: { label: string; rate: number; isUp: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {isUp ? (
          <TrendingUp size={14} className="text-green-400" />
        ) : (
          <TrendingDown size={14} className="text-red-400" />
        )}
        <span className="text-2xl font-bold text-white">{rate}%</span>
      </div>
      <span className="text-xs text-white opacity-70">{label}</span>
    </div>
  );
}

export default function CandidateStatsBar({ stats }: CandidateStatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Internship seekers */}
      <div className="bg-[#7C6FCD] rounded-2xl p-5 text-white flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium opacity-90">Internship Seekers</span>
          <div className="text-white opacity-80">
            <GraduationCap size={20} />
          </div>
        </div>
        <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          {stats.lookingForInternships.toLocaleString()}
        </span>
      </div>

      {/* Job seekers */}
      <div className="bg-[#6B5FC0] rounded-2xl p-5 text-white flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium opacity-90">Job Seekers</span>
          <div className="text-white opacity-80">
            <Briefcase size={20} />
          </div>
        </div>
        <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          {stats.lookingForJobs.toLocaleString()}
        </span>
      </div>

      {/* Internship rates */}
      <div className="bg-[#5A4FB3] rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white opacity-90">Internships</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">This Month</span>
        </div>
        <div className="flex gap-6">
          <RateBox label="Applying" rate={stats.internshipApplyingRate} isUp={true} />
          <RateBox label="Hiring" rate={stats.internshipHiringRate} isUp={false} />
        </div>
      </div>

      {/* Job rates */}
      <div className="bg-[#4A3FA6] rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white opacity-90">Jobs</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">This Month</span>
        </div>
        <div className="flex gap-6">
          <RateBox label="Applying" rate={stats.jobApplyingRate} isUp={true} />
          <RateBox label="Hiring" rate={stats.jobHiringRate} isUp={false} />
        </div>
      </div>
    </div>
  );
}
