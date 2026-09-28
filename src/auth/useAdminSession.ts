"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const ADMIN_SESSION_CHANGED = "admin-session-changed";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export function useAdminSession() {
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "authenticated" | "guest">(
    "checking",
  );

  useEffect(() => {
    let active = true;
    let latestRequest = 0;

    const checkSession = () => {
      const request = ++latestRequest;
      fetch(`${API}/api/v1/auth/me`, {
        credentials: "include",
        cache: "no-store",
      })
        .then((response) => {
          if (active && request === latestRequest) {
            setStatus(response.ok ? "authenticated" : "guest");
          }
        })
        .catch(() => {
          if (active && request === latestRequest) setStatus("guest");
        });
    };

    checkSession();
    window.addEventListener("focus", checkSession);
    window.addEventListener(ADMIN_SESSION_CHANGED, checkSession);
    return () => {
      active = false;
      window.removeEventListener("focus", checkSession);
      window.removeEventListener(ADMIN_SESSION_CHANGED, checkSession);
    };
  }, [pathname]);

  return status;
}
