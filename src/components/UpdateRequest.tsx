"use client";

import { API } from "@/lib/donor";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type RequestResponse = {
  success?: boolean;
  message?: string;
  data?: { referenceNo?: string; createdAt?: string };
};

export default function UpdateRequest({
  supportEmail,
}: {
  supportEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const openButton = useRef<HTMLButtonElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [createdAt, setCreatedAt] = useState("");

  const close = useCallback(() => {
    if (sending) return;
    setOpen(false);
    openButton.current?.focus();
  }, [sending]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameInput.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setError("");

    const mobile = mobileNo.trim().replace(/^\+?88/, "");
    if (!name.trim() || !message.trim()) {
      setError("Enter your name and the details you want to update.");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(mobile)) {
      setError("Enter a valid 11-digit Bangladeshi mobile number.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API}/api/v1/update-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          mobileNo: mobile,
          message: message.trim(),
        }),
      });
      const result: RequestResponse = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Could not send the request. Please try again.",
        );
      }
      if (!result.data?.referenceNo) {
        throw new Error(
          "Request received, but no reference was returned. Please contact support before submitting again.",
        );
      }
      setReferenceNo(result.data.referenceNo);
      setCreatedAt(result.data.createdAt ?? "");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not send the request.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="border-b border-stone-200 bg-white px-4 py-3 sm:px-8 sm:py-5">
      <div className="mx-auto text-center max-w-7xl rounded-2xl border border-red-100 bg-red-50/70 px-3 py-3 text-xs leading-relaxed text-stone-700 sm:px-6 sm:py-4 sm:text-sm">
        If you want to update your info, please leave a request{" "}
        <button
          ref={openButton}
          type="button"
          onClick={() => {
            setError("");
            setOpen(true);
          }}
          className="font-bold text-red-700 underline decoration-red-300 underline-offset-4 hover:text-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          here
        </button>
        .
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-request-title"
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="update-request-title"
                  className="text-2xl font-bold text-stone-900"
                >
                  Update your donor info
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  Tell us what is currently listed and exactly what should
                  change.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {referenceNo ? (
              <div
                className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-950"
                role="status"
              >
                <p className="font-bold">Request submitted</p>
                <p className="mt-2">Save this reference number:</p>
                <p className="mt-1 select-all font-mono text-lg font-bold tracking-wide">
                  {referenceNo}
                </p>
                <p className="mt-4 leading-relaxed">
                  If your information is not updated within 48 hours, please
                  email us with this reference number.
                </p>
                {supportEmail && (
                  <div className="mt-3">
                    {showEmail ? (
                      <a
                        className="font-semibold text-red-700 underline"
                        href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Donor update request ${referenceNo}`)}`}
                      >
                        {supportEmail}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowEmail(true)}
                        className="font-semibold text-red-700 underline"
                      >
                        Show email
                      </button>
                    )}
                  </div>
                )}
                {createdAt && !Number.isNaN(new Date(createdAt).getTime()) && (
                  <p className="mt-3 text-sm">
                    Request received:{" "}
                    {new Intl.DateTimeFormat("en-BD", {
                      timeZone: "Asia/Dhaka",
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(createdAt))}{" "}
                    (Bangladesh time)
                  </p>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white hover:bg-stone-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-7 space-y-4">
                <label className="block text-sm font-semibold text-stone-700">
                  Your name
                  <input
                    ref={nameInput}
                    required
                    maxLength={100}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Name in the donor directory"
                    className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
                <label className="block text-sm font-semibold text-stone-700">
                  Mobile number
                  <input
                    required
                    inputMode="tel"
                    maxLength={14}
                    autoComplete="tel"
                    value={mobileNo}
                    onChange={(event) => setMobileNo(event.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
                <label className="block text-sm font-semibold text-stone-700">
                  What needs to change?
                  <textarea
                    required
                    rows={5}
                    maxLength={1000}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Current details, the correction you want, and any helpful context"
                    className="mt-2 w-full resize-y rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send request"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
