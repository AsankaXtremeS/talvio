"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/auth.service";
import { getRoleHomeRoute } from "@/lib/roleRoutes";

export default function CandidateSettingsPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      setMessage(null);
      const { user: updatedUser } = await authService.updateMyRole("PROFESSIONAL");
      setUser(updatedUser);
      router.replace(getRoleHomeRoute(updatedUser.role));
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Failed to update status.");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <RoleGate allowedRoles={["STUDENT", "PROFESSIONAL"]}>
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Candidate Settings</h1>
        <div className="mt-4 space-y-1 text-sm text-gray-700">
          <p>Name: {fullName || "Not set"}</p>
          <p>Email: {user?.email || "-"}</p>
          <p>Status: {user?.role === "STUDENT" ? "Undergraduate" : "Professional"}</p>
        </div>

        {user?.role === "STUDENT" ? (
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <h2 className="text-sm font-semibold text-indigo-800">Upgrade status to Professional</h2>
            <p className="mt-1 text-xs text-indigo-700">
              This will switch your candidate account from internship-focused to jobs-focused mode.
            </p>
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isUpgrading ? "Updating..." : "Switch to Professional"}
            </button>
            {message && <p className="mt-2 text-xs text-red-600">{message}</p>}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
            Your account is already in Professional status.
          </div>
        )}
      </section>
    </RoleGate>
  );
}
