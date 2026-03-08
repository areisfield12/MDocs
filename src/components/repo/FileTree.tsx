"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Star, Folder, FileText } from "lucide-react";
import { FileNode } from "@/types";
import { FileIcon } from "./FileIcon";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: FileNode[];
  owner: string;
  repo: string;
  starredPaths: string[];
  onToggleStar: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children: TreeNode[];
  file?: FileNode;
}

function buildTree(files: FileNode[]): TreeNode[] {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  for (const file of files) {
    const parts = file.path.split("/");

    // Build directory nodes along the path
    for (let i = 0; i < parts.length - 1; i++) {
      const dirPath = parts.slice(0, i + 1).join("/");
      if (!nodeMap.has(dirPath)) {
        const dirNode: TreeNode = {
          name: parts[i],
          path: dirPath,
          type: "dir",
          children: [],
        };
        nodeMap.set(dirPath, dirNode);

        if (i === 0) {
          root.push(dirNode);
        } else {
          const parentPath = parts.slice(0, i).join("/");
          nodeMap.get(parentPath)?.children.push(dirNode);
        }
      }
    }

    // Add file node
    const fileNode: TreeNode = {
      name: parts[parts.length - 1],
      path: file.path,
      type: "file",
      children: [],
      file,
    };
    nodeMap.set(file.path, fileNode);

    if (parts.length === 1) {
      root.push(fileNode);
    } else {
      const parentPath = parts.slice(0, parts.length - 1).join("/");
      nodeMap.get(parentPath)?.children.push(fileNode);
    }
  }

  return root;
}

export function FileTree({
  files,
  owner,
  repo,
  starredPaths,
  onToggleStar,
}: FileTreeProps) {
  const tree = buildTree(files);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-16 text-fg-tertiary">
        <FileText className="h-10 w-10 mx-auto mb-3" />
        <p className="font-medium text-fg-secondary">No markdown files found</p>
        <p className="text-sm mt-1">
          This repository doesn&apos;t contain any .md or .mdx files
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-secondary">
      <TreeNodes
        nodes={tree}
        owner={owner}
        repo={repo}
        starredPaths={starredPaths}
        onToggleStar={onToggleStar}
        expandedDirs={expandedDirs}
        onToggleDir={toggleDir}
        depth={0}
      />
    </div>
  );
}

function TreeNodes({
  nodes,
  owner,
  repo,
  starredPaths,
  onToggleStar,
  expandedDirs,
  onToggleDir,
  depth,
}: {
  nodes: TreeNode[];
  owner: string;
  repo: string;
  starredPaths: string[];
  onToggleStar: (path: string) => void;
  expandedDirs: Set<string>;
  onToggleDir: (path: string) => void;
  depth: number;
}) {
  return (
    <>
      {nodes.map((node) => (
        <div key={node.path}>
          {node.type === "dir" ? (
            <>
              <button
                onClick={() => onToggleDir(node.path)}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-bg-muted transition-colors text-left"
                style={{ paddingLeft: `${16 + depth * 20}px` }}
              >
                {expandedDirs.has(node.path) ? (
                  <ChevronDown className="h-4 w-4 text-fg-tertiary flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-fg-tertiary flex-shrink-0" />
                )}
                <Folder className="h-4 w-4 text-fg-tertiary flex-shrink-0" />
                <span className="text-sm font-medium text-fg-secondary">
                  {node.name}
                </span>
              </button>
              {expandedDirs.has(node.path) && (
                <TreeNodes
                  nodes={node.children}
                  owner={owner}
                  repo={repo}
                  starredPaths={starredPaths}
                  onToggleStar={onToggleStar}
                  expandedDirs={expandedDirs}
                  onToggleDir={onToggleDir}
                  depth={depth + 1}
                />
              )}
            </>
          ) : (
            <div
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-bg-muted transition-colors group"
              style={{ paddingLeft: `${16 + depth * 20}px` }}
            >
              <FileIcon path={node.path} />
              <Link
                href={`/repos/${owner}/${repo}/edit/${node.path}`}
                className="flex-1 min-w-0 flex items-center justify-between gap-4"
              >
                <span className="text-sm text-fg truncate font-medium">
                  {node.name}
                </span>
                {node.file?.lastCommit && (
                  <span className="text-xs text-fg-tertiary flex-shrink-0">
                    {formatRelativeTime(node.file.lastCommit.date)}
                  </span>
                )}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleStar(node.path);
                }}
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-sm hover:bg-bg-muted",
                  starredPaths.includes(node.path) && "opacity-100"
                )}
                aria-label={
                  starredPaths.includes(node.path) ? "Unstar file" : "Star file"
                }
              >
                <Star
                  className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    starredPaths.includes(node.path)
                      ? "fill-amber-400 text-amber-400"
                      : "text-fg-tertiary"
                  )}
                />
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
