import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../../../utils/supabase";
import { McpSetupGuide } from "../../../components/McpSetupGuide";
import { SkillsList } from "../../../components/SkillsList";
import { ShipPersonality } from "../../../components/ShipPersonality";
import type { Skill, SkillTier } from "../../../data/skills";

const fetchDashboardData = createServerFn({ method: "GET" })
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    // Fetch profile and most recent active project in parallel
    const [profileResult, projectResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("mcp_connected_at, subscription_tier")
        .eq("id", data.userId)
        .single(),
      supabase
        .from("projects")
        .select("id, name, slug, status")
        .eq("user_id", data.userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    // Fetch skills from MCP server
    let skills: Skill[] = [];
    const mcpUrl = process.env.VITE_MCP_SERVER_URL || "http://localhost:8000";
    const apiSecret = process.env.COSHIP_API_SECRET || "";

    try {
      const res = await fetch(`${mcpUrl}/api/skills`, {
        headers: { Authorization: `Bearer ${apiSecret}` },
      });
      if (res.ok) {
        skills = await res.json();
      }
    } catch {
      // MCP server may not be running — use empty list
    }

    const profile = profileResult.data;
    const project = projectResult.data;

    return {
      mcpConnectedAt: profile?.mcp_connected_at ?? null,
      userTier:
        (profile?.subscription_tier as SkillTier | undefined) ?? "free",
      projectName: project?.name ?? "My Project",
      skills,
    };
  });

export const Route = createFileRoute("/_authed/_cockpit/dashboard")({
  loader: async ({ context }) => {
    return fetchDashboardData({ data: { userId: context.user!.id } });
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { mcpConnectedAt, userTier, projectName, skills } =
    Route.useLoaderData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ocean-50">
          {projectName}
        </h1>
        <p className="text-ocean-400 text-sm mt-1">Your project overview</p>
      </div>

      {/* Hero section — setup guide when not connected, personality when connected */}
      {mcpConnectedAt ? (
        <ShipPersonality projectName={projectName} />
      ) : (
        <McpSetupGuide />
      )}

      {/* Skills list — full width below */}
      <SkillsList skills={skills} userTier={userTier} />
    </div>
  );
}
