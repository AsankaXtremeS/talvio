"use client";

import { useAuth } from "@/context/AuthContext";
import { Cog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RecommendationsFilterBar from "@/components/candidate/recommendations/RecommendationsFilterBar";
import JobCard from "@/components/candidate/recommendations/JobCards";
import JobViewModal from "@/components/candidate/recommendations/JobViewModel";
import { apiClient } from "@/lib/apiClient";
import { candidateJobService } from "@/lib/candidate/job.service";
import NotificationBell from "@/components/candidate/recommendations/NotificationBell";
import { useRef } from "react";
import JobApplyModal from "@/components/candidate/dashboard/JobApplyModal";
import AICoverLetterModal from "@/components/candidate/dashboard/AICoverLetterGeneretingModel";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAgo: string;
  matchPercent: number;
  tags: string[];
  companyLogoUrl: string;
  companyDescription: string;
  companyProfileUrl: string;
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  role: string;
  duration: string;
  stipend: string;
  workMode: string;

  // API source fields used in mapping
  companyLocation?: string;
  createdAt?: string;
  employmentType?: string;
  stipendType?: string;
  companyWebsite?: string;
  description?: string;
  type?: string;
}


export default function CandidateRecommendationsPage() {
  const { user } = useAuth();
  const isProfessional = user?.role === "PROFESSIONAL";
  const router = useRouter();
  const queryClient = useQueryClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Location");
  const [jobType, setJobType] = useState("Job type");
  const [skillMatch, setSkillMatch] = useState("Skill matched %");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cvUrl, setCvUrl] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{ cvUrl?: string; cvFileName?: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  //Fetches all jobs the user already applied to
  const { data: myApplications = [], refetch: refetchApplications } = useQuery({
    queryKey: ["candidate-applications", user?.id],
    queryFn: () => candidateJobService.getMyApplications(),
    enabled: !!user?.id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const appliedJobIds = useMemo(
    () => myApplications.map((app) => app.job.id),
    [myApplications]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient<{ 
          jobs: any[]; 
          total: number; 
          totalPages: number;
          page: number;
        }>(`/api/candidate/jobs?page=${currentPage}&limit=20`);     //Fetches 20 jobs per page from the API.

        setTotal(data.total);
        setTotalPages(data.totalPages);

        //Maps raw API data into the Job interface shape.
        const formatted: Job[] = data.jobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location || job.companyLocation || "Location not specified",
          postedAgo: new Date(job.createdAt ?? Date.now()).toLocaleDateString(),
          matchPercent: 0,
          tags: [
            job.workMode,
            job.employmentType,
            job.stipendType,
            job.duration,
          ].filter(Boolean) as string[],
          companyLogoUrl: job.companyLogoUrl || "",
          companyDescription: job.companyDescription || "",
          companyProfileUrl: job.companyWebsite || "",
          aboutRole: job.description || "",
          responsibilities: job.responsibilities || [],
          requirements: job.requirements || [],
          role: job.type || job.role || "JOB",
          duration: job.duration || "",
          stipend: job.stipendType || "",
          workMode: job.workMode || "",
        }));

        setJobs(formatted);
      } catch (err) {
        setError("Failed to load jobs. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();      //Re-runs whenever currentPage changes
  }, [currentPage]);
  
  //Listens for the custom event fired by NotificationBell to open a job modal by ID.
  useEffect(() => {
    const handler = (e: any) => {
      const jobId = e.detail?.jobId;
      if (jobId) {
        const job = jobs.find((j) => j.id === jobId);
        if (job) {
          setSelectedJob(job);
        }
      }
    };
    window.addEventListener("open-recommendation-job-modal", handler);
    return () => window.removeEventListener("open-recommendation-job-modal", handler);
  }, [jobs]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient<{ profile: { cvUrl?: string; cvFileName?: string } }>(
          "/api/candidate/profile"
        );
        setProfileData(response.profile || null);
      } catch {
        setProfileData(null);
      }
    };

    loadProfile();
  }, []);

  //Client-side filtering.
  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchLocation =
        location === "Location" ||
        job.location.toLowerCase().includes(location.toLowerCase()) ||
        job.tags.some((tag) => tag.toLowerCase() === location.toLowerCase());
      const matchType =
        jobType === "Job type" ||
        job.tags.some((t) => t.toLowerCase() === jobType.toLowerCase());

      let matchSkill = true;
      if (skillMatch === "90%+") matchSkill = job.matchPercent >= 90;
      else if (skillMatch === "80%+") matchSkill = job.matchPercent >= 80;
      else if (skillMatch === "70%+") matchSkill = job.matchPercent >= 70;
      else if (skillMatch === "60%+") matchSkill = job.matchPercent >= 60;

      return matchSearch && matchLocation && matchType && matchSkill;
    });
  }, [search, location, jobType, skillMatch, jobs]);

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden">
      <RecommendationsFilterBar
        search={search}
        onSearchChange={setSearch}
        location={location}
        onLocationChange={setLocation}
        jobType={jobType}
        onJobTypeChange={setJobType}
        skillMatch={skillMatch}
        onSkillMatchChange={setSkillMatch}
      />

      <div className="px-7 pt-7">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
              <span><Cog /></span>
              {isProfessional ? "All Job Posts" : "All Internships"}
            </h1>
            <NotificationBell />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isProfessional
              ? "Manage and review all job recommendations"
              : "Manage and review all internship recommendations"}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-7 pb-7">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Jobs grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-5">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                {...job}
                isApplied={appliedJobIds.includes(job.id)}
                showMatchBadge={false}
                onView={(id) => setSelectedJob(jobs.find((j) => j.id === id) ?? null)}
                onApply={(id) => {
                  const selected = jobs.find((j) => j.id === id) ?? null;
                  setSelectedJob(selected);
                  if (appliedJobIds.includes(id)) {
                    setShowApplyModal(false);
                    return;
                  }
                  setShowApplyModal(true);
                }}
              />
            ))}

            {filtered.length === 0 && (
              <div className="col-span-2 py-20 text-center text-gray-400 text-sm">
                {isProfessional
                  ? "No job recommendations match your filters."
                  : "No internship recommendations match your filters."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-400">
          Showing {((currentPage - 1) * 20) + 1}–{Math.min(currentPage * 20, total)} of {total} results  
          {/* Calculates and displays the range of job results currently visible based on the current page and total number of jobs. */}
        </p>
        <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        > 
          Previous
        </button>

        {/* Displays clickable page numbers, skipping intermediate pages with an ellipsis (...) */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => 
            page === 1 || 
            page === totalPages || 
            Math.abs(page - currentPage) <= 1
          )
          .map((page, index, arr) => (
            <>
              {index > 0 && arr[index - 1] !== page - 1 && (
                <span key={`dots-${page}`} className="text-gray-400 px-1">...</span>
              )}
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 text-sm font-medium rounded-xl transition ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            </>
          ))
        }

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  )}

      {selectedJob && !showApplyModal && (
        <JobViewModal
          job={selectedJob}
          isApplied={appliedJobIds.includes(selectedJob.id)}
          onClose={() => setSelectedJob(null)}
          onApply={(id) => {
            if (appliedJobIds.includes(id)) return;
            setShowApplyModal(true);
          }}
        />
      )}

      {selectedJob && showApplyModal && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
            <div className="w-full max-w-2xl relative max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-4">
              <JobApplyModal
                selectedJob={selectedJob}
                resumeFileName={resumeFileName}
                setResumeFileName={setResumeFileName}
                cvUrl={cvUrl}
                setCvUrl={setCvUrl}
                coverLetter={coverLetter}
                setCoverLetter={setCoverLetter}
                showAIModal={showAIModal}
                setShowAIModal={setShowAIModal}
                closeModals={() => {
                  setShowApplyModal(false);
                  setSelectedJob(null);
                  setCvUrl("");
                  setResumeFileName("");
                }}
                openJobDetails={() => {
                  setShowApplyModal(false);
                }}
                handleApplySubmission={async (useDefaultCv: boolean) => {
                  if (!selectedJob) return;

                  try {
                    setSubmitError(null);
                    setIsApplying(true);
                    await candidateJobService.applyToJob(
                      selectedJob.id,
                      useDefaultCv ? undefined : cvUrl,
                      useDefaultCv ? undefined : resumeFileName,
                      coverLetter,
                      useDefaultCv
                    );
                    await refetchApplications();
                    // Invalidate other relevant queries
                    queryClient.invalidateQueries({ queryKey: ["candidate-stats"] });
                    queryClient.invalidateQueries({ queryKey: ["candidate-recommendations"] });
                    setShowApplyModal(false);
                    setSelectedJob(null);
                  } catch (error: any) {
                    setSubmitError(error?.message || "Failed to submit application.");
                  } finally {
                    setIsApplying(false);
                  }
                }}
                isLoading={isApplying}
              />
              {submitError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}
            </div>
          </div>
          {showAIModal && selectedJob && (
            <AICoverLetterModal
              jobId={selectedJob.id}
              jobTitle={selectedJob.title}
              candidateName={user?.name || "Your Name"}
              customCvUrl={cvUrl}
              onDone={(generatedCoverLetter) => {
                setCoverLetter(generatedCoverLetter);
                setShowAIModal(false);
              }}
              onClose={() => setShowAIModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
