import { NextResponse } from "next/server";
import { createPoll } from "@/lib/db/polls";
import type { CreatePollInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePollInput;

    if (!body.eventName?.trim()) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    if (!body.timeSlots?.length) {
      return NextResponse.json(
        { error: "At least one time slot is required" },
        { status: 400 }
      );
    }

    const poll = await createPoll(body);
    return NextResponse.json(poll, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 }
    );
  }
}
