"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import ThemeToggle from "../../../components/ThemeToggle";
import { useRouter } from "next/navigation";
import { API } from "../../../lib/donor";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function AdminLoginPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: userName.trim(), password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Login failed.");
      router.replace("/admin");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] dark:bg-[#141416] px-4 py-12 text-stone-900 dark:text-stone-100">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-700 relative bg-white dark:bg-[#202024] p-7 shadow-xl sm:p-10">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <Link
          href="/"
          className="inline-block pr-8 text-sm font-semibold text-red-700 dark:text-red-300 hover:underline"
        >
          ← Back to donor directory
        </Link>
        <div
          className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-2xl text-white"
          aria-hidden="true"
        >
          ✚
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Manage registered donor information.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold">
            Username
            <input
              required
              autoComplete="username"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <span className="relative mt-2 block">
              <input
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-3 pr-20 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-3 flex items-center px-2 text-stone-500 dark:text-stone-400 hover:text-red-700 dark:hover:text-red-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </span>
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-700 px-4 py-3 font-bold text-white hover:bg-red-800 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
