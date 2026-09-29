"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { API } from "@/lib/donor";

type RequestStatus = "pending" | "resolved";
type UpdateRequest = {
  _id: string;
  name: string;
  mobileNo: string;
  message: string;
  referenceNo: string;
  status: RequestStatus;
  createdAt: string;
};
type RequestList = {
  success: boolean;
  message?: string;
  data: UpdateRequest[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
type ListState = { key: string; result?: RequestList; error?: string };

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date) + " (BD time)";
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<"checking" | "ready" | "error">("checking");
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refresh, setRefresh] = useState(0);
  const [list, setList] = useState<ListState | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const key = JSON.stringify([status, page, limit, refresh]);
  const current = list?.key === key ? list : null;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/v1/auth/me`, {
      credentials: "include",
      cache: "no-store",
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
    if (auth !== "ready") return;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    fetch(`${API}/api/v1/update-requests?${params}`, {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          router.replace("/admin/login");
          return null;
        }
        const result: RequestList = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load requests.");
        }
        return result;
      })
      .then((result) => {
        if (result && !controller.signal.aborted) setList({ key, result });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setList({
            key,
            error: error instanceof Error ? error.message : "Unable to load requests.",
          });
        }
      });
    return () => controller.abort();
  }, [auth, status, page, limit, refresh, key, router]);

  const changeStatus = async (request: UpdateRequest) => {
    if (savingId) return;
    setActionError("");
    setSavingId(request._id);
    const nextStatus: RequestStatus = request.status === "pending" ? "resolved" : "pending";
    try {
      const response = await fetch(`${API}/api/v1/update-requests/${request._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not update request.");
      }
      setRefresh((value) => value + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update request.");
    } finally {
      setSavingId(null);
    }
  };

  if (auth === "checking") {
    return <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] text-stone-500">Checking admin session…</main>;
  }
  if (auth === "error") {
    return <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-6 text-center text-stone-700">Unable to contact the server. Refresh this page to try again.</main>;
  }

  const result = current?.result;
  const requests = result?.data ?? [];
  const meta = result?.meta;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <Link href="/admin" className="text-sm font-semibold text-red-700 hover:underline">← Manage donors</Link>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-red-700">Administration</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Update requests</h1>
        <p className="mt-2 text-sm text-stone-500">Review donor messages and mark completed requests as resolved.</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <label className="text-sm font-medium text-stone-700">
            Status
            <select
              value={status}
              onChange={(event) => { setStatus(event.target.value as RequestStatus | ""); setPage(1); }}
              className="ml-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-red-500"
            >
              <option value="">All requests</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
          <label className="text-sm font-medium text-stone-700">
            Per page
            <select
              value={limit}
              onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}
              className="ml-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 outline-none focus:border-red-500"
            >
              {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
        </div>

        {actionError && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{actionError}</p>}
        {current?.error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{current.error}</p>}
        {!current && <p role="status" className="mt-8 text-center text-stone-500">Loading requests…</p>}
        {result && (
          <>
            <p className="mt-6 text-sm text-stone-500">{meta?.total ?? 0} requests found</p>
            {requests.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-500">No requests found.</div>
            ) : (
              <div className="mt-4 space-y-4">
                {requests.map((request) => (
                  <article key={request._id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold">{request.name}</h2>
                        <p className="mt-1 text-sm text-stone-500">{request.mobileNo} · {formatDate(request.createdAt)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${request.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{request.status}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">{request.message}</p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                      <span className="select-all font-mono text-xs font-semibold text-stone-600">Ref: {request.referenceNo}</span>
                      <button
                        type="button"
                        disabled={savingId !== null}
                        onClick={() => changeStatus(request)}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {savingId === request._id ? "Saving…" : request.status === "pending" ? "Mark resolved" : "Reopen"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {(meta?.totalPages ?? 0) > 1 && (
              <nav aria-label="Request pages" className="mt-7 flex items-center justify-center gap-4">
                <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                <span className="text-sm">Page {page} of {meta?.totalPages}</span>
                <button type="button" disabled={page >= (meta?.totalPages ?? 0)} onClick={() => setPage(page + 1)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm disabled:opacity-40">Next</button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}
