import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGitHubApp } from "@/lib/github-app";
import { formatGitHubError } from "@/lib/utils";
import { RepoInfo } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  const githubLogin = session.user.githubLogin;
  if (!githubLogin) {
    return NextResponse.json({ error: "GitHub account not linked", actionable: "Sign in with GitHub to continue." }, { status: 401 });
  }

  try {
    const app = getGitHubApp();

    // List all installations the app has, then scope to the current user
    const { data: installations } = await app.octokit.rest.apps.listInstallations({
      per_page: 100,
    });

    const userInstallations = installations.filter(
      (inst) => inst.account?.login === githubLogin
    );

    const repos: RepoInfo[] = [];

    for (const installation of userInstallations) {
      const installationOctokit = await app.getInstallationOctokit(installation.id);

      // List repos accessible for this installation
      const repoPages = installationOctokit.paginate.iterator(
        installationOctokit.rest.apps.listReposAccessibleToInstallation,
        { per_page: 100 }
      );

      for await (const { data: pageRepos } of repoPages) {
        for (const repo of pageRepos) {
          repos.push({
            owner: repo.owner.login,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            defaultBranch: repo.default_branch,
            private: repo.private,
            stargazersCount: repo.stargazers_count,
            updatedAt: repo.updated_at ?? new Date().toISOString(),
            installationId: installation.id,
          });
        }
      }
    }

    // Sort by last updated
    repos.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ repos });
  } catch (error) {
    const friendly = formatGitHubError(error);
    return NextResponse.json(friendly, { status: 500 });
  }
}
