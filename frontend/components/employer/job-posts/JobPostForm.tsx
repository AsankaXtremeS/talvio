"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { FileText, LogOut } from "lucide-react";
import { JobPostFormData } from "@/types/employer/jobPost.types";
import { createJobPost, updateJobPost } from "@/lib/employer/jobPosts.service";
import Popup from "@/components/admin/layout/Popup";
import { useQueryClient } from "@tanstack/react-query";

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
  description: "",
  responsibilities: "",
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
  const queryClient = useQueryClient();

  const [form, setForm] = useState<JobPostFormData>({
    ...EMPTY,
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState<{
    open: boolean;
    message: string;
    success?: boolean;
  }>({
    open: false,
    message: "",
    success: false,
  });
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

  // Helper for DatePicker: convert string to Date and back
  const closingDateValue = form.closingDate ? new Date(form.closingDate) : null;

  const handleSubmit = async () => {
    setError("");

    // Required fields check
    if (
      !form.title ||
      !form.location ||
      !form.description ||
      !form.requirements ||
      !form.responsibilities ||
      !form.skills
    ) {
      setError("Please fill in the required fields before posting.");
      return;
    }

    // Min/max length validation for required textareas
    const requiredFieldsToValidate = [
      { key: "description", label: "Job Description" },
      { key: "requirements", label: "Qualifications" },
      { key: "responsibilities", label: "Responsibilities" },
    ];
    for (const { key, label } of requiredFieldsToValidate) {
      const value = form[key as keyof typeof form] as string;
      if (value.length < 20) {
        setError(`${label} must be at least 20 characters.`);
        return;
      }
      if (value.length > 700) {
        setError(`${label} must be at most 700 characters.`);
        return;
      }
    }

    if (form.skills.length > 1000) {
      setError("Skills must be at most 1000 characters.");
      return;
    }

    // Optional fields: validate only if not empty
    const optionalFieldsToValidate = [
      { key: "additionalInformation", label: "Additional Information", checkMin: false },
    ];
    for (const { key, label, checkMin } of optionalFieldsToValidate) {
      const value = form[key as keyof typeof form] as string;
      if (value && value.length > 0) {
        if (checkMin && value.length < 20) {
          setError(`${label} must be at least 20 characters if provided.`);
          return;
        }
        if (value.length > 700) {
          setError(`${label} must be at most 700 characters.`);
          return;
        }
      }
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
        status: isEdit ? form.status : "Active",
      };

      if (isEdit && postId) {
        await updateJobPost(postId, payload);
      } else {
        await createJobPost(payload);
      }

      // Invalidate React Query cache to ensure automatic update on dashboard
      queryClient.invalidateQueries({ queryKey: ["employer-job-posts"] });
      queryClient.invalidateQueries({ queryKey: ["employer"] });

      setPopup({
        open: true,
        message: isEdit
          ? "Job post updated successfully! Your latest changes are now live."
          : "Job post created successfully!",
        success: true,
      });
      onSuccess?.();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
      setPopup({
        open: true,
        message,
        success: false,
      });
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

      // Invalidate React Query cache to ensure automatic update on dashboard
      queryClient.invalidateQueries({ queryKey: ["employer-job-posts"] });

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
              <label className={labelCls}>
                Job Title <span className="text-red-500">*</span>
              </label>
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
              <label className={labelCls}>
                Workplace Type <span className="text-red-500">*</span>
              </label>
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
              <label className={labelCls}>
                Location <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="Moratuwa, Sri Lanka"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                name="location"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Job Description <span className="text-red-500">*</span>{" "}
              <span className="text-[13px] font-normal text-gray-400">(Min 20 characters)</span>
            </label>
            <textarea
              className={`${textareaCls} min-h-30`}
              placeholder="Describe the role, team and what the candidate will be doing..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>
              Responsibilities <span className="text-red-500">*</span>{" "}
              <span className="text-[13px] font-normal text-gray-400">(Min 20 characters)</span>
            </label>
            <textarea
              className={`${textareaCls} min-h-25`}
              placeholder="List the key responsibilities for this role..."
              value={form.responsibilities}
              onChange={(e) => setField("responsibilities", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>
              Requirements <span className="text-red-500">*</span>{" "}
              <span className="text-[13px] font-normal text-gray-400">(Min 20 characters)</span>
            </label>
            <textarea
              className={`${textareaCls} min-h-25`}
              placeholder="List required experience and education..."
              value={form.requirements}
              onChange={(e) => setField("requirements", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>
              Additional Information{" "}
              <span className="text-[13px] font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              className={`${textareaCls} min-h-25`}
              placeholder="Add any extra details candidates should know..."
              value={form.additionalInformation}
              onChange={(e) => setField("additionalInformation", e.target.value)}
            />
          </div>

          <div className="max-w-md">
            <label className={labelCls}>
              Skills <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="Add skills (e.g. React, Python)"
              value={form.skills}
              onChange={(e) => setField("skills", e.target.value)}
            />
          </div>

          <div className="max-w-md">
            <label className={labelCls}>
              Closing Date <span className="text-[13px] font-normal text-gray-400">(Optional)</span>
            </label>
            <DatePicker
              selected={closingDateValue}
              onChange={(date: Date | null) => setField("closingDate", date ? date.toISOString().slice(0, 10) : "")}
              className={inputCls}
              placeholderText="Select closing date"
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              isClearable
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            {isEdit && (
              <button
                type="button"
                onClick={() => router.push("/users/employer/job-posts")}
                className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            )}

            {!isEdit && (
              <button
                type="button"
                onClick={handleMakeDraft}
                disabled={draftLoading || loading}
                className="inline-flex min-w-55 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileText size={16} />
                {draftLoading ? "Saving Draft..." : "Make as Draft"}
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || draftLoading}
              className="flex min-w-55 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Posting..." : isEdit ? "Update" : "Preview"}
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

    </>
  );
}