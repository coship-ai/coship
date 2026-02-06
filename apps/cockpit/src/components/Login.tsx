import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getSupabaseServerClient } from "../utils/supabase";
import { ShipLogo } from "./ShipLogo";

const githubLoginFn = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: "repo",
      redirectTo: `${process.env.VITE_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: true, message: error.message, url: null };
  }

  return { error: false, message: null, url: data.url };
});

export function Login() {
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleGitHubLogin = async () => {
    setStatus("pending");
    setError(null);

    const result = await githubLoginFn();

    if (result.error) {
      setStatus("error");
      setError(result.message);
      return;
    }

    if (result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <ShipLogo size="xl" className="mb-4" />
          <h1 className="font-display text-3xl font-bold text-ocean-50 mb-2">
            Welcome to CoShip
          </h1>
          <p className="text-ocean-300">
            Your agentic co-founder for building MVPs
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl p-8 border border-dark-600">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGitHubLogin}
            disabled={status === "pending"}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-ocean-600 hover:bg-ocean-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {status === "pending" ? "Redirecting..." : "Sign in with GitHub"}
          </button>

          <p className="mt-6 text-center text-xs text-ocean-500">
            We'll request access to create repositories on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}
