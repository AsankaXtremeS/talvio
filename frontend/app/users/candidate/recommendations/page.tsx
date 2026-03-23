"use client";

import { useAuth } from "@/context/AuthContext";

export default function CandidateRecommendationsPage() {
  const { user } = useAuth();
  const isProfessional = user?.role === "PROFESSIONAL";

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">
        {isProfessional ? "Jobs" : "Internships"}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {isProfessional
          ? "Professional users can explore job opportunities here."
          : "Undergraduate users can explore internship opportunities here."}
      </p>
    </section>
  );
}
