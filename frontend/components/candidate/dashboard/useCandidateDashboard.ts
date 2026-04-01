import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardJob } from "./RecommendationRow";

const STORAGE_KEY = "candidateAppliedJobIds";

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

export function useCandidateDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [selectedJob, setSelectedJob] = useState<DashboardJob | null>(null);
  const [activeModal, setActiveModal] = useState<"none" | "details" | "apply" | "success">("none");

  const activeTab = useMemo<"recommended" | "applications">(() => {
    return searchParams.get("tab") === "applications" ? "applications" : "recommended";
  }, [searchParams]);

  const setActiveTab = (tab: "recommended" | "applications") => {
    router.push(`/users/candidate/dashboard?tab=${tab}`);
  };

  const selectedJobFromQuery = useMemo(() => {
    const jobId = searchParams.get("jobId");
    if (!jobId) return null;
    return RECOMMENDED_JOBS.find((job) => job.id === jobId) ?? null;
  }, [searchParams]);

  useEffect(() => {
    if (!selectedJobFromQuery) {
      return;
    }
    setSelectedJob(selectedJobFromQuery);
    setActiveModal("details");
  }, [selectedJobFromQuery]);

  const openJobDetails = (jobId: string) => {
    const job = RECOMMENDED_JOBS.find((j) => j.id === jobId);
    if (!job) return;
    setSelectedJob(job);
    setActiveModal("details");
    router.push(`/users/candidate/dashboard?jobId=${jobId}`);
  };

  const openApplyForm = (jobId: string) => {
    const job = RECOMMENDED_JOBS.find((j) => j.id === jobId);
    if (!job) return;
    setSelectedJob(job);
    setActiveModal("apply");
    router.push(`/users/candidate/dashboard?jobId=${jobId}`);
  };

  const closeModals = () => {
    setSelectedJob(null);
    setActiveModal("none");
    router.push("/users/candidate/dashboard");
  };

  const startApplicationSuccess = () => {
    setActiveModal("success");
  };

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
    if (typeof window === "undefined") return;

    const syncAppliedJobs = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
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

  const filteredJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return RECOMMENDED_JOBS;
    return RECOMMENDED_JOBS.filter((job) => job.title.toLowerCase().includes(keyword));
  }, [search]);

  const shownJobs = useMemo(() => {
    if (activeTab === "applications") {
      return filteredJobs.filter((job) => appliedJobIds.includes(job.id));
    }
    return filteredJobs;
  }, [activeTab, appliedJobIds, filteredJobs]);

  const handleViewJob = (jobId: string) => {
    openJobDetails(jobId);
  };

  const handleApplyFromList = (jobId: string) => {
    openApplyForm(jobId);
  };

  const submitApplication = (jobId: string) => {
    setAppliedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev : [...prev, jobId];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // keep UI responsive
      }
      return next;
    });

    startApplicationSuccess();
  };

  const handleWithdrawApplication = (jobId: string) => {
    setAppliedJobIds((prev) => {
      const next = prev.filter((id) => id !== jobId);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // keep UI responsive
      }
      return next;
    });
  };

  return {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    appliedJobIds,
    currentDateLabel,
    nearestInterviewDateLabel,
    nearestInterviewTimeLabel,
    shownJobs,
    selectedJob,
    activeModal,
    openJobDetails,
    openApplyForm,
    closeModals,
    submitApplication,
    handleViewJob,
    handleApplyFromList,
    handleWithdrawApplication,
    RECOMMENDED_JOBS,
  };
}
