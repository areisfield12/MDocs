"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface RepoSettings {
  defaultBranch: string;
  requirePR: boolean;
  protectedBranches: string[];
}

interface RepoSettingsClientProps {
  owner: string;
  repo: string;
  initialSettings: RepoSettings;
}

export function RepoSettingsClient({
  owner,
  repo,
  initialSettings,
}: RepoSettingsClientProps) {
  const [settings, setSettings] = useState<RepoSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/settings/repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, ...settings }),
      });
      if (res.ok) {
        toast.success("Repository settings saved");
      } else {
        const data = await res.json();
        toast.error(data.actionable ?? "Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-fg tracking-[-0.01em]">Repository Settings</h1>
          <p className="text-[13px] text-fg-tertiary mt-1">
            {owner}/{repo}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-fg-secondary block mb-1">
              Default branch
            </label>
            <input
              type="text"
              value={settings.defaultBranch}
              onChange={(e) =>
                setSettings((s) => ({ ...s, defaultBranch: e.target.value }))
              }
              className="w-full max-w-xs px-3 py-2 border border-border rounded-md text-[13px] bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-fg/10 focus:border-fg/20"
            />
            <p className="text-xs text-fg-tertiary mt-1">
              Changes are saved directly to this branch by default
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="requirePR"
              checked={settings.requirePR}
              onChange={(e) =>
                setSettings((s) => ({ ...s, requirePR: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 rounded border-border accent-fg"
            />
            <div>
              <label
                htmlFor="requirePR"
                className="text-sm font-medium text-fg-secondary cursor-pointer"
              >
                Require pull request for all changes
              </label>
              <p className="text-xs text-fg-tertiary mt-0.5">
                When enabled, all edits must go through a pull request — direct
                commits are disabled for this repository.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-secondary">
            <Button onClick={handleSave} loading={saving}>
              Save settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
