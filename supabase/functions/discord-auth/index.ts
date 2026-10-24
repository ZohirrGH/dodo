// discord-auth: sign people in with Discord and take their name + rank from the Discord server.
//
// Actions (POST JSON):
//   { action: "login", code, redirectUri }  -> { ok, token_hash }   (the site then calls supabase.auth.verifyOtp)
//   { action: "sync" }  + user session      -> { ok, rank }         (re-checks roles of someone already signed in)
//   { action: "relay_store", code, redirectUri, state } -> { ok }   (finishes a login for the tab that is waiting)
//   { action: "relay_poll", state }         -> { ok, pending } | { ok, token_hash }   (that waiting tab asks for the result)
//   { action: "sync_all" }                  -> { ok, checked, changed }   (called by pg_cron every 10 s: refreshes everybody's rank/name)
//
// Errors are JSON: { error: "<code>", message: "<text>" }
// codes: not_in_server | no_role | badge_conflict | bad_code | unauthorized | bad_request | server_error
//
// Secrets (supabase secrets set ...): DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN,
// DISCORD_GUILD_ID, ALLOWED_REDIRECTS (comma separated, e.g. https://my-site.com/,http://localhost:5173/)

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DISCORD_CLIENT_ID = Deno.env.get("DISCORD_CLIENT_ID")!;
const DISCORD_CLIENT_SECRET = Deno.env.get("DISCORD_CLIENT_SECRET")!;
const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")!;
const DISCORD_GUILD_ID = Deno.env.get("DISCORD_GUILD_ID")!;
const ALLOWED_REDIRECTS = (Deno.env.get("ALLOWED_REDIRECTS") ?? "")
  .split(",").map((s) => s.trim()).filter(Boolean);

const DISCORD_API = "https://discord.com/api/v10";
const EMAIL_DOMAIN = "sheriff.local";
// Must match RANKS in App.jsx exactly (including the "Lieutnant" spelling)
// and the profiles_rank_check constraint in the database.
const VALID_RANKS = [
  "Deputy", "Deputy First Class", "Master Deputy", "Sergent", "Lieutnant", "Capitan",
  "Major", "Division Chef", "Assistant Chef", "Management", "Under Sheriff", "Chef Sheriff",
  "Galaxy Citizen",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

class Fail extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") throw new Fail("bad_request", "Method not allowed", 405);
    const body = await req.json().catch(() => ({}));
    if (body?.action === "login") return json(await handleLogin(body));
    if (body?.action === "sync") return json(await handleSync(req));
    if (body?.action === "relay_store") return json(await handleRelayStore(body));
    if (body?.action === "relay_poll") return json(await handleRelayPoll(body));
    if (body?.action === "sync_all") return json(await handleSyncAll());
    throw new Fail("bad_request", "Unknown action", 400);
  } catch (e) {
    if (e instanceof Fail) return json({ error: e.code, message: e.message }, e.status);
    console.error("discord-auth error:", e);
    return json({ error: "server_error", message: "Unexpected server error" }, 500);
  }
});

// ---------------------------------------------------------------- Discord helpers

type DiscordUser = { id: string; username: string; global_name?: string | null; avatar?: string | null };
type Member = { user: DiscordUser; nick?: string | null; avatar?: string | null; roles: string[] };

async function getMember(discordId: string): Promise<Member | null> {
  const res = await fetch(`${DISCORD_API}/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
    headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Discord member lookup failed: ${res.status} ${await res.text()}`);
  return await res.json();
}

type RoleMapRow = { discord_role_id: string | number; rank: string; priority: number };

async function loadRoleMap(): Promise<RoleMapRow[]> {
  const { data, error } = await admin.from("discord_role_map").select("discord_role_id, rank, priority");
  if (error) throw error;
  return (data ?? []) as RoleMapRow[];
}

// Highest priority wins when someone has several mapped roles
function pickRank(map: RoleMapRow[], roleIds: string[]): string | null {
  const mine = new Set(roleIds);
  let best: { rank: string; priority: number } | null = null;
  for (const row of map) {
    if (!mine.has(String(row.discord_role_id))) continue;
    if (!VALID_RANKS.includes(row.rank)) continue;
    if (!best || row.priority > best.priority) best = { rank: row.rank, priority: row.priority };
  }
  return best?.rank ?? null;
}

async function resolveRank(roleIds: string[]): Promise<string | null> {
  return pickRank(await loadRoleMap(), roleIds);
}

// Server nickname -> display name + badge number.
// "[835] Mehdi Viper", "835 | Mehdi Viper" and "Mehdi Viper 835" all give name "Mehdi Viper", badge "835".
export function parseNick(raw: string): { name: string; badge: string | null } {
  const text = (raw ?? "").trim();
  const m = text.match(/\d{2,5}/);
  const badge = m ? m[0] : null;
  let name = text;
  if (badge) {
    name = text
      .replace(/[\[\(]?\s*\d{2,5}\s*[\]\)]?/, "")
      .replace(/^[\s|:.\-–—]+|[\s|:.\-–—]+$/g, "")
      .trim();
  }
  return { name: name || text, badge };
}

