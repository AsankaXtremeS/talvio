"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Globe,
  Github,
  Linkedin,
  FileText,
  CalendarPlus,
  Briefcase,
  CheckCircle2,
  Star,
  Loader2,
  AlertTriangle,
  Download,
  Eye,
  Clock,
  CheckCheck,
} from "lucide-react";
import { getCandidateById, markReviewed, markShortlisted } from "@/lib/employer/candidates.service";
import { getAvatarGradient } from "@/lib/employer/candidates.service";
import { FullCandidateProfile } from "@/types/candidate/candidate.types";

interface Props {
  params: Promise<{ candidateId: string }>;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:     { label: "Pending",     color: "#92400E", bg: "#FFFBEB", border: "#FCD34D" },
  REVIEWED:    { label: "Reviewed",    color: "#4F46E5", bg: "#EEF2FF", border: "#A5B4FC" },
  SHORTLISTED: { label: "Shortlisted", color: "#059669", bg: "#ECFDF5", border: "#6EE7B7" },
  REJECTED:    { label: "Rejected",    color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
  HIRED:       { label: "Hired",       color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD" },
};

export default function CandidateProfilePage({ params }: Props) {
  const { candidateId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId"); // optional context

  const [candidate, setCandidate] = useState<FullCandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getCandidateById(candidateId)
      .then((data) => {
        if (!mounted) return;
        if (!data) {
          setError("Candidate not found.");
        } else {
          setCandidate(data);
          setAppStatus(data.applicationStatus ?? null);
          setIsReviewed(data.isReviewed ?? false);
          setIsShortlisted(data.isShortlisted ?? false);
        }
      })
      .catch(() => {
        if (mounted) setError("Failed to load candidate profile. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [candidateId]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleMarkReviewed = async () => {
    if (!postId) {
      showToast("No job post context — open this profile from a job post's candidates page.", false);
      return;
    }
    setStatusLoading("REVIEWED");
    try {
      const result = await markReviewed(postId, candidateId);
      if (result) {
        setIsReviewed(result.isReviewed);
        setIsShortlisted(result.isShortlisted);
        setAppStatus(result.applicationStatus);
        showToast("Marked as Reviewed ✓", true);
      } else {
        showToast("Failed to update. Please try again.", false);
      }
    } finally {
      setStatusLoading(null);
    }
  };

  const handleMarkShortlisted = async () => {
    if (!postId) {
      showToast("No job post context — open this profile from a job post's candidates page.", false);
      return;
    }
    setStatusLoading("SHORTLISTED");
    try {
      const result = await markShortlisted(postId, candidateId);
      if (result) {
        setIsReviewed(result.isReviewed);
        setIsShortlisted(result.isShortlisted);
        setAppStatus(result.applicationStatus);
        showToast("Candidate Shortlisted ★", true);
      } else {
        showToast("Failed to shortlist. Please try again.", false);
      }
    } finally {
      setStatusLoading(null);
    }
  };

  const grad = getAvatarGradient(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-[#4F46E5]" />
          <p className="text-sm font-medium text-[#94A3B8]">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8 bg-white rounded-2xl border border-[#E8EBF4] shadow-sm max-w-sm">
          <AlertTriangle size={36} className="text-amber-400" />
          <p className="text-base font-semibold text-[#0F172A]">{error || "Candidate not found"}</p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-[#4F46E5] hover:underline"
          >
            <ArrowLeft size={15} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasAvatar = !!candidate.avatarUrl && !imgError;
  const initial = candidate.initial || candidate.name.charAt(0).toUpperCase();
  const currentMeta = STATUS_META[appStatus ?? "PENDING"] ?? STATUS_META["PENDING"];
  const cvToShow = candidate.applicationCvUrl || candidate.cvUrl;

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* ── Toast notification ─────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[13px] font-semibold border transition-all ${
            toast.ok
              ? "bg-[#ECFDF5] border-[#6EE7B7] text-[#059669]"
              : "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]"
          }`}
        >
          {toast.ok ? <CheckCheck size={15} /> : <AlertTriangle size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* ── Back button ────────────────────────────────────────────────────── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-1.5 text-[12.5px] font-medium text-[#64748B] bg-white border border-[#E8EBF4] rounded-lg hover:bg-[#F8FAFF] hover:text-[#0F172A] transition-colors mb-4 shadow-sm"
        >
          <ArrowLeft size={14} />
          Back to Candidates
        </button>

        {/* ── Hero card ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E8EBF4] shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar */}
              <div className="shrink-0">
                {hasAvatar ? (
                  <Image
                    src={candidate.avatarUrl!}
                    alt={candidate.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-[#E8EBF4] shadow-md"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div
                    className="h-20 w-20 rounded-2xl border-2 border-[#E8EBF4] shadow-md flex items-center justify-center text-[28px] font-black text-white"
                    style={{ background: grad }}
                  >
                    {initial}
                  </div>
                )}
              </div>

              {/* Identity + status badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-[21px] font-bold text-[#0F172A] leading-snug truncate">
                      {candidate.name}
                    </h1>
                    <p className="text-[13px] font-medium text-[#4F46E5] mt-0.5 truncate">
                      {candidate.role || "Applicant"}
                    </p>
                    {candidate.location && (
                      <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#64748B]">
                        <MapPin size={11} strokeWidth={2} />
                        {candidate.location}
                      </div>
                    )}
                  </div>

                  {/* Application status badge */}
                  <div
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-bold shrink-0 mt-0.5"
                    style={{
                      background: currentMeta.bg,
                      borderColor: currentMeta.border,
                      color: currentMeta.color,
                    }}
                  >
                    <Clock size={11} strokeWidth={2.5} />
                    {currentMeta.label}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Action bar ────────────────────────────────────────────────── */}
            <div className="mt-4 pt-4 border-t border-[#F1F3F9] flex flex-wrap gap-2.5 items-center">
              {/* CV button */}
              {cvToShow ? (
                <a
                  href={cvToShow}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold text-white bg-[#0F172A] rounded-xl hover:bg-[#1E293B] transition-colors shadow-sm"
                >
                  <Eye size={14} strokeWidth={2} />
                  View CV / Resume
                </a>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-medium text-[#94A3B8] bg-[#F8FAFF] border border-[#E8EBF4] rounded-xl cursor-not-allowed">
                  <FileText size={14} strokeWidth={2} />
                  No CV uploaded
                </span>
              )}

              {/* Mark as Reviewed — independent boolean */}
              <button
                onClick={handleMarkReviewed}
                disabled={!!statusLoading || isReviewed}
                className={`flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold rounded-xl border transition-colors disabled:cursor-not-allowed ${
                  isReviewed
                    ? "text-[#4F46E5] border-[#A5B4FC] bg-[#EEF2FF] opacity-80"
                    : "text-[#4F46E5] border-[#C7D2FE] bg-[#EEF2FF] hover:bg-[#E0E7FF]"
                }`}
              >
                {statusLoading === "REVIEWED" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} strokeWidth={2} />
                )}
                {isReviewed ? "Reviewed ✓" : "Mark Reviewed"}
              </button>

              {/* Shortlist — independent boolean */}
              <button
                onClick={handleMarkShortlisted}
                disabled={!!statusLoading || isShortlisted}
                className={`flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold rounded-xl border transition-colors disabled:cursor-not-allowed ${
                  isShortlisted
                    ? "text-[#059669] border-[#6EE7B7] bg-[#ECFDF5] opacity-80"
                    : "text-[#059669] border-[#6EE7B7] bg-[#ECFDF5] hover:bg-[#D1FAE5]"
                }`}
              >
                {statusLoading === "SHORTLISTED" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Star size={14} strokeWidth={2} />
                )}
                {isShortlisted ? "Shortlisted ★" : "Shortlist"}
              </button>
            </div>
          </div>
        </div>

        {/* ── No-postId warning ──────────────────────────────────────────────── */}
        {!postId && (
          <div className="mt-3 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              Review &amp; Shortlist buttons require a job post context. Open this profile from a
              specific job post has candidates list to enable those actions.
            </span>
          </div>
        )}

        {/* ── Main content grid ───────────────────────────────────────────────── */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5 pb-10">

          {/* Left column */}
          <div className="space-y-5">

            {/* Contact */}
            <section className="bg-white rounded-2xl border border-[#E8EBF4] shadow-sm p-5">
              <h2 className="text-[11.5px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3.5">Contact</h2>
              <div className="space-y-3">
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-3 text-[13px] text-[#475569] hover:text-[#4F46E5] transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 group-hover:bg-[#E0E7FF] transition-colors">
                    <Mail size={14} className="text-[#4F46E5]" />
                  </div>
                  <span className="truncate">{candidate.email}</span>
                </a>

                {candidate.linkedinUrl && (
                  <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[13px] text-[#475569] hover:text-[#0077B5] transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                      <Linkedin size={14} className="text-[#0077B5]" />
                    </div>
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}

                {candidate.githubUrl && (
                  <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[13px] text-[#475569] hover:text-[#0F172A] transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
                      <Github size={14} className="text-[#0F172A]" />
                    </div>
                    <span className="truncate">GitHub</span>
                  </a>
                )}

                {candidate.portfolioUrl && (
                  <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[13px] text-[#475569] hover:text-[#059669] transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                      <Globe size={14} className="text-[#059669]" />
                    </div>
                    <span className="truncate">Portfolio</span>
                  </a>
                )}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-white rounded-2xl border border-[#E8EBF4] shadow-sm p-5">
              <h2 className="text-[11.5px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3.5">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Briefcase size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#94A3B8] font-medium">Experience</p>
                    <p className="text-[13px] text-[#0F172A] font-semibold">{candidate.experience}</p>
                  </div>
                </div>

                {candidate.matchScore > 0 && (
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background:
                          candidate.matchScore >= 90 ? "#ECFDF5"
                          : candidate.matchScore >= 75 ? "#EEF2FF"
                          : "#FFFBEB",
                      }}
                    >
                      <span
                        className="text-[10px] font-black"
                        style={{
                          color:
                            candidate.matchScore >= 90 ? "#059669"
                            : candidate.matchScore >= 75 ? "#4F46E5"
                            : "#B45309",
                        }}
                      >
                        {candidate.matchScore}%
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-medium">AI Match Score</p>
                      <p className="text-[13px] font-semibold" style={{
                        color:
                          candidate.matchScore >= 90 ? "#059669"
                          : candidate.matchScore >= 75 ? "#4F46E5"
                          : "#B45309",
                      }}>
                        {candidate.matchScore}% Match
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* CV download card */}
            {cvToShow && (
              <section className="bg-white rounded-2xl border border-[#E8EBF4] shadow-sm p-5">
                <h2 className="text-[11.5px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Resume / CV</h2>
                <div className="space-y-2">
                  <a
                    href={cvToShow}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] hover:bg-[#EEF2FF] hover:border-[#C7D2FE] transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 group-hover:bg-[#E0E7FF] transition-colors">
                      <Eye size={16} className="text-[#4F46E5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-[#0F172A]">View CV</p>
                      <p className="text-[11px] text-[#94A3B8] truncate">Opens in new tab</p>
                    </div>
                  </a>
                  <a
                    href={cvToShow}
                    download
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E0E7FF] bg-[#F8FAFF] hover:bg-[#EEF2FF] hover:border-[#C7D2FE] transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 group-hover:bg-[#E0E7FF] transition-colors">
                      <Download size={16} className="text-[#4F46E5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-[#0F172A]">Download CV</p>
                    </div>
                  </a>
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            <section className="bg-white rounded-2xl border border-[#E8EBF4] shadow-sm p-5">
              <h2 className="text-[11.5px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">About</h2>
              {candidate.bio ? (
                <p className="text-[13.5px] text-[#475569] leading-relaxed whitespace-pre-line">{candidate.bio}</p>
              ) : (
                <p className="text-[13px] text-[#ADADAD] italic">No bio provided.</p>
              )}
            </section>

            {/* Skills */}
            <section className="bg-white rounded-2xl border border-[#E8EBF4] shadow-sm p-5">
              <h2 className="text-[11.5px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3.5">Skills</h2>
              {candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-[#E0E7FF] bg-[#EEF2FF] px-2.5 py-1 text-[12px] font-medium text-[#4F46E5]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#ADADAD] italic">No skills listed.</p>
              )}
            </section>

            {/* CTA banner */}
            <section className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold text-[15px]">Ready to interview {candidate.name}?</p>
                <p className="text-indigo-200 text-[12.5px] mt-0.5">
                  Schedule an interview and send an invitation email instantly.
                </p>
              </div>
              <button
                onClick={() => {
                  const url = postId
                    ? `/users/employer/job-posts/${postId}/candidates/${candidateId}/schedule`
                    : `/users/employer/candidates/${candidateId}/schedule`;
                  router.push(url);
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-[#4F46E5] bg-white rounded-xl shadow-md hover:bg-indigo-50 transition-colors shrink-0"
              >
                <CalendarPlus size={15} strokeWidth={2} />
                Schedule Interview
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
