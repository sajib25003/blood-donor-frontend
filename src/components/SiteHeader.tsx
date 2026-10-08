"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

type SiteHeaderProps = {
  onBecomeDonor?: () => void;
  onSignOut?: () => void | Promise<void>;
};

export default function SiteHeader({
  onBecomeDonor,
  onSignOut,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    // Admin page নিজেই onSignOut পাঠায়।
    if (onSignOut) return;

    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch(`${API}/api/v1/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });

        if (active) setSignedIn(response.ok);
      } catch {
        if (active) setSignedIn(false);
      }
    };

    void checkSession();
    window.addEventListener("focus", checkSession);

    return () => {
      active = false;
      window.removeEventListener("focus", checkSession);
    };
  }, [pathname, onSignOut]);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      if (onSignOut) {
        await onSignOut();
      } else {
        const response = await fetch(`${API}/api/v1/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Sign out failed. Please try again.");
        }
      }

      setSignedIn(false);
      window.dispatchEvent(new Event("admin-session-changed"));
      window.location.replace("/");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-[#202024] shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:gap-3 sm:py-2.5 sm:px-8">
        <Link
          href="/"
          aria-label="Bangladeshi Blood Donors — Home"
          className="shrink-0"
        >
          <Image
            src="/footer_logo.png"
            alt="Bangladeshi Blood Donors"
            width={1920}
            height={819}
            priority
            className="brand-logo h-auto w-[130px] object-contain sm:w-[210px]"
          />
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {onBecomeDonor && (
            <button
              type="button"
              onClick={onBecomeDonor}
              className="rounded-xl bg-red-700 px-2.5 py-2 text-xs sm:py-2.5 sm:text-sm font-semibold text-white hover:cursor-pointer transition hover:bg-red-800 sm:px-5"
            >
              Become a donor
            </button>
          )}

          {(onSignOut || signedIn) && (
            <Link
              href="/admin"
              aria-current={pathname === "/admin" ? "page" : undefined}
              className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-2.5 py-2 text-xs sm:py-2.5 sm:text-sm font-semibold text-red-700 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-950/60 sm:px-4"
            >
              Admin
            </Link>
          )}

          {(onSignOut || signedIn) && (
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="rounded-xl border border-stone-300 dark:border-stone-600 hover:cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-700 px-2.5 py-2 text-xs sm:py-2.5 sm:text-sm font-semibold transition disabled:opacity-60 sm:px-4"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
