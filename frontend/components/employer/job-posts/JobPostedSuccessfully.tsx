"use client";

import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPost: () => void;
}

export default function JobPostedSuccessfully({
  isOpen,
  onClose,
  onViewPost,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm p-8 text-center duration-200 bg-white shadow-xl rounded-2xl animate-in fade-in zoom-in">

        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-green-600 bg-green-100 rounded-full">
          <CheckCircle2 size={32} />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Job Posted Successfully!
        </h2>

        <p className="mb-6 text-gray-500">
          Your job has been successfully posted and is now visible to candidates.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onViewPost}
            className="w-full py-3 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            View Post
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}