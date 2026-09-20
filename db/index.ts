import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { createClient } from "@supabase/supabase-js";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

// Supabase client for auth, storage, and REST API
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Types for Supabase
export type SupabaseProfile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  occupation: string;
  locale: string;
  cv_key: string;
  cv_name: string;
  cv_type: string;
  cv_size: number;
  created_at: string;
  updated_at: string;
};

export type SupabaseApplication = {
  id: string;
  user_id: string;
  job_title: string;
  country: string;
  profession: string;
  message: string;
  cv_key: string;
  cv_name: string;
  cv_type: string;
  cv_size: number;
  status: string;
  created_at: string;
};
