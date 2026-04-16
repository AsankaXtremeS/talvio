
"use client";
import JobApplyModal from "@/components/candidate/dashboard/JobApplyModal";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Sparkles, Upload, X, Pencil, CalendarDays, Briefcase, Globe2 } from "lucide-react";
import JobDetailsModal from "@/components/candidate/dashboard/JobDetailsModal";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/candidate/dashboard/DashboardHeader";
import StatCardGrid from "@/components/candidate/dashboard/StatCardGrid";
import RecommendationList from "@/components/candidate/dashboard/RecommendationList";
import { DashboardJob } from "@/components/candidate/dashboard/RecommendationRow";
import AICoverLetterModal from "@/components/candidate/dashboard/AICoverLetterGeneretingModel";
import { candidateJobService } from "@/lib/candidate/job.service";
import { apiClient } from "@/lib/apiClient";
import Popup from "@/components/admin/layout/Popup";
import { JOBS as APPLICATION_JOBS } from "@/components/candidate/aplication/types";
import { INTERVIEWS } from "@/components/candidate/interviews/types";
import { Check } from "lucide-react";





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



function useCandidateDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isProfessional = user?.role === "PROFESSIONAL";

  const [search, setSearch] = useState("");
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [now, setNow] = useState(() => new Date());

  const jobIdFromQuery = searchParams.get("jobId");
  const sourceFromQuery = searchParams.get("from");

  // Feedback state
  const [popup, setPopup] = useState<{ open: boolean; message: string; success?: boolean }>({
    open: false,
    message: "",
    success: false,
  });

  // 1. Recommendations Query
  const { 
    data: recommendations = [], 
    isLoading: isRecLoading 
  } = useQuery({
    queryKey: ["candidate-recommendations", user?.id],
    queryFn: () => candidateJobService.getRecommendations(),
    enabled: !!user?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // 2. Applications Query
  const { 
    data: myApplications = [], 
    isLoading: isAppLoading 
  } = useQuery({
    queryKey: ["candidate-applications", user?.id],
    queryFn: () => candidateJobService.getMyApplications(),
    enabled: !!user?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // 3. Profile Query (for CV storage)
  const { data: profileData } = useQuery({
    queryKey: ["candidate-profile", user?.id],
    queryFn: async () => {
      const response = await apiClient<{ profile: any }>('/api/candidate/profile');
      return response.profile;
    },
    enabled: !!user?.id,
    staleTime: 60000, // Profile changes rarely
    refetchOnWindowFocus: false,
  });

  // 4. Stats Query
  const { data: rawStats } = useQuery({
    queryKey: ["candidate-stats", user?.id],
    queryFn: () => candidateJobService.getDashboardStats(),
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Map raw stats to UI format
  const stats = useMemo(() => {
    if (!rawStats) return undefined;
    
    return [
      { 
        title: isProfessional ? "All Jobs" : "All Internships", 
        value: String(rawStats.totalAvailable), 
        icon: <Briefcase size={24} className="text-white" /> 
      },
      { 
        title: "Interviews scheduled", 
        value: String(rawStats.interviewsScheduled), 
        icon: <CalendarDays size={24} className="text-white" /> 
      },
      { 
        title: "Applications sent", 
        value: String(rawStats.applicationsSent), 
        icon: <Sparkles size={24} className="text-white" /> 
      },
      { 
        title: "Pending matches", 
        value: String(rawStats.pendingMatches), 
        icon: <Sparkles size={24} className="text-white" /> 
      },
    ];
  }, [rawStats]);

  // 5. Apply Mutation
  const applyMutation = useMutation({
    mutationFn: (data: { jobId: string; coverLetter?: string; cvUrl?: string; cvFileName?: string }) => {
      const finalCvUrl = data.cvUrl || profileData?.cvUrl || "Profile_CV_URL";
      const finalCvFileName = data.cvFileName || profileData?.cvFileName || "Profile_CV.pdf";
      
      return candidateJobService.applyToJob(data.jobId, finalCvUrl, finalCvFileName, data.coverLetter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-applications"] });
      setPopup({ open: true, message: "Application submitted successfully!", success: true });
      setActiveModal("details");
    },
    onError: (error: any) => {
      setPopup({ 
        open: true, 
        message: error.message || "Failed to submit application.", 
        success: false 
      });
    }
  });

  // 5. Withdraw Mutation
  const withdrawMutation = useMutation({
    mutationFn: (jobId: string) => {
      const app = myApplications.find(a => a.job.id === jobId);
      if (!app) throw new Error("Application not found");
      return candidateJobService.withdrawApplication(app.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-applications"] });
      setPopup({ open: true, message: "Application withdrawn successfully!", success: true });
    },
    onError: (error: any) => {
      setPopup({ open: true, message: error.message || "Withdrawal failed.", success: false });
    }
  });

  const isLoading = isRecLoading || isAppLoading || applyMutation.isPending || withdrawMutation.isPending;

  // Derived state: List of IDs the user has applied for
  const appliedJobIds = useMemo(() => {
    return myApplications.map(app => app.job?.id).filter(Boolean) as string[];
  }, [myApplications]);

  // Merge all known jobs for easy lookup
  const allKnownJobs = useMemo(() => {
    const jobMap = new Map<string, DashboardJob>();
    recommendations.forEach(j => {
      if (j?.id) jobMap.set(j.id, j);
    });
    myApplications.forEach(a => {
      if (a?.job?.id) jobMap.set(a.job.id, a.job);
    });
    return Array.from(jobMap.values());
  }, [recommendations, myApplications]);

  const selectedJob = useMemo(() => {
    if (!jobIdFromQuery) return null;
    return allKnownJobs.find((job) => job.id === jobIdFromQuery) ?? null;
  }, [jobIdFromQuery, allKnownJobs]);

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
    const job = allKnownJobs.find((j) => j.id === jobId);
    if (!job) return;
    setActiveModal("details");
    router.push(`/users/candidate/dashboard?jobId=${jobId}`);
  };

  const openApplyForm = (jobId: string) => {
    const job = allKnownJobs.find((j) => j.id === jobId);
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
    const sourceJobs = activeTab === "applications" ? myApplications.map(a => a.job) : recommendations;
    if (!keyword) return sourceJobs;
    return sourceJobs.filter((job) => job.title.toLowerCase().includes(keyword));
  }, [search, activeTab, recommendations, myApplications]);

  const shownJobs = filteredJobs;

  const submitApplication = async (jobId: string, coverLetter?: string, cvUrl?: string, cvFileName?: string) => {
    applyMutation.mutate({ jobId, coverLetter, cvUrl, cvFileName });
  };

  const handleWithdrawApplication = (jobId: string) => {
    withdrawMutation.mutate(jobId);
  };
  return {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    stats,
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
    stats,
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
    if (!selectedJob) return;
    
    // For non-recommended jobs, we require a resume upload
    if (!selectedJob.isAiRecommended && !resumeFileName) {
      setPopup({ 
        open: true, 
        message: "Please upload your resume first.", 
        success: false 
      });
      return;
    }
    
    submitApplication(selectedJob.id, coverLetter, undefined, resumeFileName || undefined);
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

        <StatCardGrid cards={stats} />
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
                isAiRecommended={selectedJob.isAiRecommended}
                isLoading={isLoading}
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
          isAiRecommended={selectedJob.isAiRecommended}
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
