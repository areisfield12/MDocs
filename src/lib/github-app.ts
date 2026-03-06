import { App, Octokit } from "octokit";

// GitHub App singleton (server-side only)
let _githubApp: App | null = null;

function getGitHubApp(): App {
  if (_githubApp) return _githubApp;

  if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
    throw new Error(
      "GitHub App not configured. Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY in .env.local"
    );
  }

  _githubApp = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
    oauth: {
      clientId: process.env.GITHUB_APP_CLIENT_ID!,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
    },
  });

  return _githubApp;
}

export { getGitHubApp };

/**
 * Get an installation-scoped Octokit instance for a specific installation.
 * This is used for all read/write operations on repos.
 */
export async function getInstallationOctokit(
  installationId: number
): Promise<Octokit> {
  const app = getGitHubApp();
  return app.getInstallationOctokit(installationId);
}

/**
 * Find the installation ID for a given owner (user or org).
 * Returns null if the app is not installed for that owner.
 */
export async function getInstallationIdForOwner(
  owner: string
): Promise<number | null> {
  try {
    const app = getGitHubApp();
    const { data: installation } =
      await app.octokit.rest.apps.getUserInstallation({ username: owner });
    return installation.id;
  } catch {
    try {
      const app = getGitHubApp();
      const { data: installation } =
        await app.octokit.rest.apps.getOrgInstallation({ org: owner });
      return installation.id;
    } catch {
      return null;
    }
  }
}

/**
 * Get Octokit for a repo owner. Throws a user-friendly error if app is not installed.
 */
export async function getOctokitForRepo(owner: string): Promise<Octokit> {
  const installationId = await getInstallationIdForOwner(owner);
  if (!installationId) {
    throw new Error(
      `MDocs is not installed on ${owner}. Please install the GitHub App to continue.`
    );
  }
  return getInstallationOctokit(installationId);
}
