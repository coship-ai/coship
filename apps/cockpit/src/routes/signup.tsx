import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../utils/supabase";
import { useMutation } from "../hooks/useMutation";
import { Auth } from "../components/Auth";
import { ShipLogo } from "../components/ShipLogo";

type SignupResult = {
  error: boolean;
  message: string;
  confirmed: boolean;
};

export const signupFn = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string }) => d)
  .handler(async ({ data }): Promise<SignupResult> => {
    const supabase = getSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        error: true,
        message: error.message,
        confirmed: false,
      };
    }

    // Check if user was auto-confirmed (local dev with enable_confirmations = false)
    const isConfirmed = !!authData.session;

    return {
      error: false,
      message: isConfirmed ? "Account created!" : "Check your email for a confirmation link!",
      confirmed: isConfirmed,
    };
  });

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const router = useRouter();

  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
    onSuccess: async (ctx) => {
      if (!ctx.data?.error && ctx.data?.confirmed) {
        // Auto-confirmed, redirect to dashboard
        await router.invalidate();
        router.navigate({ to: "/dashboard" });
      }
    },
  });

  // Show email confirmation message only if signup succeeded but needs confirmation
  if (signupMutation.data && !signupMutation.data.error && !signupMutation.data.confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
        <div className="w-full max-w-md text-center flex flex-col items-center">
          <ShipLogo size="xl" className="mb-4" />
          <h1 className="font-display text-3xl font-bold text-ocean-50 mb-4">
            Check Your Email
          </h1>
          <p className="text-ocean-300 mb-6">
            We've sent you a confirmation link. Click it to activate your
            account and start shipping.
          </p>
          <Link to="/login" className="btn btn-primary">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <ShipLogo size="xl" className="mb-4" />
          <h1 className="font-display text-3xl font-bold text-ocean-50 mb-2">
            Start Shipping
          </h1>
          <p className="text-ocean-300">
            Create your account to get your agentic co-founder
          </p>
        </div>

        <div className="bg-dark-800 rounded-xl p-8 border border-dark-600">
          <Auth
            actionText="Sign Up"
            status={signupMutation.status}
            onSubmit={(e) => {
              const formData = new FormData(e.target as HTMLFormElement);
              signupMutation.mutate({
                data: {
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                },
              });
            }}
            afterSubmit={
              signupMutation.data?.error ? (
                <div className="text-red-400 mt-4">
                  {signupMutation.data.message}
                </div>
              ) : null
            }
          />

          <div className="mt-6 text-center text-ocean-400">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-ocean-400 hover:text-ocean-300 underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
