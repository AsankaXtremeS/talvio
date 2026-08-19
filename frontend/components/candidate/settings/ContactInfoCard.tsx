"use client";

import { useState, useRef, useEffect } from "react";
import { Github, Linkedin, SquarePen, X, Save } from "lucide-react";
import { profileService } from "@/lib/candidate/profile.service";

interface ContactInfoCardProps {
  githubUrl?: string;
  linkedinUrl?: string;
  onUpdate?: (data: { githubUrl: string; linkedinUrl: string }) => void;
}

function extractLabel(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export default function ContactInfoCard({
  githubUrl,
  linkedinUrl,
  onUpdate,
}: ContactInfoCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [github, setGithub] = useState(githubUrl ?? "");
  const [linkedin, setLinkedin] = useState(linkedinUrl ?? "");
  const [currentGithub, setCurrentGithub] = useState(githubUrl ?? "");
  const [currentLinkedin, setCurrentLinkedin] = useState(linkedinUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync internal state with props when they change
  useEffect(() => {
    setCurrentGithub(githubUrl ?? "");
    setCurrentLinkedin(linkedinUrl ?? "");
  }, [githubUrl, linkedinUrl]);

  const handleOpen = () => {
    setGithub(currentGithub);
    setLinkedin(currentLinkedin);
    setError(null);
    setEditOpen(true);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setEditOpen(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await profileService.updateProfile({
        githubUrl: github,
        linkedinUrl: linkedin,
      });
      setCurrentGithub(github);
      setCurrentLinkedin(linkedin);
      if (onUpdate) onUpdate({ githubUrl: github, linkedinUrl: linkedin });
      setEditOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to update links.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-lg font-bold text-[#374151]">Contact Info</h2>
          <button
            onClick={handleOpen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#4F46E5] px-3 py-1.5 text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF2FF] transition"
          >
            <SquarePen size={12} />
            Edit
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border border-[#E4E8F2] bg-white p-3 shadow-sm">
          {currentGithub ? (
            <a
              href={currentGithub}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[#E4E8F2] px-3 py-2.5 hover:bg-[#F8FAFF] transition"
            >
              <Github size={20} className="text-[#111827]" />
              <span className="text-xs font-medium text-[#2563EB] md:text-sm truncate">
                {extractLabel(currentGithub)}
              </span>
            </a>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#E4E8F2] px-3 py-2.5 text-[#9CA3AF]">
              <Github size={20} />
              <span className="text-xs md:text-sm">No GitHub link added</span>
            </div>
          )}

          {currentLinkedin ? (
            <a
              href={currentLinkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[#E4E8F2] px-3 py-2.5 hover:bg-[#F8FAFF] transition"
            >
              <Linkedin size={20} className="text-[#0A66C2]" />
              <span className="text-xs font-medium text-[#2563EB] md:text-sm truncate">
                {extractLabel(currentLinkedin)}
              </span>
            </a>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#E4E8F2] px-3 py-2.5 text-[#9CA3AF]">
              <Linkedin size={20} />
              <span className="text-xs md:text-sm">No LinkedIn link added</span>
            </div>
          )}
        </div>
      </section>

      {/* Edit modal */}
      {editOpen && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
              <div>
                <h2 className="text-[15px] font-semibold text-[#111827]">Edit links</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">Update your GitHub and LinkedIn URLs</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F5F5F5] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#374151] flex items-center gap-1.5">
                  <Github size={13} /> GitHub URL
                </label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/yourname"
                  className="w-full h-9 rounded-lg border border-[#E4E8F2] px-3 text-sm text-[#111827] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#374151] flex items-center gap-1.5">
                  <Linkedin size={13} /> LinkedIn URL
                </label>
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full h-9 rounded-lg border border-[#E4E8F2] px-3 text-sm text-[#111827] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#F0F0F0] flex justify-end gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="h-9 px-4 rounded-lg border border-[#E4E8F2] text-sm text-[#374151] hover:bg-[#F5F5F5] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="h-9 px-5 rounded-lg bg-blue-700 text-white text-sm font-medium flex items-center gap-2 hover:bg-blue-800 transition disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}