"use client";

import { GROUPS } from "../../lib/donor";
import type { BloodGroup, Stats } from "../../lib/donor";

export default function DonorStats({
  stats,
  statsError,
  selectedGroup,
  onSelectGroup,
}: {
  stats: Stats | null;
  statsError: boolean;
  selectedGroup: BloodGroup | "";
  onSelectGroup: (group: BloodGroup | "") => void;
}) {
  return (
    <section
      aria-labelledby="stats-title"
      className="mx-auto max-w-7xl px-4 pt-8 sm:pt-12 sm:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700 dark:text-red-300">
            Our community
          </p>
          <h2
            id="stats-title"
            className="mt-1 text-xl font-bold tracking-tight sm:text-3xl"
          >
            Donors by blood group
          </h2>
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {stats
            ? `${stats.total} registered donors`
            : statsError
              ? "Counts unavailable"
              : "Loading counts…"}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-6 sm:gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => onSelectGroup(selectedGroup === group ? "" : group)}
            aria-pressed={selectedGroup === group}
            className={`rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 hover:cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${selectedGroup === group ? "border-red-300 bg-red-100 text-red-900 hover:bg-red-200 dark:border-red-900 dark:bg-[#3b242b] dark:text-red-200 dark:hover:bg-[#482b33]" : "border-stone-200 dark:border-stone-700 bg-white dark:bg-[#202024] text-stone-900 dark:text-stone-100 hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900 dark:hover:bg-[#2b2024]"}`}
          >
            <span
              className={`text-[10px] sm:text-xs font-semibold ${selectedGroup === group ? "text-red-700 dark:text-red-300" : "text-stone-500 dark:text-stone-400"}`}
            >
              Blood group
            </span>
            <span className="mt-2 block text-xl sm:mt-3 sm:text-2xl font-extrabold">
              {group}
            </span>
            <span
              className={`mt-1 block text-xs sm:mt-2 sm:text-sm ${selectedGroup === group ? "text-red-700 dark:text-red-300" : "text-stone-500 dark:text-stone-400"}`}
            >
              {stats ? (stats.byBloodGroup[group] ?? 0) : "–"} donors
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
