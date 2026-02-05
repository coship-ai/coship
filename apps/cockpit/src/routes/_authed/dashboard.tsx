import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const tier = user?.app_metadata?.subscription_tier || "free";

  const skills = [
    {
      name: "MVP Scoping",
      description: "Define and scope your minimum viable product",
      tier: "free",
      available: true,
    },
    {
      name: "Tech Stack Advisor",
      description: "Get personalized tech stack recommendations",
      tier: "free",
      available: true,
    },
    {
      name: "Code Review",
      description: "Get expert code reviews for your codebase",
      tier: "pro",
      available: tier === "pro",
    },
    {
      name: "Deployment Guide",
      description: "Step-by-step deployment assistance",
      tier: "pro",
      available: tier === "pro",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ocean-50 mb-2">
          Welcome to CoShip
        </h1>
        <p className="text-ocean-300">
          Your agentic co-founder is ready to help you build.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
          <h2 className="font-display text-xl font-semibold text-ocean-100 mb-4">
            Quick Start
          </h2>
          <p className="text-ocean-300 mb-4">
            Connect CoShip to Claude Code to get started with your agentic
            co-founder.
          </p>
          <div className="bg-dark-900 rounded-lg p-4 font-mono text-sm text-ocean-200">
            <code>claude mcp add coship</code>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-600">
          <h2 className="font-display text-xl font-semibold text-ocean-100 mb-4">
            Your Plan
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-lg font-semibold ${
                tier === "pro" ? "text-ocean-400" : "text-ocean-300"
              }`}
            >
              {tier === "pro" ? "Pro" : "Free"} Plan
            </span>
            {tier === "free" && (
              <span className="text-xs bg-ocean-500/20 text-ocean-400 px-2 py-1 rounded-full">
                Upgrade for more
              </span>
            )}
          </div>
          <p className="text-ocean-400 text-sm">
            {tier === "pro"
              ? "You have access to all skills and features."
              : "Upgrade to Pro for code reviews, deployment guides, and more."}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ocean-100 mb-4">
          Available Skills
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className={`bg-dark-800 rounded-xl p-5 border ${
                skill.available
                  ? "border-dark-600"
                  : "border-dark-700 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-ocean-100">{skill.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    skill.tier === "pro"
                      ? "bg-ocean-500/20 text-ocean-400"
                      : "bg-dark-700 text-ocean-400"
                  }`}
                >
                  {skill.tier.toUpperCase()}
                </span>
              </div>
              <p className="text-ocean-400 text-sm">{skill.description}</p>
              {!skill.available && (
                <p className="text-ocean-500 text-xs mt-2">
                  Upgrade to Pro to unlock
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
