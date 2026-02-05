import { createClient } from "@supabase/supabase-js";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";

// Supabase configuration - works in both client and server
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Server-side Supabase client with SSR cookie handling
export function getSupabaseServerClient() {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookies) {
        cookies.forEach((cookie) => {
          setCookie(cookie.name, cookie.value);
        });
      },
    },
  });
}

export type User = {
  id: string;
  email?: string;
  app_metadata: {
    subscription_tier?: "free" | "pro";
  };
};
