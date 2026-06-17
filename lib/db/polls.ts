import { promises as fs } from "fs";
import path from "path";
import type {
  CreatePollInput,
  Poll,
  PollResults,
  SlotResult,
  SubmitVotesInput,
  Vote,
} from "@/lib/types";

/**
 * Mock database layer — swap this module for Supabase/Firebase later.
 * All poll persistence goes through these functions.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const POLLS_FILE = path.join(DATA_DIR, "polls.json");

async function ensureDataFile(): Promise<Poll[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(POLLS_FILE, "utf-8");
    return JSON.parse(raw) as Poll[];
  } catch {
    return [];
  }
}

async function writePolls(polls: Poll[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(POLLS_FILE, JSON.stringify(polls, null, 2), "utf-8");
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function createPoll(input: CreatePollInput): Promise<Poll> {
  const polls = await ensureDataFile();

  const poll: Poll = {
    id: generateId(),
    eventName: input.eventName.trim(),
    timeSlots: input.timeSlots.map((slot) => ({
      id: generateId(),
      datetime: slot.datetime,
    })),
    votes: [],
    createdAt: new Date().toISOString(),
  };

  polls.push(poll);
  await writePolls(polls);
  return poll;
}

export async function getPoll(id: string): Promise<Poll | null> {
  const polls = await ensureDataFile();
  return polls.find((p) => p.id === id) ?? null;
}

export async function submitVotes(
  pollId: string,
  input: SubmitVotesInput
): Promise<Poll | null> {
  const polls = await ensureDataFile();
  const index = polls.findIndex((p) => p.id === pollId);
  if (index === -1) return null;

  const poll = polls[index];
  const voterName = input.voterName.trim();

  // Replace existing votes from this voter
  const otherVotes = poll.votes.filter(
    (v) => v.voterName.toLowerCase() !== voterName.toLowerCase()
  );

  const newVotes: Vote[] = input.votes.map((v) => ({
    voterName,
    slotId: v.slotId,
    available: v.available,
  }));

  poll.votes = [...otherVotes, ...newVotes];
  polls[index] = poll;
  await writePolls(polls);
  return poll;
}

export function computeResults(poll: Poll): PollResults {
  const slotResults: SlotResult[] = poll.timeSlots.map((slot) => {
    const availableVotes = poll.votes.filter(
      (v) => v.slotId === slot.id && v.available
    );
    return {
      slot,
      voteCount: availableVotes.length,
      availableNames: availableVotes.map((v) => v.voterName),
    };
  });

  const maxVotes = Math.max(0, ...slotResults.map((r) => r.voteCount));

  return { poll, slotResults, maxVotes };
}
