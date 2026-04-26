import { User } from "lucide-react";
import type { JobPost } from "@/types/employer/jobPost.types";

interface JobsPreviewWidgetProps {
  jobs: JobPost[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

function getJobAgeLabel(job: JobPost) {
  const rawDate = job.updatedAt ?? job.createdAt;
  if (!rawDate) return "Recently";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function JobsPreviewWidget({ jobs, isLoading, onViewAll }: JobsPreviewWidgetProps) {
  const visibleJobs = jobs.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Jobs</h2>
          <p className="text-xs text-slate-500">Your most recent openings</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
          onClick={onViewAll}
        >
          View all
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Loading jobs…</div>
      ) : visibleJobs.length > 0 ? (
        visibleJobs.map((job) => (
          <div key={job.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 mb-4 last:mb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {job.companyLogoUrl ? (
                  <div className="overflow-hidden rounded-2xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={job.companyLogoUrl}
                      alt={`${job.companyName || job.title} logo`}
                      className="h-11 w-11 object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-bold text-white">
                    {job.title.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{job.title}</p>
                  <p className="truncate text-xs text-indigo-600">{job.companyName || job.type}</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  job.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : job.status === "Closed"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {job.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">{job.type}</span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">{job.location || "Remote"}</span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm flex items-center gap-1">
                <User size={10} /> {job.applicantsCount ?? 0} Applicants
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{job.applicantsCount ? `${job.applicantsCount} Applicants` : "No applicants yet"}</span>
              <span>{getJobAgeLabel(job)}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No active job posts yet.</div>
      )}
    </div>
  );
}
