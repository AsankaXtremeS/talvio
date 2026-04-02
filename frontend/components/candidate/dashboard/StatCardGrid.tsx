import { Briefcase, CalendarDays, Globe2, Sparkles } from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface StatCardGridProps {
  cards?: StatCard[];
}

const DEFAULT_STAT_CARDS: StatCard[] = [
  { title: "Applications sent", value: "5", icon: <Sparkles size={24} className="text-white" /> },
  { title: "Interviews scheduled", value: "2", icon: <CalendarDays size={24} className="text-white" /> },
  { title: "Pending matches", value: "4", icon: <Briefcase size={24} className="text-white" /> },
  { title: "Profile views", value: "18", icon: <Globe2 size={24} className="text-white" /> },
];

export default function StatCardGrid({ cards }: StatCardGridProps) {
  const displayCards = cards ?? DEFAULT_STAT_CARDS;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ">
      {displayCards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-indigo-200 bg-indigo-500 px-4 py-3 text-white shadow-sm"
        >
          <div className="flex items-center justify-between text-[14px] font-medium text-white/90">
            <span>{card.title}</span>
            <span className="text-white text-2xl">{card.icon}</span>
          </div>
          <p className="mt-1 text-[33px] font-bold leading-none text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
