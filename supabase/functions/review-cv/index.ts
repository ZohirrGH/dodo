// review-cv: accept or reject a CV Sheriff application. This is the only way a status can change.
//
// POST JSON (with the reviewer's session):
//   { id, decision: "accept" }
//   { id, decision: "reject", reason }        reason: 3 to 500 characters
// -> { ok: true, status }
//
// Errors are JSON: { error: "<code>", message: "<text>" }
// codes: unauthorized | forbidden | bad_request | not_found | already_reviewed | discord_failed | server_error
//
// Accept: the Discord role "Accepted CV Sheriff" is given FIRST. The site is only updated when Discord said yes,
// so a failure never leaves an "accepted" row without the role. Giving the same role twice is harmless, which makes
// "try again" safe if the database update fails after Discord succeeded.
// GALAXY CITIZEN is NOT removed, so the person can still sign in and see the result.
//
// Secrets: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID (already used by discord-auth).
// Optional: ACCEPTED_ROLE_ID (defaults to the Accepted CV Sheriff role id below).
// The bot needs the Manage Roles permission and its highest role must be ABOVE the Accepted CV Sheriff role.

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")!;
const DISCORD_GUILD_ID = Deno.env.get("DISCORD_GUILD_ID")!;
const ACCEPTED_ROLE_ID = Deno.env.get("ACCEPTED_ROLE_ID") ?? "1491121375270801518";

const DISCORD_API = "https://discord.com/api/v10";

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
    return json(await handle(req, body));
  } catch (e) {
    if (e instanceof Fail) return json({ error: e.code, message: e.message }, e.status);
    console.error("review-cv error:", e);
    return json({ error: "server_error", message: "Unexpected server error" }, 500);
  }
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handle(req: Request, body: { id?: unknown; decision?: unknown; reason?: unknown }) {
  // 1. Who is calling, and may they review?
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) throw new Fail("unauthorized", "Missing auth token", 401);
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) throw new Fail("unauthorized", "Invalid session", 401);
  const reviewerId = userData.user.id;

  // has_perm() reads auth.uid() from the caller's own session, so ask it as the caller (not as the service role)
  const asCaller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data: allowed, error: permErr } = await asCaller.rpc("has_perm", { p_room: "cv", p_action: "review" });
  if (permErr) throw permErr;
  if (allowed !== true) throw new Fail("forbidden", "You are not allowed to review applications", 403);

  // 2. Validate the request
  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID.test(id)) throw new Fail("bad_request", "Invalid application id", 400);
  const decision = body.decision;
  if (decision !== "accept" && decision !== "reject") throw new Fail("bad_request", "Decision must be accept or reject", 400);
  let reason: string | null = null;
  if (decision === "reject") {
    reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (reason.length < 3 || reason.length > 500) {
      throw new Fail("bad_request", "Write a rejection reason (3 to 500 characters)", 400);
    }
  }

  // 3. The application must still be waiting
  const { data: app, error: appErr } = await admin
    .from("cv_applications")
    .select("id, applicant_id, discord_id, status")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (appErr) throw appErr;
  if (!app) throw new Fail("not_found", "Application not found (it may have been deleted)", 404);
  if (app.status !== "pending") throw new Fail("already_reviewed", "This application was already reviewed", 409);
  if (app.applicant_id === reviewerId) throw new Fail("forbidden", "You cannot review your own application", 403);

  // 4. Accept: Discord first
  if (decision === "accept") {
    const res = await fetch(
      `${DISCORD_API}/guilds/${DISCORD_GUILD_ID}/members/${app.discord_id}/roles/${ACCEPTED_ROLE_ID}`,
      {
        method: "PUT",
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, "X-Audit-Log-Reason": "CV Sheriff accepted" },
      },
    );
    if (!res.ok) {
      console.error("Discord role grant failed:", res.status, await res.text());
      const hint = res.status === 403
        ? "The bot is not allowed to give this role (Manage Roles, and its role must be above Accepted CV Sheriff)"
        : res.status === 404
        ? "The applicant is no longer in the Discord server"
        : "Discord did not accept the request";
      throw new Fail("discord_failed", `${hint}. The application was not changed.`, 502);
    }
  }

  // 5. Save the decision (only if it is still pending, so two reviewers cannot both win)
  const patch = decision === "accept"
    ? { status: "accepted", reject_reason: null, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() }
    : { status: "rejected", reject_reason: reason, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() };
  const { data: updated, error: updErr } = await admin
    .from("cv_applications")
    .update(patch)
    .eq("id", id)
    .eq("status", "pending")
    .is("deleted_at", null)
    .select("status");
  if (updErr) throw updErr;
  if (!updated || updated.length === 0) {
    throw new Fail("already_reviewed", "This application was changed by someone else", 409);
  }
  return { ok: true, status: patch.status };
}
