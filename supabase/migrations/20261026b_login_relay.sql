-- Discord login relay: lets the browser tab that started the login receive the result even when the
-- Discord desktop app returns the person to a different browser.
-- The callback page stores the finished login here (through the discord-auth function), the first tab picks it up
-- with its secret "state" and the row is deleted on read. Rows older than 10 minutes are purged.
-- RLS is on with no policies: only the service role (the edge function) can read or write this table.

create table if not exists public.login_relay (
  key_hash   text primary key,            -- sha256 of the OAuth state
  payload    jsonb not null,              -- { ok, token_hash } or { error, message }
  created_at timestamptz not null default now()
);

alter table public.login_relay enable row level security;
revoke all on public.login_relay from anon, authenticated;
