"use client";

import { useSyncExternalStore } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

const storageKey = "blood-donors-theme";
const getTheme = () => document.documentElement.classList.contains("dark");
const getServerTheme = () => false;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  const syncStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    document.documentElement.classList.toggle(
      "dark",
      event.newValue === "dark",
    );
  };
  window.addEventListener("storage", syncStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", syncStorage);
  };
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  const toggleTheme = () => {
    const dark = !getTheme();
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(storageKey, dark ? "dark" : "light");
    } catch {
      // The toggle still works when browser storage is unavailable.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-red-300"
    >
      <FaMoon aria-hidden="true" className="h-4 w-4 dark:hidden" />
      <FaSun aria-hidden="true" className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
