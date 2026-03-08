"use client";

import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared input class ──────────────────────────────────────────────────────

export const inputClass = cn(
  "w-full text-sm px-2.5 py-1.5 rounded border border-border bg-surface",
  "text-fg placeholder:text-fg-tertiary",
  "focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40",
  "transition-colors"
);

// ─── Field Components ───────────────────────────────────────────────────────

export function TextInput({
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

export function AutoResizeTextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 84)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onInput={resize}
      rows={1}
      className={cn(inputClass, "resize-none min-h-[36px] overflow-y-auto")}
      style={{ maxHeight: 84 }}
    />
  );
}

export function TextareaInput({
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

export function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const normalized = normalizeDateValue(value);

  return (
    <input
      type="date"
      value={normalized}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, "appearance-none")}
    />
  );
}

/**
 * Normalize a date value to YYYY-MM-DD for `<input type="date">`.
 * Handles ISO strings, JS Date strings, and numeric timestamps.
 * Returns "" if the value cannot be parsed as a valid date.
 */
function normalizeDateValue(value: string): string {
  if (!value) return "";

  // Already YYYY-MM-DD — pass through
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // ISO with time portion — take date part (avoids Date constructor entirely)
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.substring(0, 10);

  // Numeric string (timestamp) — convert to number first
  const asNum = Number(value);
  const parsed = Number.isFinite(asNum) && /^\d+$/.test(value)
    ? new Date(asNum)
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  // Use UTC methods to avoid local timezone shifting the date back a day
  const y = parsed.getUTCFullYear();
  const m = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const d = String(parsed.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function TagsInput({
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
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-accent-subtle text-accent border-accent-border text-xs"
            >
              {tag}
              <button
                onClick={() => removeTag(idx)}
                className="text-text-secondary hover:text-text-primary transition-colors"
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

export function ToggleInput({
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
      <div className="flex items-center gap-2">
        <button
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={cn(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
            value ? "bg-accent" : "bg-border"
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
            "text-xs",
            value ? "text-success" : "text-text-secondary"
          )}
        >
          {value ? "Published" : "Draft"}
        </span>
      </div>
    </div>
  );
}

export function SelectInput({
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

// ─── Type coercion helpers ──────────────────────────────────────────────────

export function asString(
  v: string | number | boolean | string[] | null
): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  // gray-matter returns Date objects for date-like YAML values at runtime,
  // bypassing the TypeScript union. Use UTC to avoid timezone day-shift.
  if ((v as unknown) instanceof Date) {
    const date = v as unknown as Date;
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(v);
}

export function asStringArray(
  v: string | number | boolean | string[] | null
): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v)
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

export function asBool(v: string | number | boolean | string[] | null): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  return false;
}

// ─── Field type detection (for no-schema fallback) ──────────────────────────

export type DetectedFieldType = "toggle" | "date" | "tags" | "text" | "textarea";

export function detectFieldType(
  key: string,
  value: string | number | boolean | string[] | null
): DetectedFieldType {
  if (key === "published") return "toggle";

  if (key === "date" || key.endsWith("_date") || key.endsWith("_at"))
    return "date";

  if (key === "tags" || key === "categories") return "tags";

  const str = asString(value);
  if (str.length > 100) return "textarea";

  return "text";
}
