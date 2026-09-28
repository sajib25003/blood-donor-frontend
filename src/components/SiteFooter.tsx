"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export default function SiteFooter() {
  const [year] = useState(() => new Date().getFullYear());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch(`${API}/api/v1/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });

        if (active) setIsLoggedIn(response.ok);
      } catch {
        if (active) setIsLoggedIn(false);
      }
    };

    void checkSession();
    window.addEventListener("focus", checkSession);
    window.addEventListener("admin-session-changed", checkSession);

    return () => {
      active = false;
      window.removeEventListener("focus", checkSession);
      window.removeEventListener("admin-session-changed", checkSession);
    };
  }, [pathname]);

  return (
    <footer className="border-t border-stone-200 bg-[#faf8f5] px-5 py-10 text-stone-600 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-8 sm:flex-row sm:items-center">
          <Link
            href="/"
            aria-label="Blood Donors of BCIC — Home"
            className="inline-flex shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            <Image
              src="/footer_logo.png"
              alt="Blood Donors of BCIC — Connecting people when it matters."
              width={1921}
              height={819}
              className="h-auto w-[280px] max-w-full object-contain sm:w-[340px]"
            />
          </Link>

          {isLoggedIn === false && (
            <div className="group relative self-end sm:self-auto">
              <Link
                href="/admin/login"
                aria-label="Admin Login"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <circle cx="12" cy="15.5" r="1" />
                </svg>
              </Link>
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                Admin Login
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>
            © <span suppressHydrationWarning>{year}</span> Blood Donors of BCIC.
            All Rights Reserved.
          </p>
          <p>
            Developed &amp; Maintained by{" "}
            <a
              href="https://ashikhassan.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-red-700 underline decoration-red-200 underline-offset-4 transition hover:text-red-900 hover:decoration-red-700"
            >
              AHB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
