import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getSupabaseServerClient } from "../../utils/supabase";
import { encryptAuthCode } from "../../utils/auth-code";
import { ShipLogo } from "../../components/ShipLogo";

type AuthorizeSearch = {
  client_id: string;
  redirect_uri: string;
  state: string;
  response_type: string;
  scope?: string;
};

// Server function to get user info for the consent screen
const getAuthUserInfo = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { user: null };
  }

  return {
    user: {
      email: userData.user.email,
      id: userData.user.id,
    },
  };
});

// Server function to approve: encrypts Supabase tokens into an auth code
const approveAuthorizeFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { redirect_uri: string; state: string }) => d,
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    // Refresh session to get a fresh access_token and unused refresh_token.
    // getSession() only returns the cached (possibly expired) tokens from cookies.
    const { data: refreshData } = await supabase.auth.refreshSession();
    const session = refreshData?.session;

    if (!session) {
      return { error: true, redirectUrl: null };
    }

    const { access_token, refresh_token, expires_in } = session;
    const secret = process.env.COSHIP_API_SECRET;
    if (!secret) {
      return { error: true, redirectUrl: null };
    }

    const code = encryptAuthCode(
      {
        access_token,
        refresh_token,
        expires_in,
        created_at: Date.now(),
      },
      secret,
    );

    const sep = data.redirect_uri.includes("?") ? "&" : "?";
    const redirectUrl = `${data.redirect_uri}${sep}code=${encodeURIComponent(code)}&state=${encodeURIComponent(data.state)}`;

    return { error: false, redirectUrl };
  });

export const Route = createFileRoute("/mcp/authorize")({
  validateSearch: (search: Record<string, unknown>): AuthorizeSearch => {
    return {
      client_id: String(search.client_id || ""),
      redirect_uri: String(search.redirect_uri || ""),
      state: String(search.state || ""),
      response_type: String(search.response_type || "code"),
      scope: search.scope ? String(search.scope) : undefined,
    };
  },
  beforeLoad: async ({ context, search }) => {
    if (!context.user?.id) {
      // Build the full return URL preserving all search params
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(search)) {
        if (v != null) params.set(k, String(v));
      }
      throw redirect({
        to: "/login",
        search: { returnTo: `/mcp/authorize?${params.toString()}` },
      });
    }
  },
  loader: async () => {
    return await getAuthUserInfo();
  },
  component: McpAuthorizePage,
});

function McpAuthorizePage() {
  const { redirect_uri, state } = Route.useSearch();
  const data = Route.useLoaderData();
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setStatus("pending");
    setError(null);

    const result = await approveAuthorizeFn({
      data: { redirect_uri, state },
    });

    if (result.error || !result.redirectUrl) {
      setStatus("error");
      setError("Failed to authorize. Please try again.");
    } else {
      setStatus("success");
      setTimeout(() => {
        window.location.href = result.redirectUrl!;
      }, 1000);
    }
  };

  const handleDeny = () => {
    window.close();
    window.location.href = "/";
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-dark-950">
        <div className="w-full max-w-md text-center">
          <div className="flex flex-col items-center mb-6">
            <ShipLogo size="lg" className="mb-4" />
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-ocean-50 mb-2">
            Authorization Successful
          </h1>
          <p className="text-ocean-300">Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <ShipLogo size="xl" className="mb-4" />
          <h1 className="font-display text-3xl font-bold text-ocean-50 mb-2">
            Authorize Claude Desktop
          </h1>
          <p className="text-ocean-300">
            Claude Desktop is requesting access to your CoShip account
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl p-8 border border-dark-600">
          {/* User info */}
          <div className="mb-6 pb-6 border-b border-dark-600">
            <p className="text-sm text-ocean-400 mb-1">Signed in as</p>
            <p className="text-ocean-50 font-medium">{data.user?.email}</p>
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-ocean-300 mb-3">
              This will allow the application to:
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-ocean-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-ocean-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-ocean-200 text-sm">
                  Access your CoShip MCP tools and skills
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-ocean-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-ocean-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-ocean-200 text-sm">
                  Act on your behalf within your subscription tier
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-ocean-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-ocean-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-ocean-200 text-sm">
                  Read your account information
                </span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDeny}
              disabled={status === "pending"}
              className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-lg text-ocean-300 transition-colors disabled:opacity-50"
            >
              Deny
            </button>
            <button
              onClick={handleApprove}
              disabled={status === "pending"}
              className="flex-1 btn btn-primary py-3"
            >
              {status === "pending" ? "Authorizing..." : "Authorize"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ocean-500">
          Make sure you trust this application before authorizing.
        </p>
      </div>
    </div>
  );
}
