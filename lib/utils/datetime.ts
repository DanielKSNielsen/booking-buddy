const pad = (n: number) => String(n).padStart(2, "0");

export const MINUTE_STEP = 5;

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
  pad(hour)
);

export const MINUTE_OPTIONS = Array.from(
  { length: 60 / MINUTE_STEP },
  (_, index) => pad(index * MINUTE_STEP)
);

export function roundMinuteToStep(minute: number, step = MINUTE_STEP): number {
  return Math.min(55, Math.round(minute / step) * step);
}

export function parseDatetimeLocalValue(value: string): {
  date: string;
  hour: string;
  minute: string;
} {
  const [date = "", time = "08:00"] = value.split("T");
  const [hour = "08", minute = "00"] = time.split(":");

  return {
    date,
    hour: pad(Number(hour)),
    minute: pad(roundMinuteToStep(Number(minute))),
  };
}

export function buildDatetimeLocalValue(
  date: string,
  hour: string,
  minute: string
): string {
  return `${date}T${pad(Number(hour))}:${pad(Number(minute))}`;
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const datePart = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);

  return `${datePart}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultDatetimeLocalValue(dayOffset = 0): string {
  const date = new Date();
  date.setHours(8, 0, 0, 0);

  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  if (dayOffset > 0) {
    date.setDate(date.getDate() + dayOffset);
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T08:00`;
}

export function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  return buildDatetimeLocalValue(
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    pad(date.getHours()),
    pad(roundMinuteToStep(date.getMinutes()))
  );
}

export function fromDatetimeLocalValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Please choose a valid date and time for each slot.");
  }
  return date.toISOString();
}
