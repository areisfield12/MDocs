"use client";

import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

interface MillerBreadcrumbProps {
  owner: string;
  repo: string;
  selectedPath: string[];
  onNavigate: (depth: number) => void;
}

export function MillerBreadcrumb({
  owner,
  repo,
  selectedPath,
  onNavigate,
}: MillerBreadcrumbProps) {
  return (
    <div className="px-4 py-2 text-[11px] text-fg-tertiary flex items-center gap-1 border-b border-border-secondary min-h-[36px]">
      <span className="text-fg-secondary font-medium">
        {repo}
      </span>
      {selectedPath.map((folderPath, i) => {
        const name = folderPath.split("/").pop();
        return (
          <Fragment key={folderPath}>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
            <button
              onClick={() => onNavigate(i)}
              className="cursor-pointer hover:text-text-primary transition-colors duration-150"
            >
              {name}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
