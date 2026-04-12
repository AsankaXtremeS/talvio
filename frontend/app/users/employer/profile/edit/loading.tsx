export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-[#eef5ff] px-4 pb-12 pt-4 sm:px-6">
      <div className="mx-auto max-w-305 animate-pulse">
        <div className="mb-6 h-12 w-40 rounded-xl bg-gray-200" />
        <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-5 sm:p-6 lg:p-8">
          <div className="mb-6 h-10 rounded-xl bg-gray-200" />
          <div className="grid gap-6 lg:gap-7">
            <div className="space-y-4 rounded-3xl border border-[#e5e7eb] p-5 sm:p-6">
              <div className="h-6 w-48 rounded-full bg-gray-200" />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="h-20 rounded-2xl bg-gray-200" />
                <div className="h-20 rounded-2xl bg-gray-200" />
              </div>
              <div className="h-48 rounded-3xl bg-gray-200" />
            </div>
            <div className="rounded-3xl border border-[#e5e7eb] p-5 sm:p-6">
              <div className="h-6 w-40 rounded-full bg-gray-200" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full rounded-full bg-gray-200" />
                <div className="h-4 w-5/6 rounded-full bg-gray-200" />
              </div>
            </div>
            <div className="rounded-3xl border border-[#e5e7eb] p-5 sm:p-6">
              <div className="h-6 w-40 rounded-full bg-gray-200" />
              <div className="mt-4 flex gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
