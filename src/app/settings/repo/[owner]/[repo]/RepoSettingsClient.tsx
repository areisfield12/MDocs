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
          <h1 className="text-2xl font-bold text-gray-900">Repository Settings</h1>
          <p className="text-gray-500 mt-1">
            {owner}/{repo}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          {/* Default branch */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Default branch
            </label>
            <input
              type="text"
              value={settings.defaultBranch}
              onChange={(e) =>
                setSettings((s) => ({ ...s, defaultBranch: e.target.value }))
              }
              className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Changes are saved directly to this branch by default
            </p>
          </div>

          {/* Require PR */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="requirePR"
              checked={settings.requirePR}
              onChange={(e) =>
                setSettings((s) => ({ ...s, requirePR: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <label
                htmlFor="requirePR"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Require pull request for all changes
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                When enabled, all edits must go through a pull request — direct
                commits are disabled for this repository.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button onClick={handleSave} loading={saving}>
              Save settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
