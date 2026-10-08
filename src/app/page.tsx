"use client";

import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import DonorModal from "../components/donors/DonorModal";
import DonorStats from "../components/donors/DonorStats";
import DonorCard from "../components/donors/DonorCard";
import DonorSkeleton from "../components/donors/DonorSkeleton";
import { API, GROUPS } from "../lib/donor";
import type { BloodGroup, Donor, DonorList, Stats } from "../lib/donor";
import UpdateRequest from "@/components/UpdateRequest";

type ListState = {
  key: string;
  page: number;
  data: Donor[];
  meta: DonorList["meta"];
  error: string;
};

const emptyMeta: DonorList["meta"] = {
  page: 1,
  limit: 6,
  total: 0,
  totalPages: 0,
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export default function HomePage() {
  const [listState, setListState] = useState<ListState | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statsError, setStatsError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [notice, setNotice] = useState("");

  const requestKey = JSON.stringify([bloodGroup, debouncedSearch]);
  const currentList = listState?.key === requestKey ? listState : null;
  const donors = currentList?.data ?? [];
  const meta = currentList?.meta ?? emptyMeta;
  const error = currentList?.error ?? "";

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    // প্রথমে ৬ জন; এরপর 6 জন করে, offset 3 থেকে।
    const params = new URLSearchParams({
      page: String(page === 1 ? 1 : page + 1),
      limit: String(page === 1 ? 6 : 3),
    });

    if (bloodGroup) params.set("bloodGroup", bloodGroup);
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`${API}/api/v1/donors?${params}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result: DonorList = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load donors.");
        }

        return result;
      })
      .then((result) => {
        if (controller.signal.aborted) return;

        setListState((previous) => ({
          key: requestKey,
          page,
          data:
            page > 1 &&
            previous?.key === requestKey &&
            previous.page === page - 1
              ? [...previous.data, ...result.data]
              : result.data,
          meta: result.meta,
          error: "",
        }));
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;

        setListState((previous) => ({
          key: requestKey,
          page: page > 1 && previous?.key === requestKey ? previous.page : page,
          data: page > 1 && previous?.key === requestKey ? previous.data : [],
          meta:
            page > 1 && previous?.key === requestKey
              ? previous.meta
              : emptyMeta,
          error:
            cause instanceof Error ? cause.message : "Unable to load donors.",
        }));
      });

    return () => controller.abort();
  }, [page, bloodGroup, debouncedSearch, requestKey, refresh]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API}/api/v1/donors/stats`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Stats unavailable");

        return response.json() as Promise<{ data: Stats }>;
      })
      .then((result) => {
        setStats(result.data);
        setStatsError(false);
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") setStatsError(true);
      });

    return () => controller.abort();
  }, [refresh]);

  const chooseGroup = (group: BloodGroup | "") => {
    setBloodGroup(group);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const registered = () => {
    setShowForm(false);
    setNotice("Thank you! Your donor profile has been added.");
    setListState(null);
    setPage(1);
    setRefresh((value) => value + 1);
  };

  const isSearching =
    currentList === null ||
    search.trim() !== debouncedSearch ||
    (page === 1 && currentList.page !== 1);

  const isLoadingMore =
    !isSearching && !error && page > (currentList?.page ?? 0);

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#141416] text-stone-900 dark:text-stone-100">
      <SiteHeader onBecomeDonor={() => setShowForm(true)} />

      <main>
        <section className="relative overflow-hidden bg-[#741c21] text-white">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-64 h-[36rem] w-[36rem] rounded-full border-[100px] border-white/5"
          />

          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-200">
              A community ready to help
            </p>

            <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-6xl">
              The right donor can make all the difference.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-red-100 sm:text-lg">
              Search by blood group, name or phone number and connect directly
              with a registered donor.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
              <a
                href="#find-donors"
                className="rounded-xl bg-white dark:bg-[#202024] px-4 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base font-bold text-red-800 dark:text-red-200 transition hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                Find a donor
              </a>

              {/* <button
                onClick={() => setShowForm(true)}
                className="rounded-xl border border-white/40 px-6 py-3 font-bold text-white transition hover:bg-white/10"
              >
                Add myself
              </button> */}
            </div>
          </div>
        </section>

        <UpdateRequest
          supportEmail={process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? ""}
        />

        <DonorStats
          stats={stats}
          statsError={statsError}
          selectedGroup={bloodGroup}
          onSelectGroup={chooseGroup}
        />

        <section
          id="find-donors"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-8 sm:py-16"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700 dark:text-red-300">
                Donor directory
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-3xl">
                Find someone nearby
              </h2>
            </div>

            <p className="text-sm text-stone-500 dark:text-stone-400">
              {isSearching
                ? "Searching…"
                : `${meta.total} ${meta.total === 1 ? "result" : "results"}`}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#202024] p-3 sm:mt-6 shadow-sm sm:flex-row sm:items-center sm:p-5">
            <label className="relative flex-1">
              <span className="sr-only">Search by name or mobile number</span>

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
                <SearchIcon />
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
                placeholder="Search name or mobile number"
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 py-3 pl-12 pr-4 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
              />
            </label>

            <label className="sm:w-52">
              <span className="sr-only">Filter blood group</span>

              <select
                value={bloodGroup}
                onChange={(event) =>
                  chooseGroup(event.target.value as BloodGroup | "")
                }
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#202024] px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950"
              >
                <option value="">All blood groups</option>

                {GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>

            {(bloodGroup || search) && (
              <button
                onClick={() => {
                  chooseGroup("");
                  changeSearch("");
                }}
                className="px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {notice && (
            <div
              role="status"
              className="mt-5 flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-950/40 px-5 py-4 text-sm text-green-800 dark:text-green-200"
            >
              <span>{notice}</span>

              <button onClick={() => setNotice("")} aria-label="Dismiss notice">
                ✕
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-5 text-sm text-red-800 dark:text-red-200"
            >
              {error}{" "}
              <button
                onClick={() => setRefresh((value) => value + 1)}
                className="ml-2 font-bold underline"
              >
                Try again
              </button>
            </div>
          )}

          {isSearching && !error && (
            <div
              role="status"
              aria-label="Searching donors"
              className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              <span className="sr-only">Searching donors…</span>
              {Array.from({ length: 6 }, (_, index) => (
                <DonorSkeleton key={index} />
              ))}
            </div>
          )}

          {!isSearching && !error && donors.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 dark:border-stone-600 bg-white dark:bg-[#202024] px-5 py-10 text-center sm:p-14">
              <span
                aria-hidden="true"
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
              >
                <SearchIcon />
              </span>
              <p className="text-xl font-bold">No donors found</p>

              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                Try another name, mobile number or blood group.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (search || bloodGroup) {
                    chooseGroup("");
                    changeSearch("");
                  } else {
                    setShowForm(true);
                  }
                }}
                className="mt-5 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                {search || bloodGroup ? "Clear filters" : "Become a donor"}
              </button>
            </div>
          )}

          {!isSearching && donors.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {donors.map((donor) => (
                <div
                  key={donor._id}
                  className="donor-enter flex [&>article]:w-full"
                >
                  <DonorCard donor={donor} />
                </div>
              ))}
            </div>
          )}

          {!isSearching && donors.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              {donors.length < meta.total ? (
                <button
                  type="button"
                  disabled={isLoadingMore || Boolean(error)}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-xl border border-stone-300 dark:border-stone-600 px-4 py-2 text-sm font-semibold transition hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoadingMore ? "Loading…" : "View more"}
                </button>
              ) : (
                <p className="text-sm text-stone-500 dark:text-stone-400" role="status">
                  End of list. {meta.total}{" "}
                  {meta.total === 1 ? "donor" : "donors"} found.
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

      {showForm && (
        <DonorModal onClose={() => setShowForm(false)} onCreated={registered} />
      )}
    </div>
  );
}
