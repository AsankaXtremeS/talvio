import { CheckCircle2 } from "lucide-react";

export interface DashboardJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAgo: string;
  matchPercent: number;
  tags: string[];
  companyLogoUrl?: string;
  isAiRecommended?: boolean;
}

interface RecommendationRowProps {
  job: DashboardJob;
  isApplied: boolean;
  showWithdraw: boolean;
  onView: (jobId: string) => void;
  onApply: (jobId: string) => void;
  onWithdraw: (jobId: string) => void;
}

export default function RecommendationRow({ job, isApplied, showWithdraw, onView, onApply, onWithdraw }: RecommendationRowProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {job.companyLogoUrl && job.companyLogoUrl !== "null" && job.companyLogoUrl !== "undefined" ? (
              <img 
                src={job.companyLogoUrl} 
                alt={job.company || "Company"} 
                className="h-full w-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-sm font-bold text-indigo-700">${job.company?.charAt(0) || "?"}</span>`;
                }}
              />
            ) : (
              <span className="text-sm font-bold text-indigo-700">{job.company?.charAt(0) || "?"}</span>
            )}
          </div>
          <div>
            <p className="text-md font-semibold leading-5 text-gray-900">{job.title}</p>
            <p className="text-xs font-medium text-blue-500">
              {job.company || "Unknown Company"} - {job.location}
            </p>
            <p className="mt-1 text-[11px] text-gray-400">{job.postedAgo}</p>
          </div>
        </div>

        {!showWithdraw && (
          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
            <CheckCircle2 size={12} />
            {job.matchPercent}% Match
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onView(job.id)} className="cursor-pointer rounded-full border border-indigo-300 px-7 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
            View
          </button>

          {isApplied && showWithdraw ? (
            <button onClick={() => onWithdraw(job.id)} className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-7 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100">
              Withdraw
            </button>
          ) : isApplied ? (
            <button disabled className="cursor-not-allowed rounded-full border border-emerald-200 bg-emerald-50 px-7 py-1.5 text-sm font-semibold text-emerald-700">
              Applied
            </button>
          ) : (
            <button onClick={() => onApply(job.id)} className="cursor-pointer rounded-full bg-indigo-600 px-7 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Apply now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
