const REQUIRED_ENV_VARS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const;

function assertRequiredEnvVars(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. Copy frontend/.env.example to frontend/.env and fill real values.`,
    );
  }
}

export function requireEnv(): { supabaseUrl: string; supabaseAnonKey: string } {
  assertRequiredEnvVars();
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api",
};