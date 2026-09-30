import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const runtimeEnv = process.env;
const url = runtimeEnv["SUPABASE_URL"];
const key = runtimeEnv["SUPABASE_SECRET_KEY"];

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
  }

  return createClient(url, key);
}

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