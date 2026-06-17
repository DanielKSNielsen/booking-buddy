"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { DateTimeSlotPicker } from "@/components/DateTimeSlotPicker";
import { Button, Card, Input, Label } from "@/components/ui";
import { defaultDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/utils/datetime";
import { readApiError } from "@/lib/utils/api";

export default function CreatorPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [slots, setSlots] = useState<string[]>([defaultDatetimeLocalValue()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSlot() {
    setSlots((prev) => [...prev, defaultDatetimeLocalValue(prev.length)]);
  }

  function updateSlot(index: number, value: string) {
    setSlots((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!eventName.trim()) {
      setError("Please enter an event name.");
      return;
    }

    if (slots.length === 0) {
      setError("Add at least one time slot.");
      return;
    }

    setLoading(true);

    try {
      const timeSlots = slots.map((s) => ({
        datetime: fromDatetimeLocalValue(s),
      }));

      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: eventName.trim(),
          timeSlots,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Failed to create poll"));
      }

      const poll = await res.json();
      router.push(`/poll/${poll.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Create a poll"
      subtitle="Add your event and proposed times. Share the link — no sign-up needed."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <Label htmlFor="eventName">Event name</Label>
          <Input
            id="eventName"
            type="text"
            placeholder='e.g. "Padel" or "Climbing"'
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between p-0">
            <Label className="p-0">Proposed time slots</Label>
            <Button type="button" variant="ghost" onClick={addSlot} className="!p-0">
              + Add slot
            </Button>
          </div>

          <ul className="mt-1.5 space-y-3">
            {slots.map((slot, index) => (
              <li key={index} className="flex items-center gap-2">
                <DateTimeSlotPicker
                  id={index === 0 ? "time-slot-0" : undefined}
                  value={slot}
                  onChange={(value) => updateSlot(index, value)}
                />
                {slots.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeSlot(index)}
                    className="shrink-0 px-3 py-3"
                    aria-label="Remove time slot"
                  >
                    ✕
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating…" : "Generate Group Link"}
        </Button>
      </form>
    </PageShell>
  );
}
