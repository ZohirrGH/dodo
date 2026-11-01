// manage-roles: create / link / delete the custom roles that Chef Sheriff and Management make from the Permissions room.
//
// Actions (POST JSON, signed-in Chef Sheriff or Management only):
//   { action: "list" }                                          -> { ok, roles: [{ name, discordRoleId, priority, members }] }
//   { action: "create", name, discordRoleId?, priority? }       -> { ok }
//   { action: "link", name, discordRoleId }                     -> { ok }   (empty discordRoleId = unlink)
//   { action: "delete", name }                                  -> { ok }   (only a role that has no members)
//
// Errors are plain text with an HTTP status, the same style as delete-officer.
// A custom role starts with the least access (dashboard + rules rooms, nothing else); the permissions room opens more.
// The Discord role is NOT created here: the person pastes the ID of a role that already exists in the Discord server,
// and the discord-auth sync gives that role's members this rank within seconds.

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ADMIN_RANKS = ["Chef Sheriff", "Management"];
const BUILTIN_RANKS = [
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
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function text(body: string, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/plain", ...corsHeaders } });
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") throw new Fail("Method not allowed", 405);

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) throw new Fail("Missing auth token", 401);
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) throw new Fail("Invalid session", 401);

    const { data: caller } = await admin.from("profiles").select("id, name, rank").eq("id", userData.user.id).maybeSingle();
    if (!caller) throw new Fail("Profile not found", 403);
    if (!ADMIN_RANKS.includes(caller.rank)) throw new Fail("Only the Chef Sheriff or Management can manage roles", 403);

    const body = await req.json().catch(() => ({}));
    switch (body?.action) {
      case "list": return json(await listRoles());
      case "create": return json(await createRole(caller, body));
      case "link": return json(await linkRole(body));
      case "delete": return json(await deleteRole(caller, body));
      default: throw new Fail("Unknown action", 400);
    }
  } catch (e) {
    if (e instanceof Fail) return text(e.message, e.status);
    console.error("manage-roles error:", e);
    return text("Unexpected server error", 500);
  }
});

// ---------------------------------------------------------------- helpers

