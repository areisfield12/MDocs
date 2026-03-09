"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export const SAVE_CONFIRM_DISMISSED_KEY = "commit-save-confirmation-dismissed";

interface SaveConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
  branch: string;
  repo: string;
}

export function SaveConfirmModal({
  open,
  onClose,
  onConfirm,
  branch,
  repo,
}: SaveConfirmModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    onConfirm(dontShowAgain);
    setDontShowAgain(false);
  };

  const handleClose = () => {
    setDontShowAgain(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}
      title="Saving to GitHub"
      description={`This will commit your changes directly to ${branch}`}
    >
      <div className="space-y-4">
        <p className="text-sm text-fg-secondary leading-relaxed">
          Your edits will be saved as a commit to the{" "}
          <code className="font-mono text-xs bg-surface-secondary border border-border px-1.5 py-0.5 rounded">
            {branch}
          </code>{" "}
          branch of <strong className="text-fg">{repo}</strong>. This is
          immediate — there&apos;s no review step unless you use Propose Changes
          instead.
        </p>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-border accent-fg"
          />
          <span className="text-sm text-fg-tertiary">Don&apos;t show this again</span>
        </label>

        <div className="flex gap-2 pt-2 border-t border-border-secondary">
          <Button onClick={handleConfirm}>Save &amp; commit</Button>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
