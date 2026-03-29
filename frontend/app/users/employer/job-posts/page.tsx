"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import { JobPost, JobPostStats } from "@/types/employer/jobPost.types";
import FilterBar from "@/components/employer/job-posts/FilterBar";
import StatsRow from "@/components/employer/job-posts/StatsRow";
import JobPostsTable from "@/components/employer/job-posts/JobPostsTable";
import { deleteJobPost, getJobPosts, getJobPostStats, setJobPostStatus } from "@/lib/employer/jobPosts.service";
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

  // ── State ──
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [stats, setStats] = useState<JobPostStats>({ total: 0, active: 0, closed: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  const [jobRole, setJobRole] = useState("Job Role");
  const [sort, setSort] = useState("Newest");
  const [period, setPeriod] = useState("This Week");

  // ── Fetch posts + stats from backend ──
  useEffect(() => {
    const fetchData = async () => {
  setLoading(true);
  setError("");
  try {
    console.log("Fetching from:", `${process.env.NEXT_PUBLIC_API_URL}/api/employer/job-posts`);
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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Client-side filtering ──
  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
        // Convert "Close" filter to "Closed" status for matching
        const statusFilter = status === "Close" ? "Closed" : status;
        const matchStatus = status === "Status" || p.status === statusFilter;
        const matchRole = jobRole === "Job Role";
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
      setPosts((prev) => prev.filter((post) => post.id !== id));
      const latestStats = await getJobPostStats();
      setStats(latestStats);
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
      const updatedPost = await setJobPostStatus(id, nextStatus);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? updatedPost : post
        )
      );
      const latestStats = await getJobPostStats();
      setStats(latestStats);
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
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm ${
              toast.type === "success"
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
          applications={0}      // Applications module add later
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
            deletingId={deletingId}
            closingId={closingId}
          />
        )}
      </div>
    </div>
  );
}
