"use client";

import { Check, Clock, AlertCircle, Loader2, GitPullRequest } from "lucide-react";
import { SaveStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SaveIndicatorProps {
  status: SaveStatus;
  prNumber?: number;
  prUrl?: string;
  onSave?: () => void;
  onProposeChanges?: () => void;
}

export function SaveIndicator({
  status,
  prNumber,
  prUrl,
  onSave,
  onProposeChanges,
}: SaveIndicatorProps) {
  if (status === "clean") return null;

  return (
    <div className="flex items-center gap-3">
      {/* Status badge */}
      <div
        className={cn(
          "flex items-center gap-1.5 text-sm px-3 py-1 rounded-full",
          status === "unsaved" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          status === "saving" && "bg-surface-tertiary text-fg-secondary",
          status === "saved" && "bg-green-500/10 text-green-600 dark:text-green-400",
          status === "error" && "bg-red-500/10 text-red-600 dark:text-red-400",
          status === "pr-open" && "bg-violet-500/10 text-violet-600 dark:text-violet-400"
        )}
      >
        {status === "unsaved" && (
          <>
            <Clock className="h-3.5 w-3.5" />
            <span>Unsaved changes</span>
          </>
        )}
        {status === "saving" && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {status === "saved" && (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>Saved to GitHub</span>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Save failed</span>
          </>
        )}
        {status === "pr-open" && prNumber && (
          <>
            <GitPullRequest className="h-3.5 w-3.5" />
            {prUrl ? (
              <a
                href={prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                PR #{prNumber} open for review
              </a>
            ) : (
              <span>PR #{prNumber} open for review</span>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      {(status === "unsaved" || status === "error") && (
        <div className="flex items-center gap-2">
          {onSave && (
            <Button size="sm" onClick={onSave}>
              Save
            </Button>
          )}
          {onProposeChanges && (
            <Button size="sm" variant="secondary" onClick={onProposeChanges}>
              Propose changes
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
