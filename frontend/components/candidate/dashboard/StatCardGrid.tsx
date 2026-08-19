import { Briefcase, CalendarDays, Globe2, Sparkles } from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface StatCardGridProps {
  cards?: StatCard[];
}

export default function StatCardGrid({ cards }: StatCardGridProps) {
  if (!cards) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-indigo-200 bg-indigo-400 px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-white/20" />
              <div className="h-8 w-8 rounded-full bg-white/20" />
            </div>
            <div className="mt-2 h-10 w-16 rounded bg-white/20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-indigo-200 bg-indigo-500 px-4 py-3 text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-[14px] font-medium text-white/90">
            <span>{card.title}</span>
            <span className="text-white text-2xl opacity-80">{card.icon}</span>
          </div>
          <p className="mt-1 text-[33px] font-bold leading-none text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
