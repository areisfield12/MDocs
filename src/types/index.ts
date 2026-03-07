// ─── GitHub / File Types ───────────────────────────────────────────────────

export type FileCategory = "agent" | "style" | "gtm" | "doc";

export interface FileNode {
  path: string;
  name: string;
  type: "file" | "dir";
  sha: string;
  size?: number;
  category?: FileCategory;
  lastCommit?: {
    sha: string;
    message: string;
    author: string;
    date: string;
  };
}

export interface RepoInfo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  private: boolean;
  stargazersCount: number;
  updatedAt: string;
  installationId?: number;
}

export interface GitHubFile {
  path: string;
  content: string; // decoded, raw markdown
  sha: string;
  encoding: string;
  size: number;
}

// ─── Editor State ──────────────────────────────────────────────────────────

export type SaveStatus =
  | "clean"
  | "unsaved"
  | "saving"
  | "saved"
  | "error"
  | "pr-open";

export interface EditorState {
  status: SaveStatus;
  prNumber?: number;
  prUrl?: string;
  errorMessage?: string;
}

// ─── Comments ──────────────────────────────────────────────────────────────

export interface CommentWithAuthor {
  id: string;
  repoOwner: string;
  repoName: string;
  filePath: string;
  commitSha: string;
  charStart: number;
  charEnd: number;
  quotedText?: string | null;
  body: string;
  resolved: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    githubLogin: string | null;
  };
  replies: ReplyWithAuthor[];
}

export interface ReplyWithAuthor {
  id: string;
  commentId: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    githubLogin: string | null;
  };
}

// ─── Session Extension ─────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubLogin?: string | null;
      githubId?: number | null;
      avatarUrl?: string | null;
    };
  }
  interface User {
    githubId?: number | null;
    githubLogin?: string | null;
    avatarUrl?: string | null;
  }
}

// ─── API Response Shapes ───────────────────────────────────────────────────

export interface ApiError {
  error: string;
  actionable: string;
}

export interface CommitResult {
  sha: string;
  url: string;
  message: string;
}

export interface PullRequestResult {
  number: number;
  url: string;
  title: string;
  branchName: string;
}

// ─── Frontmatter ───────────────────────────────────────────────────────────

export interface FrontmatterData {
  [key: string]: string | number | boolean | string[] | null;
}

// ─── Collections & Sidebar ──────────────────────────────────────────────

export interface Collection {
  id: string;
  repoOwner: string;
  repoName: string;
  label: string;
  folderPath: string;
  schema: CollectionSchemaField[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionSchemaField {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "tags" | "toggle" | "select";
  required?: boolean;
  default?: string | boolean | number;
  options?: string[];
}

export interface FolderNode {
  path: string;
  name: string;
  children: FolderNode[];
}

export interface CollectionFile {
  path: string;
  title: string;
  date: string | null;
  author: string | null;
  published: boolean | null;
  lastModified: string | null;
}
