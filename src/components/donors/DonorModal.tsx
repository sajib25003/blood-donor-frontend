"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { API, GROUPS } from "../../lib/donor";
import type { BloodGroup } from "../../lib/donor";

type DonorForm = {
  name: string;
  dob: string;
  mobileNo: string;
  sex: "male" | "female" | "other";
  bloodGroup: BloodGroup | "";
  currentLocation: string;
};

const emptyForm: DonorForm = {
  name: "",
  dob: "",
  mobileNo: "",
  sex: "male",
  bloodGroup: "",
  currentLocation: "",
};

export default function DonorModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<DonorForm>(emptyForm);
  const [maxDob] = useState(() => {
    const date = new Date();
    date.setUTCFullYear(date.getUTCFullYear() - 18);
    return date.toISOString().slice(0, 10);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const setField = <K extends keyof DonorForm>(field: K, value: DonorForm[K]) =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!/^01[3-9]\d{8}$/.test(form.mobileNo.trim())) {
      setError("Enter an 11-digit Bangladeshi mobile number (01XXXXXXXXX).");
      return;
    }
    if (!form.bloodGroup) {
      setError("Select your blood group.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API}/api/v1/donors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          mobileNo: form.mobileNo.trim(),
          currentLocation: form.currentLocation.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          response.status === 409
            ? "This mobile number is already registered."
            : result.message || "Registration failed.",
        );
      }
      onCreated();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#202024] px-4 py-3 text-sm text-stone-900 dark:text-stone-100 outline-none transition placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950";
  const labelClass = "text-sm font-semibold text-stone-700 dark:text-stone-300";

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
        aria-labelledby="donor-form-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-3xl bg-[#fffdfb] dark:bg-[#202024] p-6 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
              Join the directory
            </p>
            <h2
              id="donor-form-title"
              className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100"
            >
              Register as a donor
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Your details can help someone find blood in time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-full p-2 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Full name
            <input
              required
              maxLength={100}
              autoComplete="name"
              className={inputClass}
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Your full name"
            />
          </label>
          <label className={labelClass}>
            Date of birth
            <input
              required
              type="date"
              max={maxDob}
              className={inputClass}
              value={form.dob}
              onChange={(event) => setField("dob", event.target.value)}
            />
          </label>
          <label className={labelClass}>
            Mobile number
            <input
              required
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              className={inputClass}
              value={form.mobileNo}
              onChange={(event) => setField("mobileNo", event.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </label>
          <label className={labelClass}>
            Gender
            <select
              required
              className={inputClass}
              value={form.sex}
              onChange={(event) =>
                setField("sex", event.target.value as DonorForm["sex"])
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className={labelClass}>
            Blood group
            <select
              required
              className={inputClass}
              value={form.bloodGroup}
              onChange={(event) =>
                setField("bloodGroup", event.target.value as BloodGroup)
              }
            >
              <option value="">Select blood group</option>
              {GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Current location
            <input
              required
              maxLength={120}
              className={inputClass}
              value={form.currentLocation}
              onChange={(event) =>
                setField("currentLocation", event.target.value)
              }
              placeholder="e.g. Mirpur, Dhaka"
            />
          </label>
          <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400 sm:col-span-2">
            By registering, your name, age, sex, blood group, location and
            mobile number will be visible to visitors. Your full date of birth
            will not appear in the public list.
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300 sm:col-span-2"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {saving ? "Registering…" : "Register as donor"}
          </button>
        </form>
      </section>
    </div>
  );
}
