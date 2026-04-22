"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ApplicationCard as ApplicationCardType,
  ApplicationTab,
  JobSummary,
  ApplicationMeta,
} from "@/components/candidate/aplication/types";
import ApplicationCard from "@/components/candidate/aplication/ApplicationCard";
import ApplicationsFilters from "@/components/candidate/aplication/ApplicationsFilters";
import ApplicationsTabs from "@/components/candidate/aplication/ApplicationsTabs";
import ApplicationsHeader from "@/components/candidate/aplication/ApplicationsHeader";
import ApplicationTimeline from "./ApplicationTimeline";
import { getApplications, CandidateApplication } from "@/lib/candidate/applications.service";
import JobDetailsModal from "@/components/candidate/dashboard/JobDetailsModal";
import { DashboardJob } from "@/components/candidate/dashboard/RecommendationRow";
import { motion, AnimatePresence } from "framer-motion";

const mapStatusToStage = (status: string): ApplicationMeta["stage"] => {
  switch (status) {
    case "PENDING":
      return "Applied";
    case "REVIEWED":
      return "Reviewed";
    case "SHORTLISTED":
      return "Scheduled";
    case "REJECTED":
      return "Rejected";
    case "HIRED":
      return "Scheduled";
    default:
      return "Applied";
  }
};

const normalizeWorkLocation = (value: string): JobSummary["workLocation"] => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "remote") return "Remote";
  if (normalized === "hybrid") return "Hybrid";
  return "Onsite";
};

const normalizeJobType = (value: string): JobSummary["jobType"] => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "part-time" || normalized === "part time") return "Part time";
  if (normalized === "intern" || normalized === "internship") return "Intern";
  if (normalized === "contract") return "Contract";
  return "Full time";
};

const mapBackendToFrontend = (app: CandidateApplication): ApplicationCardType => {
  return {
    id: app.jobPost.id, // Use Job ID for dashboard navigation
    applicationId: app.id, // Keep application ID for timeline actions
    title: app.jobPost.title,
    company: app.jobPost.employer.companyName,
    location: app.jobPost.location || "N/A",
    workLocation: normalizeWorkLocation(app.jobPost.workMode || ""),
    jobType: normalizeJobType(app.jobPost.employmentType || ""),
    status: app.applicationStatus === "REJECTED" ? "archived" : "active",
    stage: mapStatusToStage(app.applicationStatus),
  };
};

const APPLY_MODAL_CONTENT = {
  about: "This job opportunity was retrieved from your applications history. You can view the details provided by the employer below.",
  responsibilities: [
    "Refer to the job posting for specific responsibilities",
    "Maintain communication with the hiring team",
    "Monitor application status through the timeline",
  ],
  requirements: [
    "Requirements as specified in the original job posting",
    "Valid application status",
  ],
  companyAbout: "Information about the company is available on their profile page.",
};

export default function ApplicationsListView() {
  const [applications, setApplications] = useState<ApplicationCardType[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedApplicationTitle, setSelectedApplicationTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ApplicationTab>("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<
    "all" | JobSummary["workLocation"]
  >("all");
  const [selectedJobType, setSelectedJobType] = useState<
    "all" | JobSummary["jobType"]
  >("all");

  // Job Details Modal state
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<DashboardJob | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApplications(currentPage, limit);
      const mapped = data.applications.map(mapBackendToFrontend);
      setApplications(mapped);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const openTimeline = useCallback((applicationId: string, title: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedApplicationTitle(title);
  }, []);

  const closeTimeline = useCallback(() => {
    setSelectedApplicationId(null);
    setSelectedApplicationTitle(null);
  }, []);

  const openJobDetails = useCallback((job: ApplicationCardType) => {
    // Transform ApplicationCardType to DashboardJob for the modal
    const dashboardJob: DashboardJob = {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      postedAgo: "Applied", // Placeholder since we don't have exact posted time here
      matchPercent: 100,
      tags: [job.workLocation, job.jobType],
      isAiRecommended: false
    };
    setSelectedJobForDetails(dashboardJob);
  }, []);

  const closeJobDetails = useCallback(() => {
    setSelectedJobForDetails(null);
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((job) => {
      // Filter by tab
      if (activeTab !== "all" && job.status !== activeTab) return false;

      // Filter by location
      if (selectedLocation !== "all" && job.workLocation !== selectedLocation) return false;

      // Filter by job type
      if (selectedJobType !== "all" && job.jobType !== selectedJobType) return false;

      // Filter by search query
      const query = searchValue.trim().toLowerCase();
      if (!query) return true;
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    });
  }, [applications, activeTab, selectedLocation, selectedJobType, searchValue]);

  const tabCounts = {
    all: totalItems,
    active: applications.filter((a) => a.status === "active").length,
    archived: applications.filter((a) => a.status === "archived").length,
  };

  return (
    <section className="p-5 md:p-6">
      <div className="sticky top-0 z-20 -mx-5 bg-[#F4F6FB] px-5 pb-4 pt-1 md:-mx-6 md:px-6">
        <ApplicationsFilters
          searchValue={searchValue}
          selectedLocation={selectedLocation}
          selectedJobType={selectedJobType}
          onSearchChange={setSearchValue}
          onLocationChange={setSelectedLocation}
          onJobTypeChange={setSelectedJobType}
        />
        <ApplicationsHeader />
        <div className="mt-4">
          <ApplicationsTabs
            activeTab={activeTab}
            tabCounts={tabCounts}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4F46E5] border-t-transparent"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">
          No applications found.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApplications.map((job) => (
              <ApplicationCard
                key={job.id}
                job={job}
                onApply={() => openJobDetails(job)}
                onTimeline={(applicationId) => openTimeline(applicationId, job.title)}
              />
            ))}
          </div>

          {selectedApplicationId ? (
            <ApplicationTimeline
              applicationId={selectedApplicationId}
              applicationTitle={selectedApplicationTitle || "Application timeline"}
              onClose={closeTimeline}
            />
          ) : null}

          {/* Job Details Modal Overlay */}
          <AnimatePresence>
            {selectedJobForDetails && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeJobDetails}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl custom-scrollbar"
                >
                  <JobDetailsModal
                    selectedJob={selectedJobForDetails}
                    isSelectedJobApplied={true} // In this view, they are always applied
                    closeModals={closeJobDetails}
                    openApplyForm={() => {}} // Already applied
                    APPLY_MODAL_CONTENT={APPLY_MODAL_CONTENT}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-[#DEE3EE] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-[#475569]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-[#DEE3EE] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

