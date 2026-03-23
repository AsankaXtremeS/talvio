import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

const STAT_CARD_BACKGROUNDS: Record<string, string> = {
  'Total Users': 'bg-[#7C6FCD]',
  'Total Companies': 'bg-[#6B5FC0]',
  Undergraduates: 'bg-[#5A4FB3]',
  Professionals: 'bg-[#5448AD]',
  'Pending Approvals': 'bg-[#4A3FA6]',
};

export default function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  const backgroundClass = STAT_CARD_BACKGROUNDS[title] ?? 'bg-[#7C6FCD]';

  return (
    <div className={`${backgroundClass} rounded-2xl p-5 text-white flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-90">{title}</span>
        <div className="text-white opacity-80">
          <Icon size={20} />
        </div>
      </div>
      <span className="text-4xl font-bold tracking-tight text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
