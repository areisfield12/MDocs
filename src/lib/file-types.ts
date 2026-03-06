import { FileCategory } from "@/types";

// Exact filename matches (case-sensitive for agent configs)
const AGENT_EXACT: string[] = [
  "CLAUDE.md",
  "cursor_rules",
  ".cursorrules",
  "copilot-instructions.md",
  ".github/copilot-instructions.md",
];

// Pattern-based matchers
const STYLE_PATTERNS: RegExp[] = [/style/i, /brand/i, /tone/i, /voice/i];
const GTM_PATTERNS: RegExp[] = [/playbook/i, /battlecard/i, /persona/i, /gtm/i, /sales/i];

export function getFileCategory(path: string): FileCategory {
  const filename = path.split("/").pop() ?? path;

  // Check exact agent file names first
  if (AGENT_EXACT.some((exact) => filename === exact || path === exact)) {
    return "agent";
  }

  // Check agent pattern: files with "cursor_rules" or "copilot-instructions" anywhere in path
  if (
    path.includes("cursor_rules") ||
    path.includes(".cursorrules") ||
    path.includes("copilot-instructions")
  ) {
    return "agent";
  }

  // Style guide patterns
  if (STYLE_PATTERNS.some((re) => re.test(filename))) {
    return "style";
  }

  // GTM/Sales patterns
  if (GTM_PATTERNS.some((re) => re.test(filename))) {
    return "gtm";
  }

  return "doc";
}

export function getFileCategoryLabel(category: FileCategory): string {
  switch (category) {
    case "agent":
      return "Agent Config";
    case "style":
      return "Style Guide";
    case "gtm":
      return "GTM Doc";
    case "doc":
    default:
      return "Doc";
  }
}

export function isMarkdownFile(path: string): boolean {
  return path.endsWith(".md") || path.endsWith(".mdx");
}
