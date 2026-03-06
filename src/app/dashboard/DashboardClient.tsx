"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Star, FileText } from "lucide-react";
import Link from "next/link";
import { RepoCard } from "@/components/repo/RepoCard";
import { FileIcon } from "@/components/repo/FileIcon";
import { RepoInfo } from "@/types";
import toast from "react-hot-toast";

interface StarredFileEntry {
  id: string;
  repoOwner: string;
  repoName: string;
  filePath: string;
}

interface DashboardClientProps {
  userId: string;
  initialStarredFiles: StarredFileEntry[];
}

export function DashboardClient({ initialStarredFiles }: DashboardClientProps) {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [starredFiles] = useState<StarredFileEntry[]>(initialStarredFiles);

  useEffect(() => {
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((data) => {
        if (data.repos) {
          setRepos(data.repos);
        } else {
          toast.error(data.actionable ?? "Failed to load repositories");
        }
      })
      .catch(() => toast.error("Failed to load repositories. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-lg font-semibold text-fg mb-1 tracking-[-0.01em]">Repositories</h1>
        <p className="text-[13px] text-fg-tertiary mb-6">
          Markdown files from repositories where MDocs is installed.
        </p>

        {/* Starred files */}
        {starredFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[11px] font-medium text-fg-tertiary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" />
              Starred
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {starredFiles.map((sf) => (
                <Link
                  key={sf.id}
                  href={`/repos/${sf.repoOwner}/${sf.repoName}/edit/${sf.filePath}`}
                  className="flex items-center gap-2.5 px-4 py-3 bg-surface-secondary border border-border rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <FileIcon path={sf.filePath} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-fg truncate">
                      {sf.filePath.split("/").pop()}
                    </div>
                    <div className="text-xs text-fg-tertiary truncate">
                      {sf.repoOwner}/{sf.repoName}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-tertiary" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-[13px] bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-fg/10 focus:border-fg/20 transition-colors"
          />
        </div>

        {/* Repo list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-fg-tertiary" />
            <span className="ml-2 text-fg-tertiary">Loading repositories...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-fg-tertiary">
            {repos.length === 0 ? (
              <>
                <FileText className="h-10 w-10 mx-auto mb-3 text-fg-tertiary" />
                <p className="font-medium text-fg-secondary">No repositories found</p>
                <p className="text-sm mt-2 max-w-md mx-auto">
                  Install the MDocs GitHub App on your repositories or organizations to
                  get started.
                </p>
                <a
                  href={`https://github.com/apps/mdocs/installations/new`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-fg text-fg-inverted rounded-md text-[13px] font-medium hover:bg-fg/90 transition-colors"
                >
                  Install MDocs GitHub App
                </a>
              </>
            ) : (
              <>
                <p className="font-medium">No repositories match &ldquo;{search}&rdquo;</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((repo) => (
              <RepoCard key={repo.fullName} repo={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