function describe(member: Member) {
  const user = member.user;
  const raw = member.nick || user.global_name || user.username || "";
  const { name, badge } = parseNick(raw);
  const avatar = member.avatar
    ? `https://cdn.discordapp.com/guilds/${DISCORD_GUILD_ID}/users/${user.id}/avatars/${member.avatar}.png?size=128`
    : user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : null;
  return { name: name || user.username, badge, avatar };
}

// ---------------------------------------------------------------- profile logic

async function updateLinkedProfile(profileId: string, member: Member, rank: string) {
  const info = describe(member);
  const { data: current } = await admin.from("profiles").select("avatar_url").eq("id", profileId).single();
  const patch: Record<string, unknown> = { name: info.name, rank };
  // never overwrite a picture the officer uploaded themselves
  if (!current?.avatar_url && info.avatar) patch.avatar_url = info.avatar;
  const { error } = await admin.from("profiles").update(patch).eq("id", profileId);
  if (error) throw error;
}

// 1) already linked  2) old account with the same badge and the same rank  3) brand new account
async function findOrCreateProfile(member: Member, rank: string): Promise<string> {
  const discordId = member.user.id;
  const info = describe(member);

  const { data: linked } = await admin.from("profiles").select("id").eq("discord_id", discordId).maybeSingle();
  if (linked) {
    await updateLinkedProfile(linked.id, member, rank);
    return linked.id;
  }

  // Old password-era account: link it so hours and history are kept.
  // Safety: nicknames can be edited by the members themselves, so we only auto-link when the
  // old account has exactly the rank that the Discord roles give. Otherwise nobody can take over
  // a higher-ranked officer's account by copying his badge into their nickname.
  if (info.badge) {
    const { data: rows } = await admin.from("profiles").select("id, rank")
      .eq("badge", info.badge).is("discord_id", null).limit(2);
    if (rows && rows.length === 1 && rows[0].rank === rank) {
      const { error } = await admin.from("profiles").update({ discord_id: discordId }).eq("id", rows[0].id);
      if (error) throw error;
      await updateLinkedProfile(rows[0].id, member, rank);
      return rows[0].id;
    }
  }

  // New account. Nobody knows its password; it can only be entered through Discord.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: `discord_${discordId}@${EMAIL_DOMAIN}`,
    password: crypto.randomUUID() + crypto.randomUUID(),
    email_confirm: true,
  });
  if (createErr || !created?.user) throw createErr ?? new Error("createUser failed");

  const badge = info.badge ?? `D${discordId.slice(-5)}`;
  const { error: insertErr } = await admin.from("profiles").insert({
    id: created.user.id,
    username: badge,
    badge,
    name: info.name,
    rank,
    discord_id: discordId,
    avatar_url: info.avatar,
  });
  if (insertErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    if ((insertErr as { code?: string }).code === "23505") {
      throw new Fail("badge_conflict", "Badge number already used by another account", 409);
    }
    throw insertErr;
  }
  return created.user.id;
}

async function requireMemberWithRole(discordId: string) {
  const member = await getMember(discordId);
  if (!member) throw new Fail("not_in_server", "You are not a member of the Discord server", 403);
  const rank = await resolveRank(member.roles ?? []);
  if (!rank) throw new Fail("no_role", "Your Discord account has no role that gives access", 403);
  return { member, rank };
}

// ---------------------------------------------------------------- actions

async function handleLogin(body: { code?: string; redirectUri?: string }) {
  const { code, redirectUri } = body;
  if (!code || typeof code !== "string" || !redirectUri || typeof redirectUri !== "string") {
    throw new Fail("bad_request", "Missing code", 400);
  }
  if (ALLOWED_REDIRECTS.length === 0) throw new Error("ALLOWED_REDIRECTS is not configured");
  if (!ALLOWED_REDIRECTS.includes(redirectUri)) throw new Fail("bad_request", "Redirect not allowed", 400);

  // 1. Trade the one-time code for the person's Discord identity (the secret never leaves the server)
  const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) throw new Fail("bad_code", "Discord sign-in failed, try again", 400);
  const { access_token } = await tokenRes.json();

  const meRes = await fetch(`${DISCORD_API}/users/@me`, { headers: { Authorization: `Bearer ${access_token}` } });
  if (!meRes.ok) throw new Fail("bad_code", "Discord sign-in failed, try again", 400);
  const me: DiscordUser = await meRes.json();

  // 2. Ask Discord (as the bot) whether this person is in the server and which roles they have
  const { member, rank } = await requireMemberWithRole(me.id);

  // 3. Find / link / create the account and refresh name + rank
  const userId = await findOrCreateProfile(member, rank);

  // 4. Hand back a one-time token; the site turns it into a session with supabase.auth.verifyOtp
  const { data: userData, error: userErr } = await admin.auth.admin.getUserById(userId);
  if (userErr || !userData?.user?.email) throw userErr ?? new Error("user has no email");
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: userData.user.email,
  });
  if (linkErr || !link?.properties?.hashed_token) throw linkErr ?? new Error("generateLink failed");

  return { ok: true, token_hash: link.properties.hashed_token };
}

