"use client";

import { CalendarDays, Search } from "lucide-react";

export default function SettingsTopBar() {
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
      <div className="relative min-w-[240px] flex-1">
        <Search
          size={19}
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#9AA4B2]"
        />
        <input
          type="text"
          placeholder="Search candidates, jobs, ..."
          className="h-12 w-full rounded-3xl border border-[#CBD5E1] bg-white pl-12 pr-4 text-sm font-medium text-[#334155] placeholder:text-[#94A3B8] outline-none focus:border-[#4F46E5]"
        />
      </div>

      <div className="inline-flex h-12 shrink-0 items-center gap-2.5 self-end rounded-3xl border border-[#CBD5E1] bg-white px-4 text-xs font-semibold text-[#334155] md:self-auto">
        <CalendarDays size={15} className="text-[#94A3B8]" />
        <span>{dateLabel}</span>
      </div>
    </div>
  );
}
