import type { Donor } from "../../lib/donor";

export default function DonorCard({ donor }: { donor: Donor }) {
  return (
    <article className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-red-800" aria-hidden="true">{donor.name.charAt(0).toUpperCase()}</div><span className="rounded-xl bg-red-50 px-3 py-2 text-lg font-extrabold text-red-800">{donor.bloodGroup}</span></div>
      <h3 className="mt-5 text-xl font-bold tracking-tight">{donor.name}</h3>
      <p className="mt-1 text-sm capitalize text-stone-500">{donor.age} years old · {donor.sex}</p>
      <p className="mt-4 text-sm text-stone-600">📍 {donor.currentLocation}</p>
      <a href={`tel:${donor.mobileNo}`} className="mt-6 block rounded-xl bg-stone-900 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700">Call {donor.mobileNo}</a>
    </article>
  );
}
