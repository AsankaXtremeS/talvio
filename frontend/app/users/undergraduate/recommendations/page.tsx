"use client";

import { Cog } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import RecommendationsFilterBar from "@/components/undergraduate/recommendations/RecommendationsFilterBar";
import JobCard from "@/components/undergraduate/recommendations/JobCards";
import JobViewModal from "@/components/undergraduate/recommendations/JobViewModel";

// ── Types ──
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

// ── Mock data ──
const MOCK_JOBS: Job[] = [
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
    role: "Software Engineer Intern",
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
    role: "Software Engineer Intern",
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
    role: "Software Engineer Intern",
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
    role: "UI/UX Designer Intern",
    duration: "3 months",
    stipend: "Paid",
    workMode: "Remote",
  },
  {
    id: "5",
    title: "UI/UX Designer Intern",
    company: "Adobe",
    location: "San Jose, CA",
    postedAgo: "4 days ago",
    matchPercent: 73,
    tags: ["Onsite", "Full time", "Paid", "6 months"],
    companyLogoUrl: "adobe",
    companyDescription: "Adobe is a leader in creative software and digital experiences.",
    companyProfileUrl: "https://adobe.com",
    aboutRole: "Work on the next generation of creative tools and experiences.",
    responsibilities: ["Design UI components", "Collaborate with engineers", "Test usability"],
    requirements: ["Knowledge of Adobe Creative Suite", "Strong visual design skills", "Interest in user research"],
    role: "UI/UX Designer Intern",
    duration: "6 months",
    stipend: "Paid",
    workMode: "Onsite",
  },
  {
    id: "6",
    title: "Marketing Analyst Intern",
    company: "HubSpot",
    location: "Boston, MA",
    postedAgo: "1 week ago",
    matchPercent: 65,
    tags: ["Remote", "Part time", "Paid", "3 months"],
    companyLogoUrl: "hubspot",
    companyDescription: "HubSpot is a leading CRM platform for scaling companies.",
    companyProfileUrl: "https://hubspot.com",
    aboutRole: "Analyze marketing data and help optimize campaigns.",
    responsibilities: ["Collect and analyze data", "Prepare reports", "Support marketing team"],
    requirements: ["Strong analytical skills", "Experience with Excel or Google Sheets", "Interest in marketing"],
    role: "Marketing Analyst Intern",
    duration: "3 months",
    stipend: "Paid",
    workMode: "Remote",
  },
];

export default function RecommendationsPage() {
  const router = useRouter();

  // Filter state
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Location");
  const [jobType, setJobType] = useState("Job type");
  const [skillMatch, setSkillMatch] = useState("Skill matched %");

  // Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filtered = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchLocation =
        location === "Location" ||
        job.location.toLowerCase().includes(location.toLowerCase()) ||
        (location === "Remote" && job.tags.includes("Remote"));
      const matchType =
        jobType === "Job type" ||
        job.tags.some((t) => t.toLowerCase() === jobType.toLowerCase());

      let matchSkill = true;
      if (skillMatch === "90%+") matchSkill = job.matchPercent >= 90;
      else if (skillMatch === "80%+") matchSkill = job.matchPercent >= 80;
      else if (skillMatch === "70%+") matchSkill = job.matchPercent >= 70;
      else if (skillMatch === "60%+") matchSkill = job.matchPercent >= 60;
      // If "Skill matched %" (default), show all

      return matchSearch && matchLocation && matchType && matchSkill;
    });
  }, [search, location, jobType, skillMatch]);

  return (
    <div className="flex-1 bg-[#E9F3FD] min-h-screen flex flex-col overflow-hidden">
      {/* Filter bar */}
      <RecommendationsFilterBar
        search={search}         onSearchChange={setSearch}
        location={location}     onLocationChange={setLocation}
        jobType={jobType}       onJobTypeChange={setJobType}
        skillMatch={skillMatch} onSkillMatchChange={setSkillMatch}
      />

      {/* Page content */}
      <div className="flex-1 overflow-auto px-7 py-7">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
            <span><Cog/></span> Recommendations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and review all recommendations
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-5">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              {...job}
              onView={(id) => setSelectedJob(MOCK_JOBS.find((j) => j.id === id) ?? null)}
              onApply={(id) => router.push(`/users/student/jobs/${id}/apply`)}
            />
          ))}

          {filtered.length === 0 && (
            <div className="col-span-2 py-20 text-center text-gray-400 text-sm">
              No recommendations match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Job view modal */}
      {selectedJob && (
        <JobViewModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={(id) => {
            setSelectedJob(null);
            router.push(`/users/student/jobs/${id}/apply`);
          }}
        />
      )}
    </div>
  );
}