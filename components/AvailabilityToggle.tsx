"use client";

import { formatDateTime } from "@/lib/utils/datetime";

interface AvailabilityToggleProps {
  available: boolean;
  onChange: (available: boolean) => void;
  label: string;
}

export function AvailabilityToggle({
  available,
  onChange,
  label,
}: AvailabilityToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!available)}
      aria-label={`${label}: ${available ? "Available" : "Not available"}`}
      aria-pressed={available}
      className={`flex min-w-[7.5rem] shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
        available
          ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      <span className="text-base">{available ? "👍" : "—"}</span>
      {available ? "Available" : "Not available"}
    </button>
  );
}

interface TimeSlotRowProps {
  datetime: string;
  available: boolean;
  onChange: (available: boolean) => void;
}

export function TimeSlotRow({ datetime, available, onChange }: TimeSlotRowProps) {
  const formatted = formatDateTime(datetime);

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <span className="min-w-0 text-sm font-medium text-slate-800">
        {formatted}
      </span>
      <AvailabilityToggle
        available={available}
        onChange={onChange}
        label={formatted}
      />
    </li>
  );
}
