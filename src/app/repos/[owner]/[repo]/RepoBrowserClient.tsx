"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RepoSidebar } from "@/components/sidebar/RepoSidebar";
import { CollectionListView } from "@/components/collections/CollectionListView";
import { Collection } from "@/types";

interface RepoBrowserClientProps {
  owner: string;
  repo: string;
  userId: string;
  initialStarredPaths: string[];
  requirePR: boolean;
}

type ContentView =
  | { type: "empty" }
  | { type: "collection"; collection: Collection };

export function RepoBrowserClient({
  owner,
  repo,
}: RepoBrowserClientProps) {
  const router = useRouter();
  const [contentView, setContentView] = useState<ContentView>({
    type: "empty",
  });

  const handleSelectCollection = useCallback((collection: Collection) => {
    setContentView({ type: "collection", collection });
  }, []);

  const handleSelectFile = useCallback(
    (filePath: string) => {
      router.push(`/repos/${owner}/${repo}/edit/${filePath}`);
    },
    [owner, repo, router]
  );

  const activeCollectionId =
    contentView.type === "collection" ? contentView.collection.id : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-border">
        <RepoSidebar
          owner={owner}
          repo={repo}
          activeCollectionId={activeCollectionId}
          activeFolderPath={null}
          activeFilePath={null}
          onSelectCollection={handleSelectCollection}
          onSelectFile={handleSelectFile}
        />
      </div>

      {/* Right panel — content area */}
      <div className="flex-1 min-w-0">
        {contentView.type === "collection" ? (
          <CollectionListView
            owner={owner}
            repo={repo}
            collection={contentView.collection}
            onSelectFile={handleSelectFile}
          />
        ) : (
          <WelcomePanel owner={owner} repo={repo} />
        )}
      </div>
    </div>
  );
}

// ─── Welcome Panel (shown when nothing is selected) ─────────────────────

function WelcomePanel({ owner, repo }: { owner: string; repo: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center mb-4">
        <svg
          className="h-6 w-6 text-fg-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>
      <h2 className="text-[15px] font-medium text-fg mb-1">
        {owner}/{repo}
      </h2>
      <p className="text-[13px] text-fg-tertiary max-w-[320px]">
        Select a collection or folder from the sidebar to browse and edit your
        content.
      </p>
    </div>
  );
}
