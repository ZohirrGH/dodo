
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VALID_RANKS = ["Deputy", "Deputy First Class", "Master Deputy", "Sergent", "Lieutnant", "Capitan", "Major", "Division Chef", "Assistant Chef", "Under Sheriff", "Chef Sheriff"];
const EMAIL_DOMAIN = "sheriff.local"; 

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
    if (req.method !== "POST") {
      return response("Method not allowed", 405);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const callerToken = authHeader.replace("Bearer ", "");
    if (!callerToken) return response("Missing auth token", 401);

    // Client scoped to the caller's token, just to identify who is calling
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: `Bearer ${callerToken}` } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser(callerToken);
    if (userErr || !userData?.user) return response("Invalid session", 401);

    // Admin client (service role) to check the caller's rank + do privileged writes
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: callerProfile, error: profileErr } = await admin
      .from("profiles")
      .select("rank")
      .eq("id", userData.user.id)
      .single();

    if (profileErr || !callerProfile) return response("Profile not found", 403);
    if (!["Chief Sheriff", "Sheriff"].includes(callerProfile.rank)) {
      return response("Only management can create officers", 403);
    }

    const body = await req.json();
    const { username, password, name, rank, badge } = body ?? {};

    if (!username || !password || !name || !rank || !badge) {
      return response("Missing required fields", 400);
    }
    if (!VALID_RANKS.includes(rank)) return response("Invalid rank", 400);
    if (password.length < 6) return response("Password must be at least 6 characters", 400);

    const cleanUsername = String(username).trim().toLowerCase().replace(/\s+/g, "_");
    const fakeEmail = `${cleanUsername}@${EMAIL_DOMAIN}`;

    // 1. Create the auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: fakeEmail,
      password,
      email_confirm: true,
    });
    if (createErr) return response(createErr.message, 400);

    // 2. Insert the profile row
    const { error: insertErr } = await admin.from("profiles").insert({
      id: created.user.id,
      username: cleanUsername,
      name,
      rank,
      badge,
    });
    if (insertErr) {
      // rollback the auth user if profile insert fails
      await admin.auth.admin.deleteUser(created.user.id);
      return response(insertErr.message, 400);
    }

    return response(JSON.stringify({ ok: true, id: created.user.id, username: cleanUsername }), 200, true);
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
