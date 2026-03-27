"use client";

import CandidateShell from "../../../components/users/CandidateShell";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CandidateShell>{children}</CandidateShell>;
}
