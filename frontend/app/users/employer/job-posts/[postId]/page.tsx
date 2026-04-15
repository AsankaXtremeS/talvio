"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Code2,
  Clock,
  GraduationCap,
  Building2,
  Info,
  ListChecks,
  MapPin,
  Users,
  Edit,
  Bot
} from "lucide-react";
import { getJobPostById } from "@/lib/employer/jobPosts.service";
import { JobPost } from "@/types/employer/jobPost.types";

interface Props {
  params: Promise<{
    postId: string;
  }>;
}

const buildExtrasStorageKey = (id: string) => `employerJobPostExtras:${id}`;

type LocalExtras = {
  requirements?: string;
  responsibilities?: string;
  additionalInformation?: string;
  skills?: string;
};

const parseSkillsCsv = (skills: string | undefined): string[] => {
  if (!skills) return [];

  return skills
    .split(",")
    .map((skill: string) => skill.trim())
    .filter(Boolean);
};

export default function JobPostDetailPage({ params }: Props) {
  const router = useRouter();
  const { postId } = use(params);

  // ── State ──
  const [post, setPost] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Data Fetching ──
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
                  : parseSkillsCsv(extras.skills),
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
    return (
      <div className="flex-1 min-h-screen bg-[#F4F6FB] p-8 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading job post details...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex-1 min-h-screen bg-[#F4F6FB] p-8 flex flex-col items-center justify-center gap-4">
        <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
          {error || "Job post not found."}
        </div>
        <button onClick={() => router.back()} className="text-sm text-indigo-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  // ── Formatting ──
  const closingDateLabel = post.closingDate
    ? new Date(`${post.closingDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not specified";

  const skillsList: string[] = Array.isArray(post.skills) ? post.skills : [];
  const reqList: string[] = post.requirements ? post.requirements.split("\n").filter((r: string) => r.trim() !== "") : [];
  const respList: string[] = post.responsibilities ? post.responsibilities.split("\n").filter((r: string) => r.trim() !== "") : [];

  return (
    <div className="flex-1 min-h-screen bg-[#F4F6FB] p-8 overflow-auto">
      
      {/* ── Top Navigation ── */}
      <button 
        onClick={() => router.push('/users/employer/job-posts')}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Job Posts
      </button>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              post.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
              post.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
              'bg-red-50 text-red-600 border-red-200'
            }`}>
              {post.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            Post ID: {postId} {post.companyName ? `• ${post.companyName}` : ''}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`/users/employer/job-posts/${postId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
          >
            <Edit size={16} /> Edit Job
          </button>
          {post.status !== "Draft" && (
            <button 
              onClick={() => router.push(`/users/employer/job-posts/${postId}/candidates`)}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
            >
              <Bot size={16} /> View AI Matches
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Job Content (Takes up 2/3 width) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-8">
            
            {/* Description */}
            {post.description && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-900">Job Description</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {post.description}
                </p>
              </section>
            )}

            {/* Responsibilities */}
            {respList.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <ListChecks size={18} className="text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-900">Responsibilities</h2>
                </div>
                <ul className="space-y-3">
                  {respList.map((resp, index) => (
                    <li key={index} className="flex items-start gap-3 text-[15px] text-gray-600">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Qualifications/Requirements */}
            {reqList.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-900">Qualifications & Requirements</h2>
                </div>
                <ul className="space-y-3">
                  {reqList.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-[15px] text-gray-600">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Additional Info */}
            {post.additionalInformation && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Info size={18} className="text-indigo-600" />
                  <h2 className="text-lg font-bold text-gray-900">Additional Information</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {post.additionalInformation}
                </p>
              </section>
            )}

          </div>
        </div>

        {/* ── Right Column: Metadata & Stats (Takes up 1/3 width) ── */}
        <div className="space-y-6">
          
          {/* Quick Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5">At a Glance</h3>
            
            <div className="space-y-5">
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Employment Type</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{post.employmentType || post.type || "Full-time"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Building2 size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Workplace Mode</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{post.workMode || "On site"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Location</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{post.location || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Closing Date</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{closingDateLabel}</p>
                </div>
              </div>

            </div>

            {/* Skills Section inside sidebar */}
            {skillsList.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 size={16} className="text-gray-900" />
                  <h3 className="font-bold text-gray-900">Required Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Applicant Stats Card (Only show if not Draft) */}
          {post.status !== "Draft" && (
            <div className="bg-linear-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <Users size={120} className="absolute -bottom-6 -right-6 text-white/10" />
              
              <h3 className="font-bold text-indigo-100 mb-6 relative z-10">Candidate Pipeline</h3>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div>
                  <p className="text-indigo-200 text-xs font-medium mb-1">Total Applicants</p>
                  <p className="text-3xl font-bold">{post.applicantsCount || 0}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-xs font-medium mb-1">AI Shortlisted</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </div>

              <button 
                onClick={() => router.push(`/users/employer/job-posts/${postId}/candidates`)}
                className="w-full mt-6 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors backdrop-blur-sm"
              >
                Review Pipeline →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}