"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link
          href="/"
          aria-label="Blood Donors of BCIC — Home"
          className="shrink-0"
        >
          <Image
            src="/footer_logo.png"
            alt="Blood Donors of BCIC"
            width={1921}
            height={819}
            priority
            className="h-auto w-[150px] object-contain sm:w-[210px]"
          />
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {onBecomeDonor && (
            <button
              type="button"
              onClick={onBecomeDonor}
              className="rounded-xl bg-red-700 px-3 py-2.5 text-sm font-semibold text-white hover:cursor-pointer transition hover:bg-red-800 sm:px-5"
            >
              Become a donor
            </button>
          )}

          {(onSignOut || signedIn) && (
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="rounded-xl border border-stone-300 hover:cursor-pointer hover:bg-stone-200 px-3 py-2.5 text-sm font-semibold transition disabled:opacity-60 sm:px-4"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
