export default function DonorSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="motion-safe:animate-pulse">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-full bg-stone-100 sm:h-12 sm:w-12" />
          <div className="h-10 w-14 rounded-xl bg-red-50" />
        </div>
        <div className="mt-4 h-6 w-2/3 rounded bg-stone-100 sm:mt-5" />
        <div className="mt-2 h-4 w-1/3 rounded bg-stone-100" />
        <div className="mt-4 h-4 w-1/2 rounded bg-stone-100" />
        <div className="mt-5 h-11 rounded-xl bg-stone-50" />
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="h-11 rounded-xl bg-stone-50 sm:h-12" />
          <div className="h-11 rounded-xl bg-green-50 sm:h-12" />
          <div className="h-11 rounded-xl bg-blue-50 sm:h-12" />
        </div>
      </div>
    </div>
  );
}
