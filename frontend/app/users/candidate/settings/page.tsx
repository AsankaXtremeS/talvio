"use client";

import { useMemo } from "react";
import RoleGate from "@/components/auth/RoleGate";
import {
  CandidateSettingsProfile,
  CandidateSettingsView,
} from "@/components/candidate/settings";
import { useAuth } from "@/context/AuthContext";

export default function CandidateSettingsPage() {
  const { user } = useAuth();

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const displayName = fullName || "John Dob";

  const profile = useMemo<CandidateSettingsProfile>(() => {
    return {
      fullName: displayName,
      title: user?.role === "PROFESSIONAL" ? "Frontend Engineer" : "Frontend Developer",
      location: "Ottawa, ON, Canada",
      email: user?.email || "example@example.com",
      phone: "+1123-456-7890",
      bio: "A motivated web developer with 2 years of experience in React and Next.js.",
      skills: ["JavaScript", "React", "Next.js", "HTML/CSS", "SQL"],
      githubUrl: "https://github.com/#name",
      linkedinUrl: "https://linkedin.com/#name",
      education: {
        degree: "Bachelor's of Science",
        field: "Computer Science",
        period: "2018-2022",
      },
      project: {
        company: "Shopify",
        role: "Frontend Developer",
        period: "Jun 2022-Present",
        bullets: [
          "Developed modern responsive web applications using React, Next.js, TypeScript, and Tailwind CSS.",
          "Collaborated cross-functionally with designers and backend developers to optimize performance.",
        ],
      },
      experience: {
        company: "Shopify",
        role: "Frontend Developer",
        period: "Jun 2022-Present",
      },
    };
  }, [displayName, user?.email, user?.role]);


  return (
    <RoleGate allowedRoles={["STUDENT", "PROFESSIONAL"]}>
      <CandidateSettingsView profile={profile} profileScore={75} />
    </RoleGate>
  );
}
