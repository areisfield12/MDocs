"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collection, CollectionFile } from "@/types";
import toast from "react-hot-toast";

interface CollectionListViewProps {
  owner: string;
  repo: string;
  collection: Collection;
  onSelectFile: (filePath: string) => void;
}

export function CollectionListView({
  owner,
  repo,
  collection,
  onSelectFile,
}: CollectionListViewProps) {
  const [files, setFiles] = useState<CollectionFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setSearchQuery("");
    fetch(
      `/api/github/${owner}/${repo}/collection?folderPath=${encodeURIComponent(collection.folderPath)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
        } else {
          toast.error(data.actionable ?? "Failed to load collection files.");
        }
      })
      .catch(() => toast.error("Failed to load collection files."))
      .finally(() => setLoading(false));
  }, [owner, repo, collection.folderPath]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        (f.author && f.author.toLowerCase().includes(q))
    );
  }, [files, searchQuery]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h1 className="text-lg font-semibold text-fg tracking-[-0.01em]">
            {collection.label}
          </h1>
          <p className="text-sm text-fg-tertiary mt-0.5">
            {loading
              ? "Loading..."
              : `${files.length} post${files.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-fg text-surface text-[13px] font-medium opacity-50 cursor-not-allowed"
          title="Coming soon"
        >
          <Plus className="h-3.5 w-3.5" />
          New post
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-tertiary" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface-secondary border border-border rounded-md text-[13px] text-fg placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-border focus:border-fg-tertiary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredFiles.length === 0 ? (
          <EmptyState hasSearch={searchQuery.trim().length > 0} />
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_120px_120px_120px] gap-2 px-6 py-2 border-b border-border text-[11px] font-medium text-fg-tertiary uppercase tracking-wider">
              <span>Title</span>
              <span>Status</span>
              <span>Date</span>
              <span>Author</span>
              <span>Modified</span>
            </div>

            {/* Rows */}
            {filteredFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => onSelectFile(file.path)}
                className="w-full grid grid-cols-[1fr_100px_120px_120px_120px] gap-2 px-6 py-3 border-b border-border text-left hover:bg-surface-hover transition-colors group"
              >
                {/* Title */}
                <span className="text-[13px] text-fg font-medium truncate group-hover:text-fg">
                  {file.title}
                </span>

                {/* Status pill */}
                <span>
                  <StatusPill published={file.published} />
                </span>

                {/* Date */}
                <span className="text-[12px] text-fg-tertiary truncate">
                  {file.date ? formatDate(file.date) : "—"}
                </span>

                {/* Author */}
                <span className="text-[12px] text-fg-tertiary truncate">
                  {file.author ?? "—"}
                </span>

                {/* Last modified */}
                <span className="text-[12px] text-fg-tertiary truncate">
                  {file.lastModified
                    ? formatRelativeTime(file.lastModified)
                    : "—"}
                </span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────

function StatusPill({ published }: { published: boolean | null }) {
  if (published === null) return <span className="text-[12px] text-fg-tertiary">—</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
        published
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-neutral-500/15 text-fg-tertiary"
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="px-6 py-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 bg-surface-secondary rounded animate-pulse flex-1 max-w-[240px]" />
          <div className="h-4 bg-surface-secondary rounded animate-pulse w-16" />
          <div className="h-4 bg-surface-secondary rounded animate-pulse w-20" />
          <div className="h-4 bg-surface-secondary rounded animate-pulse w-20" />
          <div className="h-4 bg-surface-secondary rounded animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <FileText className="h-10 w-10 text-fg-tertiary opacity-30 mb-3" />
      <p className="text-[14px] text-fg-secondary font-medium">
        {hasSearch ? "No posts match your search" : "No posts yet"}
      </p>
      <p className="text-[13px] text-fg-tertiary mt-1">
        {hasSearch
          ? "Try a different search term."
          : "Create your first post to get started."}
      </p>
    </div>
  );
}

// ─── Date Helpers ─────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}
