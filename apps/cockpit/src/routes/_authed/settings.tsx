import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const tier = user?.app_metadata?.subscription_tier || "free";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-ocean-50 mb-8">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Account Section */}
        <section className="bg-dark-800 rounded-xl p-6 border border-dark-600">
          <h2 className="font-display text-xl font-semibold text-ocean-100 mb-4">
            Account
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-ocean-400 mb-1">Email</label>
              <p className="text-ocean-100">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm text-ocean-400 mb-1">
                User ID
              </label>
              <p className="text-ocean-300 font-mono text-sm">{user?.id}</p>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-dark-800 rounded-xl p-6 border border-dark-600">
          <h2 className="font-display text-xl font-semibold text-ocean-100 mb-4">
            Subscription
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-ocean-100 font-medium">
                {tier === "pro" ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-ocean-400 text-sm">
                {tier === "pro"
                  ? "Full access to all skills and features"
                  : "Basic access with limited skills"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                tier === "pro"
                  ? "bg-ocean-500/20 text-ocean-400"
                  : "bg-dark-700 text-ocean-400"
              }`}
            >
              {tier.toUpperCase()}
            </span>
          </div>
          {tier === "free" && (
            <button className="btn btn-primary w-full">
              Upgrade to Pro - $125/mo
            </button>
          )}
          {tier === "pro" && (
            <button className="btn btn-secondary w-full">
              Manage Subscription
            </button>
          )}
        </section>

        {/* MCP Connection Section */}
        <section className="bg-dark-800 rounded-xl p-6 border border-dark-600">
          <h2 className="font-display text-xl font-semibold text-ocean-100 mb-4">
            MCP Connection
          </h2>
          <p className="text-ocean-300 mb-4">
            Connect CoShip to Claude Code to use your agentic co-founder.
          </p>
          <div className="bg-dark-900 rounded-lg p-4 font-mono text-sm text-ocean-200 mb-4">
            <code>claude mcp add coship</code>
          </div>
          <p className="text-ocean-500 text-sm">
            Run this command in your terminal to connect CoShip to Claude Code.
          </p>
        </section>

        {/* Danger Zone */}
        <section className="bg-dark-800 rounded-xl p-6 border border-red-900/50">
          <h2 className="font-display text-xl font-semibold text-red-400 mb-4">
            Danger Zone
          </h2>
          <p className="text-ocean-400 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button className="btn bg-red-600 hover:bg-red-700 text-white">
            Delete Account
          </button>
        </section>
      </div>
    </div>
  );
}
