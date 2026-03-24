"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase } from "lucide-react";
import { JobPost, JobPostStats } from "@/types/employer/jobPost.types";
import FilterBar from "@/components/employer/job-posts/FilterBar";
import StatsRow from "@/components/employer/job-posts/StatsRow";
import JobPostsTable from "@/components/employer/job-posts/JobPostsTable";
import { getJobPosts, getJobPostStats } from "@/lib/employer/jobPosts.service";

export default function JobPostsPage() {
  const router = useRouter();

  // ── State ──
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [stats, setStats] = useState<JobPostStats>({ total: 0, active: 0, closed: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Status");
  const [jobRole, setJobRole] = useState("Job Role");
  const [sort, setSort] = useState("Newest");
  const [period, setPeriod] = useState("This Week");

  // ── Fetch posts + stats from backend ──
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch posts and stats in parallel for better performance
        const [postsData, statsData] = await Promise.all([
          getJobPosts(),
          getJobPostStats(),
        ]);
        setPosts(postsData);
        setStats(statsData);
      } catch (err: unknown) {
        console.error("Failed to load job posts:", err);
        setError("Failed to load job posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Client-side filtering ──
  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === "Status" || p.status === status;
        const matchRole = jobRole === "Job Role" || p.department === jobRole;
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
    <div className="flex flex-col h-full p-8 pt-2 overflow-hidden">

      {/* ── Fixed header section ── */}
      <div className="shrink-0">
        {/* ── Filter bar ── */}
        <FilterBar
          search={search}   onSearchChange={setSearch}
          status={status}   onStatusChange={setStatus}
          jobRole={jobRole} onJobRoleChange={setJobRole}
          sort={sort}       onSortChange={setSort}
          period={period}   onPeriodChange={setPeriod}
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

        {/* ── Stats row — uses real data from backend ── */}
        <StatsRow
          totalPosts={stats.total}
          active={stats.active}
          applications={0}      // Applications module එක later add කරන්න
          closed={stats.closed}
        />
      </div>

      {/* ── Scrollable table area ── */}
      <div className="flex-1 pr-1 mt-6 overflow-y-auto">
        {loading ? (
          <div className="p-12 text-sm text-center text-gray-400 bg-white border border-gray-100 rounded-2xl">
            Loading...
          </div>
        ) : error ? (
          <div className="p-12 text-sm text-center text-red-400 bg-white border border-red-100 rounded-2xl">
            {error}
          </div>
        ) : (
          <JobPostsTable posts={filtered} onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
}
