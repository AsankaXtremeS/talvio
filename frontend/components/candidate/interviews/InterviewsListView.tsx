"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import InterviewCard from "@/components/candidate/interviews/InterviewCard";
import { mapInterviewToItem } from "@/components/candidate/interviews/types";
import { candidateInterviewsService } from "@/lib/candidate/interviews.service";
import { CalendarDays, Cog } from "lucide-react";

export default function InterviewsListView() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["candidate-interviews-list"],
    queryFn: () => candidateInterviewsService.getInterviews({ status: "ALL", limit: 100 }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  const interviews = useMemo(
    () => (data?.data ?? [])
      .filter((i) => i.status !== "CANCELLED" && i.status !== "COMPLETED")
      .map(mapInterviewToItem),
    [data?.data]
  );

  const now = new Date();

  // Filter interviews by selected date if one is selected
  const displayedInterviews = useMemo(() => {
    if (selectedDate === null) return interviews;
    
    return interviews.filter((interview) => {
      const interviewDate = new Date(interview.scheduledAt);
      return (
        interviewDate.getDate() === selectedDate &&
        interviewDate.getMonth() === now.getMonth() &&
        interviewDate.getFullYear() === now.getFullYear()
      );
    });
  }, [interviews, selectedDate, now]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(now);

  const upcomingInterviews = interviews
    .filter((interview) => new Date(interview.scheduledAt).getTime() >= now.getTime())
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    .slice(0, 3);

  const interviewDaysInCurrentMonth = new Set(
    interviews.map((interview) => new Date(interview.scheduledAt))
      .filter(
        (date) =>
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear(),
      )
      .map((date) => date.getDate()),
  );

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const calendarCells: Array<number | null> = [
    ...Array.from({ length: firstDayOfMonth }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  return (
    <section className="p-5 md:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
        <div>
          <header className="mb-4">
            <h1 className="flex items-center gap-2 text-3xl font-bold text-indigo-700">
              <span>
                <Cog />
              </span>
              Interview Schedule
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your upcoming interview timings and open each detail page to join the company meeting room.
              {selectedDate && (
                <span className="ml-2 font-medium text-indigo-600">
                  Filtering by: {monthLabel.split(" ")[0]} {selectedDate}
                  <button 
                    onClick={() => setSelectedDate(null)}
                    className="ml-2 text-xs underline text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </span>
              )}
            </p>
          </header>

          {isLoading && (
            <p className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              Loading scheduled interviews...
            </p>
          )}

          {isError && (
            <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {(error as Error)?.message || "Failed to load interviews"}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {displayedInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
            {!isLoading && displayedInterviews.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                {selectedDate 
                  ? `No interviews scheduled for ${monthLabel.split(" ")[0]} ${selectedDate}.` 
                  : "No scheduled interviews yet."}
              </div>
            )}
          </div>
        </div>

        <div className="w-full rounded-2xl border border-indigo-100 bg-white shadow-sm lg:sticky lg:top-6">
          <div className="flex items-center justify-center gap-2 rounded-t-2xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
            <CalendarDays size={14} />
            {monthLabel}
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 gap-1">
              {weekdayLabels.map((label) => (
                <span
                  key={label}
                  className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {calendarCells.map((cell, index) => {
                const isToday = cell === now.getDate();
                const isPast = cell !== null && cell < now.getDate();
                const isSelected = cell === selectedDate;
                const hasInterview = cell !== null && interviewDaysInCurrentMonth.has(cell);

                let cellClassName = "text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors";
                if (cell === null) {
                  cellClassName = "text-transparent";
                } else if (isPast) {
                  cellClassName = "text-slate-300 cursor-not-allowed";
                } else if (isSelected) {
                  cellClassName = "bg-indigo-600 font-semibold text-white shadow-sm cursor-pointer";
                } else if (isToday) {
                  cellClassName = "bg-indigo-100 font-semibold text-indigo-700 hover:bg-indigo-200 cursor-pointer transition-colors";
                } else if (hasInterview) {
                  cellClassName = "border border-indigo-200 bg-indigo-50 font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer transition-colors";
                }

                return (
                  <div
                    key={`${cell ?? "empty"}-${index}`}
                    onClick={() => {
                      if (cell !== null && !isPast) {
                        setSelectedDate(cell === selectedDate ? null : cell);
                      }
                    }}
                    className={`flex h-8 items-center justify-center rounded-md text-sm ${cellClassName}`}
                  >
                    {cell ?? "-"}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Upcoming interview reminders
              </p>

              {upcomingInterviews.length === 0 ? (
                <p className="mt-2 text-xs text-slate-600">No upcoming interviews scheduled.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {upcomingInterviews.map((interview) => {
                    const date = new Date(interview.scheduledAt);
                    const dateLabel = new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(date);
                    const timeLabel = new Intl.DateTimeFormat("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }).format(date);

                    return (
                      <Link
                        key={interview.id}
                        href={`/users/candidate/interviews/${interview.id}`}
                        className="block rounded-lg border border-indigo-100 bg-white px-2.5 py-2 transition-colors hover:bg-indigo-50"
                      >
                        <p className="text-xs font-semibold text-slate-800">{interview.company}</p>
                        <p className="text-[11px] text-slate-600">
                          {dateLabel} at {timeLabel}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
