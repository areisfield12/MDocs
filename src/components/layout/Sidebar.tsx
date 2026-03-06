"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, Settings, ChevronRight, ChevronDown, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileIcon } from "@/components/repo/FileIcon";
import { FileNode } from "@/types";

interface SidebarProps {
  currentRepoOwner?: string;
  currentRepoName?: string;
  currentFilePath?: string;
}

export function Sidebar({
  currentRepoOwner,
  currentRepoName,
  currentFilePath,
}: SidebarProps) {
  const pathname = usePathname();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileTreeLoading, setFileTreeLoading] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  // Load file tree if we're in a repo context
  useEffect(() => {
    if (!currentRepoOwner || !currentRepoName) return;

    setFileTreeLoading(true);
    fetch(`/api/github/${currentRepoOwner}/${currentRepoName}/files`)
      .then((r) => r.json())
      .then((data) => {
        setFileTree(data.files ?? []);
      })
      .catch(console.error)
      .finally(() => setFileTreeLoading(false));
  }, [currentRepoOwner, currentRepoName]);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard#starred", icon: Star, label: "Starred" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="h-full bg-surface-secondary border-r border-border-secondary flex flex-col">
      {/* Logo */}
      <div className="px-4 h-14 flex items-center border-b border-border-secondary">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-fg">
          <FileText className="h-[18px] w-[18px] text-fg-tertiary" />
          <span className="text-[14px] tracking-[-0.01em]">MDocs</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="px-2 py-2 space-y-px">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-surface-active text-fg font-medium"
                : "text-fg-tertiary hover:bg-surface-hover hover:text-fg-secondary"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* File tree for current repo */}
      {currentRepoOwner && currentRepoName && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 border-y border-border-secondary">
            <Link
              href={`/repos/${currentRepoOwner}/${currentRepoName}`}
              className="text-[11px] font-medium text-fg-tertiary hover:text-fg-secondary uppercase tracking-wider"
            >
              {currentRepoOwner}/{currentRepoName}
            </Link>
          </div>

          {fileTreeLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-fg-tertiary" />
            </div>
          ) : (
            <FileTreeNodes
              nodes={fileTree}
              owner={currentRepoOwner}
              repo={currentRepoName}
              currentPath={currentFilePath}
              expandedDirs={expandedDirs}
              onToggleDir={(path) => {
                setExpandedDirs((prev) => {
                  const next = new Set(prev);
                  if (next.has(path)) next.delete(path);
                  else next.add(path);
                  return next;
                });
              }}
              depth={0}
            />
          )}
        </div>
      )}
    </aside>
  );
}

function FileTreeNodes({
  nodes,
  owner,
  repo,
  currentPath,
  expandedDirs,
  onToggleDir,
  depth,
}: {
  nodes: FileNode[];
  owner: string;
  repo: string;
  currentPath?: string;
  expandedDirs: Set<string>;
  onToggleDir: (path: string) => void;
  depth: number;
}) {
  return (
    <ul className="py-1">
      {nodes.map((node) => (
        <li key={node.path}>
          {node.type === "dir" ? (
            <>
              <button
                onClick={() => onToggleDir(node.path)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-fg-tertiary hover:bg-surface-hover hover:text-fg-secondary transition-colors"
                style={{ paddingLeft: `${12 + depth * 12}px` }}
              >
                {expandedDirs.has(node.path) ? (
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                )}
                <span className="truncate">{node.name}</span>
              </button>
            </>
          ) : (
            <Link
              href={`/repos/${owner}/${repo}/edit/${node.path}`}
              className={cn(
                "flex items-center gap-2 py-1.5 text-[13px] transition-colors truncate",
                currentPath === node.path
                  ? "bg-surface-active text-fg font-medium"
                  : "text-fg-tertiary hover:bg-surface-hover hover:text-fg-secondary"
              )}
              style={{ paddingLeft: `${20 + depth * 12}px`, paddingRight: "12px" }}
            >
              <FileIcon path={node.path} className="h-3.5 w-3.5" />
              <span className="truncate">{node.name}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
