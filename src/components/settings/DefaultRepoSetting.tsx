"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RepoInfo } from "@/types";
import toast from "react-hot-toast";

interface DefaultRepoSettingProps {
  initialDefaultRepo: string | null;
}

export function DefaultRepoSetting({ initialDefaultRepo }: DefaultRepoSettingProps) {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(initialDefaultRepo ?? "");

  useEffect(() => {
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((data) => {
        if (data.repos) setRepos(data.repos);
      })
      .catch(() => toast.error("Failed to load repositories."))
      .finally(() => setReposLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultRepo: selected || null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Default repository saved.");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-surface border border-border rounded-lg p-6 mb-4">
      <h2 className="text-[14px] font-semibold text-fg mb-1">Default repository</h2>
      <p className="text-sm text-fg-tertiary mb-4">
        Automatically load this repo when you sign in
      </p>

      <div className="flex items-center gap-3">
        {reposLoading ? (
          <div className="flex items-center gap-2 text-sm text-fg-tertiary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading repositories...
          </div>
        ) : (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 max-w-xs px-3 py-1.5 text-[13px] text-fg bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
          >
            <option value="">No default — show all repos</option>
            {repos.map((repo) => (
              <option key={repo.fullName} value={repo.fullName}>
                {repo.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleSave}
          disabled={saving || reposLoading}
          className="px-4 py-1.5 bg-fg text-fg-inverted rounded-md text-[13px] font-medium hover:bg-fg/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </section>
  );
}
