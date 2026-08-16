"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays, LayoutDashboard, FileText, X } from "lucide-react";
import { getJobPosts, getJobPostStats } from "@/lib/employer/jobPosts.service";
import { getCandidates } from "@/lib/employer/candidates.service";
import { getInterviews } from "@/lib/employer/interviews.service";
import { useAuth } from "@/context/AuthContext";
import StatsRow from "@/components/employer/dashboard/StatsRow";
import AIMatchedWidget from "@/components/employer/dashboard/AIMatchedWidget";
import UpcomingInterviewsWidget from "@/components/employer/dashboard/UpcomingInterviewsWidget";
import JobsPreviewWidget from "@/components/employer/dashboard/JobsPreviewWidget";
import RecentActivityFeed, {
  type RecentActivityFeedActivityItem,
} from "@/components/employer/dashboard/RecentActivityFeed";
import InterviewDetailsModal from "@/components/employer/interviews/InterviewDetailsModal";
import type { InterviewDTO } from "@/types/employer/interview.types";
import type { JobPost } from "@/types/employer/jobPost.types";
import type { CandidateInfo } from "@/types/candidate/candidate.types";

interface DashboardActivityItem extends RecentActivityFeedActivityItem {
  sortValue: number;
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";

  const deltaSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (deltaSeconds < 60) return "Just now";
  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d ago`;
}

const createActivityItems = (
  interviews: InterviewDTO[],
  jobs: JobPost[]
): DashboardActivityItem[] => {
  const interviewItems: DashboardActivityItem[] = interviews.map((interview) => ({
    id: `interview-${interview.id}`,
    text: `Scheduled interview with ${interview.candidate.name} for ${interview.jobPost.title}`,
    time: formatRelativeTime(interview.createdAt),
    sortValue: new Date(interview.createdAt).getTime(),
  }));

  const jobItems: DashboardActivityItem[] = jobs.map((job) => ({
    id: `job-${job.id}`,
    text: `${job.status === "Active" ? "New" : "Updated"} job post · ${job.title}`,
    time: formatRelativeTime(job.updatedAt || job.createdAt || ""),
    sortValue: new Date(job.updatedAt || job.createdAt || "").getTime(),
  }));

  return [...interviewItems, ...jobItems]
    .sort((a, b) => b.sortValue - a.sortValue)
    .slice(0, 4);
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["employer", "jobPostStats", user?.id],
    queryFn: getJobPostStats,
    enabled: !!user?.id,
    staleTime: 0,
  });

  const { data: jobPosts = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["employer", "jobPosts", user?.id],
    queryFn: getJobPosts,
    enabled: !!user?.id,
    staleTime: 0,
  });

  const { data: upcomingInterviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ["employer", "upcomingInterviews", user?.id],
    queryFn: async () => {
      const response = await getInterviews({ status: "SCHEDULED", limit: 5 });
      return response.data;
    },
    enabled: !!user?.id,
    staleTime: 0,
  });

  const activeJob = useMemo(
    () => jobPosts.find((job) => job.status === "Active") ?? jobPosts[0],
    [jobPosts]
  );

  const { data: aiCandidates = [], isLoading: aiCandidatesLoading } = useQuery({
    queryKey: ["employer", "aiCandidates", user?.id],
    queryFn: async () => {
      return await getCandidates("AI Matches");
    },
    enabled: !!user?.id,
    staleTime: 0,
  });

  const activityFeed = useMemo<DashboardActivityItem[]>(
    () => createActivityItems(upcomingInterviews, jobPosts),
    [upcomingInterviews, jobPosts]
  );

  const [selectedInterview, setSelectedInterview] = useState<InterviewDTO | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isRecentActivityModalOpen, setIsRecentActivityModalOpen] = useState(false);
  const upcomingInterviewList = upcomingInterviews.slice(0, 2);
  const recentActivityList = activityFeed.slice(0, 3);
  const recentActivityModalList = activityFeed.slice(0, 10);

  const handleRecentActivityView = (activity: RecentActivityFeedActivityItem) => {
    if (activity.id.startsWith("job-")) {
      router.push(`/users/employer/job-posts/${activity.id.replace("job-", "")}`);
      return;
    }
    if (activity.id.startsWith("interview-")) {
      router.push("/users/employer/interviews");
      return;
    }
    router.push("/users/employer/job-posts");
  };

  const closeRecentActivityModal = () => setIsRecentActivityModalOpen(false);

  const totalApplications = useMemo(() => {
    const sumFromJobs = jobPosts.reduce((sum, job) => sum + (job.applicantsCount || 0), 0);
    const backendCount = stats?.applications ?? 0;
    return Math.max(backendCount, sumFromJobs);
  }, [stats?.applications, jobPosts]);

  return (
    <div className="flex-1 min-h-screen bg-[#f4f6fb] [&_button:not(:disabled)]:cursor-pointer">
      {/* Sticky header — single block, no nesting */}
      <div className="sticky top-0 z-30 bg-[#f4f6fb] px-7 pt-7 pb-3 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)]">
        <div className="bg-white rounded-2xl px-7 py-5 mb-3 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
              <LayoutDashboard />
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <CalendarDays size={14} />
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            onClick={() => router.push("/users/employer/job-posts/new")}
          >
            <Plus size={16} />
            Post New Job
          </button>
        </div>

        <StatsRow
          stats={{
            activePosts: stats?.active ?? 0,
            interviews: upcomingInterviews.length,
            applications: totalApplications,
            aiMatches: aiCandidates.length,
          }}
        />
      </div>

      {/* Scrollable content */}
      <div className="grid gap-6 mt-6 px-9 pb-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <AIMatchedWidget
            candidates={aiCandidates}
            isLoading={aiCandidatesLoading}
            onViewProfile={(candidateId, jobPostId) => {
              if (jobPostId) {
                router.push(`/users/employer/job-posts/${jobPostId}/candidates?status=AI Matches`);
              } else {
                router.push(`/users/employer/candidates/${candidateId}`);
              }
            }}
          />
          <JobsPreviewWidget
            jobs={jobPosts}
            isLoading={jobsLoading}
            onViewAll={() => router.push("/users/employer/job-posts")}
            onViewJob={(postId) => router.push(`/users/employer/job-posts/${postId}`)}
          />
        </div>

        <div className="space-y-6">
          <UpcomingInterviewsWidget
            interviews={upcomingInterviewList}
            isLoading={interviewsLoading}
            onViewAll={() => router.push("/users/employer/interviews")}
            onViewInterview={(interview) => {
              setSelectedInterview(interview);
              setIsInterviewModalOpen(true);
            }}
          />
          <RecentActivityFeed
            activities={recentActivityList}
            onViewAll={() => setIsRecentActivityModalOpen(true)}
            onViewItem={handleRecentActivityView}
          />
        </div>
      </div>

      {/* Recent Activity Modal */}
      {isRecentActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent Activities</h2>
                <p className="text-sm text-slate-500">Showing the latest 10 updates from your roles and applicants.</p>
              </div>
              <button
                type="button"
                onClick={closeRecentActivityModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto bg-slate-50 px-6 py-4">
              {recentActivityModalList.length > 0 ? (
                <div className="space-y-3">
                  {recentActivityModalList.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 leading-snug">{activity.text}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRecentActivityView(activity)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-6 text-sm text-slate-500">No recent activity to display.</div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={closeRecentActivityModal}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <InterviewDetailsModal
        interview={selectedInterview}
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onReschedule={(iv) => {
          if (!iv.jobPost?.id || !iv.candidate?.id || !iv.id) return;
          router.push(
            `/users/employer/job-posts/${iv.jobPost.id}/candidates/${iv.candidate.id}/schedule?interviewId=${iv.id}`
          );
        }}
        onCancel={(id) => {
          router.push(`/users/employer/interviews/${id}/cancel`);
        }}
      />
    </div>
  );
}