import matter from "gray-matter";
import yaml from "js-yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkStringify from "remark-stringify";
import TurndownService from "turndown";
import { FrontmatterData } from "@/types";

// ─── Frontmatter ───────────────────────────────────────────────────────────

/**
 * Extract YAML frontmatter and body from a raw markdown string.
 */
export function extractFrontmatter(raw: string): {
  data: FrontmatterData;
  content: string;
} {
  const { data, content } = matter(raw);
  return { data: data as FrontmatterData, content };
}

/**
 * Normalize a frontmatter date value to a plain YYYY-MM-DD string.
 * Handles Date objects (from gray-matter parsing) and ISO timestamp strings.
 */
function normalizeDate(
  val: string | number | boolean | string[] | null
): string | number | boolean | string[] | null {
  if (!val) return val;
  if (typeof val === "string") return val.split("T")[0];
  if (val instanceof Date) {
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, "0");
    const d = String(val.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return val;
}

/**
 * Serialize frontmatter data + body back into a raw markdown string.
 *
 * Uses JSON_SCHEMA to avoid quoting date-like strings, flowLevel:1 to keep
 * arrays inline (e.g. tags: [a, b]), and lineWidth:-1 to prevent block
 * scalars on long strings (e.g. description).
 */
export function serializeFrontmatter(
  data: FrontmatterData,
  content: string
): string {
  if (Object.keys(data).length === 0) return content;

  const normalized = { ...data };
  if ("date" in normalized) {
    normalized.date = normalizeDate(normalized.date);
  }

  return matter.stringify(content, normalized, {
    engines: {
      yaml: {
        parse: (str: string) => yaml.load(str) as Record<string, unknown>,
        stringify: (obj: object) =>
          yaml.dump(obj, {
            flowLevel: 1,
            lineWidth: -1,
            schema: yaml.JSON_SCHEMA,
          }),
      },
    },
  });
}

// ─── Markdown → HTML (for TipTap) ─────────────────────────────────────────

/**
 * Convert markdown body (no frontmatter) to HTML for loading into TipTap.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);

  return result.toString();
}

// ─── HTML → Markdown (from TipTap) ────────────────────────────────────────

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Support GitHub Flavored Markdown tables
turndownService.addRule("table", {
  filter: ["table"],
  replacement: (content, node) => {
    const table = node as HTMLElement;
    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return content;

    const headerRow = rows[0];
    const headerCells = Array.from(headerRow.querySelectorAll("th, td")).map(
      (cell) => cell.textContent?.trim() ?? ""
    );

    const separator = headerCells.map(() => "---");
    const dataRows = rows.slice(1).map((row) =>
      Array.from(row.querySelectorAll("td")).map(
        (cell) => cell.textContent?.trim() ?? ""
      )
    );

    const lines = [
      `| ${headerCells.join(" | ")} |`,
      `| ${separator.join(" | ")} |`,
      ...dataRows.map((row) => `| ${row.join(" | ")} |`),
    ];

    return "\n\n" + lines.join("\n") + "\n\n";
  },
});

// Use data-markdown-src for images uploaded via MDocs (stores relative path
// while src uses a GitHub raw URL for in-editor preview)
turndownService.addRule("mdocsImage", {
  filter: (node) => {
    return (
      node.nodeName === "IMG" &&
      node.getAttribute("data-markdown-src") !== null
    );
  },
  replacement: (_content, node) => {
    const el = node as HTMLElement;
    const src = el.getAttribute("data-markdown-src") ?? el.getAttribute("src") ?? "";
    const alt = el.getAttribute("alt") ?? "";
    return `![${alt}](${src})`;
  },
});

// Preserve code blocks with language hints
turndownService.addRule("fencedCodeBlock", {
  filter: (node) => {
    return (
      node.nodeName === "PRE" &&
      node.firstChild !== null &&
      node.firstChild.nodeName === "CODE"
    );
  },
  replacement: (content, node) => {
    const codeNode = (node as HTMLElement).querySelector("code");
    const className = codeNode?.className ?? "";
    const langMatch = className.match(/language-(\S+)/);
    const lang = langMatch ? langMatch[1] : "";
    const code = codeNode?.textContent ?? content;
    return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
  },
});

/**
 * Convert TipTap HTML output back to clean Markdown.
 */
export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

// ─── Markdown normalization ────────────────────────────────────────────────

/**
 * Normalize a raw markdown string (roundtrip through remark to clean up formatting).
 */
export async function normalizeMarkdown(raw: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkStringify, {
      bullet: "-",
      fences: true,
      incrementListMarker: false,
    })
    .process(raw);
  return result.toString();
}

/**
 * Split a raw file into frontmatter + body HTML ready for TipTap.
 * Returns:
 * - frontmatterData: key-value pairs for the FrontmatterEditor
 * - bodyHtml: HTML string for loading into TipTap
 * - hasFrontmatter: whether the file had frontmatter
 */
export async function prepareFileForEditor(raw: string): Promise<{
  frontmatterData: FrontmatterData;
  bodyHtml: string;
  hasFrontmatter: boolean;
}> {
  const { data, content } = extractFrontmatter(raw);
  const bodyHtml = await markdownToHtml(content);
  return {
    frontmatterData: data,
    bodyHtml,
    hasFrontmatter: Object.keys(data).length > 0,
  };
}

/**
 * Reconstruct full raw markdown from frontmatter data + TipTap HTML.
 */
export function buildRawMarkdown(
  frontmatterData: FrontmatterData,
  bodyHtml: string
): string {
  const bodyMarkdown = htmlToMarkdown(bodyHtml);
  return serializeFrontmatter(frontmatterData, bodyMarkdown);
}
