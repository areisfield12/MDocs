"use client";

import { Check, Loader2 } from "lucide-react";
import { SaveStatus } from "@/types";

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
  // Determine save button state
  const isIdle = status === "clean" || status === "saved";
  const isSaving = status === "saving";
  const isUnsaved = status === "unsaved" || status === "error";
  const isPROpen = status === "pr-open";

  return (
    <div className="flex items-center gap-2">
      {/* Save button — always visible, morphs through states */}
      {onSave && (
        <button
          onClick={isUnsaved ? onSave : undefined}
          disabled={isSaving}
          className={
            isUnsaved
              ? "btn-primary"
              : isSaving
                ? "btn-primary opacity-70 cursor-default"
                : "btn-ghost cursor-default"
          }
          style={!isUnsaved && !isSaving ? { pointerEvents: "none" } : undefined}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isIdle ? (
            <Check className="h-3.5 w-3.5" />
          ) : null}
          {isSaving ? "Saving..." : isUnsaved ? "Save" : "Saved"}
        </button>
      )}

      {/* Propose changes button — always visible when handler provided */}
      {onProposeChanges && !isPROpen && (
        <button
          onClick={onProposeChanges}
          disabled={isSaving}
          className="btn-secondary"
        >
          Propose changes
        </button>
      )}

      {/* PR open state */}
      {isPROpen && prNumber && (
        <span className="btn-ghost cursor-default" style={{ pointerEvents: "none" }}>
          <Check className="h-3.5 w-3.5" />
          PR created
        </span>
      )}
    </div>
  );
}
