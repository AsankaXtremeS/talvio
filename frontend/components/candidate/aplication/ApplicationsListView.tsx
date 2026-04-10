"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ALL_JOB_IDS,
  APPLICATION_META,
  ApplicationCard as ApplicationCardType,
  ApplicationTab,
  JOBS,
  JobSummary,
} from "@/components/candidate/aplication/types";
import ApplicationCard from "@/components/candidate/aplication/ApplicationCard";
import ApplicationsFilters from "@/components/candidate/aplication/ApplicationsFilters";
import ApplicationsTabs from "@/components/candidate/aplication/ApplicationsTabs";
import ApplicationsHeader from "@/components/candidate/aplication/ApplicationsHeader";

const STEP_LABELS: Array<string> = [
  "Applied",
  "Reviewed by HR",
  "Pending Next Step",
];

export default function ApplicationsListView() {
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ApplicationTab>("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<
    "all" | JobSummary["workLocation"]
  >("all");
  const [selectedJobType, setSelectedJobType] = useState<
    "all" | JobSummary["jobType"]
  >("all");

  // Load applied jobs from localStorage
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
        setAppliedJobIds(ids.length > 0 ? Array.from(new Set([...ids, ...ALL_JOB_IDS])) : ALL_JOB_IDS);
      } else {
        setAppliedJobIds(ALL_JOB_IDS);
      }
    } catch {
      setAppliedJobIds(ALL_JOB_IDS);
    }
  }, []);

  // Build applications list
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
        } as ApplicationCardType;
      })
      .filter((job): job is ApplicationCardType => Boolean(job));
  }, [appliedJobIds]);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    const activeCount = applications.filter((job) => job.status === "active").length;
    const archivedCount = applications.filter((job) => job.status === "archived").length;

    return {
      all: applications.length,
      active: activeCount,
      archived: archivedCount,
    };
  }, [applications]);

  // Filter applications based on active tab and search/filter criteria
  const filteredApplications = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    const matches = applications.filter((job) => {
      // Filter by tab
      const matchesTab =
        activeTab === "all" ? true : job.status === activeTab;
      if (!matchesTab) return false;

      // Filter by location
      const matchesLocation =
        selectedLocation === "all"
          ? true
          : job.workLocation === selectedLocation;
      if (!matchesLocation) return false;

      // Filter by job type
      const matchesJobType =
        selectedJobType === "all" ? true : job.jobType === selectedJobType;
      if (!matchesJobType) return false;

      // Filter by search query
      if (!query) return true;
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.workLocation.toLowerCase().includes(query) ||
        job.jobType.toLowerCase().includes(query)
      );
    });

    return matches.sort((a, b) => {
      const aHasInterview = Boolean(a.interviewMessage);
      const bHasInterview = Boolean(b.interviewMessage);

      if (aHasInterview === bHasInterview) return 0;
      return aHasInterview ? -1 : 1;
    });
  }, [activeTab, applications, searchValue, selectedLocation, selectedJobType]);

  // Calculate step state
  const getStepState = (
    currentStage: string,
    step: string
  ): "done" | "current" | "pending" => {
    const currentIndex = STEP_LABELS.indexOf(currentStage);
    const stepIndex = STEP_LABELS.indexOf(step);

    if (stepIndex < currentIndex) return "done";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  // Calculate stage progress
  const getStageProgress = (stage: string): number => {
    const stageIndex = STEP_LABELS.indexOf(stage);
    const maxIndex = STEP_LABELS.length - 1;

    if (stageIndex <= 0) return 0;
    if (stageIndex >= maxIndex) return 100;
    return (stageIndex / maxIndex) * 100;
  };

  return (
    <section className="p-5 md:p-6">
      <div className="sticky top-0 z-20 -mx-5 bg-[#F4F6FB] px-5 pb-4 pt-1 md:-mx-6 md:px-6">
        {/* Filters */}
        <ApplicationsFilters
          searchValue={searchValue}
          selectedLocation={selectedLocation}
          selectedJobType={selectedJobType}
          onSearchChange={setSearchValue}
          onLocationChange={setSelectedLocation}
          onJobTypeChange={setSelectedJobType}
        />

        {/* Header */}
        <ApplicationsHeader />

        {/* Tabs */}
        <div className="mt-4">
          <ApplicationsTabs
            activeTab={activeTab}
            tabCounts={tabCounts}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">
          No applications found for this view.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3">
          {filteredApplications.map((job) => (
            <ApplicationCard
              key={job.id}
              job={job}
              getStepState={getStepState}
              getStageProgress={getStageProgress}
            />
          ))}
        </div>
      )}
    </section>
  );
}