// ---------------------------------------------------------------- login relay
// The Discord desktop app sends the person back to their DEFAULT browser, which may not be the one where
// they clicked "Login". The tab that started the login keeps waiting and asks for the result with its secret
// state (relay_poll); whichever browser Discord returns to hands the code over (relay_store).
// The one-time token is only ever returned to a caller that knows the state, and is deleted when read.

const RELAY_TTL_MS = 10 * 60 * 1000;

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function requireState(state: unknown): string {
  if (typeof state !== "string" || state.length < 16 || state.length > 128) {
    throw new Fail("bad_request", "Missing state", 400);
  }
  return state;
}

async function handleRelayStore(body: { code?: string; redirectUri?: string; state?: string }) {
  const key = await sha256Hex(requireState(body.state));
  await admin.from("login_relay").delete().lt("created_at", new Date(Date.now() - RELAY_TTL_MS).toISOString());

  let payload: Record<string, unknown>;
  try {
    const result = await handleLogin(body);
    payload = { ok: true, token_hash: result.token_hash };
  } catch (e) {
    if (e instanceof Fail) {
      payload = { error: e.code, message: e.message };
    } else {
      console.error("discord-auth relay_store error:", e);
      payload = { error: "server_error", message: "Unexpected server error" };
    }
  }

  const { error } = await admin.from("login_relay").insert({ key_hash: key, payload });
  if (error && (error as { code?: string }).code !== "23505") throw error;   // 23505: same redirect reloaded, keep the first result
  return { ok: true };
}

async function handleRelayPoll(body: { state?: string }) {
  const key = await sha256Hex(requireState(body.state));
  const { data, error } = await admin.from("login_relay").delete().eq("key_hash", key).select("payload").maybeSingle();
  if (error) throw error;
  if (!data) return { ok: true, pending: true };

  const payload = data.payload as { token_hash?: string; error?: string; message?: string };
  if (payload.token_hash) return { ok: true, token_hash: payload.token_hash };
  throw new Fail(payload.error ?? "server_error", payload.message ?? "Sign-in failed, try again", 400);
}

// ---------------------------------------------------------------- background sync
// Called by pg_cron every 10 seconds. Re-reads every linked officer's Discord roles and writes ONLY what changed
// (name / rank / missing avatar), so nothing is rewritten on quiet ticks. People who left the server or lost every
// mapped role are left alone here: their own page signs them out on its next check (action "sync").
// A throttle slot makes sure the endpoint can not be hammered into Discord's rate limits.

async function handleSyncAll() {
  const { data: slot, error: slotErr } = await admin.rpc("take_role_sync_slot", { p_seconds: 8 });
  if (slotErr) throw slotErr;
  if (!slot) return { ok: true, skipped: "throttled" };

  const map = await loadRoleMap();
  const { data: rows, error } = await admin.from("profiles")
    .select("id, discord_id, name, rank, avatar_url").not("discord_id", "is", null);
  if (error) throw error;

  let changed = 0;
  const list = rows ?? [];
  for (let i = 0; i < list.length; i += 5) {
    await Promise.all(list.slice(i, i + 5).map(async (p) => {
      try {
        const member = await getMember(String(p.discord_id));
        if (!member) return;
        const rank = pickRank(map, member.roles ?? []);
        if (!rank) return;
        const info = describe(member);
        const patch: Record<string, unknown> = {};
        if (info.name && info.name !== p.name) patch.name = info.name;
        if (rank !== p.rank) patch.rank = rank;
        if (!p.avatar_url && info.avatar) patch.avatar_url = info.avatar;
        if (Object.keys(patch).length === 0) return;
        const { error: upErr } = await admin.from("profiles").update(patch).eq("id", p.id);
        if (upErr) throw upErr;
        changed++;
      } catch (e) {
        console.error("sync_all: profile", p.id, "failed:", e);
      }
    }));
  }
  return { ok: true, checked: list.length, changed };
}

async function handleSync(req: Request) {
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!token) throw new Fail("unauthorized", "Missing auth token", 401);
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) throw new Fail("unauthorized", "Invalid session", 401);

  const { data: profile } = await admin.from("profiles").select("id, discord_id").eq("id", userData.user.id).maybeSingle();
  // Old password-era account that never signed in with Discord: nothing to check yet
  if (!profile?.discord_id) return { ok: true, skipped: true };

  const { member, rank } = await requireMemberWithRole(profile.discord_id);
  await updateLinkedProfile(profile.id, member, rank);
  return { ok: true, rank };
}
