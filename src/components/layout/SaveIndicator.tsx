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
          status === "unsaved" && "bg-amber-50 text-amber-700",
          status === "saving" && "bg-gray-100 text-gray-600",
          status === "saved" && "bg-green-50 text-green-700",
          status === "error" && "bg-red-50 text-red-700",
          status === "pr-open" && "bg-violet-50 text-violet-700"
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
