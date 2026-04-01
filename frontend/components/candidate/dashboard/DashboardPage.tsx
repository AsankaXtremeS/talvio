"use client";

import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "./DashboardHeader";
import StatCardGrid from "./StatCardGrid";
import RecommendationList from "./RecommendationList";
import UpcomingInterviewCard from "./UpcomingInterviewCard";
import ResumeScoreCard from "./ResumeScoreCard";
import { useCandidateDashboard } from "./useCandidateDashboard";

const STAT_CARDS = [
  {
    title: "Applications sent",
    value: "5",
    icon: <span className="text-white">&uarr;</span>,
  },
  {
    title: "Interviews scheduled",
    value: "2",
    icon: <span className="text-white">&#128197;</span>,
  },
  {
    title: "Pending matches",
    value: "4",
    icon: <span className="text-white">&hellip;</span>,
  },
  {
    title: "Profile views",
    value: "18",
    icon: <span className="text-white">&bull;</span>,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isProfessional = user?.role === "PROFESSIONAL";

  const {
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
    handleApplyFromList,
    handleWithdrawApplication,
  } = useCandidateDashboard();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#EEF4FF] px-4 py-5 sm:px-7 [&_button:not(:disabled)]:cursor-pointer">
      <div className="mx-auto max-w-[1120px] space-y-5">
        <DashboardHeader search={search} onSearchChange={setSearch} currentDateLabel={currentDateLabel} />

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

        <StatCardGrid cards={STAT_CARDS} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-2 border-b border-gray-100 bg-[#EEF7FF] text-sm font-semibold">
              <button
                onClick={() => setActiveTab("recommended")}
                className={`cursor-pointer px-4 py-3 ${
                  activeTab === "recommended" ? "bg-white text-gray-900" : "text-gray-500 hover:bg-white/50"
                }`}
              >
                Recommended for you
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`cursor-pointer px-4 py-3 ${
                  activeTab === "applications" ? "bg-white text-gray-900" : "text-gray-500 hover:bg-white/50"
                }`}
              >
                My applications
              </button>
            </div>

            <RecommendationList
              jobs={shownJobs}
              appliedJobIds={appliedJobIds}
              activeTab={activeTab}
              onView={(jobId) => openJobDetails(jobId)}
              onApply={handleApplyFromList}
              onWithdraw={handleWithdrawApplication}
            />
          </section>

          <div className="space-y-4">
            <UpcomingInterviewCard
              nearestInterviewDateLabel={nearestInterviewDateLabel}
              nearestInterviewTimeLabel={nearestInterviewTimeLabel}
            />
            <ResumeScoreCard />
          </div>
        </div>
      </div>

      {selectedJob && activeModal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-xl w-full rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                <p className="text-sm text-indigo-500">{selectedJob.company} - {selectedJob.location}</p>
              </div>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {activeModal === "details" && (
              <div className="mt-4 space-y-3">
                <div className="text-sm text-gray-600">Match: {selectedJob.matchPercent}%</div>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">{tag}</span>
                  ))}
                </div>
                <button onClick={() => openApplyForm(selectedJob.id)} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Apply now</button>
              </div>
            )}

            {activeModal === "apply" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-600">Submit your application for {selectedJob.title}.</p>
                <button onClick={() => submitApplication(selectedJob.id)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Submit application</button>
              </div>
            )}

            {activeModal === "success" && (
              <div className="mt-4 space-y-3 text-center">
                <p className="text-lg font-bold text-green-600">Application submitted successfully!</p>
                <p className="text-sm text-gray-600">Your application for {selectedJob.title} is under review.</p>
                <button onClick={closeModals} className="mt-3 w-full rounded-xl border border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">Back to dashboard</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
