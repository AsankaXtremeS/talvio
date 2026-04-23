"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays, LayoutDashboard } from "lucide-react";
import { getJobPosts, getJobPostStats } from "@/lib/employer/jobPosts.service";
import { getCandidates } from "@/lib/employer/candidates.service";
import { getInterviews } from "@/lib/employer/interviews.service";
import StatsRow from "@/components/employer/dashboard/StatsRow";
import AIMatchedWidget from "@/components/employer/dashboard/AIMatchedWidget";
import UpcomingInterviewsWidget from "@/components/employer/dashboard/UpcomingInterviewsWidget";
import JobsPreviewWidget from "@/components/employer/dashboard/JobsPreviewWidget";
import RecentActivityFeed from "@/components/employer/dashboard/RecentActivityFeed";
import type { InterviewDTO } from "@/types/employer/interview.types";
import type { JobPost } from "@/types/employer/jobPost.types";

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  sortValue: number;
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";

  const deltaSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (deltaSeconds >= 0) {
    if (deltaSeconds < 60) return "Just now";
    if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)} minutes ago`;
    if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)} hours ago`;
    return `${Math.floor(deltaSeconds / 86400)} days ago`;
  }

  const futureSeconds = Math.abs(deltaSeconds);
  if (futureSeconds < 60) return "In a few seconds";
  if (futureSeconds < 3600) return `In ${Math.ceil(futureSeconds / 60)} minutes`;
  if (futureSeconds < 86400) return `In ${Math.ceil(futureSeconds / 3600)} hours`;
  return `In ${Math.ceil(futureSeconds / 86400)} days`;
}

const createActivityItems = (
  interviews: InterviewDTO[],
  jobs: JobPost[]
): ActivityItem[] => {
  const interviewItems = interviews.map((interview) => {
    const eventTime = interview.updatedAt || interview.createdAt || interview.scheduledAt;
    return {
      id: `interview-${interview.id}`,
      text: `Scheduled interview with ${interview.candidate.name} for ${interview.jobPost.title}`,
      time: formatRelativeTime(eventTime),
      sortValue: new Date(eventTime).getTime() || 0,
    };
  });

  const jobItems = jobs
    .filter((job) => typeof job.updatedAt === "string" || typeof job.createdAt === "string")
    .slice(0, 4)
    .map((job) => {
      const timestamp = new Date(job.updatedAt ?? job.createdAt ?? "").getTime();
      return {
        id: `job-${job.id}`,
        text: `${job.status === "Active" ? "New" : "Updated"} job post · ${job.title}`,
        time: job.updatedAt || job.createdAt
          ? formatRelativeTime(job.updatedAt ?? job.createdAt ?? "")
          : "Recently",
        sortValue: timestamp || 0,
      };
    });

  return [...interviewItems, ...jobItems]
    .sort((a, b) => b.sortValue - a.sortValue)
    .slice(0, 4);
};

export default function DashboardPage() {
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ["employer", "jobPostStats"],
    queryFn: getJobPostStats,
  });

  const { data: jobPosts = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["employer", "jobPosts"],
    queryFn: getJobPosts,
  });

  const { data: upcomingInterviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ["employer", "upcomingInterviews"],
    queryFn: async () => {
      const response = await getInterviews({ status: "SCHEDULED", limit: 5 });
      return response.data;
    },
  });

  const activeJob = useMemo(
    () => jobPosts.find((job) => job.status === "Active") ?? jobPosts[0],
    [jobPosts]
  );

  const { data: aiCandidates = [], isLoading: aiCandidatesLoading } = useQuery({
    queryKey: ["employer", "aiCandidates", activeJob?.id],
    queryFn: async () => {
      if (!activeJob?.id) return [];
      const candidates = await getCandidates("AI Matches", activeJob.id);
      if (candidates.length > 0) return candidates;
      return await getCandidates("AI Matches");
    },
    enabled: Boolean(activeJob?.id),
  });

  const activityFeed = useMemo(
    () => createActivityItems(upcomingInterviews, jobPosts),
    [upcomingInterviews, jobPosts]
  );

  const upcomingInterviewList = upcomingInterviews.slice(0, 2);
  const recentActivityList = activityFeed.slice(0, 3);

  return (
    <div className="flex-1 min-h-screen overflow-auto p-7 [&_button:not(:disabled)]:cursor-pointer">
      <div className="sticky top-0 z-30 bg-[#f4f6fb] pt-0 -mt-7 pb-2">
        <div className="bg-white rounded-2xl px-7 py-5 mb-3 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
              <span className="text-2xl">
                <LayoutDashboard />
              </span>{" "}
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
        <div className="sticky top-24 z-20 bg-[#f4f6fb] pb-2">
          <StatsRow
            stats={{
              activePosts: stats?.active ?? 0,
              interviews: upcomingInterviews.length,
              applications: stats?.applications ?? 0,
              aiMatches: aiCandidates.length,
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 mt-6 px-2 pb-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <AIMatchedWidget candidates={aiCandidates} isLoading={aiCandidatesLoading} />
          <JobsPreviewWidget
            jobs={jobPosts}
            isLoading={jobsLoading}
            onViewAll={() => router.push("/users/employer/job-posts")}
          />
        </div>

        <div className="space-y-6">
          <UpcomingInterviewsWidget
            interviews={upcomingInterviewList}
            isLoading={interviewsLoading}
            onViewAll={() => router.push("/users/employer/interviews")}
          />
          <RecentActivityFeed activities={recentActivityList} onViewAll={() => router.push("/users/employer/interviews")} />
        </div>
      </div>
    </div>
  );
}