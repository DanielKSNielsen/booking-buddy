import { NextResponse } from "next/server";
import { computeResults, submitVotes } from "@/lib/db/polls";
import type { SubmitVotesInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as SubmitVotesInput;

    if (!body.voterName?.trim()) {
      return NextResponse.json(
        { error: "Your name is required" },
        { status: 400 }
      );
    }

    const poll = await submitVotes(id, body);
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json(computeResults(poll));
  } catch {
    return NextResponse.json(
      { error: "Failed to submit votes" },
      { status: 500 }
    );
  }
}
