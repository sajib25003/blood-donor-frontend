"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash, FaPhone, FaWhatsapp } from "react-icons/fa6";
import type { Donor } from "../../lib/donor";

export default function DonorCard({ donor }: { donor: Donor }) {
  const [showNumber, setShowNumber] = useState(false);

  const maskedNumber =
    donor.mobileNo.length > 5
      ? `${donor.mobileNo.slice(0, 3)}${"•".repeat(
          donor.mobileNo.length - 5,
        )}${donor.mobileNo.slice(-2)}`
      : "••••••";

  const mobileDigits = donor.mobileNo.replace(/\D/g, "");
  const whatsappNumber = mobileDigits.startsWith("0")
    ? `88${mobileDigits}`
    : mobileDigits;

  const tooltipClass =
    "pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100";

  return (
    <article className="flex flex-col rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#202024] p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-lg font-bold text-stone-700 dark:text-stone-300"
          aria-hidden="true"
        >
          {donor.name.charAt(0).toUpperCase()}
        </div>

        <span className="rounded-xl bg-red-50 dark:bg-red-950/40 px-3 py-2 text-lg font-extrabold text-red-800 dark:text-red-200">
          {donor.bloodGroup}
        </span>
      </div>

      <h3 className="mt-4 text-lg sm:mt-5 sm:text-xl font-bold tracking-tight">{donor.name}</h3>

      <p className="mt-1 text-sm capitalize text-stone-500 dark:text-stone-400">
        {donor.age} years old · {donor.sex}
      </p>

      <p className="mt-3 text-xs sm:mt-4 sm:text-sm text-stone-600 dark:text-stone-300">📍 {donor.currentLocation}</p>

      <div className="mt-auto pt-4 sm:pt-6">
        <div className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Mobile number
          </span>

          <span
            aria-live="polite"
            className="font-mono text-sm font-semibold tabular-nums text-stone-800 dark:text-stone-200"
          >
            {showNumber ? donor.mobileNo : maskedNumber}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="group relative">
            <button
              type="button"
              onClick={() => setShowNumber((visible) => !visible)}
              aria-label={
                showNumber
                  ? `Hide ${donor.name}'s number`
                  : `View ${donor.name}'s number`
              }
              aria-pressed={showNumber}
              className="flex h-11 sm:h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-300 transition hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-600"
            >
              {showNumber ? (
                <FaEyeSlash className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FaEye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <span aria-hidden="true" className={`${tooltipClass} left-0`}>
              {showNumber ? "Hide number" : "View number"}
            </span>
          </div>

          <div className="group relative">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Message ${donor.name} on WhatsApp`}
              className="flex h-11 sm:h-12 w-full items-center justify-center rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 transition hover:border-green-300 dark:hover:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              <FaWhatsapp className="h-6 w-6" aria-hidden="true" />
            </a>

            <span
              aria-hidden="true"
              className={`${tooltipClass} left-1/2 -translate-x-1/2`}
            >
              Message on WhatsApp
            </span>
          </div>

          <div className="group relative">
            <a
              href={`tel:${donor.mobileNo}`}
              aria-label={`Call ${donor.name}`}
              className="flex h-11 sm:h-12 w-full items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 transition hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <FaPhone className="h-5 w-5" aria-hidden="true" />
            </a>

            <span aria-hidden="true" className={`${tooltipClass} right-0`}>
              Call donor
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
