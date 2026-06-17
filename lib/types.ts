export interface TimeSlot {
  id: string;
  datetime: string; // ISO 8601
}

export interface Vote {
  voterName: string;
  slotId: string;
  available: boolean;
}

export interface Poll {
  id: string;
  eventName: string;
  timeSlots: TimeSlot[];
  votes: Vote[];
  createdAt: string;
}

export interface CreatePollInput {
  eventName: string;
  timeSlots: { datetime: string }[];
}

export interface SubmitVotesInput {
  voterName: string;
  votes: { slotId: string; available: boolean }[];
}

export interface SlotResult {
  slot: TimeSlot;
  voteCount: number;
  availableNames: string[];
}

export interface PollResults {
  poll: Poll;
  slotResults: SlotResult[];
  maxVotes: number;
}
