"use client";

import { useState, useEffect } from "react";
import { Collection, SchemaField } from "@/types";

interface UseCollectionSchemaParams {
  owner: string;
  repo: string;
  filePath: string;
}

interface UseCollectionSchemaResult {
  schema: SchemaField[] | null;
  collectionLabel: string | null;
  loading: boolean;
}

/**
 * Fetches collections for the repo and matches the file's folder path
 * to a collection schema. Returns null schema if no match (fallback to generic editor).
 */
export function useCollectionSchema({
  owner,
  repo,
  filePath,
}: UseCollectionSchemaParams): UseCollectionSchemaResult {
  const [schema, setSchema] = useState<SchemaField[] | null>(null);
  const [collectionLabel, setCollectionLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCollections() {
      try {
        const res = await fetch(
          `/api/collections?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
        );
        if (!res.ok) {
          setSchema(null);
          setCollectionLabel(null);
          return;
        }

        const data: { collections: Collection[] } = await res.json();
        if (cancelled) return;

        // Find the collection whose folderPath is a prefix of this file's directory
        const fileDir = filePath.substring(0, filePath.lastIndexOf("/"));

        const match = data.collections.find((c) => {
          const normalized = c.folderPath.replace(/^\//, "").replace(/\/$/, "");
          return fileDir === normalized || fileDir.startsWith(normalized + "/");
        });

        if (match && match.schema && match.schema.length > 0) {
          setSchema(match.schema);
          setCollectionLabel(match.label);
        } else {
          setSchema(null);
          setCollectionLabel(null);
        }
      } catch {
        setSchema(null);
        setCollectionLabel(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCollections();
    return () => {
      cancelled = true;
    };
  }, [owner, repo, filePath]);

  return { schema, collectionLabel, loading };
}
