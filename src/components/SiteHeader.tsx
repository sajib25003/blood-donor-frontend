"use client";

import Link from "next/link";
import Image from "next/image";

type SiteHeaderProps = {
  onBecomeDonor?: () => void;
  onSignOut?: () => void;
};

export default function SiteHeader({
  onBecomeDonor,
  onSignOut,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link
          href="/"
          aria-label="Blood Donors of BCIC — Home"
          className="shrink-0"
        >
          <Image
            src="/footer_logo.png"
            alt="Blood Donors of BCIC"
            width={240}
            height={90}
            priority
            className="h-auto w-[150px] object-contain sm:w-[210px]"
          />
        </Link>
        {onBecomeDonor && (
          <button
            type="button"
            onClick={onBecomeDonor}
            className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 sm:px-5"
          >
            Become a donor
          </button>
        )}
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
