"use client";

import { useState, useEffect } from "react";
import { ExternalLink, GitPullRequest, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatRelativeTime } from "@/lib/utils";

interface PR {
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  head: { ref: string };
  user: { login: string; avatar_url: string } | null;
}

interface PRsClientProps {
  owner: string;
  repo: string;
}

export function PRsClient({ owner, repo }: PRsClientProps) {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/github/${owner}/${repo}/prs`)
      .then((r) => r.json())
      .then((data) => {
        if (data.prs) setPrs(data.prs);
        else toast.error(data.actionable ?? "Failed to load pull requests");
      })
      .catch(() => toast.error("Failed to load pull requests"))
      .finally(() => setLoading(false));
  }, [owner, repo]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2.5 mb-1">
          <GitPullRequest className="h-5 w-5 text-fg-tertiary" />
          <h1 className="text-lg font-semibold text-fg tracking-[-0.01em]">Pull Requests</h1>
        </div>
        <p className="text-[13px] text-fg-tertiary mb-6">
          Pull requests opened via MDocs for{" "}
          <span className="font-medium text-fg-secondary">
            {owner}/{repo}
          </span>
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-fg-tertiary" />
          </div>
        ) : prs.length === 0 ? (
          <div className="text-center py-16 text-fg-tertiary">
            <GitPullRequest className="h-10 w-10 mx-auto mb-3" />
            <p className="font-medium text-fg-secondary">No pull requests yet</p>
            <p className="text-sm mt-1">
              Edit a file and use &ldquo;Propose changes&rdquo; to open your first PR
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {prs.map((pr) => (
              <a
                key={pr.number}
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-4 py-3.5 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-all"
              >
                <GitPullRequest
                  className={`h-5 w-5 flex-shrink-0 ${
                    pr.state === "open" ? "text-green-500" : "text-violet-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-fg truncate">
                      {pr.title}
                    </span>
                    <span
                      className={`flex-shrink-0 text-[11px] px-2 py-0.5 rounded font-medium ${
                        pr.state === "open"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-surface-tertiary text-fg-tertiary"
                      }`}
                    >
                      {pr.state}
                    </span>
                  </div>
                  <div className="text-xs text-fg-tertiary mt-0.5">
                    #{pr.number} opened {formatRelativeTime(pr.created_at)} ·{" "}
                    {pr.head.ref}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-fg-tertiary flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
