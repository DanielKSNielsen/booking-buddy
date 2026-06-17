"use client";

import {
  buildDatetimeLocalValue,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  parseDatetimeLocalValue,
} from "@/lib/utils/datetime";

interface DateTimeSlotPickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

const fieldClassName =
  "rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

export function DateTimeSlotPicker({
  value,
  onChange,
  id,
}: DateTimeSlotPickerProps) {
  const { date, hour, minute } = parseDatetimeLocalValue(value);

  function update(partial: { date?: string; hour?: string; minute?: string }) {
    onChange(
      buildDatetimeLocalValue(
        partial.date ?? date,
        partial.hour ?? hour,
        partial.minute ?? minute
      )
    );
  }

  return (
    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1.4fr)_auto_auto] gap-2">
      <input
        id={id}
        type="date"
        value={date}
        onChange={(e) => update({ date: e.target.value })}
        required
        className={`min-w-0 ${fieldClassName}`}
      />
      <select
        value={hour}
        onChange={(e) => update({ hour: e.target.value })}
        aria-label="Hour"
        className={`min-w-[4.5rem] ${fieldClassName}`}
      >
        {HOUR_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        value={minute}
        onChange={(e) => update({ minute: e.target.value })}
        aria-label="Minute"
        className={`min-w-[4.5rem] ${fieldClassName}`}
      >
        {MINUTE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
