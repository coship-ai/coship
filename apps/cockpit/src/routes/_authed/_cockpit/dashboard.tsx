import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/_cockpit/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-ocean-50 mb-3">
        Dashboard
      </h1>
      <p className="text-ocean-400 max-w-md">
        Your project overview will appear here.
      </p>
    </div>
  );
}
