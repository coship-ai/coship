import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TopBar } from "../../components/TopBar";

export const Route = createFileRoute("/_authed/_cockpit")({
  component: CockpitLayout,
});

function CockpitLayout() {
  return (
    <div className="min-h-screen bg-dark-900">
      <TopBar />
      <main className="pt-14">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
