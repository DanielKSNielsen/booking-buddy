"use client";

import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ResultsSummary } from "@/components/ResultsSummary";
import { TimeSlotRow } from "@/components/AvailabilityToggle";
import { Button, Card, Input, Label } from "@/components/ui";
import type { PollResults } from "@/lib/types";
import { readApiError } from "@/lib/utils/api";

interface PollPageProps {
  params: Promise<{ id: string }>;
}

export default function PollPage({ params }: PollPageProps) {
  const [pollId, setPollId] = useState<string | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [voterName, setVoterName] = useState("");
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setPollId(id));
  }, [params]);

  const fetchResults = useCallback(async (id: string) => {
    const res = await fetch(`/api/polls/${id}`);
    if (!res.ok) {
      throw new Error("Poll not found");
    }
    return (await res.json()) as PollResults;
  }, []);

  useEffect(() => {
    if (!pollId) return;

    setLoading(true);
    fetchResults(pollId)
      .then((data) => {
        setResults(data);
        setAvailability(
          Object.fromEntries(data.poll.timeSlots.map((s) => [s.id, false]))
        );
      })
      .catch(() => setError("This poll could not be found."))
      .finally(() => setLoading(false));
  }, [pollId, fetchResults]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pollId || !results) return;

    setError(null);
    setSuccess(false);

    if (!voterName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/polls/${pollId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterName: voterName.trim(),
          votes: results.poll.timeSlots.map((slot) => ({
            slotId: slot.id,
            available: availability[slot.id] ?? false,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Failed to submit votes"));
      }

      const updated = (await res.json()) as PollResults;
      setResults(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!pollId) return;
    const url = `${window.location.origin}/poll/${pollId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <PageShell>
        <Card>
          <p className="text-center text-sm text-slate-500">Loading poll…</p>
        </Card>
      </PageShell>
    );
  }

  if (error && !results) {
    return (
      <PageShell title="Poll not found">
        <Card>
          <p className="text-sm text-slate-600">{error}</p>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => (window.location.href = "/")}
          >
            Create a new poll
          </Button>
        </Card>
      </PageShell>
    );
  }

  if (!results) return null;

  return (
    <PageShell
      title={results.poll.eventName}
      subtitle="Tap the times you're free — no account needed."
    >
      <div className="mb-4 flex gap-2">
        <Button variant="secondary" className="flex-1 text-xs" onClick={copyLink}>
          {copied ? "Copied!" : "Copy link to share"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <Label htmlFor="voterName">Your name</Label>
          <Input
            id="voterName"
            type="text"
            placeholder="Alex"
            value={voterName}
            onChange={(e) => setVoterName(e.target.value)}
            required
            autoComplete="name"
          />
        </Card>

        <Card>
          <Label>When are you available?</Label>
          <ul className="mt-3 space-y-3">
            {results.poll.timeSlots.map((slot) => (
              <TimeSlotRow
                key={slot.id}
                datetime={slot.datetime}
                available={availability[slot.id] ?? false}
                onChange={(val) =>
                  setAvailability((prev) => ({ ...prev, [slot.id]: val }))
                }
              />
            ))}
          </ul>
        </Card>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Votes saved! Results updated below.
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Submitting…" : "Submit My Votes"}
        </Button>
      </form>

      <ResultsSummary results={results} />
    </PageShell>
  );
}
