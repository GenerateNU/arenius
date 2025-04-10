import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
    console.warn("Supabase URL not found during build. Using placeholder.");
  } else {
    console.error("Supabase URL is required.");
  }
}

export const supabaseClient = createClient(
  supabaseUrl || "https://placeholder-for-static-build.supabase.co",
  supabaseAnonKey || "placeholder-key-for-static-build"
);
