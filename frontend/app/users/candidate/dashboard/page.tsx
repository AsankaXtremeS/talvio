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

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProfessional = user?.role === "PROFESSIONAL";
  const storageKey = "candidateAppliedJobIds";

  const [activeTab, setActiveTab] = useState<"recommended" | "applications">("recommended");
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [scheduledInterviews] = useState(() => {
    const base = new Date();
    return [
      new Date(base.getTime() + 1000 * 60 * 60 * 2),
      new Date(base.getTime() + 1000 * 60 * 60 * 27),
      new Date(base.getTime() + 1000 * 60 * 60 * 72),
    ];
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "applications") {
      setActiveTab("applications");
      return;
    }
    setActiveTab("recommended");
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncAppliedJobs = () => {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) {
        setAppliedJobIds([]);
        return;
      }

      try {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setAppliedJobIds(parsed.filter((value): value is string => typeof value === "string"));
        } else {
          setAppliedJobIds([]);
        }
      } catch {
        setAppliedJobIds([]);
      }
    };

    syncAppliedJobs();
    window.addEventListener("storage", syncAppliedJobs);
    window.addEventListener("focus", syncAppliedJobs);

    return () => {
      window.removeEventListener("storage", syncAppliedJobs);
      window.removeEventListener("focus", syncAppliedJobs);
    };
  }, []);

  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(now),
    [now],
  );

  const nearestInterview = useMemo(
    () =>
      scheduledInterviews
        .filter((interviewDate) => interviewDate.getTime() >= now.getTime())
        .sort((a, b) => a.getTime() - b.getTime())[0] ?? null,
    [now, scheduledInterviews],
  );

  const nearestInterviewDateLabel = useMemo(() => {
    if (!nearestInterview) return "No upcoming interview";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(nearestInterview);
  }, [nearestInterview]);

  const nearestInterviewTimeLabel = useMemo(() => {
    if (!nearestInterview) return "Please check back later";
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(nearestInterview);
  }, [nearestInterview]);

  const filteredJobs = useMemo(
    () =>
      RECOMMENDED_JOBS.filter((job) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;
        return job.title.toLowerCase().includes(keyword);
      }),
    [search],
  );

  const shownJobs = useMemo(() => {
    if (activeTab === "applications") {
      return filteredJobs.filter((job) => appliedJobIds.includes(job.id));
    }

    return filteredJobs;
  }, [activeTab, appliedJobIds, filteredJobs]);

  const handleApplyFromList = (jobId: string) => {
    router.push(`/users/candidate/dashboard/apply_job?jobId=${jobId}`);
  };

  const handleWithdrawApplication = (jobId: string) => {
    setAppliedJobIds((prev) => {
      const next = prev.filter((id) => id !== jobId);

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Keep UI responsive even if storage is unavailable.
      }

      return next;
    });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#EEF4FF] px-4 py-5 sm:px-7 [&_button:not(:disabled)]:cursor-pointer">
      <div className="mx-auto max-w-[1120px] space-y-5">
        <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center gap-3 bg-[#EEF4FF] px-1 pb-2 pt-1">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates, jobs, ..."
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-300"
            />
          </div>
          <div className="inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 shadow-sm">
            <CalendarDays size={15} className="text-gray-400" />
            {currentDateLabel}
          </div>
        </div>

        <div>
          <h1 className="flex items-center gap-2 text-4xl font-bold leading-none text-indigo-700">
            <LayoutDashboard size={30} />
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isProfessional
              ? "Let's find your perfect full-time role."
              : "Let's find your perfect internship or job."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-indigo-200 bg-gradient-to-r from-[#A78BFA] via-[#8AA5FF] to-[#86A7FF] px-4 py-3 text-white shadow-sm"
            >
              <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
                <span>{card.title}</span>
                <span className="text-white/90">{card.icon}</span>
              </div>
              <p className="mt-1 text-[33px] font-bold leading-none text-white">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-2 border-b border-gray-100 bg-[#EEF7FF] text-sm font-semibold">
              <button
                onClick={() => setActiveTab("recommended")}
                className={`cursor-pointer px-4 py-3 ${
                  activeTab === "recommended"
                    ? "bg-white text-gray-900"
                    : "text-gray-500 hover:bg-white/50"
                }`}
              >
                Recommended for you
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`cursor-pointer px-4 py-3 ${
                  activeTab === "applications"
                    ? "bg-white text-gray-900"
                    : "text-gray-500 hover:bg-white/50"
                }`}
              >
                My applications
              </button>
            </div>

            <div>
              {shownJobs.map((job) => (
                <RecommendationRow
                  key={job.id}
                  job={job}
                  isApplied={appliedJobIds.includes(job.id)}
                  showWithdraw={activeTab === "applications"}
                  onView={(jobId) => router.push(`/users/candidate/dashboard/apply_job?jobId=${jobId}`)}
                  onApply={handleApplyFromList}
                  onWithdraw={handleWithdrawApplication}
                />
              ))}

              {shownJobs.length === 0 && (
                <div className="px-6 py-14 text-center text-sm text-gray-400">
                  No results found for your search.
                </div>
              )}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming interview</h2>
              <div className="mt-5 flex items-start gap-3 text-gray-600">
                <CalendarFold size={36} className="text-gray-400" />
                <div>
                  <p className="text-lg font-semibold text-gray-700">{nearestInterviewDateLabel}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                    <Clock3 size={14} className="text-gray-500" />
                    {nearestInterviewTimeLabel}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-gray-200 border-r-sky-400 border-t-indigo-600 text-[42px] font-bold text-gray-800">
                75
                <span className="text-xl">%</span>
              </div>

              <p className="mx-auto mt-4 max-w-[210px] text-center text-sm text-gray-500">
                Your resume is in great shape but could still be improved
              </p>

              <button className="mt-5 w-full cursor-pointer rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                Optimize resume
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
