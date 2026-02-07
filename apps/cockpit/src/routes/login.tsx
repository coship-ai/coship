import { createFileRoute } from "@tanstack/react-router";
import { Login } from "../components/Login";

type LoginSearch = {
  returnTo?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { returnTo } = Route.useSearch();
  return <Login returnTo={returnTo} />;
}
