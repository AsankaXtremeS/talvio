export default function EmployerDashboardLoading() {
  return (
    <div className="flex-1 min-h-screen overflow-auto bg-[#E9F3FD] p-7">
      <div className="sticky top-0 z-30 -mt-7 bg-[#E9F3FD] pb-2 pt-0">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-white px-7 py-5 shadow-sm">
          <div className="space-y-3">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-indigo-100" />
            <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-10 w-34 animate-pulse rounded-xl bg-indigo-100" />
        </div>

        <div className="grid grid-cols-4 gap-4 pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-7 px-2 pb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
            <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
            <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
