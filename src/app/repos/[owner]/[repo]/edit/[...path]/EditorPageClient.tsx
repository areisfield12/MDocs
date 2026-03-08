"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, Pencil, Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Editor } from "@/components/editor/Editor";
import { Toolbar } from "@/components/editor/Toolbar";
import { MarkdownToggle } from "@/components/editor/MarkdownToggle";
import { FrontmatterPanel } from "@/components/editor/FrontmatterPanel";
import { SaveConfirmationBar } from "@/components/editor/SaveConfirmationBar";
import { AIEditModal } from "@/components/editor/AIEditModal";
import { CommentPopover } from "@/components/editor/CommentPopover";
import { CommentThread } from "@/components/editor/CommentThread";
import { CreatePRModal } from "@/components/pr/CreatePRModal";
import { useGitHubFile } from "@/hooks/useGitHubFile";
import { useEditorState } from "@/hooks/useEditorState";
import { useComments } from "@/hooks/useComments";
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdown";
import { FrontmatterData } from "@/types";
import { useCollectionSchema } from "@/hooks/useCollectionSchema";
import { reanchorComments } from "@/lib/commentAnchoring";
import toast from "react-hot-toast";

// TipTap Editor instance reference type
interface TipTapEditorRef {
  chain: () => unknown;
  getHTML: () => string;
}

interface EditorPageClientProps {
  owner: string;
  repo: string;
  filePath: string;
  userId: string;
  requirePR: boolean;
  defaultBranch: string;
}

