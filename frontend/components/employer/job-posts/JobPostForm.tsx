"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobPostFormData } from "@/types/employer/jobPost.types";
import { createJobPost, updateJobPost } from "@/lib/employer/jobPosts.service";

interface JobPostFormProps {
  initialData?: Partial<JobPostFormData>;
  postId?: string;       // if provided → edit mode
  onSuccess?: () => void;
}

const EMPTY: JobPostFormData = {
  title: "",
  department: "",
  type: "Job",
  closedDate: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  description: "",
  requirements: "",
  workMode: "On site",
  employmentType: "Full-time",
  status: "Draft",
};

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white";

const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

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
  const [error, setError] = useState("");

  const isEdit = Boolean(postId);

  const set = (key: keyof JobPostFormData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (status: "Draft" | "Active") => {
    setError("");
    if (!form.title || !form.department || !form.closedDate) {
      setError("Please fill in Title, Department, and Closing Date.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, status };
      if (isEdit && postId) {
        await updateJobPost(postId, payload);
      } else {
        await createJobPost(payload);
      }
      onSuccess?.();
      router.push("/users/employer/job-posts");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl p-8 bg-white border border-gray-100 rounded-2xl">
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        {isEdit ? "Edit Job Post" : "Create New Job Post"}
      </h2>

      {error && (
        <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-5">
        {/* Job Title */}
        <div className="col-span-2">
          <label className={labelCls}>Job Title *</label>
          <input
            className={inputCls}
            placeholder="e.g. Frontend Developer"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        {/* Department */}
        <div>
          <label className={labelCls}>Department *</label>
          <select
            className={inputCls}
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
          >
            <option value="">Select department</option>
            {["Engineering", "Design", "Marketing", "Management", "Sales", "HR"].map(
              (d) => <option key={d}>{d}</option>
            )}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className={labelCls}>Type *</label>
          <select
            className={inputCls}
            value={form.type}
            onChange={(e) => set("type", e.target.value as JobPostFormData["type"])}
          >
            <option>Job</option>
            <option>Internship</option>
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label className={labelCls}>Employment Type</label>
          <select
            className={inputCls}
            value={form.employmentType}
            onChange={(e) =>
              set("employmentType", e.target.value as JobPostFormData["employmentType"])
            }
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
        </div>

        {/* Work Mode */}
        <div>
          <label className={labelCls}>Work Mode</label>
          <select
            className={inputCls}
            value={form.workMode}
            onChange={(e) =>
              set("workMode", e.target.value as JobPostFormData["workMode"])
            }
          >
            <option>On site</option>
            <option>Remote</option>
            <option>Hybrid</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className={labelCls}>Location</label>
          <input
            className={inputCls}
            placeholder="e.g. Colombo, Sri Lanka"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>

        {/* Closing Date */}
        <div>
          <label className={labelCls}>Closing Date *</label>
          <input
            type="date"
            className={inputCls}
            value={form.closedDate}
            onChange={(e) => set("closedDate", e.target.value)}
          />
        </div>

        {/* Salary */}
        <div>
          <label className={labelCls}>Salary Min ($)</label>
          <input
            className={inputCls}
            placeholder="e.g. 1000"
            value={form.salaryMin}
            onChange={(e) => set("salaryMin", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Salary Max ($)</label>
          <input
            className={inputCls}
            placeholder="e.g. 2000"
            value={form.salaryMax}
            onChange={(e) => set("salaryMax", e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className={labelCls}>Job Description</label>
          <textarea
            className={`${inputCls} min-h-[120px] resize-y`}
            placeholder="Describe the role and responsibilities..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Requirements */}
        <div className="col-span-2">
          <label className={labelCls}>Requirements & Skills</label>
          <textarea
            className={`${inputCls} min-h-[100px] resize-y`}
            placeholder="List required skills and qualifications..."
            value={form.requirements}
            onChange={(e) => set("requirements", e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-8">
        <button
          disabled={loading}
          onClick={() => handleSubmit("Active")}
          className="flex-1 py-3 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : isEdit ? "Update & Publish" : "Publish Job"}
        </button>
        <button
          disabled={loading}
          onClick={() => handleSubmit("Draft")}
          className="flex-1 py-3 text-sm font-semibold text-gray-700 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-60"
        >
          Save as Draft
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 text-sm font-semibold text-gray-500 transition-colors border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}