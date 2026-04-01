"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type JobSummary = {
  id: string;
  title: string;
  company: string;
  location: string;
  workLocation: "Remote" | "Onsite" | "Hybrid";
  jobType: "Full time" | "Part time" | "Intern" | "Contract";
};

type ApplicationTab = "all" | "active" | "archived";

type ApplicationStatus = "active" | "archived";

type ApplicationMeta = {
  status: ApplicationStatus;
  stage: "Applied" | "Reviewed by HR" | "Pending Next Step";
  interviewMessage?: string;
};

type ApplicationCard = JobSummary & ApplicationMeta;

type CompanyBadge = {
  icon: string;
  textClassName: string;
  bgClassName: string;
};

const JOBS: Record<string, JobSummary> = {
  "1": {
    id: "1",
    title: "Frontend Developer Intern",
    company: "Google",
    location: "Mountain View, CA",
    workLocation: "Remote",
    jobType: "Intern",
  },
  "2": {
    id: "2",
    title: "Data Analyst Intern",
    company: "Microsoft",
    location: "Redmond, WA",
    workLocation: "Onsite",
    jobType: "Intern",
  },
  "3": {
    id: "3",
    title: "UI/UX Design Intern",
    company: "Figma",
    location: "San Francisco, CA",
    workLocation: "Remote",
    jobType: "Part time",
  },
  "4": {
    id: "4",
    title: "Marketing Intern",
    company: "Airbnb",
    location: "Seattle, WA",
    workLocation: "Hybrid",
    jobType: "Contract",
  },
  "5": {
    id: "5",
    title: "Software Engineer Intern",
    company: "Meta",
    location: "Menlo Park, CA",
    workLocation: "Hybrid",
    jobType: "Full time",
  },
  "6": {
    id: "6",
    title: "Backend Engineer Intern",
    company: "Amazon",
    location: "Austin, TX",
    workLocation: "Onsite",
    jobType: "Contract",
  },
  "7": {
    id: "7",
    title: "Product Analyst Intern",
    company: "Stripe",
    location: "New York, NY",
    workLocation: "Remote",
    jobType: "Part time",
  },
  "8": {
    id: "8",
    title: "AI Research Intern",
    company: "OpenAI",
    location: "San Francisco, CA",
    workLocation: "Hybrid",
    jobType: "Intern",
  },
};

const ALL_JOB_IDS = Object.keys(JOBS);

const APPLICATION_META: Record<string, ApplicationMeta> = {
  "1": {
    status: "active",
    stage: "Pending Next Step",
    interviewMessage: "Interview scheduled: Tomorrow 10:00 AM",
  },
  "2": {
    status: "active",
    stage: "Reviewed by HR",
  },
  "3": {
    status: "archived",
    stage: "Applied",
  },
  "4": {
    status: "active",
    stage: "Reviewed by HR",
  },
  "5": {
    status: "active",
    stage: "Reviewed by HR",
  },
  "6": {
    status: "archived",
    stage: "Applied",
  },
  "7": {
    status: "active",
    stage: "Pending Next Step",
    interviewMessage: "Interview scheduled: Monday 11:30 AM",
  },
  "8": {
    status: "active",
    stage: "Applied",
  },
};

const TAB_LABELS: Array<{ key: ApplicationTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "archived", label: "Archived" },
];

const STEP_LABELS: Array<ApplicationMeta["stage"]> = ["Applied", "Reviewed by HR", "Pending Next Step"];

const STEP_HINTS: Record<ApplicationMeta["stage"], string> = {
  Applied: "Checked",
  "Reviewed by HR": "Checked",
  "Pending Next Step": "Active",
};

const STAGE_SHORT_LABELS: Record<ApplicationMeta["stage"], string> = {
  Applied: "Applied",
  "Reviewed by HR": "Reviewed by HR",
  "Pending Next Step": "Pending Next Step",
};

const COMPANY_BADGES: Record<string, CompanyBadge> = {
  Google: {
    icon: "G",
    textClassName: "text-[#EA4335]",
    bgClassName: "bg-white",
  },
  Microsoft: {
    icon: "M",
    textClassName: "text-[#2563EB]",
    bgClassName: "bg-[#F3F8FF]",
  },
  Figma: {
    icon: "F",
    textClassName: "text-[#0E7490]",
    bgClassName: "bg-[#ECFEFF]",
  },
  Airbnb: {
    icon: "A",
    textClassName: "text-[#E11D48]",
    bgClassName: "bg-[#FFF1F2]",
  },
  Meta: {
    icon: "M",
    textClassName: "text-[#2563EB]",
    bgClassName: "bg-[#EFF6FF]",
  },
  Amazon: {
    icon: "A",
    textClassName: "text-[#F59E0B]",
    bgClassName: "bg-[#FFFBEB]",
  },
  Stripe: {
    icon: "S",
    textClassName: "text-[#6366F1]",
    bgClassName: "bg-[#EEF2FF]",
  },
  OpenAI: {
    icon: "O",
    textClassName: "text-[#0F172A]",
    bgClassName: "bg-[#F8FAFC]",
  },
};

