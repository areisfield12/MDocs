import { useState, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import toast from "react-hot-toast";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getHintDismissedKey(owner: string, repo: string): string {
  return `mdocs-image-hint-dismissed:${owner}/${repo}`;
}

interface UseImageUploadOptions {
  owner: string;
  repo: string;
  contentPath: string;
}

interface UploadResult {
  storagePath: string;
  markdownPath: string;
  githubUrl: string;
  rawUrl: string;
}

export function useImageUpload({ owner, repo, contentPath }: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [firstUploadHint, setFirstUploadHint] = useState<string | null>(null);
  const activeUploads = useRef(0);

  const dismissHint = useCallback(() => {
    setFirstUploadHint(null);
    try {
      localStorage.setItem(getHintDismissedKey(owner, repo), "1");
    } catch {
      // localStorage unavailable
    }
  }, [owner, repo]);

  const uploadImage = useCallback(
    async (file: File, editor: Editor): Promise<UploadResult | null> => {
      // Validate type
      if (!ACCEPTED_TYPES.has(file.type)) {
        toast.error("Supported formats: JPEG, PNG, GIF, WebP, SVG");
        return null;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image must be under 5MB");
        return null;
      }

      // Create a local blob URL for instant preview (works for private repos too)
      const blobUrl = URL.createObjectURL(file);

      // Insert placeholder node at current cursor position
      const placeholderId = `upload-${Date.now()}`;
      editor
        .chain()
        .focus()
        .insertContent({
          type: "imageUploadPlaceholder",
          attrs: { id: placeholderId },
        })
        .run();

      activeUploads.current += 1;
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contentPath", contentPath);

        const res = await fetch(
          `/api/github/${owner}/${repo}/upload-image`,
          { method: "POST", body: formData }
        );

        const data = await res.json();

        // Remove placeholder
        removePlaceholder(editor, placeholderId);

        if (!res.ok) {
          toast.error(data.actionable ?? "Failed to upload image");
          URL.revokeObjectURL(blobUrl);
          return null;
        }

        const result = data as UploadResult;

        // Insert image — use blob URL for preview, store markdownPath for save
        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: {
              src: blobUrl,
              alt: file.name.replace(/\.[^.]+$/, ""),
              "data-markdown-src": result.markdownPath,
            },
          })
          .run();

        // Show first-upload hint if not previously dismissed
        try {
          const dismissed = localStorage.getItem(getHintDismissedKey(owner, repo));
          if (!dismissed) {
            const folder = result.storagePath.split("/").slice(0, -1).join("/");
            setFirstUploadHint(
              `Image saved to ${folder}/ in your repo. Change this in repo Settings.`
            );
          }
        } catch {
          // localStorage unavailable
        }

        return result;
      } catch {
        // Remove placeholder on error
        removePlaceholder(editor, placeholderId);
        URL.revokeObjectURL(blobUrl);
        toast.error("Failed to upload image. Please try again.");
        return null;
      } finally {
        activeUploads.current -= 1;
        if (activeUploads.current === 0) {
          setUploading(false);
        }
      }
    },
    [owner, repo, contentPath]
  );

  return { uploadImage, uploading, firstUploadHint, dismissHint };
}

function removePlaceholder(editor: Editor, placeholderId: string) {
  const { doc } = editor.state;
  let placeholderPos: number | null = null;

  doc.descendants((node, pos) => {
    if (
      node.type.name === "imageUploadPlaceholder" &&
      node.attrs.id === placeholderId
    ) {
      placeholderPos = pos;
      return false; // stop traversal
    }
  });

  if (placeholderPos !== null) {
    const tr = editor.state.tr.delete(
      placeholderPos,
      placeholderPos + 1
    );
    editor.view.dispatch(tr);
  }
}
