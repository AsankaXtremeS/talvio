"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, LogOut } from "lucide-react";
import { JobPostFormData } from "@/types/employer/jobPost.types";
import { createJobPost, updateJobPost } from "@/lib/employer/jobPosts.service";
import JobPostedSuccessfully from "./JobPostedSuccessfully";

interface JobPostFormProps {
  initialData?: Partial<JobPostFormData>;
  postId?: string;
  onSuccess?: () => void;
}

const EMPTY: JobPostFormData = {
  title: "",
  type: "Job",
  closingDate: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  description: "",
  requirements: "",
  additionalInformation: "",
  skills: "",
  workMode: "On site",
  employmentType: "Full-time",
  status: "Draft",
};

const inputCls =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] text-gray-700 outline-none focus:border-indigo-500";

const textareaCls =
  "w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] text-gray-700 outline-none focus:border-indigo-500";

const labelCls = "mb-2 block text-[15px] font-semibold text-gray-800";
const PREVIEW_STORAGE_KEY = "employerJobPostPreviewDraft";

export default function JobPostForm({
  initialData,
  postId,
  onSuccess,
}: JobPostFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<JobPostFormData>({
    ...EMPTY,
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isEdit = Boolean(postId);

  useEffect(() => {
    if (isEdit) return;

    const raw = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as JobPostFormData;
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore invalid stored data and keep default form values.
    }
  }, [isEdit]);

  const setField = (key: keyof JobPostFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.title || !form.location || !form.description) {
      setError("Please fill in the required fields before posting.");
      return;
    }

    if (!isEdit) {
      sessionStorage.setItem(
        PREVIEW_STORAGE_KEY,
        JSON.stringify(form)
      );
      router.push("/users/employer/job-posts/preview");
      return;
    }

    setLoading(true);

    try {
      const payload: JobPostFormData = {
        ...form,
        status: "Active",
      };

      if (isEdit && postId) {
        await updateJobPost(postId, payload);
      } else {
        await createJobPost(payload);
      }

      setShowSuccessModal(true);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeDraft = async () => {
    if (isEdit) return;

    setError("");
    setDraftLoading(true);

    try {
      const payload: JobPostFormData = {
        ...form,
        status: "Draft",
      };

      await createJobPost(payload);
      sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
      router.push("/users/employer/job-posts");
    } catch (err) {
      console.error(err);
      setError("Failed to save draft. Please try again.");
    } finally {
      setDraftLoading(false);
    }
  };

  return (
    <>
      <div className="h-full overflow-y-auto rounded-2xl bg-white px-12 py-10 shadow-sm">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-black">
            Create a job / internship opening
          </h2>
          <p className="mt-1 text-[14px] text-blue-600">
            Fill in the information below to publish a new opportunity.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-5 pb-2">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
            <div className="md:col-span-4">
              <label className={labelCls}>Job Title</label>
              <input
                className={inputCls}
                placeholder="Software Engineer"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
            </div>

            <div className="md:col-span-4">
              <label className="mb-2 block text-[15px] font-semibold text-transparent">
                Type
              </label>
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) =>
                  setField("type", e.target.value as JobPostFormData["type"])
                }
              >
                <option value="Job">Job</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="mb-2 block text-[15px] font-semibold text-transparent">
                Employment Type
              </label>
              <select
                className={inputCls}
                value={form.employmentType}
                onChange={(e) =>
                  setField(
                    "employmentType",
                    e.target.value as JobPostFormData["employmentType"]
                  )
                }
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
            <div className="md:col-span-4">
              <label className={labelCls}>Workplace Type</label>
              <select
                className={inputCls}
                value={form.workMode}
                onChange={(e) =>
                  setField(
                    "workMode",
                    e.target.value as JobPostFormData["workMode"]
                  )
                }
              >
                <option value="On site">On site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="md:col-span-8">
              <label className={labelCls}>Location</label>
              <input
                className={inputCls}
                placeholder="Moratuwa, Sri Lanka"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Job Description</label>
            <textarea
              className={`${textareaCls} min-h-30`}
              placeholder="Describe the role, team and what the candidate will be doing..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Qualifications</label>
            <textarea
              className={`${textareaCls} min-h-25`}
              placeholder="List required experience and education..."
              value={form.requirements}
              onChange={(e) => setField("requirements", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Additional Information</label>
            <textarea
              className={`${textareaCls} min-h-25`}
              placeholder="Add any extra details candidates should know..."
              value={form.additionalInformation}
              onChange={(e) => setField("additionalInformation", e.target.value)}
            />
          </div>

          <div className="max-w-md">
            <label className={labelCls}>Skills</label>
            <input
              className={inputCls}
              placeholder="Add skills (e.g. React, Python)"
              value={form.skills}
              onChange={(e) => setField("skills", e.target.value)}
            />
          </div>

          <div className="max-w-md">
            <label className={labelCls}>Closing Date</label>
            <input
              type="date"
              className={inputCls}
              value={form.closingDate}
              onChange={(e) => setField("closingDate", e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            {!isEdit && (
              <button
                type="button"
                onClick={handleMakeDraft}
                disabled={draftLoading || loading}
                className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileText size={16} />
                {draftLoading ? "Saving Draft..." : "Make as Draft"}
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || draftLoading}
              className="flex min-w-[220px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Posting..." : isEdit ? "Update" : "Preview"}
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <JobPostedSuccessfully
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/users/employer/job-posts");
        }}
        onViewPost={() => {
          setShowSuccessModal(false);
          router.push("/users/employer/job-posts");
        }}
      />
    </>
  );
}