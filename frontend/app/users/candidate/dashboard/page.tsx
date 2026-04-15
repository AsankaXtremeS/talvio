
"use client";
import JobApplyModal from "@/components/candidate/dashboard/JobApplyModal";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, Sparkles, Upload, X, Pencil } from "lucide-react";
import JobDetailsModal from "@/components/candidate/dashboard/JobDetailsModal";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/candidate/dashboard/DashboardHeader";
import StatCardGrid from "@/components/candidate/dashboard/StatCardGrid";
import RecommendationList from "@/components/candidate/dashboard/RecommendationList";
import { DashboardJob } from "@/components/candidate/dashboard/RecommendationRow";
import AICoverLetterModal from "@/components/candidate/dashboard/AICoverLetterGeneretingModel";
import Popup from "@/components/admin/layout/Popup";
import { JOBS as APPLICATION_JOBS } from "@/components/candidate/aplication/types";
import { INTERVIEWS } from "@/components/candidate/interviews/types";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const MOCK_RECOMMENDED_JOBS: DashboardJob[] = [
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

const ALL_DASHBOARD_JOBS: DashboardJob[] = (() => {
  const byId = new Map<string, DashboardJob>(
    MOCK_RECOMMENDED_JOBS.map((job) => [job.id, job]),
  );

  Object.values(APPLICATION_JOBS).forEach((job) => {
    if (byId.has(job.id)) return;

    byId.set(job.id, {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      postedAgo: "Recently posted",
      matchPercent: 80,
      tags: [job.workLocation, job.jobType, "Paid", "3 months"],
      companyLogoUrl: job.company.toLowerCase(),
    });
  });

  return Array.from(byId.values());
})();

const APPLY_MODAL_CONTENT = {
  about: "Help plan and execute campaign ideas that connect with community and growth goals.",
  responsibilities: [
    "Support campaign planning and execution",
    "Track engagement and campaign performance",
    "Coordinate with content and design teams",
  ],
  requirements: [
    "Strong writing and communication skills",
    "Interest in digital marketing",
    "Data-informed decision making",
  ],
  companyAbout: "Airbnb helps create a world where anyone can belong anywhere through unique stays and experiences.",
};

const STORAGE_KEY = "candidateAppliedJobIds";
const NOTIFICATION_READ_STORAGE_KEY = "candidateReadInterviewNotificationIds";

function timeAgo(date: string | Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

function useCandidateDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [now, setNow] = useState(() => new Date());
  
  // Real Data State
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const jobIdFromQuery = searchParams.get("jobId");
  const sourceFromQuery = searchParams.get("from");

  // Feedback state
  const [popup, setPopup] = useState<{ open: boolean; message: string; success?: boolean }>({
    open: false,
    message: "",
    success: false,
  });

  // Fetch Recommendations from AI Module
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/ai/recommendations`, {
          withCredentials: true 
        });
        
        if (response.data?.recommendations) {
          const mappedJobs: DashboardJob[] = response.data.recommendations.map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            postedAgo: timeAgo(job.createdAt),
            matchPercent: job.matchPercent,
            tags: job.tags || [],
            companyLogoUrl: job.companyLogoUrl,
          }));
          setJobs(mappedJobs);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setJobs([]); // Clear on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  const selectedJob = useMemo(() => {
    if (!jobIdFromQuery) {
      return null;
    }
    return jobs.find((job) => job.id === jobIdFromQuery) ?? null;
  }, [jobIdFromQuery, jobs]);

  const [activeModal, setActiveModal] = useState<"none" | "details" | "apply">(
    jobIdFromQuery ? "details" : "none",
  );

  const activeTab = useMemo<"recommended" | "applications">(() => {
    return searchParams.get("tab") === "applications" ? "applications" : "recommended";
  }, [searchParams]);

  const setActiveTab = (tab: "recommended" | "applications") => {
    router.push(`/users/candidate/dashboard?tab=${tab}`);
  };

  const openJobDetails = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setActiveModal("details");
    router.push(`/users/candidate/dashboard?jobId=${jobId}`);
  };

  const openApplyForm = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setActiveModal("apply");
    router.push(`/users/candidate/dashboard?jobId=${jobId}`);
  };

  const closeModals = () => {
    setActiveModal("none");

    if (sourceFromQuery === "applications") {
      router.push("/users/candidate/applications");
      return;
    }

    router.push("/users/candidate/dashboard");
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(NOTIFICATION_READ_STORAGE_KEY);
      if (!stored) {
        setReadNotificationIds([]);
        return;
      }

      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setReadNotificationIds(parsed.filter((value): value is string => typeof value === "string"));
      } else {
        setReadNotificationIds([]);
      }
    } catch {
      setReadNotificationIds([]);
    }
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

  const interviewNotifications = useMemo(() => {
    return INTERVIEWS
      .map((interview) => {
        const scheduledDate = new Date(interview.scheduledAt);
        const isUpcoming = scheduledDate.getTime() >= now.getTime();
        const isRead = readNotificationIds.includes(interview.id);
        const isNew = isUpcoming && !isRead;

        return {
          id: interview.id,
          title: `New interview scheduled: ${interview.company}`,
          timeLabel: interview.scheduledLabel,
          isNew,
          href: `/users/candidate/interviews/${interview.id}`,
          scheduledAtMs: scheduledDate.getTime(),
        };
      })
      .sort((a, b) => b.scheduledAtMs - a.scheduledAtMs)
      .map(({ scheduledAtMs, ...notification }) => notification);
  }, [now, readNotificationIds]);

  const markNotificationAsRead = (notificationId: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(notificationId)) return prev;

      const next = [...prev, notificationId];
      try {
        window.localStorage.setItem(NOTIFICATION_READ_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // keep UI responsive even if storage is unavailable
      }
      return next;
    });
  };

  const filteredJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return jobs;
    return jobs.filter((job) => job.title.toLowerCase().includes(keyword));
  }, [search, jobs]);

  const shownJobs = useMemo(() => {
    if (activeTab === "applications") {
      return filteredJobs.filter((job) => appliedJobIds.includes(job.id));
    }
    return filteredJobs;
  }, [activeTab, appliedJobIds, filteredJobs]);

  const submitApplication = async (jobId: string, coverLetter?: string) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/ai/apply/${jobId}`, {
        coverLetter
      }, { withCredentials: true });

      setAppliedJobIds((prev) => [...new Set([...prev, jobId])]);
      setPopup({ open: true, message: "Application submitted successfully!", success: true });
      setActiveModal("details");
    } catch (error: any) {
      console.error("Failed to submit application:", error);
      setPopup({ 
        open: true, 
        message: error.response?.data?.message || "Failed to submit application. Please try again.", 
        success: false 
      });
    } finally {
      setIsLoading(false);
    }
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
    interviewNotifications,
    markNotificationAsRead,
    shownJobs,
    selectedJob,
    activeModal,
    openJobDetails,
    openApplyForm,
    closeModals,
    submitApplication,
    handleViewJob: openJobDetails,
    handleApplyFromList: openJobDetails,
    handleWithdrawApplication,
    isLoading,
    popup,
    setPopup,
  };
}

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const isProfessional = user?.role === "PROFESSIONAL";
  const [resumeFileName, setResumeFileName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLetterFileName, setCoverLetterFileName] = useState("");
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    appliedJobIds,
    currentDateLabel,
    nearestInterviewDateLabel,
    nearestInterviewTimeLabel,
    interviewNotifications,
    markNotificationAsRead,
    shownJobs,
    selectedJob,
    activeModal,
    openJobDetails,
    openApplyForm,
    closeModals,
    submitApplication,
    handleApplyFromList,
    handleWithdrawApplication,
    isLoading,
    popup,
    setPopup,
  } = useCandidateDashboard();

  const isSelectedJobApplied = selectedJob ? appliedJobIds.includes(selectedJob.id) : false;

  const handleGenerateCoverLetter = () => {
    if (!selectedJob) return;
    setCoverLetter(`Dear Hiring Team at ${selectedJob.company},\n\nI am excited to apply for the ${selectedJob.title} role. My skills in communication, collaboration, and campaign support align well with this opportunity, and I am confident I can contribute to your team from day one.\n\nThank you for your time and consideration. I would welcome the opportunity to discuss how I can support your goals.\n\nSincerely,\nCandidate`);
  };

  const handleApplySubmission = () => {
    if (!selectedJob || !resumeFileName) {
      return;
    }
    submitApplication(selectedJob.id, coverLetter);
  };

  const handleAIDone = (generatedCoverLetter: string) => {
    setCoverLetter(generatedCoverLetter);
    setShowAIModal(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col px-7 py-0 [&_button:not(:disabled)]:cursor-pointer">
      <div className="mx-auto w-full max-w-7xl space-y-5 pb-5">
        <DashboardHeader
          search={search}
          onSearchChange={setSearch}
          currentDateLabel={currentDateLabel}
          nearestInterviewDateLabel={nearestInterviewDateLabel}
          nearestInterviewTimeLabel={nearestInterviewTimeLabel}
          notifications={interviewNotifications}
          onNotificationClick={(notification) => markNotificationAsRead(notification.id)}
        />

        <div className="pt-0">
          <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
            <LayoutDashboard size={26} />
            Dashboard
          </h1>
        </div>

        <StatCardGrid />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm px-7 py-6">
            <div className="grid grid-cols-2 border-b border-gray-100  text-sm font-semibold">
              <button
                onClick={() => setActiveTab("recommended")}
                className={`cursor-pointer px-4 py-3 ${activeTab === "recommended" ? "bg-blue-100 text-indigo-700 rounded-lg" : "text-indigo-500 hover:bg-white/50"}`}
              >
                Recommended for you
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`cursor-pointer px-4 py-3 ${activeTab === "applications" ? "bg-blue-100 text-indigo-700 rounded-lg" : "text-indigo-500 hover:bg-white/50"}`}
              >
                My applications
              </button>
            </div>

            <div className={`transition-opacity duration-300 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              <RecommendationList
                jobs={shownJobs}
                appliedJobIds={appliedJobIds}
                activeTab={activeTab}
                onView={openJobDetails}
                onApply={handleApplyFromList}
                onWithdraw={handleWithdrawApplication}
              />
            </div>
            
            {isLoading && (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
              </div>
            )}
            </section>
          </div>
        </div>
      </div>

      {selectedJob && activeModal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
          <div
            className={`w-full shadow-xl ${activeModal === "apply" ? "relative max-h-[80vh] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4" : "relative max-h-[80vh] max-w-2xl overflow-y-auto rounded-2xl bg-white p-4"}`}
          >
            {activeModal === "details" && selectedJob && (
              <JobDetailsModal
                selectedJob={selectedJob}
                isSelectedJobApplied={isSelectedJobApplied}
                closeModals={closeModals}
                openApplyForm={openApplyForm}
                APPLY_MODAL_CONTENT={APPLY_MODAL_CONTENT}
              />
            )}

            {activeModal === "apply" && selectedJob && (
              <JobApplyModal
                selectedJob={selectedJob}
                resumeFileName={resumeFileName}
                setResumeFileName={setResumeFileName}
                resumeInputRef={resumeInputRef}
                coverLetter={coverLetter}
                setCoverLetter={setCoverLetter}
                coverLetterFileName={coverLetterFileName}
                setCoverLetterFileName={setCoverLetterFileName}
                coverLetterInputRef={coverLetterInputRef}
                showAIModal={showAIModal}
                setShowAIModal={setShowAIModal}
                closeModals={closeModals}
                openJobDetails={openJobDetails}
                handleApplySubmission={handleApplySubmission}
              />
            )}
          </div>
        </div>
      )}
      {selectedJob && activeModal === "apply" && showAIModal && (
        <AICoverLetterModal
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          candidateName={user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Candidate"}
          onDone={handleAIDone}
          onClose={() => setShowAIModal(false)}
        />
      )}

      <Popup
        open={popup.open}
        message={popup.message}
        success={popup.success}
        onClose={() => setPopup({ ...popup, open: false })}
      />
    </div>
  );
}
