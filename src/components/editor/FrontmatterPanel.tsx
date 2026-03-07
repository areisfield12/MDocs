"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import {
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FrontmatterEditor } from "./FrontmatterEditor";
import type { FrontmatterData, SchemaField } from "@/types";

interface FrontmatterPanelProps {
  data: FrontmatterData;
  onChange: (data: FrontmatterData) => void;
  schema: SchemaField[] | null;
  collectionLabel: string | null;
}

export function FrontmatterPanel({
  data,
  onChange,
  schema,
  collectionLabel,
}: FrontmatterPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleFieldChange = useCallback(
    (key: string, value: string | number | boolean | string[] | null) => {
      onChange({ ...data, [key]: value });
    },
    [data, onChange]
  );

  // Collapsed strip
  if (collapsed) {
    return (
      <div className="w-10 border-l border-border bg-surface-secondary flex flex-col items-center pt-3 flex-shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 text-fg-tertiary hover:text-fg-secondary transition-colors"
          aria-label="Expand document settings"
          title="Document settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // No schema — fall back to the generic key-value editor
  if (!schema) {
    return (
      <div className="w-[280px] border-l border-border bg-surface-secondary flex flex-col flex-shrink-0">
        <PanelHeader
          label="Document settings"
          onCollapse={() => setCollapsed(true)}
        />
        <div className="flex-1 overflow-y-auto">
          <FrontmatterEditor data={data} onChange={onChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[280px] border-l border-border bg-surface-secondary flex flex-col flex-shrink-0">
      <PanelHeader
        label={collectionLabel ?? "Document settings"}
        onCollapse={() => setCollapsed(true)}
      />
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {schema.map((field) => (
          <SchemaFieldInput
            key={field.key}
            field={field}
            value={data[field.key] ?? field.default ?? null}
            onChange={(val) => handleFieldChange(field.key, val)}
          />
        ))}

        {/* Show any extra frontmatter keys not in the schema */}
        <ExtraFields data={data} schema={schema} onChange={onChange} />
      </div>
    </div>
  );
}

// ─── Panel Header ──────────────────────────────────────────────────────────

function PanelHeader({
  label,
  onCollapse,
}: {
  label: string;
  onCollapse: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
      <span className="text-xs font-semibold text-fg-secondary uppercase tracking-wide">
        {label}
      </span>
      <button
        onClick={onCollapse}
        className="p-1 text-fg-tertiary hover:text-fg-secondary transition-colors"
        aria-label="Collapse panel"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Schema Field Router ────────────────────────────────────────────────────

function SchemaFieldInput({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: string | number | boolean | string[] | null;
  onChange: (val: string | number | boolean | string[] | null) => void;
}) {
  const label = (
    <label className="block text-xs font-medium text-fg-secondary mb-1">
      {field.label}
      {field.required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );

  switch (field.type) {
    case "text":
      return (
        <div>
          {label}
          <TextInput value={asString(value)} onChange={(v) => onChange(v)} />
        </div>
      );

    case "textarea":
      return (
        <div>
          {label}
          <TextareaInput
            value={asString(value)}
            onChange={(v) => onChange(v)}
          />
        </div>
      );

    case "date":
      return (
        <div>
          {label}
          <DateInput value={asString(value)} onChange={(v) => onChange(v)} />
        </div>
      );

    case "tags":
      return (
        <div>
          {label}
          <TagsInput
            value={asStringArray(value)}
            onChange={(v) => onChange(v)}
          />
        </div>
      );

    case "toggle":
      return (
        <ToggleInput
          label={field.label}
          value={asBool(value)}
          onChange={(v) => onChange(v)}
        />
      );

    case "select":
      return (
        <div>
          {label}
          <SelectInput
            value={asString(value)}
            options={field.options ?? []}
            onChange={(v) => onChange(v)}
          />
        </div>
      );

    default:
      return (
        <div>
          {label}
          <TextInput value={asString(value)} onChange={(v) => onChange(v)} />
        </div>
      );
  }
}

// ─── Field Components ───────────────────────────────────────────────────────

const inputClass = cn(
  "w-full text-sm px-2.5 py-1.5 rounded border border-border bg-surface",
  "text-fg placeholder:text-fg-tertiary",
  "focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40",
  "transition-colors"
);

function TextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

function TextareaInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={cn(inputClass, "resize-y min-h-[60px]")}
    />
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Normalize to YYYY-MM-DD for the native input
  const normalized = value ? value.substring(0, 10) : "";

  return (
    <input
      type="date"
      value={normalized}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, "appearance-none")}
    />
  );
}

function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setDraft("");
    },
    [value, onChange]
  );

  const removeTag = useCallback(
    (idx: number) => {
      onChange(value.filter((_, i) => i !== idx));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
      e.preventDefault();
      addTag(draft);
    }
    if (e.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {value.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-xs"
            >
              {tag}
              <button
                onClick={() => removeTag(idx)}
                className="hover:text-violet-300 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
        placeholder="Type and press Enter"
        className={inputClass}
      />
    </div>
  );
}

function ToggleInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-fg-secondary">{label}</span>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          value ? "bg-violet-500" : "bg-border"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
            value ? "translate-x-[18px]" : "translate-x-[3px]"
          )}
        />
      </button>
      <span
        className={cn(
          "text-xs ml-2",
          value ? "text-green-400" : "text-fg-tertiary"
        )}
      >
        {value ? "Published" : "Draft"}
      </span>
    </div>
  );
}

function SelectInput({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, "appearance-none cursor-pointer")}
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ─── Extra Fields ───────────────────────────────────────────────────────────

/**
 * Shows frontmatter keys that exist in the file but aren't in the schema.
 * Renders them as simple text inputs so data isn't silently lost.
 */
function ExtraFields({
  data,
  schema,
  onChange,
}: {
  data: FrontmatterData;
  schema: SchemaField[];
  onChange: (data: FrontmatterData) => void;
}) {
  const schemaKeys = new Set(schema.map((f) => f.key));
  const extraEntries = Object.entries(data).filter(([k]) => !schemaKeys.has(k));

  if (extraEntries.length === 0) return null;

  return (
    <div className="pt-3 border-t border-border space-y-3">
      <span className="text-[10px] font-semibold text-fg-tertiary uppercase tracking-wide">
        Other fields
      </span>
      {extraEntries.map(([key, value]) => (
        <div key={key}>
          <label className="block text-xs font-medium text-fg-tertiary mb-1">
            {key}
          </label>
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            className={inputClass}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Type coercion helpers ──────────────────────────────────────────────────

function asString(v: string | number | boolean | string[] | null): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

function asStringArray(
  v: string | number | boolean | string[] | null
): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v)
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function asBool(v: string | number | boolean | string[] | null): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  return false;
}
