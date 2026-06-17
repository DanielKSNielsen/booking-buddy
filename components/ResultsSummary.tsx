import type { PollResults } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/datetime";
import { Card } from "./ui";

interface ResultsSummaryProps {
  results: PollResults;
}

export function ResultsSummary({ results }: ResultsSummaryProps) {
  const { slotResults, maxVotes } = results;

  if (slotResults.length === 0) {
    return null;
  }

  const hasVotes = slotResults.some((r) => r.voteCount > 0);

  return (
    <Card className="mt-6">
      <h2 className="text-lg font-semibold text-slate-900">Results Summary</h2>
      <p className="mt-1 text-sm text-slate-500">
        {hasVotes
          ? "Best times are highlighted. Share the link so more friends can vote!"
          : "No votes yet — be the first!"}
      </p>

      <ul className="mt-4 space-y-3">
        {slotResults.map(({ slot, voteCount, availableNames }) => {
          const isTop = maxVotes > 0 && voteCount === maxVotes;
          const formatted = formatDateTime(slot.datetime);

          return (
            <li
              key={slot.id}
              className={`rounded-xl border p-4 transition ${
                isTop
                  ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {formatted}
                    <span
                      className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        isTop
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {voteCount} {voteCount === 1 ? "vote" : "votes"}
                    </span>
                    {isTop && maxVotes > 0 && (
                      <span className="ml-1 text-xs font-semibold text-emerald-700">
                        Best match
                      </span>
                    )}
                  </p>
                  {availableNames.length > 0 ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {availableNames.join(", ")}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">No one yet</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
