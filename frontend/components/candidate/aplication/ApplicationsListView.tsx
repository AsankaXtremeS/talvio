"use client";

import { useEffect, useState, useCallback } from "react";
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
import { getApplications, CandidateApplication } from "@/lib/candidate/applications.service";

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

const mapBackendToFrontend = (app: CandidateApplication): ApplicationCardType => {
  return {
    id: app.jobPost.id, // Use Job ID for dashboard navigation
    applicationId: app.id, // Keep application ID just in case
    title: app.jobPost.title,
    company: app.jobPost.employer.companyName,
    location: app.jobPost.location || "N/A",
    workLocation: (app.jobPost.workMode as any) || "Onsite",
    jobType: (app.jobPost.employmentType as any) || "Full time",
    status: app.applicationStatus === "REJECTED" ? "archived" : "active",
    stage: mapStatusToStage(app.applicationStatus),
  };
};

export default function ApplicationsListView() {
  const [applications, setApplications] = useState<ApplicationCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ApplicationTab>("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<
    "all" | JobSummary["workLocation"]
  >("all");
  const [selectedJobType, setSelectedJobType] = useState<
    "all" | JobSummary["jobType"]
  >("all");

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

  const filteredApplications = applications.filter((job) => {
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

  const tabCounts = {
    all: totalItems,
    active: applications.filter((a) => a.status === "active").length, // This is only for current page, but for mock parity
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
              <ApplicationCard key={job.id} job={job} />
            ))}
          </div>

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
