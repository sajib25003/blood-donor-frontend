"use client";

import { GROUPS } from "../../lib/donor";
import type { BloodGroup, Stats } from "../../lib/donor";

export default function DonorStats({ stats, statsError, selectedGroup, onSelectGroup }: {
  stats: Stats | null;
  statsError: boolean;
  selectedGroup: BloodGroup | "";
  onSelectGroup: (group: BloodGroup | "") => void;
}) {
  return (
    <section aria-labelledby="stats-title" className="mx-auto max-w-7xl px-5 pt-12 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">Our community</p><h2 id="stats-title" className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Donors by blood group</h2></div>
        <p className="text-sm text-stone-500">{stats ? `${stats.total} registered donors` : statsError ? "Counts unavailable" : "Loading counts…"}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {GROUPS.map((group) => (
          <button key={group} onClick={() => onSelectGroup(selectedGroup === group ? "" : group)} aria-pressed={selectedGroup === group}
            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selectedGroup === group ? "border-red-700 bg-red-700 text-white" : "border-stone-200 bg-white text-stone-900"}`}>
            <span className={`text-xs font-semibold ${selectedGroup === group ? "text-red-100" : "text-stone-500"}`}>Blood group</span>
            <span className="mt-3 block text-2xl font-extrabold">{group}</span>
            <span className={`mt-2 block text-sm ${selectedGroup === group ? "text-red-100" : "text-stone-500"}`}>{stats ? stats.byBloodGroup[group] ?? 0 : "–"} donors</span>
          </button>
        ))}
      </div>
    </section>
  );
}
