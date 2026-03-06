"use client";

import { useState, useEffect, useCallback } from "react";
import { CommentWithAuthor } from "@/types";
import toast from "react-hot-toast";

interface UseCommentsOptions {
  owner: string;
  repo: string;
  filePath: string;
  commitSha: string;
}

export function useComments({
  owner,
  repo,
  filePath,
  commitSha,
}: UseCommentsOptions) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!commitSha) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        repoOwner: owner,
        repoName: repo,
        filePath,
        commitSha,
      });
      const res = await fetch(`/api/comments?${params}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }, [owner, repo, filePath, commitSha]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(
    async (body: string, charStart: number, charEnd: number) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoOwner: owner,
          repoName: repo,
          filePath,
          commitSha,
          charStart,
          charEnd,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.actionable ?? "Failed to add comment");
        return false;
      }
      setComments((prev) => [data.comment, ...prev]);
      return true;
    },
    [owner, repo, filePath, commitSha]
  );

  const resolveComment = useCallback(async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: true }),
    });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
      );
    } else {
      toast.error("Failed to resolve comment");
    }
  }, []);

  const addReply = useCallback(async (commentId: string, body: string) => {
    const res = await fetch(`/api/comments/${commentId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.actionable ?? "Failed to add reply");
      return false;
    }
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...c.replies, data.reply] }
          : c
      )
    );
    return true;
  }, []);

  return {
    comments,
    loading,
    addComment,
    resolveComment,
    addReply,
    refresh: fetchComments,
  };
}
