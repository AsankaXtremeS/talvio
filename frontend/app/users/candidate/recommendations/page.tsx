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
}

/* 
//Mock data - kept for reference

  const MOCK_JOBS: Job[] = [

   //mock jobs only visible to students

  {
    id: "1",
    title: "Software Engineer Intern",
    company: "Google",
    location: "Mountain View, CA",
    postedAgo: "2 days ago",
    matchPercent: 92,
    tags: ["Remote", "Full time", "Paid", "6 months"],
    companyLogoUrl: "google",
    companyDescription: "Google is a global technology company focused on building innovative products that improve everyday life.",
    companyProfileUrl: "https://google.com",
    aboutRole: "As a Software Engineering Intern, you will work with experienced engineers to design, develop, and maintain scalable software solutions.",
    responsibilities: ["Assist in developing web applications", "Write clean and maintainable code", "Collaborate with cross-functional teams"],
    requirements: ["Undergraduate in Computer Science or related field", "Basic knowledge of JavaScript, React, or Java", "Good problem-solving skills"],
    role: "INTERNSHIP",
    duration: "6 months",
    stipend: "Paid",
    workMode: "Remote",
  },
  {
    id: "2",
    title: "Software Engineer Intern",
    company: "Microsoft",
    location: "Redmond, WA",
    postedAgo: "1 day ago",
    matchPercent: 85,
    tags: ["Onsite", "Full time", "Paid", "3 months"],
    companyLogoUrl: "microsoft",
    companyDescription: "Microsoft is a global leader in software, services, devices, and solutions.",
    companyProfileUrl: "https://microsoft.com",
    aboutRole: "Join the Microsoft team to work on cutting-edge cloud and AI technologies.",
    responsibilities: ["Develop scalable software", "Participate in code reviews", "Work with senior engineers"],
    requirements: ["Pursuing a degree in Computer Science", "Experience with C# or Python", "Team player"],
    role: "INTERNSHIP",
    duration: "3 months",
    stipend: "Paid",
    workMode: "Onsite",
  },
  {
    id: "3",
    title: "Software Engineer Intern",
    company: "Meta",
    location: "Menlo Park, CA",
    postedAgo: "3 days ago",
    matchPercent: 78,
    tags: ["Hybrid", "Full time", "Paid", "6 months"],
    companyLogoUrl: "meta",
    companyDescription: "Meta builds technologies that help people connect, find communities, and grow businesses.",
    companyProfileUrl: "https://meta.com",
    aboutRole: "Work on social media platforms and large-scale distributed systems.",
    responsibilities: ["Contribute to backend services", "Optimize performance", "Collaborate with product teams"],
    requirements: ["Knowledge of distributed systems", "Experience with React or Node.js", "Strong communication skills"],
    role: "INTERNSHIP",
    duration: "6 months",
    stipend: "Paid",
    workMode: "Hybrid",
  },
  {
    id: "4",
    title: "UI/UX Designer Intern",
    company: "Figma",
    location: "San Francisco, CA",
    postedAgo: "5 days ago",
    matchPercent: 88,
    tags: ["Remote", "Full time", "Paid", "3 months"],
    companyLogoUrl: "figma",
    companyDescription: "Figma is a collaborative interface design tool.",
    companyProfileUrl: "https://figma.com",
    aboutRole: "Design user interfaces and experiences for web and mobile apps.",
    responsibilities: ["Create wireframes and prototypes", "Work with product managers", "Conduct user research"],
    requirements: ["Experience with Figma or Sketch", "Portfolio of design work", "Attention to detail"],
    role: "INTERNSHIP",
    duration: "3 months",
    stipend: "Paid",
    workMode: "Remote",
  },

  //mock jobs only visible to professionals

  {
    id: "5",
    title: "Senior Software Engineer",
    company: "Google",
    location: "Mountain View, CA",
    postedAgo: "1 day ago",
    matchPercent: 94,
    tags: ["Remote", "Full time", "5+ years"],
    companyLogoUrl: "google",
    companyDescription: "Google is a global technology company focused on building innovative products.",
    companyProfileUrl: "https://google.com",
    aboutRole: "As a Senior Software Engineer, you will lead the design and development of scalable software solutions.",
    responsibilities: ["Lead software architecture decisions", "Mentor junior engineers", "Drive technical roadmap"],
    requirements: ["5+ years of software engineering experience", "Strong knowledge of distributed systems", "Experience with cloud platforms"],
    role: "JOB",
    duration: "Permanent",
    stipend: "Competitive salary",
    workMode: "Remote",
  },
  {
    id: "6",
    title: "Full Stack Developer",
    company: "Microsoft",
    location: "Redmond, WA",
    postedAgo: "2 days ago",
    matchPercent: 88,
    tags: ["Hybrid", "Full time", "3+ years"],
    companyLogoUrl: "microsoft",
    companyDescription: "Microsoft is a global leader in software, services, devices, and solutions.",
    companyProfileUrl: "https://microsoft.com",
    aboutRole: "Build and maintain full stack web applications for enterprise clients.",
    responsibilities: ["Develop frontend and backend features", "Optimize application performance", "Collaborate with design teams"],
    requirements: ["3+ years with React and Node.js", "Experience with Azure", "Strong TypeScript skills"],
    role: "JOB",
    duration: "Permanent",
    stipend: "Competitive salary",
    workMode: "Hybrid",
  },
  {
    id: "7",
    title: "DevOps Engineer",
    company: "Meta",
    location: "Menlo Park, CA",
    postedAgo: "3 days ago",
    matchPercent: 81,
    tags: ["Onsite", "Full time", "4+ years"],
    companyLogoUrl: "meta",
    companyDescription: "Meta builds technologies that help people connect and grow businesses.",
    companyProfileUrl: "https://meta.com",
    aboutRole: "Manage CI/CD pipelines and cloud infrastructure at scale.",
    responsibilities: ["Maintain cloud infrastructure", "Automate deployment pipelines", "Monitor system performance"],
    requirements: ["4+ years DevOps experience", "Strong knowledge of AWS or GCP", "Experience with Kubernetes"],
    role: "JOB",
    duration: "Permanent",
    stipend: "Competitive salary",
    workMode: "Onsite",
  },
];

*/

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
          postedAgo: new Date(job.createdAt).toLocaleDateString(),
          matchPercent: 0,
          tags: [
            job.workMode,
            job.employmentType,
            job.stipendType,
            job.duration,
          ].filter(Boolean),
          companyLogoUrl: job.companyLogoUrl || "",
          companyDescription: job.companyDescription || "",
          companyProfileUrl: job.companyWebsite || "",
          aboutRole: job.description || "",
          responsibilities: job.responsibilities || [],
          requirements: job.requirements || [],
          role: job.type,
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
