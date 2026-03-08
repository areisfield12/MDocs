"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Collaborator {
  login: string;
  avatarUrl: string;
}

interface CreatePRModalProps {
  open: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  filePath: string;
  baseBranch: string;
  originalContent: string;
  newContent: string;
  onSuccess: (prNumber: number, prUrl: string) => void;
}

export function CreatePRModal({
  open,
  onClose,
  owner,
  repo,
  filePath,
  baseBranch,
  originalContent,
  newContent,
  onSuccess,
}: CreatePRModalProps) {
  const filename = filePath.split("/").pop() ?? filePath;
  const [title, setTitle] = useState(`Update ${filename}`);
  const [body, setBody] = useState("");
  const [reviewers, setReviewers] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load collaborators + auto-generate PR description when modal opens
  useEffect(() => {
    if (!open) return;

    // Fetch collaborators
    fetch(`/api/github/${owner}/${repo}/collaborators`)
      .then((r) => r.json())
      .then((data) => setCollaborators(data.collaborators ?? []))
      .catch(() => {});

    // Auto-generate PR description
    if (originalContent !== newContent) {
      setGeneratingDesc(true);
      fetch("/api/ai/pr-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalContent, newContent, filePath }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.title) setTitle(data.title);
          if (data.body) setBody(data.body);
        })
        .catch(() => {})
        .finally(() => setGeneratingDesc(false));
    }
  }, [open, owner, repo, originalContent, newContent, filePath]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      // First get the file SHA (we need it for the commit)
      const fileRes = await fetch(
        `/api/github/${owner}/${repo}/file?path=${encodeURIComponent(filePath)}&ref=${baseBranch}`
      );
      const fileData = await fileRes.json();

      if (fileData.error) {
        toast.error(fileData.actionable);
        return;
      }

      const res = await fetch(`/api/github/${owner}/${repo}/pr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: filePath,
          content: newContent,
          sha: fileData.sha,
          baseBranch,
          title: title.trim(),
          body,
          reviewers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.actionable ?? "Failed to create pull request");
        return;
      }

      onSuccess(data.number, data.url);
      onClose();
    } catch {
      toast.error("Failed to create pull request. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReviewer = (login: string) => {
    setReviewers((prev) =>
      prev.includes(login) ? prev.filter((r) => r !== login) : [...prev, login]
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title="Propose changes"
      description={`Open a pull request to update ${filename} on the ${baseBranch} branch`}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-fg-secondary block mb-1">
            Pull request title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-[13px] bg-surface focus:outline-none focus:ring-2 focus:ring-fg/10 focus:border-fg-tertiary"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-fg-secondary">
              Description
            </label>
            {generatingDesc && (
              <div className="flex items-center gap-1.5 text-xs text-violet-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <Sparkles className="h-3 w-3" />
                Generating with AI...
              </div>
            )}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe what changed and why..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
          />
          <p className="text-xs text-fg-tertiary mt-1">
            This is pre-filled by AI based on your changes — edit as needed
          </p>
        </div>

        {/* Target branch info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm text-fg-secondary">
          <span>Merging into</span>
          <code className="font-mono text-xs bg-surface border border-border px-1.5 py-0.5 rounded">
            {baseBranch}
          </code>
        </div>

        {/* Reviewer suggestions */}
        {collaborators.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-fg-secondary mb-2">
              <UserPlus className="h-4 w-4" />
              Request reviewers (optional)
            </div>
            <div className="flex flex-wrap gap-2">
              {collaborators.slice(0, 10).map((c) => (
                <button
                  key={c.login}
                  onClick={() => toggleReviewer(c.login)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium border transition-colors ${
                    reviewers.includes(c.login)
                      ? "bg-surface-tertiary border-border text-fg"
                      : "bg-surface border-border text-fg-tertiary hover:border-fg-tertiary"
                  }`}
                >
                  @{c.login}
                  {reviewers.includes(c.login) && " ✓"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border-secondary">
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={!title.trim()}
          >
            Open pull request
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
