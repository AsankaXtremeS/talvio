"use client";

import { useState } from "react";
import { ArrowUpCircle, CheckCircle2, ArrowRightLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProfessionalStatusCard from "./ProfessionalStatusCard";

export default function UpgradeToProfessionalCard({ onSuccess }: { onSuccess?: () => void }) {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already professional and not in success state, don't show anything
  if (user?.role === "PROFESSIONAL" && !success) {
    return null;
  }

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me/role", {        
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: "PROFESSIONAL" }),   
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to upgrade account.");
      }

      setSuccess(true);
      if (setUser && data?.user) setUser(data.user);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || "Failed to upgrade account.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <ProfessionalStatusCard />;
  }

  return (
    <section className="rounded-xl border border-[#E4E8F2] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <ArrowRightLeft className="text-blue-700 w-[18px] h-[18px]" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-[#111827] leading-tight">Upgrade to professional</h2>
          <p className="text-xs text-[#6B7280]">Student account</p>
        </div>
      </div>

      <div className="border-t border-[#F0F0F0] my-3" />

      <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
        Unlock all job features and opportunities by upgrading your account to professional status.
      </p>

      <ul className="flex flex-col gap-1.5 mb-4">
        {["Full access to job listings", "Apply directly to employers", "Priority profile visibility"].map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-[#6B7280]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-700 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="w-[14px] h-[14px] text-red-700 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full h-[38px] rounded-lg bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-800 transition disabled:opacity-60"
      >
        {loading ? (
          "Upgrading..."
        ) : (
          <>
            <ArrowUpCircle className="w-[14px] h-[14px]" />
            Upgrade now
          </>
        )}
      </button>
    </section>
  );
}