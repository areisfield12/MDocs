import matter from "gray-matter";
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
 * Serialize frontmatter data + body back into a raw markdown string.
 */
export function serializeFrontmatter(
  data: FrontmatterData,
  content: string
): string {
  if (Object.keys(data).length === 0) return content;
  return matter.stringify(content, data);
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
