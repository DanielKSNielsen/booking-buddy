import { NextResponse } from "next/server";
import { computeResults, getPoll } from "@/lib/db/polls";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const poll = await getPoll(id);

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  return NextResponse.json(computeResults(poll));
}
