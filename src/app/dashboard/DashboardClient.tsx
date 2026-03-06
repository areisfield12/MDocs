"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Star } from "lucide-react";
import Link from "next/link";
import { RepoCard } from "@/components/repo/RepoCard";
import { RepoInfo } from "@/types";
import toast from "react-hot-toast";
import { getFileIcon, getFileCategory } from "@/lib/file-types";

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Repositories</h1>
        <p className="text-gray-500 mb-6">
          Showing markdown files from all repositories where MDocs is installed.
        </p>

        {/* Starred files */}
        {starredFiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Starred Files
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {starredFiles.map((sf) => (
                <Link
                  key={sf.id}
                  href={`/repos/${sf.repoOwner}/${sf.repoName}/edit/${sf.filePath}`}
                  className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <span>{getFileIcon(getFileCategory(sf.filePath))}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {sf.filePath.split("/").pop()}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Repo list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading repositories...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {repos.length === 0 ? (
              <>
                <p className="text-4xl mb-3">🔌</p>
                <p className="font-medium text-gray-700">No repositories found</p>
                <p className="text-sm mt-2 max-w-md mx-auto">
                  Install the MDocs GitHub App on your repositories or organizations to
                  get started.
                </p>
                <a
                  href={`https://github.com/apps/mdocs/installations/new`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
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
