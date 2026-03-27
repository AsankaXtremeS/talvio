"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { consumeRedirectToast } from "@/lib/postRedirectToast";

type ToastState = {
  id: number;
  message: string;
  tone: "success" | "error";
};

export default function GlobalRedirectToast() {
  const pathname = usePathname();
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const payload = consumeRedirectToast();
      if (!payload) return;

      setToast({
        id: Date.now(),
        message: payload.message,
        tone: payload.tone ?? "success",
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toneClasses = useMemo(() => {
    if (!toast) return "";
    return toast.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";
  }, [toast]);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-100">
      {toast ? (
        <div
          className={`pointer-events-auto flex min-w-65 max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all duration-200 ease-out ${toneClasses}`}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium leading-snug">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto rounded p-0.5 opacity-70 transition hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
