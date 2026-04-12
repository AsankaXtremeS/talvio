"use client";

import { useAuth } from "@/context/AuthContext";
import { Cog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RecommendationsFilterBar from "@/components/candidate/recommendations/RecommendationsFilterBar";
import JobCard from "@/components/candidate/recommendations/JobCards";
import JobViewModal from "@/components/candidate/recommendations/JobViewModel";
import { apiClient } from "@/lib/apiClient";

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

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Location");
  const [jobType, setJobType] = useState("Job type");
  const [skillMatch, setSkillMatch] = useState("Skill matched %");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient<{ jobs: Job[] }>("/api/candidate/jobs");

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

    fetchJobs();
  }, []);
  
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
          <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
            <span><Cog /></span>
            {isProfessional ? "Jobs" : "Recommendations"}
          </h1>
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
                onView={(id) => setSelectedJob(jobs.find((j) => j.id === id) ?? null)}
                onApply={(id) => router.push(`/users/candidate/jobs/${id}/apply`)}
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

      {selectedJob && (
        <JobViewModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={(id) => {
            setSelectedJob(null);
            router.push(`/users/candidate/jobs/${id}/apply`);
          }}
        />
      )}
    </div>
  );
}
