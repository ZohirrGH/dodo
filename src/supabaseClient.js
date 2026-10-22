import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// detectSessionInUrl is off: Discord sends people back with ?code=..., and that code
// is handled by App.jsx (it goes to the discord-auth function), not by supabase-js.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { detectSessionInUrl: false },
});

export const EMAIL_DOMAIN = "sheriff.local";
export const usernameToEmail = (username) =>
  `${String(username).trim().toLowerCase().replace(/\s+/g, "_")}@${EMAIL_DOMAIN}`;
