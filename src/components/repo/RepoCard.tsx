import Link from "next/link";
import { Lock, Star, GitBranch } from "lucide-react";
import { RepoInfo } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface RepoCardProps {
  repo: RepoInfo;
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <Link
      href={`/repos/${repo.owner}/${repo.name}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {repo.private && (
              <Lock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            )}
            <h3 className="font-semibold text-gray-900 truncate">
              {repo.owner}/{repo.name}
            </h3>
          </div>

          {repo.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {repo.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {repo.defaultBranch}
            </span>
            {repo.stargazersCount > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {repo.stargazersCount}
              </span>
            )}
            <span>Updated {formatRelativeTime(repo.updatedAt)}</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Open →
        </div>
      </div>
    </Link>
  );
}
