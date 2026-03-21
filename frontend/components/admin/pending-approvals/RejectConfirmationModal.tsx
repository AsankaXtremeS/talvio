import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface RejectConfirmationModalProps {
  isOpen: boolean;
  companyName: string;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function RejectConfirmationModal({
  isOpen,
  companyName,
  onCancel,
  onConfirm,
}: RejectConfirmationModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setReason("");
    onCancel();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reject Company Approval</h3>
            <p className="mt-1 text-sm text-gray-500">
              You are about to reject <span className="font-medium text-gray-700">{companyName}</span>.
            </p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Rejection reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add a note for why this company was rejected..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
