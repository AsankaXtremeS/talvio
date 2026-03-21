// components/admin/layout/Popup.tsx

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface PopupProps {
  open: boolean;
  message: string;
  onClose: () => void;
  success?: boolean;
}

const Popup: React.FC<PopupProps> = ({ open, message, onClose, success }) => {
  // Auto-close after 4s on success
  useEffect(() => {
    if (open && success) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [open, success, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4"
        style={{ boxShadow: "0 8px 40px rgba(99,91,255,0.13)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm"
        >
          <X size={15} strokeWidth={2.5} />
        </button>

        {/* Icon */}
        <div
          className={`flex items-center justify-center w-16 h-16 rounded-full ${
            success ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {success ? (
            <CheckCircle2
              size={36}
              strokeWidth={1.8}
              className="text-green-500"
            />
          ) : (
            <XCircle
              size={36}
              strokeWidth={1.8}
              className="text-red-500"
            />
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-lg font-bold tracking-tight ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {success ? "Success!" : "Something went wrong"}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-500 text-center leading-relaxed">
          {message}
        </p>

        {/* Progress bar (success auto-close indicator) */}
        {success && (
          <div className="w-full h-1 bg-green-100 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-green-400 rounded-full"
              style={{
                animation: "shrink 4s linear forwards",
              }}
            />
          </div>
        )}

        {/* Action button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-px active:translate-y-0 ${
            success
              ? "bg-linear-to-r from-green-500 to-emerald-500 shadow-[0_4px_14px_rgba(34,197,94,0.35)]"
              : "bg-linear-to-r from-red-500 to-rose-500 shadow-[0_4px_14px_rgba(239,68,68,0.35)]"
          }`}
        >
          {success ? "Continue" : "Try again"}
        </button>
      </div>

      {/* Shrink keyframe */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Popup;