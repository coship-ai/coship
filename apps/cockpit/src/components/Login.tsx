import { useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "../hooks/useMutation";
import { loginFn } from "../routes/_authed";
import { signupFn } from "../routes/signup";
import { Auth } from "./Auth";
import { ShipLogo } from "./ShipLogo";

type LoginProps = {
  redirectTo?: string;
};

export function Login({ redirectTo }: LoginProps) {
  const router = useRouter();

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await router.invalidate();
        router.navigate({ to: redirectTo || "/dashboard" });
      }
    },
  });

  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <ShipLogo size="xl" className="mb-4" />
          <h1 className="font-display text-3xl font-bold text-ocean-50 mb-2">
            Welcome Back
          </h1>
          <p className="text-ocean-300">
            Sign in to continue shipping
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl p-8 border border-dark-600">
          <Auth
            actionText="Sign In"
            status={loginMutation.status}
            onSubmit={(e) => {
              const formData = new FormData(e.target as HTMLFormElement);
              loginMutation.mutate({
                data: {
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                },
              });
            }}
            afterSubmit={
              loginMutation.data ? (
                <>
                  {loginMutation.data.error && (
                    <div className="text-red-400 mt-4">
                      {loginMutation.data.message}
                    </div>
                  )}
                  {loginMutation.data.error &&
                  loginMutation.data.message === "Invalid login credentials" ? (
                    <div className="mt-2">
                      <button
                        className="text-ocean-400 hover:text-ocean-300 underline text-sm"
                        onClick={(e) => {
                          const formData = new FormData(
                            (e.target as HTMLButtonElement).form!
                          );
                          signupMutation.mutate({
                            data: {
                              email: formData.get("email") as string,
                              password: formData.get("password") as string,
                            },
                          });
                        }}
                        type="button"
                      >
                        Sign up instead?
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null
            }
          />

          <div className="mt-6 text-center text-ocean-400">
            <p>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-ocean-400 hover:text-ocean-300 underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
