import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getSupabaseServerClient } from "../../utils/supabase";
import { listTemplates, bootstrapProject } from "../../utils/github";
import type { Template } from "../../utils/github";
import { ShipLogo } from "../../components/ShipLogo";

// Fetch templates from GitHub org
const listTemplatesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const templates = await listTemplates();
    return { error: false, templates };
  } catch (err) {
    return {
      error: true,
      templates: [] as Template[],
      message: err instanceof Error ? err.message : "Failed to load templates",
    };
  }
});

// Create a project: insert row, bootstrap repo, update status
const createProjectFn = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { name: string; slug: string; description: string; templateFullName: string }) => d
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return { error: true, message: "Not authenticated" };
    }

    // Get provider token from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("github_provider_token")
      .eq("id", userData.user.id)
      .single();

    if (!profile?.github_provider_token) {
      return {
        error: true,
        message: "GitHub token not found. Please sign in again.",
      };
    }

    // Bootstrap the repo on GitHub first
    const result = await bootstrapProject({
      userToken: profile.github_provider_token,
      templateFullName: data.templateFullName,
      repoName: data.slug,
      description: data.description,
      isPrivate: true,
    });

    if (!result.success) {
      return { error: true, message: result.error };
    }

    // Only insert project row after GitHub repo is created
    const { data: project, error: insertError } = await supabase
      .from("projects")
      .insert({
        user_id: userData.user.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        template_repo: data.templateFullName,
        status: "active",
        github_repo_url: result.repoUrl,
        github_repo_full_name: result.fullName,
      })
      .select()
      .single();

    if (insertError) {
      return { error: true, message: insertError.message };
    }

    return {
      error: false,
      repoUrl: result.repoUrl,
      fullName: result.fullName,
      projectId: project.id,
    };
  });

export const Route = createFileRoute("/_authed/new-project")({
  loader: async () => {
    const data = await listTemplatesFn();
    return { templates: data.templates, templateError: data.error ? (data as any).message : null };
  },
  component: OnboardingPage,
});

type Step = 1 | 2 | 3 | 4;

function OnboardingPage() {
  const { templates, templateError } = Route.useLoaderData();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Bootstrap state
  const [creating, setCreating] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    repoUrl?: string;
    fullName?: string;
    error?: string;
  } | null>(null);

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const handleCreate = async () => {
    setStep(4);
    setCreating(true);
    setProgressMsg("Creating repository...");

    const res = await createProjectFn({
      data: {
        name,
        slug,
        description,
        templateFullName: selectedTemplate,
      },
    });

    setCreating(false);

    if (res.error) {
      setResult({ success: false, error: res.message });
    } else {
      setProgressMsg("Done!");
      setResult({
        success: true,
        repoUrl: res.repoUrl,
        fullName: res.fullName,
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center px-4 py-12">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              s <= step ? "bg-ocean-400" : "bg-dark-600"
            }`}
          />
        ))}
      </div>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 flex flex-col items-center">
          <ShipLogo size="lg" className="mb-4" />
        </div>

        {/* Step 1: Project Name */}
        {step === 1 && (
          <div className="bg-dark-800 rounded-xl p-8 border border-dark-600">
            <h1 className="font-display text-2xl font-bold text-ocean-50 mb-2">
              Name your project
            </h1>
            <p className="text-ocean-400 mb-6 text-sm">
              This will be your GitHub repository name.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-sm text-ocean-300 mb-1"
                >
                  Project name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-ocean-50 placeholder-ocean-600 focus:outline-none focus:border-ocean-500 transition-colors"
                  placeholder="my-saas-app"
                  autoFocus
                />
              </div>

              {slug && (
                <p className="text-ocean-500 text-xs">
                  Repository: <span className="text-ocean-300">{slug}</span>
                </p>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="w-full btn btn-primary py-3 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="bg-dark-800 rounded-xl p-8 border border-dark-600">
            <h1 className="font-display text-2xl font-bold text-ocean-50 mb-2">
              Describe your project
            </h1>
            <p className="text-ocean-400 mb-6 text-sm">
              Describe what you're building in 1-2 sentences.
            </p>

            <div className="space-y-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-ocean-50 placeholder-ocean-600 focus:outline-none focus:border-ocean-500 transition-colors resize-none"
                placeholder="A marketplace for local artisan goods..."
                autoFocus
              />
              <p className="text-ocean-500 text-xs text-right">
                {description.length}/200
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-lg text-ocean-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!description.trim()}
                  className="flex-1 btn btn-primary py-3 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Template Selection */}
        {step === 3 && (
          <div className="bg-dark-800 rounded-xl p-8 border border-dark-600">
            <h1 className="font-display text-2xl font-bold text-ocean-50 mb-2">
              Choose a template
            </h1>
            <p className="text-ocean-400 mb-6 text-sm">
              Select a starter template for your project.
            </p>

            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-ocean-500 text-sm">
                    No templates available. Check your GitHub App configuration.
                  </p>
                  {templateError && (
                    <p className="text-red-400 text-xs mt-2">{templateError}</p>
                  )}
                </div>
              ) : (
                templates.map((t) => {
                  const isSelected = selectedTemplate === t.full_name;
                  return (
                    <button
                      key={t.full_name}
                      onClick={() => setSelectedTemplate(t.full_name)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-ocean-600/15 border-ocean-500 ring-1 ring-ocean-500/50"
                          : "bg-dark-700 border-dark-600 hover:border-ocean-600/50 hover:bg-dark-700/80"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Radio indicator */}
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            isSelected
                              ? "border-ocean-400 bg-ocean-500"
                              : "border-dark-400"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ocean-100 mb-1">
                            {t.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </div>
                          {t.description && (
                            <p className="text-ocean-400 text-sm leading-relaxed">
                              {t.description}
                            </p>
                          )}
                          {t.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {t.topics.map((topic) => (
                                <span
                                  key={topic}
                                  className="text-xs bg-dark-600 text-ocean-300 px-2 py-0.5 rounded-full"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-lg text-ocean-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedTemplate}
                className="flex-1 btn btn-primary py-3 disabled:opacity-50"
              >
                Create Project
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Bootstrapping */}
        {step === 4 && (
          <div className="bg-dark-800 rounded-xl p-8 border border-dark-600 text-center">
            {creating && (
              <>
                <div className="w-12 h-12 border-2 border-ocean-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h1 className="font-display text-2xl font-bold text-ocean-50 mb-2">
                  Setting up your project
                </h1>
                <p className="text-ocean-400">{progressMsg}</p>
              </>
            )}

            {result && result.success && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="font-display text-2xl font-bold text-ocean-50 mb-2">
                  Your project is ready!
                </h1>
                <p className="text-ocean-400 mb-8">
                  Your project has been set up and is ready to go.
                </p>

                <a
                  href={result.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-ocean-400 hover:text-ocean-300 text-sm mb-8"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  View on GitHub
                </a>

                <button
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="w-full btn btn-primary py-3"
                >
                  Start Shipping!
                </button>
              </>
            )}

            {result && !result.success && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="font-display text-2xl font-bold text-ocean-50 mb-2">
                  Something went wrong
                </h1>
                <p className="text-red-400 text-sm mb-6">{result.error}</p>

                <button
                  onClick={() => {
                    setResult(null);
                    setStep(3);
                  }}
                  className="w-full btn btn-primary py-3"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
