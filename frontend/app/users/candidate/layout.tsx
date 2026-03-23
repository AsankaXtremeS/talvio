"use client";

import StudentProfessionalShell from "@/components/users/StudentProfessionalShell";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentProfessionalShell>{children}</StudentProfessionalShell>;
}
