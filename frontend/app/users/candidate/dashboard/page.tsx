"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CalendarFold,
  CheckCircle2,
  Clock3,
  Eye,
  FileSearch,
  LayoutDashboard,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DashboardJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAgo: string;
  matchPercent: number;
  tags: string[];
  companyLogoUrl?: string;
}

const RECOMMENDED_JOBS: DashboardJob[] = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "Google",
    location: "Mountain view, CA",
    postedAgo: "2 days ago",
    matchPercent: 92,
    tags: ["Remote", "Full time", "Paid", "6 months"],
    companyLogoUrl: "google",
  },
  {
    id: "2",
    title: "Data Analyst Intern",
    company: "Microsoft",
    location: "Redmond, WA",
    postedAgo: "1 day ago",
    matchPercent: 86,
    tags: ["Onsite", "Full time", "Paid", "3 months"],
    companyLogoUrl: "microsoft",
  },
  {
    id: "3",
    title: "UI/UX Design Intern",
    company: "Figma",
    location: "San Francisco, CA",
    postedAgo: "3 days ago",
    matchPercent: 84,
    tags: ["Hybrid", "Full time", "Paid", "4 months"],
    companyLogoUrl: "figma",
  },
  {
    id: "4",
    title: "Marketing Intern",
    company: "Airbnb",
    location: "Seattle, WA",
    postedAgo: "4 days ago",
    matchPercent: 81,
    tags: ["Remote", "Part time", "Paid", "3 months"],
    companyLogoUrl: "airbnb",
  },
];

const STAT_CARDS = [
  {
    title: "Applications sent",
    value: "5",
    icon: <Send size={15} />,
  },
  {
    title: "Interviews scheduled",
    value: "2",
    icon: <CalendarDays size={15} />,
  },
  {
    title: "Pending matches",
    value: "4",
    icon: <FileSearch size={15} />,
  },
  {
    title: "Profile views",
    value: "18",
    icon: <Eye size={15} />,
  },
];

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function RecommendationRow({
  job,
  isApplied,
  showWithdraw,
  onView,
  onApply,
  onWithdraw,
}: {
  job: DashboardJob;
  isApplied: boolean;
  showWithdraw: boolean;
  onView: (jobId: string) => void;
  onApply: (jobId: string) => void;
  onWithdraw: (jobId: string) => void;
}) {
  const showGoogleLogo = job.companyLogoUrl === "google";

  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
            {showGoogleLogo ? (
              <GoogleLogo />
            ) : (
              <span className="text-sm font-bold text-indigo-700">{job.company.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold leading-5 text-gray-900">{job.title}</p>
            <p className="text-sm font-medium text-blue-500">
              {job.company} - {job.location}
            </p>
            <p className="mt-1 text-xs text-gray-400">{job.postedAgo}</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
          <CheckCircle2 size={12} />
          {job.matchPercent}% Match
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(job.id)}
            className="cursor-pointer rounded-full border border-indigo-300 px-7 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            View
          </button>
          {isApplied && showWithdraw ? (
            <button
              onClick={() => onWithdraw(job.id)}
              className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-7 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Withdraw
            </button>
          ) : isApplied ? (
            <button
              disabled
              className="cursor-not-allowed rounded-full border border-emerald-200 bg-emerald-50 px-7 py-1.5 text-sm font-semibold text-emerald-700"
            >
              Applied
            </button>
          ) : (
            <button
              onClick={() => onApply(job.id)}
              className="cursor-pointer rounded-full bg-indigo-600 px-7 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Apply now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import DashboardPage from "@/components/candidate/dashboard/DashboardPage";

export default function CandidateDashboardPage() {
  return <DashboardPage />;
}
