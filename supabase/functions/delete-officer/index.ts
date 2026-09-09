
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    if (callerProfile.rank !== "Chef Sheriff") {
      return response("Only the Chief Sheriff can delete accounts", 403);
    }

    const { officerId } = await req.json();
    if (!officerId) return response("Missing officerId", 400);
    if (officerId === userData.user.id) return response("You cannot delete your own account", 400);

    const { data: targetProfile } = await admin.from("profiles").select("name").eq("id", officerId).single();

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
