"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import FilterBar from "@/components/employer/job-posts/FilterBar";
import StatsRow from "@/components/employer/job-posts/StatsRow";
import JobPostsTable from "@/components/employer/job-posts/JobPostsTable";
import { deleteJobPost, getJobPosts, getJobPostStats, setJobPostStatus } from "@/lib/employer/jobPosts.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Popup from "@/components/admin/layout/Popup";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type PendingCloseState = {
  id: string;
  title: string;
} | null;

type PendingDeleteState = {
  id: string;
  title: string;
} | null;

export default function JobPostsPage() {
  const router = useRouter();

  const queryClient = useQueryClient();

  // ── Data Fetching (React Query) ──
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["employer-job-posts"],
    queryFn: async () => {
      console.log("Fetching from:", `${process.env.NEXT_PUBLIC_API_URL}/api/employer/job-posts`);
      const [postsData, statsData] = await Promise.all([
        getJobPosts(),
        getJobPostStats(),
      ]);
      return { posts: postsData, stats: statsData };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });

  const posts = useMemo(() => data?.posts || [], [data?.posts]);
  const stats = data?.stats || { total: 0, active: 0, closed: 0, draft: 0, applications: 0 };
  const [error, setError] = useState("");

  // When we successfully load from the live DB, clear any stale offline cache
  // so the next load always fetches fresh data rather than localStorage fallback.
  useEffect(() => {
    if (data?.posts && data.posts.length >= 0) {
      try {
        localStorage.removeItem("employerOfflineJobPosts");
      } catch {
        // Ignore storage errors
      }
    }
  }, [data?.posts]);

  useEffect(() => {
    if (queryError) {
      setError("Failed to load job posts. Please try again.");
    }
  }, [queryError]);


  // ── UI State ──
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [pendingClose, setPendingClose] = useState<PendingCloseState>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState>(null);
  const [popup, setPopup] = useState<{
    open: boolean;
    message: string;
    success?: boolean;
  }>({
    open: false,
    message: "",
    success: false,
  });

  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Status");
  const [jobType, setJobType] = useState("Job Type");
  const [sort, setSort] = useState("Newest");
  const [period, setPeriod] = useState("All Time");


  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const parseClosingDate = (dateStr?: string): Date | null => {
    if (!dateStr || !dateStr.trim()) return null;

    const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, month, day, 23, 59, 59, 999);
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const isWithinPeriod = (closingDateStr?: string, periodChoice?: string) => {
    if (!periodChoice || periodChoice === "All Time") return true;

    const closingDate = parseClosingDate(closingDateStr);
    if (!closingDate) return false;

    const now = new Date();

    if (periodChoice === "This Week") {
      // Start of current calendar week (Monday)
      const dayOfWeek = now.getDay();
      const distanceToMonday = (dayOfWeek + 6) % 7;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0);
      // End of 7 days from today
      const endOf7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59, 999);

      return closingDate >= startOfWeek && closingDate <= endOf7Days;
    }

    if (periodChoice === "This Month") {
      // Start of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      // End of current month or 30 days ahead
      const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const in30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30, 23, 59, 59, 999);
      const endLimit = endOfCurrentMonth > in30Days ? endOfCurrentMonth : in30Days;

      return closingDate >= startOfMonth && closingDate <= endLimit;
    }

    if (periodChoice === "Next 3 Months" || periodChoice === "Past 3 Months") {
      // Start of current month to 90 days ahead
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const in90Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 90, 23, 59, 59, 999);

      return closingDate >= startOfMonth && closingDate <= in90Days;
    }

    return true;
  };

  // ── Client-side filtering ──
  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        const title = p.title ?? "";
        const statusValue = p.status ?? "";
        const typeValue = p.type ?? "";
        const matchSearch = title.toLowerCase().includes(search.toLowerCase());
        // Convert "Close" filter to "Closed" status for matching
        const statusFilter = status === "Close" ? "Closed" : status;
        const matchStatus = status === "Status" || statusValue === statusFilter;
        // Apply jobType filter ("Job" or "Internship")
        const matchType =
          jobType === "Job Type" || typeValue.toLowerCase() === jobType.toLowerCase();

        // Apply period filter to upcoming closing dates
        const matchPeriod = isWithinPeriod(p.closingDate, period);

        return matchSearch && matchStatus && matchType && matchPeriod;
      })
      .sort((a, b) => {
        const aTime = a.createdAt
          ? new Date(a.createdAt).getTime()
          : a.closingDate
          ? new Date(a.closingDate).getTime()
          : 0;
        const bTime = b.createdAt
          ? new Date(b.createdAt).getTime()
          : b.closingDate
          ? new Date(b.closingDate).getTime()
          : 0;
        return sort === "Newest" ? bTime - aTime : aTime - bTime;
      });
  }, [posts, search, status, jobType, sort, period]);

  // Navigate to Edit page
  const handleEdit = (id: string) => {
    router.push(`/users/employer/job-posts/${id}/edit`);
  };

  // Navigate to the AI Shortlisted Candidates page for this specific job
  const handleViewCandidates = (id: string) => {
    router.push(`/users/employer/job-posts/${id}/candidates`);
  };

  const handleDelete = async (id: string) => {
    const post = posts.find((item) => item.id === id);
    const postTitle = post?.title || "this job post";

    if (post?.status === "Active") {
      setPopup({
        open: true,
        message: "Active job posts cannot be deleted. Please close the post first.",
        success: false,
      });
      return;
    }

    setPendingDelete({ id, title: postTitle });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    const { id } = pendingDelete;
    setPendingDelete(null);
    setError("");
    setDeletingId(id);

    try {
      await deleteJobPost(id);
      queryClient.invalidateQueries({ queryKey: ["employer-job-posts"] });
      setToast({
        type: "success",
        message: "Job post deleted successfully.",
      });
    } catch (err: unknown) {
      console.error("Failed to delete job post:", err);
      const message = err instanceof Error ? err.message : "Failed to delete job post. Please try again.";
      setError(message);
      setToast({
        type: "error",
        message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const updatePostStatus = async (id: string, nextStatus: "Draft" | "Active" | "Closed") => {
    setError("");
    setClosingId(id);

    try {
      await setJobPostStatus(id, nextStatus);
      queryClient.invalidateQueries({ queryKey: ["employer-job-posts"] });
      setToast({
        type: "success",
        message: `Job post updated to ${nextStatus}.`,
      });
    } catch (err: unknown) {
      console.error("Failed to update job post status:", err);
      setError("Failed to update job post status. Please try again.");
      setToast({
        type: "error",
        message: "Failed to update job post status.",
      });
    } finally {
      setClosingId(null);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: "Draft" | "Active" | "Closed") => {
    if (nextStatus === "Closed") {
      const postTitle = posts.find((post) => post.id === id)?.title || "this job post";
      setPendingClose({ id, title: postTitle });
      return;
    }

    await updatePostStatus(id, nextStatus);
  };

  const handleConfirmClose = async () => {
    if (!pendingClose) return;
    const { id } = pendingClose;
    setPendingClose(null);
    await updatePostStatus(id, "Closed");
  };

  return (
    <div className="flex flex-col h-full p-8 pt-2 overflow-hidden">
      <Popup
        open={popup.open}
        message={popup.message}
        success={popup.success}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />

      {toast && (
        <div className="fixed right-6 top-6 z-50">
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
              }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {pendingClose && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900">Close Job Post?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Are you sure you want to close
              <span className="font-semibold text-gray-800"> {pendingClose.title}</span>?
              Candidates will no longer be able to apply.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingClose(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="rounded-lg border border-red-300 bg-[#C61D20] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#AF1A1C]"
              >
                Close Post
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900">Delete Job Post?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Are you sure you want to delete
              <span className="font-semibold text-gray-800"> {pendingDelete.title}</span>?
              This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg border border-red-300 bg-[#C61D20] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#AF1A1C]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed header section ── */}
      <div className="shrink-0">
        <FilterBar
          search={search} onSearchChange={setSearch}
          status={status} onStatusChange={setStatus}
          jobType={jobType} onJobTypeChange={setJobType}
          sort={sort} onSortChange={setSort}
          period={period} onPeriodChange={setPeriod}
        />

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
          applications={stats.applications ?? 0}
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
          <JobPostsTable
            posts={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onViewCandidates={handleViewCandidates}
            deletingId={deletingId}
            closingId={closingId}
            jobType={jobType}
            onJobTypeChange={setJobType}
            statusFilter={status}
            onStatusFilterChange={setStatus}
            period={period}
            onPeriodChange={setPeriod}
          />
        )}
      </div>
    </div>
  );
}