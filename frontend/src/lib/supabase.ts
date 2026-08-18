import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { requireEnv } from "./env";

const { supabaseUrl, supabaseAnonKey } = requireEnv();

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});