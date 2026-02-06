import { SignJWT, importPKCS8 } from "jose";

// GitHub App configuration (server-only)
const GITHUB_APP_ID = process.env.GITHUB_APP_ID!;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY!;
const GITHUB_APP_INSTALLATION_ID = process.env.GITHUB_APP_INSTALLATION_ID!;
const COSHIP_TEMPLATE_ORG = process.env.COSHIP_TEMPLATE_ORG || "coship-hq";

const GITHUB_API = "https://api.github.com";

// Cache for installation token
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get a GitHub App installation access token.
 * Signs a JWT with the App's private key, then exchanges it for an installation token.
 * Caches the token for ~55 minutes.
 */
export async function getInstallationToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.token;
  }

  // The private key may come with escaped newlines from env vars
  // Also strip surrounding quotes if present
  const pemKey = GITHUB_APP_PRIVATE_KEY
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(pemKey, "RS256");

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 10 * 60)
    .setIssuer(GITHUB_APP_ID)
    .sign(privateKey);

  const response = await fetch(
    `${GITHUB_API}/app/installations/${GITHUB_APP_INSTALLATION_ID}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to get installation token: ${response.status} ${err}`);
  }

  const data = await response.json();

  cachedToken = {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  };

  return data.token;
}

export type Template = {
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  topics: string[];
};

/**
 * List available template repos from the CoShip org.
 * Uses the installation token to access private repos marked as templates.
 */
export async function listTemplates(): Promise<Template[]> {
  const token = await getInstallationToken();

  const response = await fetch(
    `${GITHUB_API}/orgs/${COSHIP_TEMPLATE_ORG}/repos?type=all&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list templates: ${response.status} ${err}`);
  }

  const repos = await response.json();

  return repos
    .filter((repo: any) => repo.is_template)
    .map((repo: any) => ({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      default_branch: repo.default_branch,
      topics: repo.topics || [],
    }));
}

/**
 * Bootstrap a new repo from a template using GitHub's template generation API.
 * Templates must be public (or the user must have access).
 * Uses the user's OAuth token to generate a private repo from the template.
 */
export async function bootstrapProject(params: {
  userToken: string;
  templateFullName: string;
  repoName: string;
  description: string;
  isPrivate?: boolean;
}): Promise<{ success: true; repoUrl: string; fullName: string } | { success: false; error: string }> {
  const { userToken, templateFullName, repoName, description, isPrivate = true } = params;

  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${templateFullName}/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          name: repoName,
          description,
          private: isPrivate,
          include_all_branches: false,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `GitHub API error: ${response.status}`);
    }

    const repo = await response.json();

    return {
      success: true,
      repoUrl: repo.html_url,
      fullName: repo.full_name,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error during bootstrap",
    };
  }
}
