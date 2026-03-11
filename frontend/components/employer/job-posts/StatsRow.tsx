import { FileText, ClipboardList, FileCheck, XSquare } from "lucide-react";

interface Stat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bg: string;
}

interface StatsRowProps {
  totalPosts: number;
  active: number;
  applications: number;
  closed: number;
}

export default function StatsRow({
  totalPosts,
  active,
  applications,
  closed,
}: StatsRowProps) {
  const stats: Stat[] = [
    {
      label: "Total Posts",
      value: totalPosts,
      icon: <FileText size={20} className="text-white opacity-80" />,
      bg: "bg-[#7C6FCD]",
    },
    {
      label: "Active",
      value: active,
      icon: <ClipboardList size={20} className="text-white opacity-80" />,
      bg: "bg-[#6B5FC0]",
    },
    {
      label: "Applications",
      value: applications,
      icon: <FileCheck size={20} className="text-white opacity-80" />,
      bg: "bg-[#5A4FB3]",
    },
    {
      label: "Closed",
      value: closed,
      icon: <XSquare size={20} className="text-white opacity-80" />,
      bg: "bg-[#4A3FA6]",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} rounded-2xl p-5 text-white flex flex-col gap-3`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-90">{stat.label}</span>
            {stat.icon}
          </div>
          <span className="text-4xl font-bold">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}