"use client";

interface ProfileCompletionCardProps {
  score: number;
}

export default function ProfileCompletionCard({ score }: ProfileCompletionCardProps) {
  const normalized = Math.max(0, Math.min(100, score));
  const angle = (normalized / 100) * 360;

  return (
    <section className="rounded-3xl border border-[#E4E8F2] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#374151]">Profile completion</h2>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#2563EB ${angle}deg, #DCE5FF ${angle}deg)`,
          }}
        >
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white text-lg font-bold text-[#1F2937]">
            {normalized}%
          </div>
        </div>

        <div>
          <p className="text-2xl font-extrabold text-[#374151]">
            {normalized}/100
          </p>
          <p className="mt-1.5 max-w-[220px] text-xs text-[#6B7280] md:text-sm">
            Resume is in great shape but could still be improved.
          </p>
        </div>
      </div>

      <button className="mt-4 h-10 w-full rounded-lg border border-[#4F46E5] text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF2FF] md:text-sm">
        Optimize resume
      </button>
    </section>
  );
}
