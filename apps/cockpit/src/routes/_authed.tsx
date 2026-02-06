import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../utils/supabase";

// Server function to check if user has projects
const checkProjectsFn = createServerFn({ method: "GET" })
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", data.userId)
      .limit(1);

    return { hasProjects: !!(projects && projects.length > 0) };
  });

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context, location }) => {
    if (!context.user?.id) {
      throw redirect({
        to: "/login",
      });
    }

    // Skip project check if already heading to onboarding
    if (location.pathname === "/new-project") {
      return;
    }

    const { hasProjects } = await checkProjectsFn({
      data: { userId: context.user.id },
    });

    if (!hasProjects) {
      throw redirect({ to: "/new-project" });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return <Outlet />;
}
