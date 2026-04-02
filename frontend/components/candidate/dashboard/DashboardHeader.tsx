import { Search } from "lucide-react";

interface DashboardHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  currentDateLabel: string;
  nearestInterviewDateLabel?: string;
  nearestInterviewTimeLabel?: string;
}

export default function DashboardHeader({
  search,
  onSearchChange,
  nearestInterviewDateLabel,
  nearestInterviewTimeLabel,
}: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-20 -mx-1 w-full px-1 pb-2 pt-1">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-70 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidates, jobs, ..."
            className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-indigo-300"
          />
        </div>

        <div className="inline-flex h-11 min-w-65 items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-600">
          {nearestInterviewDateLabel && nearestInterviewTimeLabel ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
                <span>Upcoming Interview</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs text-blue-600">
                <span>{nearestInterviewDateLabel}</span>
                <span>|</span>
                <span>{nearestInterviewTimeLabel}</span>
              </div>
            </>
          ) : (
            <span className="text-xs text-gray-500">No upcoming interview</span>
          )}
        </div>
      </div>
    </div>
  );
}
