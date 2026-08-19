"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createJobPost } from "@/lib/employer/jobPosts.service";
import { JobPostFormData } from "@/types/employer/jobPost.types";
import Popup from "@/components/admin/layout/Popup";
import { useQueryClient } from "@tanstack/react-query";

import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Code2,
  GraduationCap,
  Info,
  ListChecks,
  MapPin,
} from "lucide-react";

export default function JobPostPreviewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<JobPostFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{
    open: boolean;
    message: string;
    success?: boolean;
  }>({
    open: false,
    message: "",
    success: false,
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("employerJobPostPreviewDraft");

    if (!raw) {
      router.replace("/users/employer/job-posts/new");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as JobPostFormData;
      setDraft(parsed);
    } catch {
      router.replace("/users/employer/job-posts/new");
    }
  }, [router]);

  const handlePost = async () => {
    if (!draft) return;

    setLoading(true);
    setPopup((prev) => ({ ...prev, open: false }));

    try {
      const payload: JobPostFormData = {
        ...draft,
        status: "Active",
      };

      await createJobPost(payload);
      
      // Invalidate React Query cache to ensure automatic update on dashboard
      queryClient.invalidateQueries({ queryKey: ["employer-job-posts"] });

      sessionStorage.removeItem("employerJobPostPreviewDraft");
      setPopup({
        open: true,
        message: "Job posted successfully! Your opportunity is now visible to candidates.",
        success: true,
      });
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to publish job post. Please try again.";
      setPopup({
        open: true,
        message,
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!draft) {
    return null;
  }

  const skillsList = (draft.skills ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <div className="h-full overflow-y-auto bg-[#EEF4FB] p-4 md:p-8">
      <Popup
        open={popup.open}
        message={popup.message}
        success={popup.success}
        onClose={() => {
          setPopup((prev) => ({ ...prev, open: false }));
          if (popup.success) {
            router.push("/users/employer/job-posts");
          }
        }}
      />

      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white px-8 py-8 shadow-sm md:px-12 md:py-10">
        <header className="mb-6">
          <h1 className="text-[22px] font-bold text-black">{draft.title}</h1>
          <p className="mt-1 text-[14px] text-blue-600">
            Review the details below before publishing your opportunity.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] font-medium">
            <span className="rounded-full bg-blue-600 px-4 py-1.5 text-white">
              {draft.employmentType}
            </span>
            <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-white">
              {draft.workMode}
            </span>
            <span className="mx-1 text-gray-400">|</span>
            <div className="flex items-center text-gray-700">
              <MapPin size={16} className="mr-1" />
              {draft.location || "-"}
            </div>
          </div>
        </header>

        <hr className="mb-6 border-gray-100" />

        <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[14px] text-gray-700">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-gray-500" />
            <span>Closing Date: {draft.closingDate || "Not specified"}</span>
          </div>
        </div>

        <div className="space-y-5">
          {draft.description && (
            <section>
              <div className="mb-1.5 flex items-center gap-2 text-gray-800">
                <Briefcase size={15} className="text-gray-700" />
                <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Job Description</h2>
              </div>
              <p className="text-[14px] leading-7 text-gray-700">{draft.description}</p>
            </section>
          )}
          {draft.responsibilities && (
            <section>
              <div className="mb-1.5 flex items-center gap-2 text-gray-800">
                <ListChecks size={15} className="text-gray-700" />
                <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Responsibilities</h2>
              </div>
              <p className="text-[14px] leading-7 text-gray-700">{draft.responsibilities}</p>
            </section>
          )}
          {draft.requirements && (
            <section>
              <div className="mb-1.5 flex items-center gap-2 text-gray-800">
                <GraduationCap size={15} className="text-gray-700" />
                <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Qualifications</h2>
              </div>
              <p className="text-[14px] leading-7 text-gray-700">{draft.requirements}</p>
            </section>
          )}
          {draft.additionalInformation && (
            <section>
              <div className="mb-1.5 flex items-center gap-2 text-gray-800">
                <Info size={15} className="text-gray-700" />
                <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Additional Information</h2>
              </div>
              <p className="text-[14px] leading-7 text-gray-700">{draft.additionalInformation}</p>
            </section>
          )}

          <section>
            <div className="mb-1.5 flex items-center gap-2 text-gray-800">
              <Code2 size={15} className="text-gray-700" />
              <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Skills</h2>
            </div>
            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-[13px] font-medium text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[14px] leading-7 text-gray-700">-</p>
            )}
          </section>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => router.push("/users/employer/job-posts/new")}
            className="inline-flex min-w-35 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Edit Details
          </button>

          <button
            type="button"
            onClick={handlePost}
            disabled={loading}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>
      </div>
    </div>
  );
}
