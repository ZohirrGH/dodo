// delete-officer: delete one account, or every account at once.
//
// Who may call it: Chef Sheriff or Management.
//   { officerId }                                  -> deletes that account
//   { all: true, confirm: "DELETE ALL ACCOUNTS" }  -> deletes every account except the caller's own
//                                                     (and except Chef Sheriff accounts when the caller is Management)
//
// People who sign in with Discord again get a brand new account (their hours and history are gone).

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CHIEF_RANK = "Chef Sheriff";
const ADMIN_RANKS = [CHIEF_RANK, "Management"];
const DELETE_ALL_PHRASE = "DELETE ALL ACCOUNTS";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return response("Method not allowed", 405);

    const authHeader = req.headers.get("Authorization") ?? "";
    const callerToken = authHeader.replace("Bearer ", "");
    if (!callerToken) return response("Missing auth token", 401);

    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: `Bearer ${callerToken}` } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser(callerToken);
    if (userErr || !userData?.user) return response("Invalid session", 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: callerProfile, error: profileErr } = await admin
      .from("profiles")
      .select("rank, name")
      .eq("id", userData.user.id)
      .single();
    if (profileErr || !callerProfile) return response("Profile not found", 403);
    if (!ADMIN_RANKS.includes(callerProfile.rank)) {
      return response("Only the Chef Sheriff or Management can delete accounts", 403);
    }
    const callerIsChief = callerProfile.rank === CHIEF_RANK;

    const body = await req.json().catch(() => ({}));

    // ---- delete every account
    if (body?.all === true) {
      if (body.confirm !== DELETE_ALL_PHRASE) return response(`Type ${DELETE_ALL_PHRASE} to confirm`, 400);

      // read every profile (the API returns at most 1000 rows per request)
      const everyone: { id: string; rank: string }[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await admin.from("profiles").select("id, rank").order("id").range(from, from + 999);
        if (error) return response(error.message, 500);
        everyone.push(...(data ?? []));
        if (!data || data.length < 1000) break;
      }

      const targets = everyone.filter((p) =>
        p.id !== userData.user.id && (callerIsChief || p.rank !== CHIEF_RANK)
      );

      let deleted = 0;
      let failed = 0;
      for (let i = 0; i < targets.length; i += 5) {
        await Promise.all(targets.slice(i, i + 5).map(async (p) => {
          const { error } = await admin.auth.admin.deleteUser(p.id);
          if (error) {
            console.error("delete-officer: could not delete", p.id, error.message);
            failed++;
          } else {
            deleted++;
          }
        }));
      }

      const { error: logErr } = await admin.from("activity_logs").insert({
        actor_id: userData.user.id,
        actor_name: callerProfile.name,
        action: "account_delete",
        target_id: null,
        target_name: null,
        details: `Deleted all accounts: ${deleted} deleted, ${failed} failed`,
      });
      if (logErr) console.error("delete-officer: activity log failed:", logErr.message);

      return response(JSON.stringify({ ok: true, deleted, failed, kept: everyone.length - targets.length }), 200, true);
    }

    // ---- delete one account
    const { officerId } = body;
    if (!officerId) return response("Missing officerId", 400);
    if (officerId === userData.user.id) return response("You cannot delete your own account", 400);

    const { data: targetProfile } = await admin.from("profiles").select("name, rank").eq("id", officerId).single();
    if (targetProfile?.rank === CHIEF_RANK && !callerIsChief) {
      return response("Only the Chef Sheriff can delete a Chef Sheriff account", 403);
    }

    const { error: deleteErr } = await admin.auth.admin.deleteUser(officerId);
    if (deleteErr) return response(deleteErr.message, 400);

    await admin.from("activity_logs").insert({
      actor_id: userData.user.id,
      actor_name: callerProfile.name,
      action: "account_delete",
      target_id: officerId,
      target_name: targetProfile?.name || null,
      details: null,
    });

    return response(JSON.stringify({ ok: true }), 200, true);
  } catch (e) {
    return response(String(e?.message ?? e), 500);
  }
});

function response(body: string, status = 200, isJson = false) {
  return new Response(body, {
    status,
    headers: { "Content-Type": isJson ? "application/json" : "text/plain", ...corsHeaders },
  });
}
