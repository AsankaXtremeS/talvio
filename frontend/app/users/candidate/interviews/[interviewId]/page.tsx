"use client";

import { useParams } from "next/navigation";
import { InterviewDetailsView } from "@/components/candidate/interviews";

export default function CandidateInterviewDetailsPage() {
  const params = useParams<{ interviewId: string }>();
  const interviewId = Array.isArray(params.interviewId)
    ? params.interviewId[0]
    : params.interviewId;

  return <InterviewDetailsView interviewId={interviewId ?? ""} />;
}
