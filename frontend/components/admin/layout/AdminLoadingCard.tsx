interface AdminLoadingCardProps {
  label: string;
}

export default function AdminLoadingCard({ label }: AdminLoadingCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="font-medium">{label}</span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}
