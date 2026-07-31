"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BriefcaseBusiness, X } from "lucide-react";
import { apiClient, SessionExpiredError } from "@/lib/apiClient";

interface NewJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  createdAt: string;
}

interface NewJobsResponse {
  count: number;
  jobs: NewJob[];
}

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [jobs, setJobs] = useState<NewJob[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNewJobs = useCallback(async () => {
    if (sessionExpired) return;

    try {
      setLoading(true);
      const data = await apiClient<NewJobsResponse>("/api/candidate/jobs/new");
      setJobs(data.jobs);
      // Only count jobs that haven't been seen yet
      const unseenCount = data.jobs.filter((j) => !seenIds.has(j.id)).length;
      setCount(unseenCount);
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        setSessionExpired(true);
        return;
      }
      console.error("Failed to fetch new jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [seenIds, sessionExpired]);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    if (sessionExpired) return;

    fetchNewJobs();
    const interval = setInterval(fetchNewJobs, 30000);
    return () => clearInterval(interval);
  }, [fetchNewJobs, sessionExpired]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) {
            // Mark all current jobs as seen when opening
            setSeenIds(new Set(jobs.map((j) => j.id)));
            setCount(0);
          }
        }}
      >
        <Bell size={18} className="text-gray-500" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-indigo-600" />
              <p className="text-sm font-semibold text-gray-800">New Postings</p>
              {count > 0 && (
                <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                  {count} new
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            )}

            {!loading && jobs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Bell size={24} className="text-gray-300" />
                <p className="text-sm text-gray-400">No new postings in last 24 hours</p>
              </div>
            )}

            {!loading && jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-recommendation-job-modal", { detail: { jobId: job.id } }));
                  setOpen(false);
                }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
              >
                {/* Company avatar */}
                <div className="w-9 h-9 rounded-xl bg-indigo-50 shrink-0 flex items-center justify-center">
                  <BriefcaseBusiness size={16} className="text-indigo-600" />
                </div>

                {/* Job info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{job.title}</p>
                  <p className="text-xs text-indigo-500 font-medium truncate">{job.company}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400">{job.location}</span>
                    {job.workMode && (
                      <span className="text-[11px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full font-medium">
                        {job.workMode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time + View */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-[11px] text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                  <span className="text-[11px] text-indigo-500 font-semibold hover:underline">
                    View →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {jobs.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-[11px] text-gray-400 text-center">
                Updates every 30 seconds
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}