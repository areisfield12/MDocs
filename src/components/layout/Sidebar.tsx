"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, Settings, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileIcon, getFileCategory } from "@/lib/file-types";
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
    <aside className="h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="text-xl">📝</span>
          <span>MDocs</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="px-2 py-3 space-y-0.5 border-b border-gray-200">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
          <div className="px-3 py-2.5 border-b border-gray-200">
            <Link
              href={`/repos/${currentRepoOwner}/${currentRepoName}`}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 uppercase tracking-wide"
            >
              {currentRepoOwner}/{currentRepoName}
            </Link>
          </div>

          {fileTreeLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
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
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                style={{ paddingLeft: `${12 + depth * 12}px` }}
              >
                {expandedDirs.has(node.path) ? (
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                )}
                <span className="truncate">{node.name}</span>
              </button>
              {/* Children would be fetched lazily — for now show if expanded */}
            </>
          ) : (
            <Link
              href={`/repos/${owner}/${repo}/edit/${node.path}`}
              className={cn(
                "flex items-center gap-2 py-1.5 text-sm transition-colors truncate",
                currentPath === node.path
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              style={{ paddingLeft: `${20 + depth * 12}px`, paddingRight: "12px" }}
            >
              <span className="flex-shrink-0 text-xs">
                {getFileIcon(getFileCategory(node.path))}
              </span>
              <span className="truncate">{node.name}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
