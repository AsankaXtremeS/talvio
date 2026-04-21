"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CircleCheck, Clock3, Globe2, Link2, MapPin, X } from "lucide-react";
import { mapInterviewToItem } from "@/components/candidate/interviews/types";
import { candidateInterviewsService } from "@/lib/candidate/interviews.service";

type InterviewDetailsViewProps = {
  interviewId: string;
};

export default function InterviewDetailsView({ interviewId }: InterviewDetailsViewProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["candidate-interview", interviewId],
    queryFn: () => candidateInterviewsService.getInterviewById(interviewId),
    enabled: Boolean(interviewId),
    staleTime: 30000,
  });

  const interview = data ? mapInterviewToItem(data) : null;

  const formattedTime = useMemo(() => {
    if (!interview) return "";
    const date = new Date(interview.scheduledAt);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(date);
  }, [interview]);

  if (isLoading) {
    return (
      <section className="p-6">
        <div className="rounded-2xl border border-[#DEE3EE] bg-white p-6">
          <p className="text-base font-semibold text-[#0F172A]">Loading interview details...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="p-6">
        <div className="rounded-2xl border border-[#DEE3EE] bg-white p-6">
          <p className="text-base font-semibold text-[#0F172A]">
            {(error as Error)?.message || "Failed to load interview details."}
          </p>
          <Link
            href="/users/candidate/interviews"
            className="mt-3 inline-flex rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Interview List
          </Link>
        </div>
      </section>
    );
  }

  if (!interview) {
    return (
      <section className="p-6">
        <div className="rounded-2xl border border-[#DEE3EE] bg-white p-6">
          <p className="text-base font-semibold text-[#0F172A]">Interview not found.</p>
          <Link
            href="/users/candidate/interviews"
            className="mt-3 inline-flex rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Interview List
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 md:p-5">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#DDE5F3] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] md:p-4">
        <div className="rounded-2xl border border-[#E3EAF3] bg-[#F8FAFD] p-3 md:p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DCE6F6] bg-[#EEF3FF] text-base font-bold text-[#4F46E5]">
                {interview.company.charAt(0)}
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{interview.title}</h1>
                <p className="text-base font-semibold text-indigo-500 md:text-lg">
                  {interview.company} - {interview.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-[#9FE0B7] bg-[#E8FAEF] px-4 py-1.5 text-sm font-semibold text-[#1FA55B]">
                {interview.status}
              </span>
              <Link
                href="/users/candidate/interviews"
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#CBD5E1] text-[#64748B] transition-colors hover:bg-[#EEF2F7]"
              >
                <X size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-medium text-sky-700">
              {interview.workMode}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-medium text-sky-700">
              {interview.jobType}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-medium text-sky-700">
              {interview.stipend}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-medium text-sky-700">
              {interview.duration}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <section className="rounded-2xl border border-[#E3EAF3] bg-[#F8FAFD] p-4">
            <h2 className="mb-3 text-xl font-bold text-gray-800">Interview Schedule</h2>
            <div className="space-y-2.5 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <CalendarClock size={16} className="text-[#64748B]" />
                {formattedTime}
              </p>
              <p className="flex items-center gap-2">
                <Clock3 size={16} className="text-[#64748B]" />
                {interview.scheduledLabel} ({interview.timezone})
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-[#64748B]" />
                {interview.location}
              </p>
              <p className="flex items-center gap-2">
                <Globe2 size={16} className="text-[#64748B]" />
                {interview.meetingLabel}
              </p>
            </div>

            {interview.meetingUrl ? (
              <a
                href={interview.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#4338CA]"
              >
                <Link2 size={14} />
                Join interview meeting
              </a>
            ) : (
              <p className="mt-4 text-xs font-medium text-slate-500">Meeting link will be shared by the company.</p>
            )}
          </section>

          <section className="rounded-2xl border border-[#E3EAF3] bg-[#F8FAFD] p-4">
            <h2 className="mb-3 text-xl font-bold text-gray-800">Company</h2>
            <h3 className="text-3xl font-bold text-indigo-500">{interview.company}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-gray-700">{interview.companyDescription}</p>
            {interview.companyProfileUrl && (
              <a
                href={interview.companyProfileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-indigo-500 hover:underline"
              >
                Visit company profile
              </a>
            )}
          </section>
        </div>

        <section className="mt-3 rounded-2xl border border-[#E3EAF3] bg-[#F8FAFD] p-4">
          <h2 className="text-xl font-bold text-gray-800">About the Role</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-gray-700">{interview.roleOverview}</p>

          <h3 className="mt-4 text-xl font-bold text-gray-800">Responsibilities</h3>
          <ul className="mt-2.5 space-y-2">
            {interview.responsibilities.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <CircleCheck size={16} className="mt-0.5 text-[#2563EB]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
