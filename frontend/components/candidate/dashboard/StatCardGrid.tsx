interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface StatCardGridProps {
  cards: StatCard[];
}

export default function StatCardGrid({ cards }: StatCardGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-indigo-200 bg-gradient-to-r from-[#A78BFA] via-[#8AA5FF] to-[#86A7FF] px-4 py-3 text-white shadow-sm"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-white/90">
            <span>{card.title}</span>
            <span className="text-white/90">{card.icon}</span>
          </div>
          <p className="mt-1 text-[33px] font-bold leading-none text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
