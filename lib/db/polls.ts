import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  CreatePollInput,
  Poll,
  PollResults,
  SlotResult,
  SubmitVotesInput,
} from "@/lib/types";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

async function fetchPollById(id: string): Promise<Poll | null> {
  const supabase = getSupabaseAdmin();

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, event_name, created_at")
    .eq("id", id)
    .maybeSingle();

  if (pollError) throw pollError;
  if (!poll) return null;

  const { data: timeSlots, error: slotsError } = await supabase
    .from("time_slots")
    .select("id, datetime")
    .eq("poll_id", id)
    .order("datetime", { ascending: true });

  if (slotsError) throw slotsError;

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("voter_name, slot_id, available")
    .eq("poll_id", id);

  if (votesError) throw votesError;

  return {
    id: poll.id,
    eventName: poll.event_name,
    createdAt: poll.created_at,
    timeSlots: (timeSlots ?? []).map((slot) => ({
      id: slot.id,
      datetime: slot.datetime,
    })),
    votes: (votes ?? []).map((vote) => ({
      voterName: vote.voter_name,
      slotId: vote.slot_id,
      available: vote.available,
    })),
  };
}

export async function createPoll(input: CreatePollInput): Promise<Poll> {
  const supabase = getSupabaseAdmin();
  const pollId = generateId();
  const createdAt = new Date().toISOString();

  const { error: pollError } = await supabase.from("polls").insert({
    id: pollId,
    event_name: input.eventName.trim(),
    created_at: createdAt,
  });

  if (pollError) throw pollError;

  const timeSlots = input.timeSlots.map((slot) => ({
    id: generateId(),
    poll_id: pollId,
    datetime: slot.datetime,
  }));

  const { error: slotsError } = await supabase
    .from("time_slots")
    .insert(timeSlots);

  if (slotsError) throw slotsError;

  const poll = await fetchPollById(pollId);
  if (!poll) throw new Error("Failed to load poll after creation");

  return poll;
}

export async function getPoll(id: string): Promise<Poll | null> {
  return fetchPollById(id);
}

export async function submitVotes(
  pollId: string,
  input: SubmitVotesInput
): Promise<Poll | null> {
  const supabase = getSupabaseAdmin();
  const poll = await fetchPollById(pollId);
  if (!poll) return null;

  const voterName = input.voterName.trim();
  const normalizedName = voterName.toLowerCase();

  const { data: existingVotes, error: fetchError } = await supabase
    .from("votes")
    .select("id, voter_name")
    .eq("poll_id", pollId);

  if (fetchError) throw fetchError;

  const voteIdsToDelete = (existingVotes ?? [])
    .filter((vote) => vote.voter_name.toLowerCase() === normalizedName)
    .map((vote) => vote.id);

  if (voteIdsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("votes")
      .delete()
      .in("id", voteIdsToDelete);

    if (deleteError) throw deleteError;
  }

  const newVotes = input.votes.map((vote) => ({
    poll_id: pollId,
    slot_id: vote.slotId,
    voter_name: voterName,
    available: vote.available,
  }));

  if (newVotes.length > 0) {
    const { error: insertError } = await supabase.from("votes").insert(newVotes);
    if (insertError) throw insertError;
  }

  return fetchPollById(pollId);
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
