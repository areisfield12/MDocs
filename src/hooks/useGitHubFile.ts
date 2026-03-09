"use client";

import { useState, useEffect, useCallback } from "react";
import { GitHubFile, FrontmatterData } from "@/types";
import { prepareFileForEditor, buildRawMarkdown } from "@/lib/markdown";

interface UseGitHubFileOptions {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
  imageStorageFolder?: string;
  imageUrlPrefix?: string;
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

/**
 * Rewrite relative image src attributes in HTML to GitHub raw URLs so images
 * stored in the repo (uploaded via Commit) render correctly in the editor when
 * opening a file from a previous session.
 *
 * Also sets `data-markdown-src` on each rewritten img to the original relative
 * path, so Turndown's commitImage rule produces the correct markdown on save.
 */
function rewriteRelativeImageSrcs(
  html: string,
  owner: string,
  repo: string,
  branch: string,
  imageStorageFolder: string,
  imageUrlPrefix: string
): string {
  if (!html || typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgs = doc.querySelectorAll("img");

  imgs.forEach((img) => {
    const src = img.getAttribute("src");
    // Only rewrite relative paths that start with imageUrlPrefix and haven't
    // already been rewritten (no data-markdown-src means this is a fresh load).
    if (!src || !src.startsWith(imageUrlPrefix) || img.getAttribute("data-markdown-src")) {
      return;
    }

    // Strip imageUrlPrefix prefix, prepend imageStorageFolder to get the repo path.
    // e.g. "/images/photo.jpg" → "public/images/photo.jpg"
    const relativePart = src.slice(imageUrlPrefix.length);
    const repoPath = `${imageStorageFolder}${relativePart}`;
    // Proxy through our API so it works for both public and private repos.
    const proxyUrl = `/api/github/${owner}/${repo}/image?path=${encodeURIComponent(repoPath)}&ref=${encodeURIComponent(branch)}`;

    img.setAttribute("data-markdown-src", src);
    img.setAttribute("src", proxyUrl);
  });

  return doc.body.innerHTML;
}

export function useGitHubFile({
  owner,
  repo,
  path,
  branch,
  imageStorageFolder = "public/images",
  imageUrlPrefix = "/images",
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
        const rewrittenHtml = rewriteRelativeImageSrcs(
          prepared.bodyHtml,
          owner,
          repo,
          branch ?? "main",
          imageStorageFolder,
          imageUrlPrefix
        );
        setBodyHtml(rewrittenHtml);
        setFrontmatterData(prepared.frontmatterData);
        setHasFrontmatter(prepared.hasFrontmatter);
      })
      .catch(() => setError("Failed to load file. Check your connection."))
      .finally(() => setLoading(false));
  }, [owner, repo, path, branch, reloadKey, imageStorageFolder, imageUrlPrefix]);

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