function cleanName(raw: unknown): string {
  const name = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 40) throw new Fail("The role name must be 2 to 40 characters", 400);
  if (!/^[\p{L}\p{N} ._'’&-]+$/u.test(name)) throw new Fail("The role name can only use letters, numbers, spaces and . _ ' & -", 400);
  return name;
}

function cleanRoleId(raw: unknown, required: boolean): string | null {
  const id = String(raw ?? "").trim();
  if (!id) {
    if (required) throw new Fail("Paste the Discord role ID", 400);
    return null;
  }
  if (!/^\d{17,20}$/.test(id)) {
    throw new Fail("That does not look like a Discord role ID (it is a number of 17 to 20 digits)", 400);
  }
  return id;
}

function cleanPriority(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(100, Math.max(0, Math.round(n)));
}

async function customNames(): Promise<string[]> {
  const { data, error } = await admin.from("custom_ranks").select("name");
  if (error) throw new Fail("Custom roles are not set up yet: run the migration 20261101_admin_roles_custom_ranks.sql first", 500);
  return (data ?? []).map((r: { name: string }) => r.name);
}

async function requireCustom(name: string) {
  if (!(await customNames()).includes(name)) {
    throw new Fail("Only roles created from the website can be changed here", 400);
  }
}

async function roleIdTaken(roleId: string, exceptRank?: string): Promise<string | null> {
  const { data, error } = await admin.from("discord_role_map").select("rank").eq("discord_role_id", roleId).limit(1);
  if (error) throw error;
  const row = data?.[0];
  if (row && row.rank !== exceptRank) return row.rank as string;
  return null;
}

async function logActivity(caller: { id: string; name: string }, action: string, targetName: string, details: string | null) {
  try {
    const { error } = await admin.from("activity_logs").insert({
      actor_id: caller.id, actor_name: caller.name, action, target_id: null, target_name: targetName, details,
    });
    if (error) console.error("activity log failed:", error.message);
  } catch (e) {
    console.error("activity log failed:", e);
  }
}

// ---------------------------------------------------------------- actions

async function listRoles() {
  const names = await customNames();
  const { data: map, error } = await admin.from("discord_role_map").select("discord_role_id, rank, priority").in("rank", names.length ? names : ["__none__"]);
  if (error) throw error;
  const { data: members, error: memErr } = await admin.from("profiles").select("rank").in("rank", names.length ? names : ["__none__"]);
  if (memErr) throw memErr;

  const roles = names.sort((a, b) => a.localeCompare(b)).map((name) => {
    const link = (map ?? []).find((m: { rank: string }) => m.rank === name);
    return {
      name,
      discordRoleId: link ? String(link.discord_role_id) : null,
      priority: link ? link.priority : null,
      members: (members ?? []).filter((m: { rank: string }) => m.rank === name).length,
    };
  });
  return { ok: true, roles };
}

async function createRole(caller: { id: string; name: string }, body: Record<string, unknown>) {
  const name = cleanName(body.name);
  const roleId = cleanRoleId(body.discordRoleId, false);
  const priority = cleanPriority(body.priority);

  const taken = [...BUILTIN_RANKS, ...(await customNames())].map((n) => n.toLowerCase());
  if (taken.includes(name.toLowerCase())) throw new Fail("A role with this name already exists", 409);
  if (roleId) {
    const owner = await roleIdTaken(roleId);
    if (owner) throw new Fail(`That Discord role is already linked to "${owner}"`, 409);
  }

  const { error: rankErr } = await admin.from("custom_ranks").insert({ name, created_by: caller.id });
  if (rankErr) throw rankErr;

  // least access to start with; the permissions room opens more. Mirrors the defaults in App.jsx.
  const { error: permErr } = await admin.from("role_permissions").upsert({
    rank: name,
    rooms: { dashboard: true, rules: true },
    actions: {},
    updated_at: new Date().toISOString(),
    updated_by: caller.id,
  }, { onConflict: "rank" });
  if (permErr) {
    await admin.from("custom_ranks").delete().eq("name", name);
    throw permErr;
  }

  if (roleId) {
    const { error: mapErr } = await admin.from("discord_role_map").insert({ discord_role_id: roleId, rank: name, priority });
    if (mapErr) {
      await admin.from("role_permissions").delete().eq("rank", name);
      await admin.from("custom_ranks").delete().eq("name", name);
      throw mapErr;
    }
  }

  await logActivity(caller, "role_create", name, roleId ? `Discord role ${roleId}` : "not linked to a Discord role yet");
  return { ok: true };
}

async function linkRole(body: Record<string, unknown>) {
  const name = cleanName(body.name);
  await requireCustom(name);
  const roleId = cleanRoleId(body.discordRoleId, false);

  const { data: old, error: oldErr } = await admin.from("discord_role_map").select("priority").eq("rank", name).limit(1);
  if (oldErr) throw oldErr;
  const priority = body.priority === undefined && old?.[0] ? old[0].priority : cleanPriority(body.priority);

  if (roleId) {
    const owner = await roleIdTaken(roleId, name);
    if (owner) throw new Fail(`That Discord role is already linked to "${owner}"`, 409);
  }

  const { error: delErr } = await admin.from("discord_role_map").delete().eq("rank", name);
  if (delErr) throw delErr;
  if (roleId) {
    const { error } = await admin.from("discord_role_map").insert({ discord_role_id: roleId, rank: name, priority });
    if (error) throw error;
  }
  return { ok: true };
}

async function deleteRole(caller: { id: string; name: string }, body: Record<string, unknown>) {
  const name = cleanName(body.name);
  await requireCustom(name);

  const { count, error: countErr } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("rank", name);
  if (countErr) throw countErr;
  if ((count ?? 0) > 0) {
    throw new Fail(`${count} people still have this role. Take the Discord role away from them first, then delete it`, 409);
  }

  const { error: rankErr } = await admin.from("custom_ranks").delete().eq("name", name);
  if (rankErr) throw new Fail(rankErr.message, 409);
  await admin.from("role_permissions").delete().eq("rank", name);
  await admin.from("discord_role_map").delete().eq("rank", name);

  await logActivity(caller, "role_delete", name, null);
  return { ok: true };
}
