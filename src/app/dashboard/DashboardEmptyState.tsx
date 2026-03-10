"use client";

import { useEffect, useState } from "react";
import { GitBranch } from "lucide-react";

const GITHUB_APP_INSTALL_URL = "https://github.com/apps/commit-editor";

export function DashboardEmptyState() {
  const [hasRepos, setHasRepos] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((data) => setHasRepos(Array.isArray(data.repos) && data.repos.length > 0))
      .catch(() => setHasRepos(false));
  }, []);

  if (hasRepos === null) {
    // Loading — render nothing to avoid flash
    return null;
  }

  if (!hasRepos) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
        <GitBranch className="h-8 w-8 text-fg-tertiary mb-4" />
        <p className="text-[15px] font-medium text-fg-primary mb-1">
          Connect your GitHub repos
        </p>
        <p className="text-[13px] text-fg-tertiary mb-6 max-w-xs">
          Install the Commit GitHub App to start browsing and editing your repositories.
        </p>
        <a
          href={GITHUB_APP_INSTALL_URL}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          Install GitHub App
        </a>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <GitBranch className="h-8 w-8 text-fg-tertiary mb-3" />
      <p className="text-[13px] text-fg-tertiary">
        Select a repository to browse its content
      </p>
    </div>
  );
}
