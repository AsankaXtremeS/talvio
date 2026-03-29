"use client";
import { use, useEffect, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  Code2,
  Clock3,
  GraduationCap,
  Building2,
  Info,
  ListChecks,
  MapPin,
} from "lucide-react";
import { getJobPostById } from "@/lib/employer/jobPosts.service";
import { JobPost } from "@/types/employer/jobPost.types";

interface Props {
  params: Promise<{ postId: string }>;
}

const buildExtrasStorageKey = (id: string) => `employerJobPostExtras:${id}`;

type LocalExtras = {
  requirements?: string;
  responsibilities?: string;
  additionalInformation?: string;
  skills?: string;
};

export default function JobPostDetailPage({ params }: Props) {
  const { postId } = use(params);

  const [post, setPost] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getJobPostById(postId);
        const rawExtras = localStorage.getItem(buildExtrasStorageKey(data.id));
        let merged = data;

        if (rawExtras) {
          try {
            const extras = JSON.parse(rawExtras) as LocalExtras;
            merged = {
              ...data,
              requirements: data.requirements || extras.requirements || "",
              responsibilities: data.responsibilities || extras.responsibilities || "",
              additionalInformation: data.additionalInformation || extras.additionalInformation || "",
              skills:
                data.skills && data.skills.length > 0
                  ? data.skills
                  : (extras.skills || "")
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean),
            };
          } catch {
            // Ignore invalid stored extras and use fetched payload.
          }
        }

        if (isMounted) {
          setPost(merged);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load job post.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading job post...</div>;
  }

  if (error || !post) {
    return <div className="p-8 text-sm text-red-500">{error || "Job post not found."}</div>;
  }

  const closingDateLabel = post.closingDate
    ? new Date(`${post.closingDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not specified";
  const createdDateLabel = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";
  const updatedDateLabel = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";
  const skillsList = post.skills ?? [];

  return (
    <div className="h-full overflow-y-auto bg-[#EEF4FB] p-4 md:p-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white px-8 py-8 shadow-sm md:px-12 md:py-10">
        <header className="mb-6">
          <h1 className="text-[22px] font-bold text-black">{post.title}</h1>
          <p className="mt-1 text-[14px] text-blue-600">
            Published job post details.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] font-medium">
            <span className="rounded-full bg-blue-600 px-4 py-1.5 text-white">
              {post.type || "-"}
            </span>
            <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-white">
              {post.status || "-"}
            </span>
            {post.location ? (
              <>
                <span className="mx-1 text-gray-400">|</span>
                <div className="flex items-center text-gray-700">
                  <MapPin size={16} className="mr-1" />
                  {post.location}
                </div>
              </>
            ) : null}
          </div>
        </header>

        <hr className="mb-6 border-gray-100" />

        <div className="mb-6 grid grid-cols-1 gap-3 text-[14px] text-gray-700 md:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
            <Building2 size={15} className="text-gray-500" />
            <span>Company: {post.companyName || "Not available"}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
            <CalendarDays size={15} className="text-gray-500" />
            <span>Closing Date: {closingDateLabel}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
            <Clock3 size={15} className="text-gray-500" />
            <span>Created: {createdDateLabel}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
            <Clock3 size={15} className="text-gray-500" />
            <span>Updated: {updatedDateLabel}</span>
          </div>
        </div>

        <div className="space-y-5">
          {post.description && (
            <section>
              <div className="mb-1.5 flex items-center gap-2 text-gray-800">
                <Briefcase size={15} className="text-gray-700" />
                <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Job Description</h2>
              </div>
              <p className="text-[14px] leading-7 text-gray-700">{post.description}</p>
            </section>
          )}
          {post.responsibilities && (
            <section>
              <div className="mb-1.5 flex items-center gap-2 text-gray-800">
                <ListChecks size={15} className="text-gray-700" />
                <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Responsibilities</h2>
              </div>
              <p className="text-[14px] leading-7 text-gray-700">{post.responsibilities}</p>
            </section>
          )}
          {post.requirements && (
            <section>
              <div className="mb-1.5 flex items-center gap-2 text-gray-800">
                <GraduationCap size={15} className="text-gray-700" />
                <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Qualifications</h2>
              </div>
              <p className="text-[14px] leading-7 text-gray-700">{post.requirements}</p>
            </section>
          )}
          {post.additionalInformation && (
            <section>
              <div className="mb-1.5 flex items-center gap-2 text-gray-800">
                <Info size={15} className="text-gray-700" />
                <h2 className="text-[13px] font-semibold tracking-wide text-gray-700">Additional Information</h2>
              </div>
              <p className="text-[14px] leading-7 text-gray-700">{post.additionalInformation}</p>
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
      </div>
    </div>
  );
}
