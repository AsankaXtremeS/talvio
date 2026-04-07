"use client";

import { useState } from "react";
import { X, RefreshCw, Check, Sparkles } from "lucide-react";

interface AICoverLetterModalProps {
  jobTitle: string;
  candidateName?: string;
  onDone: (coverLetterText: string) => void;
  onClose: () => void;
}

const COVER_LETTER_1 = (jobTitle: string, name: string) => `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position. As a Computer Science undergraduate with hands-on experience in JavaScript, React, and Node.js, I am excited about the opportunity to contribute to your innovative projects.

During my academic journey, I have developed a solid foundation in software development principles, working on several full-stack projects that involved designing scalable architectures and writing clean, maintainable code. My experience with collaborative team environments and agile workflows aligns well with your engineering culture.

I am particularly drawn to this position because of the commitment to building products that improve everyday life. I am eager to learn from experienced engineers, contribute meaningfully to the team, and grow as a software professional.

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and enthusiasm can contribute to your mission.

Sincerely,
${name}`;

const COVER_LETTER_2 = (jobTitle: string, name: string) => `Dear Hiring Manager,

I am excited to apply for the ${jobTitle} role. With a background in Computer Science and practical experience building web applications using React and Node.js, I believe I can make a meaningful contribution to your engineering team.

Throughout my studies, I have cultivated a passion for solving complex problems through elegant code. I have led multiple team projects, honing my ability to collaborate effectively and deliver results under deadlines. My understanding of data structures and algorithms, combined with my enthusiasm for learning, makes me well-suited for the challenges this position presents.

Your culture of innovation and impact inspires me deeply. I am committed to bringing the same level of dedication and creativity to every task I undertake.

I would welcome the opportunity to discuss my qualifications further. Thank you for your time and consideration.

Best regards,
${name}`;

export default function AICoverLetterModal({
  jobTitle,
  candidateName = "Your Name",
  onDone,
  onClose,
}: AICoverLetterModalProps) {
  const [coverLetter, setCoverLetter] = useState(COVER_LETTER_1(jobTitle, candidateName));
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [useFirst, setUseFirst] = useState(true);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setCoverLetter("Regenerating cover letter...");

    setTimeout(() => {
      const next = useFirst
        ? COVER_LETTER_2(jobTitle, candidateName)
        : COVER_LETTER_1(jobTitle, candidateName);
      setCoverLetter(next);
      setUseFirst(!useFirst);
      setIsRegenerating(false);
    }, 1200);
  };

  const handleDone = () => {
    onDone(coverLetter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-[#DCE6F3]/56 backdrop-blur-xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1220px] items-start justify-center px-4 pt-5">
        <div className="relative w-full max-w-[620px]">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-[#C7CED9] bg-white text-slate-500 transition hover:bg-slate-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Main card */}
          <div className="relative w-full rounded-2xl border border-[#D7DEE8] bg-[#EFF6FD] p-8 shadow-[0_18px_55px_rgba(32,51,87,0.12)]">

            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                <Sparkles size={15} className="text-indigo-600" />
              </div>
              <h1 className="text-[22px] font-bold text-slate-900">
                AI Cover Letter Generator
              </h1>
            </div>
            <p className="text-[14px] text-slate-500 mb-6">
              Generating for:{" "}
              <span className="font-semibold text-indigo-600">{jobTitle}</span>
            </p>

            {/* Text area card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-semibold text-slate-500">
                  Generated Cover Letter
                </p>
                <span className="text-[11px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-semibold">
                  AI Generated
                </span>
              </div>

              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                disabled={isRegenerating}
                className={`w-full min-h-[220px] border border-[#E2E8F0] rounded-lg p-4 text-[13px] leading-relaxed resize-y bg-[#F8FAFC] font-inherit outline-none transition ${
                  isRegenerating
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-700 focus:border-indigo-300"
                }`}
              />

              <p className="text-[11px] text-slate-400 mt-2">
                You can edit the generated text above before using it.
              </p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 mb-6">
              <Check size={15} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-[12px] text-green-700 leading-relaxed">
                Cover letter generated based on your CV and the job requirements.
                Feel free to personalize it before submitting.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 h-10 px-5 border border-indigo-200 bg-white rounded-lg text-[14px] font-semibold text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  size={14}
                  className={isRegenerating ? "animate-spin" : ""}
                />
                {isRegenerating ? "Regenerating..." : "Regenerate"}
              </button>

              <button
                onClick={handleDone}
                disabled={isRegenerating}
                className="flex items-center gap-2 h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[14px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={14} />
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
