export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-sky-50 to-indigo-100">
      <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white/85 px-5 py-3 text-indigo-700 shadow-sm backdrop-blur-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <span className="text-sm font-medium">Loading Talvio...</span>
      </div>
    </div>
  );
}
