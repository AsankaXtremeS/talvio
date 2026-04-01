import { CalendarDays, Search } from "lucide-react";

interface DashboardHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  currentDateLabel: string;
}

export default function DashboardHeader({ search, onSearchChange, currentDateLabel }: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-3 bg-[#EEF4FF] px-1 pb-2 pt-1">
      <div className="relative min-w-65 flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search candidates, jobs, ..."
          className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700  outline-none placeholder:text-gray-400 focus:border-indigo-300"
        />
      </div>
      <div className="inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 ">
        <CalendarDays size={15} className="text-gray-400" />
        {currentDateLabel}
      </div>
    </div>
  );
}
