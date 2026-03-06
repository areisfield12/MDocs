"use client";

import { useState, useCallback, useRef } from "react";
import { SaveStatus } from "@/types";

interface UseEditorStateOptions {
  onCommit: (content: string, message?: string) => Promise<{ sha: string } | null>;
  getCurrentContent: () => string;
  originalContent: string;
}

interface UseEditorStateResult {
  status: SaveStatus;
  prNumber?: number;
  prUrl?: string;
  isDirty: boolean;
  markUnsaved: () => void;
  save: (message?: string) => Promise<void>;
  setPROpen: (number: number, url: string) => void;
  setError: (msg: string) => void;
  setClean: () => void;
}

export function useEditorState({
  onCommit,
  getCurrentContent,
  originalContent,
}: UseEditorStateOptions): UseEditorStateResult {
  const [status, setStatus] = useState<SaveStatus>("clean");
  const [prNumber, setPrNumber] = useState<number | undefined>();
  const [prUrl, setPrUrl] = useState<string | undefined>();
  const lastSavedContent = useRef(originalContent);

  const isDirty = status === "unsaved" || status === "error";

  const markUnsaved = useCallback(() => {
    setStatus("unsaved");
  }, []);

  const save = useCallback(
    async (message?: string) => {
      setStatus("saving");
      try {
        const content = getCurrentContent();
        const result = await onCommit(content, message);
        if (result) {
          lastSavedContent.current = content;
          setStatus("saved");
          // Reset to "clean" after 3 seconds
          setTimeout(() => setStatus("clean"), 3000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [onCommit, getCurrentContent]
  );

  const setPROpen = useCallback((number: number, url: string) => {
    setPrNumber(number);
    setPrUrl(url);
    setStatus("pr-open");
  }, []);

  const setError = useCallback(() => {
    setStatus("error");
  }, []);

  const setClean = useCallback(() => {
    setStatus("clean");
    setPrNumber(undefined);
    setPrUrl(undefined);
  }, []);

  return {
    status,
    prNumber,
    prUrl,
    isDirty,
    markUnsaved,
    save,
    setPROpen,
    setError,
    setClean,
  };
}
