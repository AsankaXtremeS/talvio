"use client";

import { useAuth } from "@/context/AuthContext";

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const modeLabel = user?.role === "PROFESSIONAL" ? "Professional" : "Undergraduate";

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        You are currently in {modeLabel} mode.
      </p>
    </section>
  );
}
