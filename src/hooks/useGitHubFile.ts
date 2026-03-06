"use client";

import { useState, useEffect, useCallback } from "react";
import { GitHubFile, FrontmatterData } from "@/types";
import { prepareFileForEditor, buildRawMarkdown } from "@/lib/markdown";

interface UseGitHubFileOptions {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
}

interface UseGitHubFileResult {
  loading: boolean;
  error: string | null;
  sha: string | null;
  branch: string;
  bodyHtml: string;
  rawMarkdown: string;
  frontmatterData: FrontmatterData;
  hasFrontmatter: boolean;
  lastCommit: GitHubFile["sha"] | null;
  // Actions
  setBodyHtml: (html: string) => void;
  setFrontmatterData: (data: FrontmatterData) => void;
  getCurrentRaw: () => string;
  reload: () => void;
}

export function useGitHubFile({
  owner,
  repo,
  path,
  branch,
}: UseGitHubFileOptions): UseGitHubFileResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState(branch ?? "main");
  const [bodyHtml, setBodyHtml] = useState("");
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [frontmatterData, setFrontmatterData] = useState<FrontmatterData>({});
  const [hasFrontmatter, setHasFrontmatter] = useState(false);
  const [lastCommit, setLastCommit] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ path });
    if (branch) params.set("ref", branch);

    fetch(`/api/github/${owner}/${repo}/file?${params}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.error) {
          setError(data.actionable ?? data.error);
          return;
        }

        setSha(data.sha);
        setLastCommit(data.lastCommit?.sha ?? null);
        if (data.lastCommit?.sha) {
          setCurrentBranch(branch ?? "main");
        }
        setRawMarkdown(data.content);

        // Parse frontmatter and convert body to HTML
        const prepared = await prepareFileForEditor(data.content);
        setBodyHtml(prepared.bodyHtml);
        setFrontmatterData(prepared.frontmatterData);
        setHasFrontmatter(prepared.hasFrontmatter);
      })
      .catch(() => setError("Failed to load file. Check your connection."))
      .finally(() => setLoading(false));
  }, [owner, repo, path, branch, reloadKey]);

  const getCurrentRaw = useCallback((): string => {
    return buildRawMarkdown(frontmatterData, bodyHtml);
  }, [frontmatterData, bodyHtml]);

  return {
    loading,
    error,
    sha,
    branch: currentBranch,
    bodyHtml,
    rawMarkdown,
    frontmatterData,
    hasFrontmatter,
    lastCommit,
    setBodyHtml,
    setFrontmatterData,
    getCurrentRaw,
    reload,
  };
}
