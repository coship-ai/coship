import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (context.user?.id) {
      throw redirect({ to: "/cockpit" });
    }
    throw redirect({ to: "/login" });
  },
});
