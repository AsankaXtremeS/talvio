"use client";

import { Github, Linkedin } from "lucide-react";

interface ContactInfoCardProps {
  githubUrl?: string;
  linkedinUrl?: string;
}

function extractLabel(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export default function ContactInfoCard({ githubUrl, linkedinUrl }: ContactInfoCardProps) {
  return (
    <section>
      <h2 className="mb-2.5 text-lg font-bold text-[#374151]">Contact Info</h2>
      <div className="space-y-3 rounded-2xl border border-[#E4E8F2] bg-white p-3 shadow-sm">
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[#E4E8F2] px-3 py-2.5 hover:bg-[#F8FAFF]"
          >
            <Github size={20} className="text-[#111827]" />
            <span className="text-xs font-medium text-[#2563EB] md:text-sm">{extractLabel(githubUrl)}</span>
          </a>
        )}

        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[#E4E8F2] px-3 py-2.5 hover:bg-[#F8FAFF]"
          >
            <Linkedin size={20} className="text-[#0A66C2]" />
            <span className="text-xs font-medium text-[#2563EB] md:text-sm">{extractLabel(linkedinUrl)}</span>
          </a>
        )}
      </div>
    </section>
  );
}
