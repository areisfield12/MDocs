"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Code2,
  Link2,
  Table,
  ImageIcon,
  Minus,
  Undo,
  Redo,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as Tooltip from "@radix-ui/react-tooltip";

interface ToolbarProps {
  editor: Editor | null;
  onAIEdit?: () => void;
  hasSelection?: boolean;
  onImageUpload?: () => void;
  onLinkClick?: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  label,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip.Provider delayDuration={400}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent editor blur
              if (!disabled) onClick();
            }}
            disabled={disabled}
            className={cn(
              "p-1.5 rounded-sm cursor-pointer transition-colors",
              active
                ? "bg-fg text-fg-inverted"
                : "text-fg-tertiary hover:bg-bg-muted hover:text-text-primary",
              disabled && "opacity-30 pointer-events-none"
            )}
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-fg text-fg-inverted text-xs px-2 py-1 rounded shadow z-50"
            sideOffset={6}
          >
            {label}
            <Tooltip.Arrow className="fill-fg" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

export function Toolbar({ editor, onAIEdit, hasSelection, onImageUpload, onLinkClick }: ToolbarProps) {
  if (!editor) return null;

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border-secondary bg-surface flex-wrap">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        label="Undo (⌘Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        label="Redo (⌘⇧Z)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        label="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Inline marks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold (⌘B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic (⌘I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label="Inline code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        label="Code block"
      >
        <Code2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => onLinkClick?.()}
        active={editor.isActive("link")}
        label="Link (⌘K)"
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addTable} label="Insert table">
        <Table className="h-4 w-4" />
      </ToolbarButton>
      {onImageUpload && (
        <ToolbarButton onClick={onImageUpload} label="Insert image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      )}
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="Horizontal rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      {/* AI edit button */}
      {onAIEdit && (
        <>
          <Divider />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              onAIEdit();
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[12px] font-medium transition-colors",
              hasSelection
                ? "bg-fg text-fg-inverted hover:bg-fg/90"
                : "text-fg-tertiary bg-surface-tertiary hover:bg-bg-muted hover:text-text-primary"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {hasSelection ? "Ask AI" : "Select text to use AI"}
          </button>
        </>
      )}
    </div>
  );
}