const LOCATION_OPTIONS: Array<JobSummary["workLocation"]> = ["Remote", "Onsite", "Hybrid"];
const JOB_TYPE_OPTIONS: Array<JobSummary["jobType"]> = ["Full time", "Part time", "Intern", "Contract"];

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ApplicationTab>("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<"all" | JobSummary["workLocation"]>("all");
  const [selectedJobType, setSelectedJobType] = useState<"all" | JobSummary["jobType"]>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = "candidateAppliedJobIds";
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      setAppliedJobIds(ALL_JOB_IDS);
      return;
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const ids = parsed.filter((value): value is string => typeof value === "string");
        setAppliedJobIds(ids.length > 0 ? ids : ALL_JOB_IDS);
      } else {
        setAppliedJobIds(ALL_JOB_IDS);
      }
    } catch {
      setAppliedJobIds(ALL_JOB_IDS);
    }
  }, []);

  const applications = useMemo(() => {
    return appliedJobIds
      .map((id) => {
        const job = JOBS[id];
        if (!job) return null;

        const meta = APPLICATION_META[id] ?? {
          status: "active",
          stage: "Applied",
        };

        return {
          ...job,
          ...meta,
        } as ApplicationCard;
      })
      .filter((job): job is ApplicationCard => Boolean(job));
  }, [appliedJobIds]);

  const tabCounts = useMemo(() => {
    const activeCount = applications.filter((job) => job.status === "active").length;
    const archivedCount = applications.filter((job) => job.status === "archived").length;

    return {
      all: applications.length,
      active: activeCount,
      archived: archivedCount,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return applications.filter((job) => {
      const matchesTab = activeTab === "all" ? true : job.status === activeTab;
      if (!matchesTab) return false;

      const matchesLocation = selectedLocation === "all" ? true : job.workLocation === selectedLocation;
      if (!matchesLocation) return false;

      const matchesJobType = selectedJobType === "all" ? true : job.jobType === selectedJobType;
      if (!matchesJobType) return false;

      if (!query) return true;
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.workLocation.toLowerCase().includes(query) ||
        job.jobType.toLowerCase().includes(query)
      );
    });
  }, [activeTab, applications, searchValue, selectedLocation, selectedJobType]);

  const getStepState = (currentStage: ApplicationMeta["stage"], step: ApplicationMeta["stage"]) => {
    const currentIndex = STEP_LABELS.indexOf(currentStage);
    const stepIndex = STEP_LABELS.indexOf(step);

    if (stepIndex < currentIndex) return "done";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const getStageProgress = (stage: ApplicationMeta["stage"]) => {
    const stageIndex = STEP_LABELS.indexOf(stage);
    const maxIndex = STEP_LABELS.length - 1;

    if (stageIndex <= 0) return 0;
    if (stageIndex >= maxIndex) return 100;
    return (stageIndex / maxIndex) * 100;
  };

  return (
    <section className="rounded-2xl border border-[#DEE3EE] bg-[#EEF1F7] p-5 shadow-sm md:p-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[2.5fr_0.9fr_0.9fr_1fr_0.8fr]">
        <label className="flex h-12 items-center gap-2 rounded-2xl border border-[#D0D7E5] bg-white px-4 text-sm text-[#64748B] md:col-span-2 xl:col-span-1">
          <span className="text-lg leading-none text-[#94A3B8]">⌕</span>
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search jobs"
            className="h-full w-full border-0 bg-transparent text-sm text-[#334155] outline-none"
          />
        </label>

        <label className="relative flex h-12 items-center rounded-2xl border border-[#D0D7E5] bg-white px-5">
          <select
            value={selectedLocation}
            onChange={(event) => setSelectedLocation(event.target.value as "all" | JobSummary["workLocation"])}
            className="h-full w-full appearance-none bg-transparent pr-6 text-[13px] font-semibold text-[#334155] outline-none"
          >
            <option value="all">Location</option>
            {LOCATION_OPTIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-5 text-[#94A3B8]">⌄</span>
        </label>

        <label className="relative flex h-12 items-center rounded-2xl border border-[#D0D7E5] bg-white px-5">
          <select
            value={selectedJobType}
            onChange={(event) => setSelectedJobType(event.target.value as "all" | JobSummary["jobType"])}
            className="h-full w-full appearance-none bg-transparent pr-6 text-[13px] font-semibold text-[#334155] outline-none"
          >
            <option value="all">Job type</option>
            {JOB_TYPE_OPTIONS.map((jobType) => (
              <option key={jobType} value={jobType}>
                {jobType}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-5 text-[#94A3B8]">⌄</span>
        </label>

        <button
          type="button"
          className="flex h-12 items-center justify-between rounded-2xl border border-[#D0D7E5] bg-white px-5 text-[13px] font-semibold text-[#334155]"
        >
          <span>Skill matched %</span>
          <span className="text-[#94A3B8]">⌄</span>
        </button>

        <button
          type="button"
          className="flex h-12 items-center justify-between rounded-2xl border border-[#D0D7E5] bg-white px-5 text-[13px] font-semibold text-[#334155]"
        >
          <span>View all</span>
          <span className="text-[#94A3B8]">›</span>
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-[34px] font-bold leading-none text-[#4338CA]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D6DCEC] bg-white text-xl text-[#4338CA]">
              🗎
            </span>
            Applications
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">Manage and review all applications</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-[#DCE1EC] bg-white">
        {TAB_LABELS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`h-10 border-r border-[#DCE1EC] text-xs font-semibold last:border-r-0 ${
                isActive ? "bg-[#E7E9FF] text-[#4F46E5]" : "bg-white text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              {tab.label} ({tabCounts[tab.key]})
            </button>
          );
        })}
      </div>

      {filteredApplications.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">No applications found for this view.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {filteredApplications.map((job) => {
            const badge = COMPANY_BADGES[job.company] ?? {
              icon: job.company.slice(0, 1).toUpperCase(),
              textClassName: "text-[#4B5563]",
              bgClassName: "bg-white",
            };

            return (
              <article key={job.id} className="rounded-2xl border border-[#DEE3EE] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#E7EAF2] text-sm font-bold shadow-sm ${badge.bgClassName} ${badge.textClassName}`}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#0F172A]">{job.title}</p>
                      <p className="text-[13px] font-semibold text-[#4F46E5]">
                        {job.company} - {job.location}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#D9EFFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#0369A1]">
                          {job.workLocation}
                        </span>
                        <span className="rounded-full bg-[#D9EFFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#0369A1]">
                          {job.jobType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/users/candidate/dashboard/apply_job?jobId=${job.id}`)}
                    className="rounded-xl bg-[#4F46E5] px-6 py-2 text-sm font-bold text-white hover:bg-[#4338CA]"
                  >
                    Apply now
                  </button>
                </div>

              {job.interviewMessage ? (
                <p className="mt-3 flex w-full items-center gap-2 rounded-full border border-[#9FE0B7] bg-[#E8FAEF] px-4 py-1.5 text-[11px] font-semibold text-[#1FA55B]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#1FA55B] bg-white text-[10px] leading-none">
                    ✓
                  </span>
                  <span>{job.interviewMessage}</span>
                </p>
              ) : (
                <div className="mt-4">
                  <div className="relative px-1">
                    <span className="absolute left-[8px] right-[8px] top-2 block h-[2px] bg-[#CDD6EA]" />
                    <span
                      className="absolute left-[8px] top-2 block h-[2px] bg-[#4F46E5]"
                      style={{ width: `calc((100% - 16px) * ${getStageProgress(job.stage) / 100})` }}
                    />

                    <div className="relative grid grid-cols-3">
                      {STEP_LABELS.map((step) => {
                        const state = getStepState(job.stage, step);

                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center text-center">
                            {state === "done" ? (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#4F46E5] bg-[#4F46E5] text-[10px] font-bold text-white">
                                ✓
                              </span>
                            ) : (
                              <span
                                className={`h-4 w-4 rounded-full border ${
                                  state === "current" ? "border-[#4F46E5] bg-white" : "border-[#CDD6EA] bg-white"
                                }`}
                              />
                            )}
                            <span className="mt-1 text-[9px] font-medium text-[#475569]">{STAGE_SHORT_LABELS[step]}</span>
                            <span className="text-[8px] text-[#94A3B8]">
                              {state === "pending" ? "Waiting" : STEP_HINTS[step]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
