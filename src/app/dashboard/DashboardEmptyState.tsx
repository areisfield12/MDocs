"use client";

import { GitBranch } from "lucide-react";

export function DashboardEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <GitBranch className="h-8 w-8 text-fg-tertiary mb-3" />
      <p className="text-[13px] text-fg-tertiary">
        Select a repository to browse its content
      </p>
    </div>
  );
}
