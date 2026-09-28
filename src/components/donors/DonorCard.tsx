"use client";

import { useState } from "react";
import type { Donor } from "../../lib/donor";

export default function DonorCard({ donor }: { donor: Donor }) {
  const [showNumber, setShowNumber] = useState(false);
  const maskedNumber =
    donor.mobileNo.length > 5
      ? `${donor.mobileNo.slice(0, 3)}${"•".repeat(donor.mobileNo.length - 5)}${donor.mobileNo.slice(-2)}`
      : "••••••";

  return (
    <article className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:shadow-md">
      {" "}
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-red-800"
          aria-hidden="true"
        >
          {donor.name.charAt(0).toUpperCase()}
        </div>
        <span className="rounded-xl bg-red-50 px-3 py-2 text-lg font-extrabold text-red-800">
          {donor.bloodGroup}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight">{donor.name}</h3>
      <p className="mt-1 text-sm capitalize text-stone-500">
        {donor.age} years old · {donor.sex}
      </p>
      <p className="mt-4 text-sm text-stone-600">📍 {donor.currentLocation}</p>
      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          <span className="text-xs font-medium text-stone-500">
            Mobile number
          </span>
          <span
            aria-live="polite"
            className="font-mono text-sm font-semibold tabular-nums text-stone-800"
          >
            {showNumber ? donor.mobileNo : maskedNumber}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowNumber((visible) => !visible)}
            aria-label={
              showNumber
                ? `Hide ${donor.name}'s number`
                : `View ${donor.name}'s number`
            }
            className="rounded-xl border border-stone-300 px-3 py-3 text-center text-sm font-bold text-stone-700 transition hover:border-red-300 hover:bg-red-200 hover:cursor-pointer hover:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            {showNumber ? "Hide number" : "View number"}
          </button>
          <a
            href={`tel:${donor.mobileNo}`}
            aria-label={`Call ${donor.name}`}
            className="rounded-xl bg-stone-900 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            Call donor
          </a>
        </div>
      </div>
    </article>
  );
}
