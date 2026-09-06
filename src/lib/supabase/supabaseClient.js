import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://btqhhilvtlnfwqglbfki.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cWhoaWx2dGxuZndxZ2xiZmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTY5NzcsImV4cCI6MjEwNDE3Mjk3N30.8VKIe6_5eUvrtnZ5RXfIwFSoC3qNuMTF4v7srowK_T4";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name) {
        if (typeof document === "undefined") return null;
        const match = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${name}=`));
        return match ? decodeURIComponent(match.split("=")[1]) : null;
      },
      set(name, value, options) {
        if (typeof document === "undefined") return;
        let cookie = `${name}=${encodeURIComponent(value)}`;
        if (options?.maxAge) {
          cookie += `; Max-Age=${options.maxAge}`;
        } else if (options?.expires) {
          cookie += `; Expires=${options.expires.toUTCString()}`;
        }
        cookie += options?.path ? `; Path=${options.path}` : "; Path=/";
        if (options?.domain) cookie += `; Domain=${options.domain}`;
        if (options?.secure) cookie += "; Secure";
        cookie += options?.sameSite
          ? `; SameSite=${options.sameSite}`
          : "; SameSite=Lax";
        document.cookie = cookie;
      },
      remove(name, options) {
        if (typeof document === "undefined") return;
        let cookie = `${name}=; Max-Age=-1`;
        cookie += options?.path ? `; Path=${options.path}` : "; Path=/";
        if (options?.domain) cookie += `; Domain=${options.domain}`;
        document.cookie = cookie;
      },
    },
  });
}

export default createClient;
