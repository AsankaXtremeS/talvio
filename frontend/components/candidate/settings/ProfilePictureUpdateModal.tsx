"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Camera } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import { profileService } from "@/lib/candidate/profile.service";

interface ProfilePictureUpdateModalProps {
  onClose: () => void;
  onSave: (url: string) => void;
}

export default function ProfilePictureUpdateModal({
  onClose,
  onSave,
}: ProfilePictureUpdateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  //Handles the closing of the modal when the overlay is clicked
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0] shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#111827]">Update Profile Picture</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Choose a photo or drag and drop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F5F5F5] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <UploadDropzone                 
            endpoint="imageUploader"
            onClientUploadComplete={async (res) => {
              if (res && res[0]) {
                const url = res[0].ufsUrl || res[0].url;
                setLoading(true);
                try {
                  await profileService.updateProfile({ profilePictureUrl: url });
                  onSave(url);
                  onClose();
                } catch (err: any) {
                  setError(err.message || "Failed to update profile picture.");
                } finally {
                  setLoading(false);
                }
              }
            }}
            onUploadError={(error: Error) => {
              setError(error.message);
            }}
            appearance={{
                container: "border-2 border-dashed border-[#E4E8F2] bg-[#F9FAFF] rounded-xl hover:bg-[#F3F6FF] transition-colors cursor-pointer p-8",
                label: "text-[#4F46E5] font-semibold hover:text-[#4338CA]",
                allowedContent: "text-[#6B7280] text-xs mt-2",
                button: "bg-[#4F46E5] ut-ready:bg-[#4F46E5] ut-uploading:cursor-not-allowed rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#4338CA] focus-within:ring-2 focus-within:ring-[#4F46E5] focus-within:ring-offset-2",
            }}
            content={{                                  // override the default text labels
                label: "Choose a photo",
                allowedContent: "Image (Max 4MB)",
            }}
          />
          {error && (
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          )}
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating profile...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F0F0] shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-[#E4E8F2] text-sm text-[#374151] hover:bg-[#F5F5F5] transition"
            >
              Cancel
            </button>
        </div>
      </div>
    </div>
  );
}
