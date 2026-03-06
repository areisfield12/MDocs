"use client";

import { useState, useEffect } from "react";
import { Loader2, GitBranch } from "lucide-react";
import { FileTree } from "@/components/repo/FileTree";
import { FileNode } from "@/types";
import toast from "react-hot-toast";

interface RepoBrowserClientProps {
  owner: string;
  repo: string;
  userId: string;
  initialStarredPaths: string[];
  requirePR: boolean;
}

export function RepoBrowserClient({
  owner,
  repo,
  initialStarredPaths,
}: RepoBrowserClientProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<string>("");
  const [starredPaths, setStarredPaths] = useState<string[]>(initialStarredPaths);

  useEffect(() => {
    fetch(`/api/github/${owner}/${repo}/files`)
      .then((r) => r.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
          setBranch(data.branch ?? "");
        } else {
          toast.error(data.actionable ?? "Failed to load files");
        }
      })
      .catch(() => toast.error("Failed to load files. Check your connection."))
      .finally(() => setLoading(false));
  }, [owner, repo]);

  const handleToggleStar = async (filePath: string) => {
    const isStarred = starredPaths.includes(filePath);

    setStarredPaths((prev) =>
      isStarred ? prev.filter((p) => p !== filePath) : [...prev, filePath]
    );

    try {
      const response = await fetch("/api/stars", {
        method: isStarred ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoOwner: owner, repoName: repo, filePath }),
      });

      if (!response.ok) {
        setStarredPaths((prev) =>
          isStarred ? [...prev, filePath] : prev.filter((p) => p !== filePath)
        );
        const data = await response.json();
        toast.error(data.actionable ?? "Failed to update starred files");
      }
    } catch {
      setStarredPaths((prev) =>
        isStarred ? [...prev, filePath] : prev.filter((p) => p !== filePath)
      );
      toast.error("Failed to update starred files");
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-fg tracking-[-0.01em]">
              {owner}/{repo}
            </h1>
            {branch && (
              <div className="flex items-center gap-1.5 text-sm text-fg-tertiary mt-1">
                <GitBranch className="h-3.5 w-3.5" />
                <span>{branch}</span>
              </div>
            )}
          </div>
          <div className="text-sm text-fg-tertiary">
            {!loading && `${files.length} markdown file${files.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-fg-tertiary" />
            <span className="ml-2 text-fg-tertiary">Loading files...</span>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <FileTree
              files={files}
              owner={owner}
              repo={repo}
              starredPaths={starredPaths}
              onToggleStar={handleToggleStar}
            />
          </div>
        )}
      </div>
    </div>
  );
}
