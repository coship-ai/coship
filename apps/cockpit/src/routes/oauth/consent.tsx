import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getSupabaseServerClient } from "../../utils/supabase";
import { ShipLogo } from "../../components/ShipLogo";

type ConsentSearch = {
  authorization_id: string;
};

// Server function to get authorization details and user session
const getAuthorizationDetails = createServerFn({ method: "GET" })
  .inputValidator((d: { authorizationId: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { user: null, authorizationId: data.authorizationId };
    }

    // Get the session for the access token
    const { data: sessionData } = await supabase.auth.getSession();

    return {
      user: {
        email: userData.user.email,
        id: userData.user.id,
      },
      accessToken: sessionData.session?.access_token,
      authorizationId: data.authorizationId,
    };
  });

// MCP Server URL - loaded at build time
const MCP_SERVER_URL = process.env.VITE_MCP_SERVER_URL || "http://localhost:8000";

// Server function to approve authorization
const approveAuthorization = createServerFn({ method: "POST" })
  .inputValidator((d: { authorizationId: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.access_token) {
      return { error: true, message: "Not authenticated" };
    }

    // Call the MCP server to complete authorization
    const mcpServerUrl = MCP_SERVER_URL;

    try {
      const response = await fetch(`${mcpServerUrl}/oauth/authorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          authorization_id: data.authorizationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: true,
          message: errorData.detail || `Authorization failed: ${response.status}`
        };
      }

      const result = await response.json();
      return {
        error: false,
        redirectUrl: result.redirect_uri || result.redirect_url,
      };
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : "Failed to complete authorization"
      };
    }
  });

export const Route = createFileRoute("/oauth/consent")({
  validateSearch: (search: Record<string, unknown>): ConsentSearch => {
    const authorizationId = search.authorization_id;
    if (typeof authorizationId !== "string" || !authorizationId) {
      throw new Error("Missing authorization_id parameter");
    }
    return { authorization_id: authorizationId };
  },
  beforeLoad: async ({ context, search }) => {
    // If user is not logged in, redirect to login with consent page as redirect
    if (!context.user) {
      throw redirect({
        to: "/login",
        search: { redirect: `/oauth/consent?authorization_id=${search.authorization_id}` },
      });
    }
  },
  loaderDeps: ({ search }) => ({ authorizationId: search.authorization_id }),
  loader: async ({ deps }) => {
    const details = await getAuthorizationDetails({
      data: { authorizationId: deps.authorizationId },
    });
    return details;
  },
  component: ConsentPage,
});

function ConsentPage() {
  const { authorization_id } = Route.useSearch();
  const data = Route.useLoaderData();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const approve = useServerFn(approveAuthorization);

  const handleApprove = async () => {
    setStatus("pending");
    setError(null);

    const result = await approve({ data: { authorizationId: authorization_id } });

    if (result.error) {
      setStatus("error");
      setError(result.message || "Authorization failed");
    } else {
      setStatus("success");
      if (result.redirectUrl) {
        setRedirectUrl(result.redirectUrl);
        // Redirect after a brief delay to show success message
        setTimeout(() => {
          window.location.href = result.redirectUrl!;
        }, 1500);
      }
    }
  };

  const handleDeny = () => {
    // Simply close the window or redirect to home
    window.close();
    // Fallback if window.close() doesn't work
    window.location.href = "/";
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
        <div className="w-full max-w-md text-center">
          <div className="flex flex-col items-center mb-6">
            <ShipLogo size="lg" className="mb-4" />
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-ocean-50 mb-2">
            Authorization Successful
          </h1>
          <p className="text-ocean-300">
            {redirectUrl ? "Redirecting you back..." : "You can close this window."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <ShipLogo size="xl" className="mb-4" />
          <h1 className="font-display text-3xl font-bold text-ocean-50 mb-2">
            Authorize Access
          </h1>
          <p className="text-ocean-300">
            An application is requesting access to your CoShip account
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
            <h2 className="text-sm font-medium text-ocean-300 mb-3">This will allow the application to:</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-ocean-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-ocean-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-ocean-200 text-sm">Access your CoShip MCP tools and skills</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-ocean-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-ocean-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-ocean-200 text-sm">Act on your behalf within your subscription tier</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-ocean-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-ocean-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-ocean-200 text-sm">Read your account information</span>
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
