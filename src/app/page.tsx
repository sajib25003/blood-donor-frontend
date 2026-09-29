"use client";

import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import DonorModal from "../components/donors/DonorModal";
import DonorStats from "../components/donors/DonorStats";
import DonorCard from "../components/donors/DonorCard";
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
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      <SiteHeader onBecomeDonor={() => setShowForm(true)} />

      <main>
        <section className="relative overflow-hidden bg-[#741c21] text-white">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-64 h-[36rem] w-[36rem] rounded-full border-[100px] border-white/5"
          />

          <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-200">
              A community ready to help
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              The right donor can make all the difference.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-red-100 sm:text-lg">
              Search by blood group, name or phone number and connect directly
              with a registered donor.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#find-donors"
                className="rounded-xl bg-white px-6 py-3 font-bold text-red-800 transition hover:bg-red-50"
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
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                Donor directory
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Find someone nearby
              </h2>
            </div>

            <p className="text-sm text-stone-500">
              {isSearching
                ? "Searching…"
                : `${meta.total} ${meta.total === 1 ? "result" : "results"}`}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
            <label className="relative flex-1">
              <span className="sr-only">Search by name or mobile number</span>

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                <SearchIcon />
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
                placeholder="Search name or mobile number"
                className="w-full rounded-xl border border-stone-200 py-3 pl-12 pr-4 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>

            <label className="sm:w-52">
              <span className="sr-only">Filter blood group</span>

              <select
                value={bloodGroup}
                onChange={(event) =>
                  chooseGroup(event.target.value as BloodGroup | "")
                }
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
                className="px-3 py-2 text-sm font-semibold text-red-700 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {notice && (
            <div
              role="status"
              className="mt-5 flex items-center justify-between rounded-xl bg-green-50 px-5 py-4 text-sm text-green-800"
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
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
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
            <p role="status" className="py-16 text-center text-stone-500">
              Searching donors…
            </p>
          )}

          {!isSearching && !error && donors.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-14 text-center">
              <p className="text-xl font-bold">No donors found</p>

              <p className="mt-2 text-sm text-stone-500">
                Try another name or blood group, or be the first to register.
              </p>
            </div>
          )}

          {!isSearching && donors.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {donors.map((donor) => (
                <DonorCard key={donor._id} donor={donor} />
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
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoadingMore ? "Loading…" : "View more"}
                </button>
              ) : (
                <p className="text-sm text-stone-500" role="status">
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
