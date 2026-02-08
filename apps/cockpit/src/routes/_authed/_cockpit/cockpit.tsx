import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../../../utils/supabase";
import { McpSetupGuide } from "../../../components/McpSetupGuide";
import { SkillsLibrary } from "../../../components/SkillsList";
import { ShipPersonality } from "../../../components/ShipPersonality";
import type { Skill, SkillTier } from "../../../data/skills";
import type { ProjectPersonality } from "../../../data/skills";

const fetchDashboardData = createServerFn({ method: "GET" })
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    // Fetch profile, most recent active project in parallel
    const [profileResult, projectResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("subscription_tier")
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

    const profile = profileResult.data;
    const project = projectResult.data;

    // Fetch personality and skills in parallel
    const projectId = project?.id;

    const [personalityResult, skills] = await Promise.all([
      projectId
        ? supabase
            .from("project_personality")
            .select("*")
            .eq("project_id", projectId)
            .single()
        : Promise.resolve({ data: null }),
      (async () => {
        const mcpUrl =
          process.env.VITE_MCP_SERVER_URL || "http://localhost:8000";
        const apiSecret = process.env.COSHIP_API_SECRET || "";
        try {
          const res = await fetch(`${mcpUrl}/api/skills`, {
            headers: { Authorization: `Bearer ${apiSecret}` },
          });
          if (res.ok) return (await res.json()) as Skill[];
        } catch {
          // MCP server may not be running
        }
        return [] as Skill[];
      })(),
    ]);

    // Extract personality fields and updated_at separately
    const rawPersonality = personalityResult.data as
      | (ProjectPersonality & { updated_at?: string })
      | null;

    let personality: ProjectPersonality | null = null;
    let personalityUpdatedAt: string | null = null;

    if (rawPersonality) {
      personalityUpdatedAt = rawPersonality.updated_at ?? null;
      const { updated_at: _u, created_at: _c, id: _i, project_id: _p, ...rest } =
        rawPersonality as Record<string, unknown>;
      personality = rest as unknown as ProjectPersonality;
    }

    return {
      userTier:
        (profile?.subscription_tier as SkillTier | undefined) ?? "free",
      projectId: projectId ?? null,
      projectName: project?.name ?? "My Project",
      personality,
      personalityUpdatedAt,
      skills,
    };
  });

export const Route = createFileRoute("/_authed/_cockpit/cockpit")({
  loader: async ({ context }) => {
    return fetchDashboardData({ data: { userId: context.user!.id } });
  },
  component: DashboardPage,
});

function DashboardPage() {
  const {
    userTier,
    projectId,
    personality,
    personalityUpdatedAt,
    skills,
  } = Route.useLoaderData();

  // If personality hasn't been configured yet (Claude Desktop not connected),
  // show only the matching onboarding step
  if (!personality) {
    return (
      <div className="max-w-xl mx-auto pt-12">
        <McpSetupGuide projectId={projectId} />
      </div>
    );
  }

  // Build skill last-run map. Matching = personality updated_at.
  const skillLastRun: Record<string, string> = {};
  if (personalityUpdatedAt) {
    // Find matching skill by name
    const matchingSkill = skills.find(
      (s) => s.name.toLowerCase() === "matching",
    );
    if (matchingSkill) {
      skillLastRun[matchingSkill.id] = personalityUpdatedAt;
    }
  }

  return (
    <div className="flex gap-5 items-start">
      {/* Left — Ship's Personality (fixed width, left-aligned) */}
      <div className="w-[340px] flex-shrink-0">
        <ShipPersonality
          personality={personality}
          personalityUpdatedAt={personalityUpdatedAt}
        />
      </div>

      {/* Right — Skills Library (fills remaining width) */}
      <div className="flex-1 min-w-0">
        <SkillsLibrary
          skills={skills}
          userTier={userTier}
          skillLastRun={skillLastRun}
        />
      </div>
    </div>
  );
}
