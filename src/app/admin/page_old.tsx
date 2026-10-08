"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API, GROUPS } from "../../lib/donor";
import type { BloodGroup, Donor, DonorList } from "../../lib/donor";
import SiteHeader from "@/components/SiteHeader";
import Swal from "sweetalert2";

type Detail = Omit<Donor, "age"> & { dob: string };
type ListState = {
  key: string;
  data: Donor[];
  meta: DonorList["meta"];
  error: string;
};
const emptyMeta: DonorList["meta"] = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

function EditDonorModal({
  donor,
  onClose,
  onSaved,
}: {
  donor: Detail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: donor.name,
    dob: donor.dob.slice(0, 10),
    mobileNo: donor.mobileNo,
    sex: donor.sex,
    bloodGroup: donor.bloodGroup,
    currentLocation: donor.currentLocation,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [maxDob] = useState(() => new Date().toISOString().slice(0, 10));
  const inputClass =
    "mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/v1/donors/${donor._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Update failed.");
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-donor-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-3xl bg-white p-6 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
              Admin
            </p>
            <h2 id="edit-donor-title" className="mt-2 text-2xl font-bold">
              Edit donor
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
          >
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">
            Full name
            <input
              required
              maxLength={100}
              className={inputClass}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label className="text-sm font-semibold">
            Date of birth
            <input
              required
              type="date"
              max={maxDob}
              className={inputClass}
              value={form.dob}
              onChange={(event) =>
                setForm({ ...form, dob: event.target.value })
              }
            />
          </label>
          <label className="text-sm font-semibold">
            Mobile number
            <input
              required
              inputMode="numeric"
              maxLength={11}
              pattern="01[3-9][0-9]{8}"
              className={inputClass}
              value={form.mobileNo}
              onChange={(event) =>
                setForm({ ...form, mobileNo: event.target.value })
              }
            />
          </label>
          <label className="text-sm font-semibold">
            Gender
            <select
              className={inputClass}
              value={form.sex}
              onChange={(event) =>
                setForm({ ...form, sex: event.target.value as Detail["sex"] })
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Blood group
            <select
              className={inputClass}
              value={form.bloodGroup}
              onChange={(event) =>
                setForm({
                  ...form,
                  bloodGroup: event.target.value as BloodGroup,
                })
              }
            >
              {GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Current location
            <input
              required
              maxLength={120}
              className={inputClass}
              value={form.currentLocation}
              onChange={(event) =>
                setForm({ ...form, currentLocation: event.target.value })
              }
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 disabled:opacity-60 sm:col-span-2"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<"checking" | "ready" | "error">("checking");
  const [listState, setListState] = useState<ListState | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const requestKey = JSON.stringify([
    page,
    bloodGroup,
    debouncedSearch,
    refresh,
    pageSize,
  ]);
  const currentList = listState?.key === requestKey ? listState : null;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/v1/auth/me`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) return;
        if (response.ok) setAuth("ready");
        else router.replace("/admin/login");
      })
      .catch(() => {
        if (!controller.signal.aborted) setAuth("error");
      });
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (auth !== "ready") return;
    const controller = new AbortController();
    // const params = new URLSearchParams({ page: String(page), limit: "5" });
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });
    if (bloodGroup) params.set("bloodGroup", bloodGroup);
    if (debouncedSearch) params.set("search", debouncedSearch);
    fetch(`${API}/api/v1/donors?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const result: DonorList = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Unable to load donors.");
        return result;
      })
      .then((result) => {
        if (!controller.signal.aborted)
          setListState({
            key: requestKey,
            data: result.data,
            meta: result.meta,
            error: "",
          });
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setListState({
            key: requestKey,
            data: [],
            meta: emptyMeta,
            error:
              cause instanceof Error ? cause.message : "Unable to load donors.",
          });
      });
    return () => controller.abort();
  }, [auth, page, bloodGroup, debouncedSearch, requestKey, pageSize]);

  const edit = async (id: string) => {
    setActionError("");
    setActionLoading(id);
    try {
      const response = await fetch(`${API}/api/v1/donors/${id}`, {
        credentials: "include",
      });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to load donor.");
      setSelected(result.data as Detail);
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "Unable to load donor.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const remove = async (donor: Donor) => {
    const confirmation = await Swal.fire({
      title: "Delete donor?",
      text: `Remove ${donor.name} from the donor directory? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#78716c",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) return;

    setActionError("");
    setActionLoading(donor._id);

    try {
      const response = await fetch(`${API}/api/v1/donors/${donor._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Delete failed.");
      }

      if (currentList?.data.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefresh((value) => value + 1);
      }
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Delete failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const logout = async () => {
    setActionError("");

    const response = await fetch(`${API}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed. Please try again.");
    }

    window.location.replace("/");
  };

  if (auth === "checking")
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] text-stone-500">
        Checking admin session…
      </main>
    );
  if (auth === "error")
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-6 text-center text-stone-700">
        Unable to contact the server. Refresh this page to try again.
      </main>
    );

  const donors = currentList?.data ?? [];
  const meta = currentList?.meta ?? emptyMeta;
  const isLoading = currentList === null || search.trim() !== debouncedSearch;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      {/* <header className="sticky top-0 z-40 border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/" className="font-bold text-red-800">
            ✚ Bangladeshi Blood Donors
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50"
          >
            Sign out
          </button>
        </div>
      </header> */}
      <SiteHeader onSignOut={logout} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Manage donors
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Update registered information or remove a donor.
        </p>
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:p-5">
          <label className="flex-1">
            <span className="sr-only">Search by name or mobile</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name or mobile number"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </label>
          <label className="sm:w-48">
            <span className="sr-only">Blood group</span>
            <select
              value={bloodGroup}
              onChange={(event) => {
                setBloodGroup(event.target.value as BloodGroup | "");
                setPage(1);
              }}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500"
            >
              <option value="">All blood groups</option>
              {GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            Per page
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-stone-200 bg-white px-3 py-3"
            >
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        {actionError && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {actionError}
          </p>
        )}
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-5 py-4 text-sm text-stone-500">
            {isLoading ? "Loading donors…" : `${meta.total} donors found`}
          </div>
          {currentList?.error && (
            <p role="alert" className="p-5 text-red-700">
              {currentList.error}
            </p>
          )}
          {isLoading && (
            <p role="status" className="p-8 text-center text-stone-500">
              Loading…
            </p>
          )}
          {!isLoading && !currentList?.error && donors.length === 0 && (
            <p className="p-8 text-center text-stone-500">No donors found.</p>
          )}
          {!isLoading &&
            !currentList?.error &&
            donors.map((donor) => (
              <div
                key={donor._id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 px-5 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-red-50 px-2 py-1 font-bold text-red-800">
                      {donor.bloodGroup}
                    </span>
                    <span className="font-semibold">{donor.name}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">
                    {donor.age} yrs .{" "}
                    <span className="capitalize">{donor.sex}</span> .{" "}
                    {donor.mobileNo} . {donor.currentLocation}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading === donor._id}
                    onClick={() => edit(donor._id)}
                    className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === donor._id}
                    onClick={() => remove(donor)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
        {!isLoading && meta.totalPages > 1 && (
          <nav
            aria-label="Admin donor pages"
            className="mt-6 flex items-center justify-center gap-4"
          >
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {page} of {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </main>
      {selected && (
        <EditDonorModal
          key={selected._id}
          donor={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            setRefresh((value) => value + 1);
          }}
        />
      )}
    </div>
  );
}
