"use client";

import { useState, useRef } from "react";
import { FileText, Trash2, RefreshCcw, FileUp, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

interface ResumeCardProps {
  cvUrl?: string;
  cvFileName?: string;
  updatedAt?: string;
  onUploadSuccess: (res: any) => void;
  onUploadError: (error: string) => void;
  onRemove: () => void;
}

export default function ResumeCard({
  cvUrl,
  cvFileName,
  updatedAt,
  onUploadSuccess,
  onUploadError,
  onRemove,
}: ResumeCardProps) {
  const hasResume = !!cvUrl;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { startUpload, isUploading } = useUploadThing("pdfUploader", {
    onClientUploadComplete: (res) => {
      onUploadSuccess(res);
    },
    onUploadError: (error) => {
      onUploadError(error.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await startUpload([file]);
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E4E8F2] bg-white p-6 shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#374151] flex items-center gap-2">
            <FileText size={22} className="text-[#4F46E5]" />
            Professional Resume
          </h2>
          <p className="text-sm text-[#6B7280]">
            Manage your default CV for applications and AI-driven recommendations.
          </p>
        </div>
      </div>

      {!hasResume ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E4E8F2] bg-[#F9FAFF] p-10 text-center transition-colors hover:bg-[#F3F6FF]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5]">
            <FileUp size={32} />
          </div>
          <h3 className="mb-2 text-lg font-bold text-[#374151]">Add your Resume</h3>
          <p className="mb-6 max-w-sm text-sm text-[#6B7280]">
            Upload your CV in PDF format to showcase your skills and experience to potential employers.
          </p>
          <button
            onClick={triggerUpload}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold h-11 px-10 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FileUp size={18} />
                <span>Upload Resume</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-[#E4E8F2] bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
              <FileText size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#374151] truncate">
                {cvFileName || "Your_Resume.pdf"}
              </p>
              {updatedAt && (
                <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                  Last updated: {new Date(updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#4F46E5] transition-all"
              title="View PDF"
            >
              <FileUp size={20} className="rotate-180" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={triggerUpload}
              disabled={isUploading}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold h-11 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCcw size={16} />
                  <span>Update Resume</span>
                </>
              )}
            </button>
            <button
              onClick={onRemove}
              disabled={isUploading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#FEE2E2] bg-white px-5 h-11 text-sm font-semibold text-[#EF4444] transition-all hover:bg-[#FEF2F2] hover:border-[#EF4444] active:scale-[0.98] disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
