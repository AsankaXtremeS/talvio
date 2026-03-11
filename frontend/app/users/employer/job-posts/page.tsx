"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase } from "lucide-react";
import { JobPost } from "@/types/employer/jobPost.types";
import { getJobPosts } from "@/lib/employer/jobPosts.service";
import FilterBar from "@/components/employer/job-posts/FilterBar";
import StatsRow from "@/components/employer/job-posts/StatsRow";
import JobPostsTable from "@/components/employer/job-posts/JobPostsTable";

// ── Mock data so the page works before backend is ready ──
const MOCK_POSTS: JobPost[] = [
  { id: "1", title: "Frontend Developer", department: "Engineering", type: "Job",        closedDate: "Apr 26,2024", status: "Draft",  applicantsCount: 0   },
  { id: "2", title: "UI/UX Designer",     department: "Design",      type: "Internship", closedDate: "Apr 26,2024", status: "Active", applicantsCount: 24  },
  { id: "3", title: "Data Analyst",       department: "Engineering", type: "Job",        closedDate: "Apr 26,2024", status: "Active", applicantsCount: 12  },
  { id: "4", title: "Marketing Intern",   department: "Marketing",   type: "Job",        closedDate: "Apr 26,2024", status: "Closed", applicantsCount: 210 },
  { id: "5", title: "QA Engineer",        department: "Engineering", type: "Job",        closedDate: "Apr 26,2024", status: "Active", applicantsCount: 8   },
  { id: "6", title: "Product Manager",    department: "Management",  type: "Job",        closedDate: "Apr 26,2024", status: "Active", applicantsCount: 16  },
];

export default function JobPostsPage() {
  const router = useRouter();

  const [posts, setPosts]     = useState<JobPost[]>(MOCK_POSTS);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("Status");
  const [jobRole, setJobRole] = useState("Job Role");
  const [sort,    setSort]    = useState("Newest");
  const [period,  setPeriod]  = useState("This Week");

  // Uncomment when backend is ready:
  // useEffect(() => {
  //   setLoading(true);
  //   getJobPosts().then(setPosts).finally(() => setLoading(false));
  // }, []);

  // ── Derived stats ──
  const totalPosts    = posts.length;
  const activePosts   = posts.filter((p) => p.status === "Active").length;
  const applications  = posts.reduce((acc, p) => acc + (p.applicantsCount ?? 0), 0);
  const closedPosts   = posts.filter((p) => p.status === "Closed").length;

  // ── Client-side filtering ──
  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === "Status" || p.status === status;
        const matchRole   = jobRole === "Job Role" || p.department === jobRole;
        return matchSearch && matchStatus && matchRole;
      })
      .sort((a, b) =>
        sort === "Newest"
          ? b.id.localeCompare(a.id)
          : a.id.localeCompare(b.id)
      );
  }, [posts, search, status, jobRole, sort]);

  const handleEdit = (id: string) => {
    router.push(`/users/employer/job-posts/${id}/edit`);
  };

  return (
    <div className="flex flex-col h-full p-8 overflow-hidden">

      {/* ── Fixed header section (filter + title + stats) ── */}
      <div className="flex-shrink-0">
        {/* ── Filter bar (top) ── */}
        <FilterBar
          search={search}       onSearchChange={setSearch}
          status={status}       onStatusChange={setStatus}
          jobRole={jobRole}     onJobRoleChange={setJobRole}
          sort={sort}           onSortChange={setSort}
          period={period}       onPeriodChange={setPeriod}
        />

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mt-6 mb-5">
          <h1 className="flex items-center gap-2.5 text-3xl font-bold text-indigo-500">
            <Briefcase size={26} className="text-indigo-500" />
            Job Posts
          </h1>
          <button
            onClick={() => router.push("/users/employer/job-posts/new")}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700
                       text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} />
            Post New Job
          </button>
        </div>

        {/* ── Stats row ── */}
        <StatsRow
          totalPosts={totalPosts}
          active={activePosts}
          applications={applications}
          closed={closedPosts}
        />
      </div>

      {/* ── Scrollable table area ── */}
      <div className="flex-1 pr-1 mt-6 overflow-y-auto">
        {loading ? (
          <div className="p-12 text-sm text-center text-gray-400 bg-white border border-gray-100 rounded-2xl">
            Loading...
          </div>
        ) : (
          <JobPostsTable posts={filtered} onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
}