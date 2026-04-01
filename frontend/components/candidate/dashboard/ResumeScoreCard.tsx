export default function ResumeScoreCard() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 ">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-gray-200 border-r-sky-400 border-t-indigo-600 text-[42px] font-bold text-gray-800">
        75
        <span className="text-xl">%</span>
      </div>
      <p className="mx-auto mt-4 max-w-[210px] text-center text-sm text-gray-500">
        Your resume is in great shape but could still be improved
      </p>
      <button className="mt-5 w-full cursor-pointer rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
        Optimize resume
      </button>
    </section>
  );
}
