-- Run this in Supabase: SQL Editor → New query → Run

create table if not exists polls (
  id text primary key,
  event_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists time_slots (
  id text primary key,
  poll_id text not null references polls(id) on delete cascade,
  datetime timestamptz not null
);

create table if not exists votes (
  id bigserial primary key,
  poll_id text not null references polls(id) on delete cascade,
  slot_id text not null references time_slots(id) on delete cascade,
  voter_name text not null,
  available boolean not null default false,
  unique (poll_id, slot_id, voter_name)
);

create index if not exists time_slots_poll_id_idx on time_slots(poll_id);
create index if not exists votes_poll_id_idx on votes(poll_id);