export function EditorPageClient({
  owner,
  repo,
  filePath,
  userId,
  requirePR,
  defaultBranch,
}: EditorPageClientProps) {
  const {
    loading,
    error,
    sha,
    branch,
    bodyHtml,
    rawMarkdown,
    frontmatterData,
    hasFrontmatter,
    setBodyHtml,
    setFrontmatterData,
    getCurrentRaw,
    reload,
  } = useGitHubFile({ owner, repo, path: filePath, branch: defaultBranch });

  // Editor mode: WYSIWYG or raw markdown
  const [mode, setMode] = useState<"wysiwyg" | "raw">("wysiwyg");
  const [rawDraft, setRawDraft] = useState("");
  const [currentHtml, setCurrentHtml] = useState(bodyHtml);
  const [currentFrontmatter, setCurrentFrontmatter] = useState<FrontmatterData>(frontmatterData);

  // Update local state when file loads. Use `sha` as the readiness signal
  // instead of `bodyHtml` — new files with only frontmatter have an empty
  // body, so bodyHtml is "" (falsy) and would block initialization forever.
  const initialized = useRef(false);
  if (!initialized.current && !loading && sha) {
    initialized.current = true;
    setCurrentHtml(bodyHtml);
    setCurrentFrontmatter(frontmatterData);
    setRawDraft(rawMarkdown);
  }

  // Comments — lifted for editor highlights and click-to-open
  const { comments: commentList, refresh: refreshComments, resolveComment, addReply } = useComments({ owner, repo, filePath, commitSha: sha ?? "" });
  const [mainEditorInstance, setMainEditorInstance] = useState<any>(null);
  const commentRanges = useMemo(() => {
    const unresolved = commentList.filter((c) => !c.resolved);
    if (!mainEditorInstance || unresolved.length === 0) return [];
    try {
      return reanchorComments(
        unresolved.map((c) => ({ id: c.id, charStart: c.charStart, charEnd: c.charEnd, quotedText: c.quotedText })),
        mainEditorInstance.state.doc
      ).filter((r) => !r.orphaned);
    } catch {
      return unresolved.map((c) => ({ id: c.id, charStart: c.charStart, charEnd: c.charEnd, orphaned: false }));
    }
  }, [commentList, mainEditorInstance]);

  // Selection tracking for comments + AI
  const [selection, setSelection] = useState({ hasSelection: false, from: 0, to: 0, text: "" });
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showPRModal, setShowPRModal] = useState(false);
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Collection schema for typed frontmatter fields
  const { schema: collectionSchema, collectionLabel } = useCollectionSchema({
    owner,
    repo,
    filePath,
  });

  // Editor ref for programmatic operations
  const editorRef = useRef<TipTapEditorRef | null>(null);

  const handleCommit = useCallback(
    async (content: string, message?: string) => {
      if (!sha) return null;

      const res = await fetch(`/api/github/${owner}/${repo}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: filePath,
          content,
          sha,
          branch,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.actionable ?? "Failed to save");
        return null;
      }

      // Reload to get new SHA (confirmation bar replaces toast)
      reload();
      return { sha: data.sha };
    },
    [sha, owner, repo, filePath, branch, reload]
  );

  const getCurrentContent = useCallback(() => {
    return getCurrentRaw();
  }, [getCurrentRaw]);

  const editorState = useEditorState({
    onCommit: handleCommit,
    getCurrentContent,
    originalContent: rawMarkdown,
  });

  // Handle WYSIWYG editor updates
  const handleEditorUpdate = useCallback(
    (html: string) => {
      setCurrentHtml(html);
      setBodyHtml(html);
      editorState.markUnsaved();
    },
    [setBodyHtml, editorState]
  );

  // Handle frontmatter changes
  const handleFrontmatterChange = useCallback(
    (data: FrontmatterData) => {
      setCurrentFrontmatter(data);
      setFrontmatterData(data);
      editorState.markUnsaved();
    },
    [setFrontmatterData, editorState]
  );

  // Toggle between WYSIWYG and raw markdown modes
  const handleModeToggle = async (newMode: "wysiwyg" | "raw") => {
    if (newMode === mode) return;

    if (newMode === "raw") {
      // Convert current HTML to markdown for raw editing
      const md = htmlToMarkdown(currentHtml);
      setRawDraft(md);
    } else {
      // Convert raw markdown back to HTML for WYSIWYG
      const html = await markdownToHtml(rawDraft);
      setCurrentHtml(html);
      setBodyHtml(html);
    }
    setMode(newMode);
  };

  // Selection change from TipTap
  const handleSelectionChange = useCallback(
    (hasSelection: boolean, from: number, to: number, text: string) => {
      setSelection({ hasSelection, from, to, text });
    },
    []
  );

  // Open AI edit with current selection (uses TipTap state, not window.getSelection)
  const handleAIEdit = useCallback(() => {
    if (!selection.hasSelection || !selection.text) return;
    setSelectedText(selection.text);
    setShowAIModal(true);
  }, [selection.hasSelection, selection.text]);

  // Accept AI suggestion — replace selected text in editor
  const handleAIAccept = useCallback(
    (newText: string) => {
      if (editorRef.current) {
        const editor = editorRef.current;
        (editor.chain() as { focus: () => { insertContent: (text: string) => { run: () => void } } })
          .focus()
          .insertContent(newText)
          .run();
      }
    },
    []
  );

  // Save logic
  const handleSave = useCallback(async () => {
    await editorState.save();
  }, [editorState]);

  const handleProposeChanges = useCallback(() => {
    setShowPRModal(true);
  }, []);

  // Confirmation bar state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<"save" | "pr">("save");
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissConfirmation = useCallback(() => {
    setShowConfirmation(false);
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
  }, []);

  // Track status transitions for confirmation bar
  const prevStatusRef = useRef(editorState.status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = editorState.status;
    prevStatusRef.current = curr;

    if (prev !== curr) {
      if (curr === "saved") {
        setConfirmationType("save");
        setShowConfirmation(true);
      } else if (curr === "pr-open") {
        setConfirmationType("pr");
        setShowConfirmation(true);
      } else if (curr === "unsaved" && showConfirmation) {
        // User made a new edit while confirmation is showing — dismiss it
        dismissConfirmation();
      }
    }
  }, [editorState.status, showConfirmation, dismissConfirmation]);

  // Cmd+S / Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (editorState.status === "unsaved" || editorState.status === "error") {
          handleSave();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editorState.status, handleSave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <Loader2 className="h-6 w-6 animate-spin text-fg-tertiary" />
        <span className="ml-2 text-fg-tertiary">Loading file...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface gap-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <div className="text-center">
          <p className="font-semibold text-fg">Unable to load file</p>
          <p className="text-fg-tertiary text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={reload}
          className="px-4 py-2 bg-fg text-fg-inverted rounded-lg text-sm font-medium hover:bg-fg/90"
        >
          Try again
        </button>
      </div>
    );
  }

  const originalRaw = rawMarkdown;
  const currentRaw = getCurrentRaw();

  return (
    <AppShell
      repoOwner={owner}
      repoName={repo}
      filePath={filePath}
      saveStatus={editorState.status}
      prNumber={editorState.prNumber}
      prUrl={editorState.prUrl}
      onSave={requirePR ? undefined : handleSave}
      onProposeChanges={handleProposeChanges}
    >
      <div className="h-full flex flex-col bg-surface">
        {/* Post-save confirmation bar */}
        <SaveConfirmationBar
          visible={showConfirmation}
          variant={confirmationType}
          branch={branch}
          owner={owner}
          repo={repo}
          filePath={filePath}
          prNumber={editorState.prNumber}
          prUrl={editorState.prUrl}
          onDismiss={dismissConfirmation}
        />

        {/* Title + toggle row */}
        <div className="flex items-center border-b border-border">
          <div className="flex-1 px-16 py-2 flex items-center gap-2 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  ref={titleInputRef}
                  type="text"
                  defaultValue={String(currentFrontmatter.title ?? "")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = titleInputRef.current?.value ?? "";
                      handleFrontmatterChange({ ...currentFrontmatter, title: val });
                      setEditingTitle(false);
                    } else if (e.key === "Escape") {
                      setEditingTitle(false);
                    }
                  }}
                  onBlur={() => {
                    const val = titleInputRef.current?.value ?? "";
                    if (val !== String(currentFrontmatter.title ?? "")) {
                      handleFrontmatterChange({ ...currentFrontmatter, title: val });
                    }
                    setEditingTitle(false);
                  }}
                  autoFocus
                  className="flex-1 min-w-0 text-lg font-semibold text-fg leading-snug bg-transparent border-b-2 border-accent focus:outline-none"
                />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const val = titleInputRef.current?.value ?? "";
                    handleFrontmatterChange({ ...currentFrontmatter, title: val });
                    setEditingTitle(false);
                  }}
                  className="text-fg-tertiary hover:text-fg flex-shrink-0"
                  aria-label="Confirm title"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : currentFrontmatter.title ? (
              <div className="group/title flex items-center gap-2 min-w-0">
                <h1 className="text-lg font-semibold text-fg leading-snug truncate">
                  {String(currentFrontmatter.title)}
                </h1>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="text-fg-tertiary hover:text-fg flex-shrink-0 opacity-0 group-hover/title:opacity-100 transition-opacity"
                  aria-label="Edit title"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>
          <div className="px-4 py-2 border-l border-border flex-shrink-0">
            <MarkdownToggle mode={mode} onToggle={handleModeToggle} />
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main editor */}
          <div className="flex-1 overflow-hidden relative">
            {mode === "wysiwyg" ? (
              <EditorWithToolbar
                initialHtml={currentHtml}
                onUpdate={handleEditorUpdate}
                onSelectionChange={handleSelectionChange}
                onAIEdit={handleAIEdit}
                hasSelection={selection.hasSelection}
                commentRanges={commentRanges}
                onCommentClick={(id) => { setHighlightedCommentId(id); setShowCommentPanel(true); }}
                onEditorReady={setMainEditorInstance}
              />
            ) : (
              <textarea
                value={rawDraft}
                onChange={(e) => {
                  setRawDraft(e.target.value);
                  editorState.markUnsaved();
                }}
                className="w-full h-full resize-none font-mono text-sm px-16 py-12 focus:outline-none bg-surface text-fg"
                placeholder="Write markdown here..."
                spellCheck={false}
              />
            )}

            {/* Floating comment popover */}
            {selection.hasSelection && mode === "wysiwyg" && (
              <CommentPopover
                owner={owner}
                repo={repo}
                filePath={filePath}
                commitSha={sha ?? ""}
                charStart={selection.from}
                charEnd={selection.to}
                quotedText={selection.text}
                onCommentAdded={() => { refreshComments(); setShowCommentPanel(true); }}
              />
            )}
          </div>

          {/* Comment sidebar */}
          {showCommentPanel && (
            <div className="w-80 border-l border-border flex-shrink-0">
              <CommentThread
                comments={commentList}
                onResolve={resolveComment}
                onReply={addReply}
                onRefresh={refreshComments}
                onClose={() => setShowCommentPanel(false)}
                highlightedCommentId={highlightedCommentId}
              />
            </div>
          )}

          {/* Frontmatter sidebar panel */}
          {hasFrontmatter && (
            <FrontmatterPanel
              data={currentFrontmatter}
              onChange={handleFrontmatterChange}
              schema={collectionSchema}
              collectionLabel={collectionLabel}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AIEditModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        selectedText={selectedText}
        onAccept={handleAIAccept}
      />

      <CreatePRModal
        open={showPRModal}
        onClose={() => setShowPRModal(false)}
        owner={owner}
        repo={repo}
        filePath={filePath}
        baseBranch={branch}
        originalContent={originalRaw}
        newContent={currentRaw}
        onSuccess={(prNumber, prUrl) => {
          editorState.setPROpen(prNumber, prUrl);
        }}
      />
    </AppShell>
  );
}

// Sub-component that provides the editor ref to the Toolbar
function EditorWithToolbar({
  initialHtml,
  onUpdate,
  onSelectionChange,
  onAIEdit,
  hasSelection,
  commentRanges,
  onCommentClick,
  onEditorReady: onEditorReadyProp,
}: {
  initialHtml: string;
  onUpdate: (html: string) => void;
  onSelectionChange: (has: boolean, from: number, to: number, text: string) => void;
  onAIEdit: () => void;
  hasSelection: boolean;
  commentRanges: Array<{ id: string; charStart: number; charEnd: number }>;
  onCommentClick: (id: string) => void;
  onEditorReady?: (editor: import("@tiptap/react").Editor | null) => void;
}) {
  const [editorInstance, setEditorInstance] = useState<import("@tiptap/react").Editor | null>(null);
  const handleEditorReady = useCallback((editor: import("@tiptap/react").Editor | null) => {
    setEditorInstance(editor);
    onEditorReadyProp?.(editor);
  }, [onEditorReadyProp]);

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        editor={editorInstance}
        onAIEdit={onAIEdit}
        hasSelection={hasSelection}
      />
      <div className="flex-1 overflow-hidden">
        <EditorWithRef
          initialHtml={initialHtml}
          onUpdate={onUpdate}
          onSelectionChange={onSelectionChange}
          onEditorReady={handleEditorReady}
          commentRanges={commentRanges}
          onCommentClick={onCommentClick}
        />
      </div>
    </div>
  );
}

// Editor wrapper that exposes the editor instance
function EditorWithRef({
  initialHtml,
  onUpdate,
  onSelectionChange,
  onEditorReady,
  commentRanges,
  onCommentClick,
}: {
  initialHtml: string;
  onUpdate: (html: string) => void;
  onSelectionChange: (has: boolean, from: number, to: number, text: string) => void;
  onEditorReady: (editor: import("@tiptap/react").Editor | null) => void;
  commentRanges: Array<{ id: string; charStart: number; charEnd: number }>;
  onCommentClick: (id: string) => void;
}) {
  const { useEditor, EditorContent } = require("@tiptap/react");
  const StarterKit = require("@tiptap/starter-kit").default;
  const Link = require("@tiptap/extension-link").default;
  const Placeholder = require("@tiptap/extension-placeholder").default;
  const Table = require("@tiptap/extension-table").Table;
  const TableRow = require("@tiptap/extension-table-row").TableRow;
  const TableCell = require("@tiptap/extension-table-cell").TableCell;
  const TableHeader = require("@tiptap/extension-table-header").TableHeader;
  const Underline = require("@tiptap/extension-underline").default;
  const { Extension } = require("@tiptap/core");
  const { Plugin, PluginKey } = require("prosemirror-state");
  const { Decoration, DecorationSet } = require("prosemirror-view");

  // Stable callback ref — always current, safe to read from plugin
  const onCommentClickRef = useRef<(id: string) => void>(onCommentClick);
  onCommentClickRef.current = onCommentClick;

  // Stable plugin key + plugin (created once via ref)
  const pluginKeyRef = useRef<any>(null);
  const pluginRef = useRef<any>(null);
  const extensionRef = useRef<any>(null);
  if (!pluginKeyRef.current) {
    pluginKeyRef.current = new PluginKey("commentHighlights");
    const key = pluginKeyRef.current;
    pluginRef.current = new Plugin({
      key,
      state: {
        init() { return []; },
        apply(tr: any, prev: any) {
          const meta = tr.getMeta(key);
          if (meta !== undefined) return meta;
          if (!tr.docChanged || prev.length === 0) return prev;
          return prev.map((r: any) => ({
            id: r.id,
            charStart: tr.mapping.map(r.charStart, 1),
            charEnd: tr.mapping.map(r.charEnd, -1),
          })).filter((r: any) => r.charEnd > r.charStart);
        },
      },
      props: {
        decorations(state: any) {
          const ranges: Array<{ id: string; charStart: number; charEnd: number }> = key.getState(state) || [];
          const maxPos = state.doc.content.size;
          const decos = ranges.flatMap((r) => {
            try {
              if (r.charStart >= maxPos || r.charEnd <= r.charStart) return [];
              return [Decoration.inline(r.charStart, Math.min(r.charEnd, maxPos), { class: "comment-highlight" })];
            } catch { return []; }
          });
          return DecorationSet.create(state.doc, decos);
        },
        handleClick(view: any, pos: number) {
          const ranges: Array<{ id: string; charStart: number; charEnd: number }> = key.getState(view.state) || [];
          const clicked = ranges.find((r) => pos >= r.charStart && pos < r.charEnd);
          if (clicked) {
            onCommentClickRef.current(clicked.id);
            return true;
          }
          return false;
        },
      },
    });
    extensionRef.current = Extension.create({
      name: "commentHighlights",
      addProseMirrorPlugins() { return [pluginRef.current]; },
    });
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 100,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      extensionRef.current,
    ],
    content: initialHtml,
    onUpdate: ({ editor }: { editor: import("@tiptap/react").Editor }) => {
      onUpdate(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }: { editor: import("@tiptap/react").Editor }) => {
      const { from, to } = editor.state.selection;
      const text = from !== to ? editor.state.doc.textBetween(from, to, " ") : "";
      onSelectionChange(from !== to, from, to, text);
    },
    onCreate: ({ editor }: { editor: import("@tiptap/react").Editor }) => {
      onEditorReady(editor);
    },
    onDestroy: () => onEditorReady(null),
    editorProps: {
      attributes: {
        class: "prose prose-gray dark:prose-invert max-w-none focus:outline-none min-h-full px-16 py-12",
      },
    },
  });

  // Push updated comment ranges into the ProseMirror plugin
  useEffect(() => {
    if (!editor) return;
    try {
      editor.view.dispatch(
        editor.view.state.tr.setMeta(pluginKeyRef.current, commentRanges)
      );
    } catch { /* ignore if editor is destroyed */ }
  }, [editor, commentRanges]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const TableControls = require("@/components/editor/table/TableControls").TableControls;

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto relative">
      <EditorContent editor={editor} />
      {editor && (
        <TableControls editor={editor} scrollContainerRef={scrollRef} />
      )}
    </div>
  );
}
