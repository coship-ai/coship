import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../../utils/supabase";

const handleCallbackFn = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string; returnTo?: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    // Exchange the OAuth code for a session
    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(data.code);

    if (error || !sessionData.session) {
      return { error: true, redirectTo: "/login" };
    }

    const { session } = sessionData;
    const user = session.user;

    // Store GitHub info in profiles
    const githubUsername =
      user.user_metadata?.user_name || user.user_metadata?.preferred_username;
    const githubAvatarUrl = user.user_metadata?.avatar_url;
    const providerToken = session.provider_token;

    if (githubUsername || githubAvatarUrl || providerToken) {
      await supabase
        .from("profiles")
        .update({
          github_username: githubUsername || null,
          github_avatar_url: githubAvatarUrl || null,
          github_provider_token: providerToken || null,
        })
        .eq("id", user.id);
    }

    // If there's a returnTo URL (e.g. from MCP authorize flow), go there
    if (data.returnTo) {
      return { error: false, redirectTo: data.returnTo };
    }

    // Check if user has any projects
    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    const hasProjects = projects && projects.length > 0;

    return {
      error: false,
      redirectTo: hasProjects ? "/" : "/new-project",
    };
  });

export const Route = createFileRoute("/auth/callback")({
  loaderDeps: ({ search }) => ({
    code: (search as Record<string, string>).code,
    returnTo: (search as Record<string, string>).returnTo,
  }),
  loader: async ({ deps }) => {
    if (!deps.code) {
      throw redirect({ to: "/login" });
    }

    const result = await handleCallbackFn({
      data: { code: deps.code, returnTo: deps.returnTo },
    });
    throw redirect({ to: result.redirectTo });
  },
});
