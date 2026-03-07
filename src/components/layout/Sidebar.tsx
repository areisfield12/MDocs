"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Star, Settings, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { RepoInfo } from "@/types";
import { MDocsMark } from "@/components/ui/MDocsLogo";
import toast from "react-hot-toast";

interface SidebarProps {
  currentRepoOwner?: string;
  currentRepoName?: string;
  currentFilePath?: string;
}

export function Sidebar({
  currentRepoOwner,
  currentRepoName,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);

  useEffect(() => {
    setReposLoading(true);
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((data) => {
        if (data.repos) {
          setRepos(data.repos);
        }
      })
      .catch(() => toast.error("Failed to load repositories."))
      .finally(() => setReposLoading(false));
  }, []);

  const navItems = [
    { href: "/dashboard#starred", icon: Star, label: "Starred" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="h-full bg-surface-secondary border-r border-border-secondary flex flex-col">
      {/* Logo */}
      <div className="px-3 py-4 mb-2">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <MDocsMark size={22} />
          <span className="text-[15px] font-bold text-fg tracking-[-0.01em]">MDocs</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="px-2 space-y-px">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-surface-active text-fg font-medium"
                : "text-fg-tertiary hover:bg-row-hover hover:text-text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mt-3 border-t border-border-secondary" />

      {/* Repositories label */}
      <div className="px-3 pt-3 pb-1">
        <span className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-[0.08em]">
          Repositories
        </span>
      </div>

      {/* Repo list */}
      <div className="flex-1 overflow-y-auto">
        {reposLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-fg-tertiary" />
          </div>
        ) : repos.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-[12px] text-fg-tertiary">
              No repositories found.
            </p>
          </div>
        ) : (
          <div className="py-1">
            {repos.map((repo) => {
              const isActive =
                currentRepoOwner === repo.owner &&
                currentRepoName === repo.name;

              return (
                <button
                  key={repo.fullName}
                  onClick={() => router.push(`/repos/${repo.owner}/${repo.name}`)}
                  className={cn(
                    "w-full flex items-center text-left cursor-pointer transition-colors relative",
                    isActive
                      ? "bg-surface-emphasis"
                      : "hover:bg-row-hover"
                  )}
                  style={{ height: "52px", padding: "0 12px" }}
                >
                  {/* Accent bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-accent" />
                  )}

                  <div className="min-w-0 flex-1 pl-1">
                    <div className="text-[13px] font-medium text-fg truncate">
                      {repo.name}
                    </div>
                    <div className="text-[11px] text-fg-tertiary truncate mt-0.5">
                      {repo.defaultBranch} · {formatUpdatedAt(repo.updatedAt)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Connect repo link */}
        <div className="px-2 py-2">
          <a
            href="https://github.com/apps/mdocs/installations/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2.5 py-[7px] rounded-md text-[13px] text-fg-tertiary hover:bg-bg-muted hover:text-text-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            Connect repo
          </a>
        </div>
      </div>
    </aside>
  );
}

function formatUpdatedAt(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 1) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
