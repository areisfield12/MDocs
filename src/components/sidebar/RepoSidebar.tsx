"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Loader2,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collection, FileNode, FolderNode } from "@/types";
import toast from "react-hot-toast";

interface RepoSidebarProps {
  owner: string;
  repo: string;
  activeCollectionId: string | null;
  activeFolderPath: string | null;
  activeFilePath: string | null;
  onSelectCollection: (collection: Collection) => void;
  onSelectFile: (filePath: string) => void;
}

export function RepoSidebar({
  owner,
  repo,
  activeCollectionId,
  activeFolderPath,
  activeFilePath,
  onSelectCollection,
  onSelectFile,
}: RepoSidebarProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [collectionFileCounts, setCollectionFileCounts] = useState<
    Record<string, number>
  >({});
  const [markdownPaths, setMarkdownPaths] = useState<string[]>([]);

  // Fetch collections
  useEffect(() => {
    setCollectionsLoading(true);
    fetch(`/api/collections?owner=${owner}&repo=${repo}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.collections) {
          setCollections(data.collections);
          // Fetch file counts for each collection
          for (const col of data.collections as Collection[]) {
            fetch(
              `/api/github/${owner}/${repo}/collection?folderPath=${encodeURIComponent(col.folderPath)}`
            )
              .then((r) => r.json())
              .then((colData) => {
                if (colData.files) {
                  setCollectionFileCounts((prev) => ({
                    ...prev,
                    [col.id]: colData.files.length,
                  }));
                }
              })
              .catch(() => {
                // Non-fatal — count stays at 0
              });
          }
        }
      })
      .catch(() => toast.error("Failed to load collections."))
      .finally(() => setCollectionsLoading(false));
  }, [owner, repo]);

  // Fetch folder tree and markdown file list in parallel
  useEffect(() => {
    setFoldersLoading(true);
    Promise.all([
      fetch(`/api/github/${owner}/${repo}/tree`).then((r) => r.json()),
      fetch(`/api/github/${owner}/${repo}/files`).then((r) => r.json()),
    ])
      .then(([treeData, filesData]) => {
        if (treeData.folders) {
          setFolders(treeData.folders);
        }
        if (filesData.files) {
          setMarkdownPaths(
            (filesData.files as FileNode[]).map((f) => f.path)
          );
        }
      })
      .catch(() => toast.error("Failed to load folder tree."))
      .finally(() => setFoldersLoading(false));
  }, [owner, repo]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  // Build set of folder paths that contain at least one markdown file (at any depth)
  const foldersWithMarkdown = useMemo(() => {
    const paths = new Set<string>();
    for (const filePath of markdownPaths) {
      const parts = filePath.split("/");
      // Add every ancestor folder path
      for (let i = 1; i < parts.length; i++) {
        paths.add(parts.slice(0, i).join("/"));
      }
    }
    return paths;
  }, [markdownPaths]);

  // Filter: remove collection-covered folders AND folders with no markdown content
  const collectionPaths = new Set(collections.map((c) => c.folderPath));
  const filterFolders = (nodes: FolderNode[]): FolderNode[] => {
    return nodes
      .filter(
        (node) =>
          !collectionPaths.has(node.path) && foldersWithMarkdown.has(node.path)
      )
      .map((node) => ({
        ...node,
        children: filterFolders(node.children),
      }));
  };
  const filteredFolders = filterFolders(folders);

  const isLoading = collectionsLoading || foldersLoading;

  return (
    <div className="h-full flex flex-col bg-surface-secondary overflow-hidden">
      {/* Repo header */}
      <div className="px-3 py-3 border-b border-border-secondary">
        <h2 className="text-[11px] font-medium text-fg-tertiary uppercase tracking-wider truncate">
          {owner}/{repo}
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-fg-tertiary" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Labeled collections */}
          {collections.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1">
                <span className="text-[10px] font-semibold text-fg-tertiary uppercase tracking-widest">
                  Collections
                </span>
              </div>
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => onSelectCollection(collection)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors",
                    activeCollectionId === collection.id
                      ? "bg-surface-active text-fg font-medium"
                      : "text-fg-secondary hover:bg-surface-hover"
                  )}
                >
                  <LayoutGrid className="h-4 w-4 flex-shrink-0 text-fg-tertiary" />
                  <span className="truncate flex-1 text-left">
                    {collection.label}
                  </span>
                  <span className="text-[11px] text-fg-tertiary tabular-nums">
                    {collectionFileCounts[collection.id] ?? ""}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Divider between collections and folders */}
          {collections.length > 0 && filteredFolders.length > 0 && (
            <div className="border-t border-border-secondary" />
          )}

          {/* Raw folder tree */}
          {filteredFolders.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1">
                <span className="text-[10px] font-semibold text-fg-tertiary uppercase tracking-widest">
                  Folders
                </span>
              </div>
              <FolderTree
                nodes={filteredFolders}
                depth={0}
                owner={owner}
                repo={repo}
                expandedFolders={expandedFolders}
                activeFolderPath={activeFolderPath}
                activeFilePath={activeFilePath}
                onToggleFolder={toggleFolder}
                onSelectFile={onSelectFile}
              />
            </div>
          )}

          {/* Empty state */}
          {collections.length === 0 && filteredFolders.length === 0 && (
            <div className="px-3 py-8 text-center">
              <FileText className="h-8 w-8 text-fg-tertiary mx-auto mb-2 opacity-40" />
              <p className="text-[13px] text-fg-tertiary">
                No folders with markdown files found in this repo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Folder Tree ──────────────────────────────────────────────────────────

interface FolderTreeProps {
  nodes: FolderNode[];
  depth: number;
  owner: string;
  repo: string;
  expandedFolders: Set<string>;
  activeFolderPath: string | null;
  activeFilePath: string | null;
  onToggleFolder: (path: string) => void;
  onSelectFile: (filePath: string) => void;
}

function FolderTree({
  nodes,
  depth,
  owner,
  repo,
  expandedFolders,
  activeFolderPath,
  activeFilePath,
  onToggleFolder,
  onSelectFile,
}: FolderTreeProps) {
  return (
    <ul>
      {nodes.map((node) => {
        const isExpanded = expandedFolders.has(node.path);
        return (
          <li key={node.path}>
            <button
              onClick={() => onToggleFolder(node.path)}
              className={cn(
                "w-full flex items-center gap-1.5 py-1.5 text-[13px] transition-colors",
                activeFolderPath === node.path
                  ? "text-fg-secondary bg-surface-hover"
                  : "text-fg-tertiary hover:bg-surface-hover hover:text-fg-secondary"
              )}
              style={{ paddingLeft: `${12 + depth * 14}px`, paddingRight: "12px" }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-fg-tertiary" />
              ) : (
                <Folder className="h-3.5 w-3.5 flex-shrink-0 text-fg-tertiary" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {isExpanded && node.children.length > 0 && (
              <FolderTree
                nodes={node.children}
                depth={depth + 1}
                owner={owner}
                repo={repo}
                expandedFolders={expandedFolders}
                activeFolderPath={activeFolderPath}
                activeFilePath={activeFilePath}
                onToggleFolder={onToggleFolder}
                onSelectFile={onSelectFile}
              />
            )}
            {isExpanded && (
              <FolderFiles
                owner={owner}
                repo={repo}
                folderPath={node.path}
                depth={depth + 1}
                activeFilePath={activeFilePath}
                onSelectFile={onSelectFile}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Folder Files (loaded on expand) ──────────────────────────────────────

interface FolderFilesProps {
  owner: string;
  repo: string;
  folderPath: string;
  depth: number;
  activeFilePath: string | null;
  onSelectFile: (filePath: string) => void;
}

function FolderFiles({
  owner,
  repo,
  folderPath,
  depth,
  activeFilePath,
  onSelectFile,
}: FolderFilesProps) {
  const [files, setFiles] = useState<
    { path: string; title: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `/api/github/${owner}/${repo}/collection?folderPath=${encodeURIComponent(folderPath)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.files) {
          setFiles(
            (data.files as { path: string; title: string }[]).map((f) => ({
              path: f.path,
              title: f.title,
            }))
          );
        }
      })
      .catch(() => {
        // Non-fatal
      })
      .finally(() => setLoading(false));
  }, [owner, repo, folderPath]);

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 py-1.5 text-fg-tertiary"
        style={{ paddingLeft: `${26 + depth * 14}px` }}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-[12px]">Loading...</span>
      </div>
    );
  }

  if (files.length === 0) return null;

  return (
    <ul>
      {files.map((file) => (
        <li key={file.path}>
          <button
            onClick={() => onSelectFile(file.path)}
            className={cn(
              "w-full flex items-center gap-2 py-1.5 text-[13px] transition-colors truncate",
              activeFilePath === file.path
                ? "bg-surface-active text-fg font-medium"
                : "text-fg-tertiary hover:bg-surface-hover hover:text-fg-secondary"
            )}
            style={{
              paddingLeft: `${26 + depth * 14}px`,
              paddingRight: "12px",
            }}
          >
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{file.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
