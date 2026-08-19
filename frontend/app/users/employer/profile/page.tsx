"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  CalendarDays,
  ExternalLink,
  Globe,
  Pencil,
  Users,
  CheckCircle2,
  AlertCircle,
  Unlink,
} from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaXTwitter, FaGoogle } from "react-icons/fa6";
import { profileService, EmployerProfileDTO } from "@/lib/employer/profile.service";
import { getJobPosts } from "@/lib/employer/jobPosts.service";
import type { JobPost } from "@/types/employer/jobPost.types";
import { useSearchParams, useRouter } from "next/navigation";

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState<EmployerProfileDTO | null>(null);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile();
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load profile.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle Google OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    if (code && profile && !profile.googleCalendarConnected) {
      const connect = async () => {
        setIsConnecting(true);
        try {
          const updated = await profileService.connectCalendar(code);
          setProfile(updated);
          // Clean up URL
          router.replace("/users/employer/profile");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to connect Google Calendar.");
        } finally {
          setIsConnecting(false);
        }
      };
      connect();
    }
  }, [searchParams, profile, router]);

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      try {
        const jobs = await getJobPosts();
        if (!cancelled) {
          setJobPosts(jobs.sort((a, b) => {
            const aDate = new Date(a.updatedAt ?? a.createdAt ?? "").getTime();
            const bDate = new Date(b.updatedAt ?? b.createdAt ?? "").getTime();
            return bDate - aDate;
          }));
        }
      } catch (err) {
        if (!cancelled) setJobsError(err instanceof Error ? err.message : "Unable to load job openings.");
      } finally {
        if (!cancelled) setIsJobsLoading(false);
      }
    };

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnectCalendar = async () => {
    try {
      setIsConnecting(true);
      const { url } = await profileService.getCalendarAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError("Failed to start Google connection flow.");
      setIsConnecting(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!confirm("Are you sure you want to disconnect your Google Calendar? Auto-generation of Meet links will stop working.")) return;
    
    try {
      setIsConnecting(true);
      const updated = await profileService.disconnectCalendar();
      setProfile(updated);
    } catch (err) {
      setError("Failed to disconnect Google Calendar.");
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#eef5ff] px-4 pb-4 pt-0 sm:px-6">
        <div className="mx-auto max-w-305 rounded-[28px] border border-[#dbe7ff] bg-white p-6">
          <div className="h-8 w-60 rounded-xl bg-gray-200" />
          <div className="mt-6 h-72 rounded-3xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#eef5ff] px-4 pb-4 pt-0 sm:px-6">
        <div className="mx-auto max-w-305 rounded-[28px] border border-[#dbe7ff] bg-white p-6">
          <p className="text-sm text-red-600">{error || "Employer profile not found."}</p>
        </div>
      </div>
    );
  }

  const companyInitial = profile.companyName.slice(0, 1).toUpperCase();
  const websiteUrl = profile.companyWebsite || "#";
  const recentJobs = jobPosts.slice(0, 2);

  const formatPostedAt = (job: JobPost) => {
    const raw = job.updatedAt ?? job.createdAt;
    if (!raw) return "Posted recently";
    return `Posted ${new Date(raw).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`;
  };

  return (
    <div className="min-h-screen bg-[#eef5ff] px-4 pb-4 pt-0 sm:px-6">
      <div className="mx-auto max-w-305 rounded-[28px] border border-[#dbe7ff] bg-white p-6">
        <div className="flex flex-col gap-5">
          {/* Top section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="flex gap-4">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#101828] text-sm font-bold text-white">
                {profile.companyLogoUrl ? (
                  <Image
                    src={profile.companyLogoUrl}
                    alt={`${profile.companyName} logo`}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#101828] text-sm font-bold text-white">
                    {companyInitial}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
                  {profile.companyName}
                </h1>

                <p className="mt-3 max-w-2xl text-[15px] leading-8 text-[#475467]">
                  {profile.companyDescription || "No company description provided yet."}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/users/employer/profile/edit"
                    className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Page
                  </Link>

                  <a
                    href={websiteUrl}
                    target={profile.companyWebsite ? "_blank" : undefined}
                    rel={profile.companyWebsite ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 rounded-xl border border-[#3b82f6] bg-white px-6 py-3 text-sm font-semibold text-[#2563eb] transition hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {profile.companyWebsite ? "Visit us" : "No website"}
                  </a>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-100">
              {profile.coverImageUrl ? (
                <Image
                  src={profile.coverImageUrl}
                  alt={`${profile.companyName} cover`}
                  width={500}
                  height={300}
                  className="h-57.5 w-full object-cover"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-gray-100 text-4xl font-bold text-gray-400">
                  {companyInitial}
                </div>
              )}
            </div>
          </div>

          {/* Bottom section */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            {/* Left column */}
            <div className="flex flex-col gap-5 self-start">
              <div className="rounded-3xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <h2 className="mb-4 text-2xl font-bold text-[#2563eb]">Details</h2>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Website</p>
                      <p className="text-[#667085]">
                        {profile.companyWebsite || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Location</p>
                      <p className="text-[#667085]">
                        {profile.companyLocation || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Status</p>
                      <p className="text-[#667085]">{profile.verificationStatus}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 text-[#2563eb]" />
                    <div>
                      <p className="font-semibold text-[#111827]">Last updated</p>
                      <p className="text-[#667085]">
                        {new Date(profile.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Calendar Connection Card */}
              <div className="rounded-3xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-[#2563eb]">Calendar</h2>
                  <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile.googleCalendarConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${profile.googleCalendarConnected ? 'bg-green-600' : 'bg-gray-400'}`} />
                    {profile.googleCalendarConnected ? 'Connected' : 'Not Connected'}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                    <FaGoogle className={profile.googleCalendarConnected ? "text-[#4285F4]" : "text-gray-300"} size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#111827]">Google Calendar & Meet</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#667085]">
                      {profile.googleCalendarConnected 
                        ? "Automatically generate real Google Meet links for every online interview scheduled."
                        : "Connect your Google account to automatically generate official Google Meet links and sync interviews to your calendar."
                      }
                    </p>
                    
                    <button
                      onClick={profile.googleCalendarConnected ? handleDisconnectCalendar : handleConnectCalendar}
                      disabled={isConnecting}
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        profile.googleCalendarConnected
                          ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                          : "border-[#2563eb] bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isConnecting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : profile.googleCalendarConnected ? (
                        <>
                          <Unlink className="h-4 w-4" />
                          Disconnect Account
                        </>
                      ) : (
                        <>
                          <FaGoogle className="h-3.5 w-3.5" />
                          Connect Google Calendar
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {profile.googleCalendarConnected && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-[11px] text-blue-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Real Google Meet links will now be generated for all online interviews.</span>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-[#e5e7eb] p-5">
                <h2 className="mb-4 text-2xl font-bold text-[#2563eb]">Specialties</h2>
                <p className="text-[15px] leading-8 text-[#475467]">
                  Enterprise API Management, Identity & Access Management (IAM),
                  Cloud-Native Integration Platforms, Integration Platform as a Service
                  (iPaaS), Ballerina Language, Choreo, Secure Enterprise Integrations.
                </p>
              </div>

              <div className="rounded-3xl border border-[#e5e7eb] p-5">
                <h2 className="mb-4 text-2xl font-bold text-[#2563eb]">Social Links</h2>

                <div className="flex gap-3">
                  <a
                    href={profile.linkedInUrl || undefined}
                    target={profile.linkedInUrl ? "_blank" : undefined}
                    rel={profile.linkedInUrl ? "noopener noreferrer" : undefined}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition hover:scale-105 ${profile.linkedInUrl ? "bg-[#0A66C2]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    aria-disabled={!profile.linkedInUrl}
                  >
                    <FaLinkedinIn size={20} />
                  </a>

                  <a
                    href={profile.facebookUrl || undefined}
                    target={profile.facebookUrl ? "_blank" : undefined}
                    rel={profile.facebookUrl ? "noopener noreferrer" : undefined}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition hover:scale-105 ${profile.facebookUrl ? "bg-[#1877F2]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    aria-disabled={!profile.facebookUrl}
                  >
                    <FaFacebookF size={20} />
                  </a>

                  <a
                    href={profile.twitterUrl || undefined}
                    target={profile.twitterUrl ? "_blank" : undefined}
                    rel={profile.twitterUrl ? "noopener noreferrer" : undefined}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition hover:scale-105 ${profile.twitterUrl ? "bg-[#111827]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    aria-disabled={!profile.twitterUrl}
                  >
                    <FaXTwitter size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5 self-start">
              <div className="rounded-3xl border border-[#e5e7eb] bg-linear-to-b from-white to-[#fafcff] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#2563eb]">
                    Recent Job Openings
                  </h2>
                  <Link href="/users/employer/job-posts" className="text-sm font-semibold text-[#2563eb] transition hover:underline">
                    View all →
                  </Link>
                </div>

                {isJobsLoading ? (
                  <div className="rounded-2xl bg-[#f4f8ff] p-6 text-sm text-[#667085]">
                    Loading recent job openings...
                  </div>
                ) : jobsError ? (
                  <div className="rounded-2xl bg-[#fef3c7] p-6 text-sm text-[#92400e]">
                    {jobsError}
                  </div>
                ) : recentJobs.length === 0 ? (
                  <div className="rounded-2xl bg-[#f4f8ff] p-6 text-sm text-[#475467]">
                    No recent job openings yet. Create a job post to show it here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="group rounded-2xl bg-[#f4f8ff] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#edf4ff]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#111827] text-sm font-bold text-white">
                              {profile.companyLogoUrl ? (
                                <Image
                                  src={profile.companyLogoUrl}
                                  alt={`${profile.companyName} logo`}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#111827] text-sm font-bold text-white">
                                  {companyInitial}
                                </div>
                              )}
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-[#111827] transition group-hover:text-[#2563eb]">
                                {job.title}
                              </h3>
                              <p className="mt-0.5 text-sm text-[#667085]">
                                {job.type} · {job.location || "Remote/Hybrid"}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#16a34a]">
                            {job.status}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.employmentType ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-medium text-[#2563eb]">
                              {job.employmentType}
                            </span>
                          ) : null}
                          {job.workMode ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-medium text-[#0284c7]">
                              {job.workMode}
                            </span>
                          ) : null}
                          {job.closingDate ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffedd5] px-3 py-1 text-xs font-medium text-[#ea580c]">
                              Closes {new Date(job.closingDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm text-[#667085]">
                          <span className="font-medium text-[#22c55e]">
                            {job.applicantsCount ?? 0} Applicants
                          </span>
                          <span className="text-[#f4b400]">•</span>
                          <span>{formatPostedAt(job)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}