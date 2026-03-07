# CLAUDE.md — MDocs

This file is instructions for Claude Code. Read it fully before making any changes.

---

## What we're building

MDocs is a collaborative markdown editor that connects to GitHub. The north star UX is:

> A non-technical person (marketer, content writer) opens a link, navigates a familiar folder sidebar to find their blog posts, clicks one, edits it in a friendly WYSIWYG editor, hits Save, and a GitHub PR is created automatically — without ever seeing a raw file path, branch name, or git command.

Think: Webflow CMS or Contentful, but the files actually live in the GitHub repo. No sync. No separate CMS database. GitHub is always the source of truth.

The navigation model is **Webflow CMS**: a left sidebar shows a navigable folder hierarchy. Users browse into folders naturally. Files are shown by their frontmatter title, not their filename. The underlying repo structure is visible as navigation — but never as raw path strings.

---

## Primary use case (build for this first)

**Content teams on code-based websites.**

Engineers have built the marketing site in Next.js, Astro, or Remix. Blog posts, how-to guides, case studies, and changelog entries live as `.md` or `.mdx` files in the repo (commonly in `/content/`, `/posts/`, `/blog/`, or similar). The content team needs to edit these files regularly but cannot use GitHub's editor or VS Code.

MDocs solves this by giving them a CMS-like interface that reads and writes directly to the repo.

---

## Secondary use case (also important, do not neglect)

**AI-native teams managing agent configs and GTM docs.**

`CLAUDE.md` files, `cursor_rules`, brand style guides, sales playbooks, and persona definitions that live in GitHub repos. These users are more technical but still benefit from collaboration features, inline comments, and PR workflows.

---

## Current state of the app (as of March 2026)

### Architecture overview

- **Auth**: Hybrid NextAuth GitHub OAuth + GitHub App. JWT session stores `id`, `githubLogin`, `githubId`, `avatarUrl`. All GitHub API write calls use the GitHub App installation token via `getOctokitForRepo(owner)` in `src/lib/github-app.ts` — never the user's OAuth token. OAuth tokens are stored in the `Account` table but never read (dead code, do not use them).
- **Editor**: TipTap v3.20.0 with StarterKit, Underline, Link, Placeholder, Table, CodeBlockLowlight, CharacterCount (installed but unused)
- **Markdown pipeline**: `gray-matter` strips frontmatter on load → TipTap gets HTML only → `matter.stringify()` re-prepends YAML on save. Lives in `src/lib/markdown.ts`.
- **Save state**: Managed in `src/hooks/useEditorState.ts` with states: `clean → unsaved → saving → saved → clean` (also `error` and `pr-open`)
- **Key files**: `src/lib/github-app.ts`, `src/lib/auth.ts`, `src/lib/markdown.ts`, `src/hooks/useEditorState.ts`, `src/components/editor/`, `src/app/dashboard/DashboardClient.tsx`, `src/app/repos/[owner]/[repo]/RepoBrowserClient.tsx`

### What is working

- GitHub OAuth sign-in via NextAuth + GitHub App installation flow
- Dashboard: grid of repo cards with search, last updated, privacy icon, starred files section
- Repo file browser: hierarchical folder tree via `FileTree.tsx`, filters to `.md`/`.mdx`, shows file category icons (agent/style/gtm/doc), last commit time, star button
- TipTap WYSIWYG editor loading file content from GitHub, with markdown toggle (WYSIWYG ↔ raw via Turndown + remark)
- Frontmatter stripped on load, re-prepended on save — currently rendered as a generic key-value UI via `FrontmatterEditor.tsx`
- Direct commit save flow (`POST /api/github/[owner]/[repo]/commit`)
- PR creation flow: creates branch `mdocs/{username}/{filename}` → commits → opens PR → requests reviewers (`POST /api/github/[owner]/[repo]/pr`)
- AI inline editing via Claude Sonnet streaming (`POST /api/ai/edit`)
- AI PR description generation (`POST /api/ai/pr-description`)
- Inline comments: create, list, resolve, reply, delete — all working end to end
- File starring
- Repo settings (requirePR, defaultBranch, protectedBranches)

### Known bugs — fix these before building new features

| Issue | Location | Fix |
|---|---|---|
| AI text insertion uses deprecated `document.execCommand("insertText")` | `EditorPageClient.tsx:200-209` | Replace with TipTap's `editor.chain().insertContent()` API |
| `EditorWithRef` duplicates editor config using `require()` calls, missing CodeBlockLowlight | Line 433 | Refactor to share single editor config, add CodeBlockLowlight to this instance |
| Selection uses `window.getSelection()` instead of TipTap state | `EditorPageClient.tsx` | Use `editor.state.selection` instead |
| No Cmd+S keyboard shortcut | Editor | Add `useEffect` keydown listener that calls save handler |

### Not yet built (priority order)

1. Content collections + Webflow-style sidebar navigation
2. Schema-driven frontmatter editor (right sidebar panel with proper field types)
3. New post creation flow
4. Image upload and insertion
5. Shareable draft preview link
6. Real-time multiplayer (Yjs) — deprioritized, build last

### Existing API routes (do not duplicate)

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/github/repos` | GET | List repos where App is installed |
| `/api/github/[owner]/[repo]/files` | GET | List markdown files (recursive tree) |
| `/api/github/[owner]/[repo]/file` | GET | Get single file content + last commit |
| `/api/github/[owner]/[repo]/commit` | POST | Direct commit to branch |
| `/api/github/[owner]/[repo]/pr` | POST | Create PR |
| `/api/github/[owner]/[repo]/prs` | GET | List MDocs-created PRs |
| `/api/github/[owner]/[repo]/collaborators` | GET | List repo collaborators |
| `/api/comments` | GET/POST | List/create comments |
| `/api/comments/[commentId]` | PATCH/DELETE | Resolve/delete comments |
| `/api/comments/[commentId]/replies` | POST | Add reply |
| `/api/ai/edit` | POST | AI inline editing (streaming) |
| `/api/ai/pr-description` | POST | AI PR title/body from diff |
| `/api/settings/repo` | POST | Upsert repo settings |
| `/api/stars` | GET/POST/DELETE | Star/unstar files |

### Existing Prisma models (additive changes only)

`Account`, `Session`, `VerificationToken`, `User`, `Comment`, `Reply`, `Suggestion` (DB only — no API routes or UI yet), `StarredFile`, `RepoSettings`

### Key dependencies

| Package | Version |
|---|---|
| next | ^16.1.6 |
| react | ^19.2.4 |
| next-auth | ^4.24.13 |
| @tiptap/* | ^3.20.0 |
| octokit | ^5.0.5 |
| @prisma/client | ^6.19.2 |
| @anthropic-ai/sdk | ^0.78.0 |
| gray-matter | ^4.0.3 |
| turndown | ^7.2.2 |
| tailwindcss | ^4.2.1 |
| zod | ^4.3.6 |

---

## What to build next — detailed specs

### 1. Content Collections & Sidebar Navigation

**What it is:** A Webflow CMS-style left sidebar that lets users navigate the repo folder hierarchy and see files as friendly, titled rows — never as raw file paths.

**Navigation model:**
- Left sidebar shows the repo's folder structure as a navigable tree
- Folder names are shown as-is (they're usually human-readable: `/blog`, `/docs`, `/guides`)
- Clicking a folder expands it and shows its contents
- Clicking a markdown file opens it in the editor
- Files are always labeled by their frontmatter `title` field when available; filename is the fallback
- File extensions (`.md`, `.mdx`) are never shown
- Full file paths are never shown as the primary label — a small gray breadcrumb at the top of the editor is acceptable for context, but optional

**Two tiers of folders:**

*Labeled collections* (configured by repo admin):
- Admin maps a folder path to a friendly label: `/content/blog` → "Blog Posts"
- Labeled collections appear at the top of the sidebar with their friendly name and a post count
- Clicking a labeled collection shows a row-based list view (like Webflow CMS): title, date, author, published status pill
- Labeled collections have a defined frontmatter schema (see frontmatter section)

*Unlabeled folders* (no config required):
- All other folders in the repo appear below labeled collections as a standard folder tree
- Show folder name as-is, files by frontmatter title or filename fallback
- Use a generic key-value frontmatter editor (no schema required)
- This means MDocs works immediately for any repo, even before an admin configures anything

**Config storage:** Store collection config in Postgres in a `Collection` table:
```
Collection {
  id, repoOwner, repoName, label, folderPath, schema (JSON), createdAt
}
```

**Setup UI:** In `/settings/repo/[owner]/[repo]`, add a "Collections" section where admins can:
- Add a collection: pick a label ("Blog Posts") and a folder path (`/content/blog`)
- Define the frontmatter schema for that collection (see frontmatter section below)
- Reorder or delete collections

**Row-based list view (for labeled collections):**
- Columns: Title, Published date, Author, Status (Published / Draft pill), Last modified
- Sorted by date descending by default
- Search/filter within the collection
- "New post" button prominent in top right (see New Post Creation Flow below)

---

### 2. Frontmatter Editor

**What it is:** A schema-driven form that replaces raw YAML frontmatter editing. Non-technical users see labeled fields, not `---` blocks.

**Schema definition:** Each collection has a JSON schema stored in Postgres. Example:
```json
[
  { "key": "title", "label": "Title", "type": "text", "required": true },
  { "key": "date", "label": "Publish Date", "type": "date", "required": true },
  { "key": "author", "label": "Author", "type": "text" },
  { "key": "tags", "label": "Tags", "type": "tags" },
  { "key": "description", "label": "SEO Description", "type": "textarea" },
  { "key": "published", "label": "Published", "type": "toggle", "default": false }
]
```

**Field types to support:** `text`, `textarea`, `date` (date picker), `tags` (multi-value tag input), `toggle` (published/draft boolean), `select` (dropdown with options)

**UI placement:** Render the frontmatter form in a right sidebar panel in the editor view, not inline above the document body. The editor should be full-width document area on the left, frontmatter panel on the right (collapsible).

**Behavior:** Editing any frontmatter field updates the in-memory document state. On save/PR creation, frontmatter is serialized back to YAML and prepended to the markdown content before committing.

**Fallback:** If a file has frontmatter but no collection schema is defined, render a generic key-value editor (current behavior is fine as fallback).

---

### 3. New Post Creation Flow

**What it is:** A "New post" button that creates a new markdown file in the collection folder with pre-populated frontmatter.

**UI:** In the collection view, a prominent "New post" button. Clicking it opens a modal:
- Title field (required)
- Publish date (defaults to today)
- Author (defaults to current user's GitHub name)
- Published toggle (defaults to false / draft)

**File creation logic:**
- Auto-generate filename from title: lowercase, spaces to hyphens, strip special chars, append `.md`
- Example: "How to Write a CLAUDE.md" → `how-to-write-a-claude-md.md`
- Place file in the collection's folder path
- Pre-populate frontmatter from the modal inputs
- Open the editor immediately after creation
- Do NOT commit to GitHub yet — treat as a new unsaved draft until the user hits Save

**Edge cases:**
- If filename already exists, append `-2`, `-3` etc.
- Validate title is not empty before allowing creation

---

### 4. Image Upload and Insertion

**What it is:** Drag-and-drop or paste an image into the editor, have it committed to the repo, and inserted as a markdown image reference.

**Upload flow:**
- User drags image onto editor canvas OR pastes from clipboard
- Show upload progress indicator in editor
- Commit image file to `/public/images/[filename]` in the repo (or configurable path)
- Insert `![alt text](/images/[filename])` at cursor position
- Alt text defaults to filename, user can edit inline

**File naming:** Sanitize filename, prepend timestamp to avoid collisions: `1709123456-screenshot.png`

**Supported formats:** jpg, jpeg, png, gif, webp

**Do not:** Build external CDN/Cloudinary integration in v1. Keep it simple — images go into the repo. We can add external storage later.

---

## UX principles — enforce these in every feature

1. **File paths are navigation, not labels.** Users navigate folder structure visually via the sidebar. Files are always labeled by frontmatter title. Full path strings (e.g. `/content/blog/2024-03-01-post.md`) should never appear as primary labels — a small gray breadcrumb in the editor for context is acceptable.

2. **Plain language first, git context second — always both.** Every button or action that touches GitHub must follow this pattern:
   - **Primary label**: plain English (e.g. "Save changes", "Propose changes", "Publishing to...")
   - **Secondary info**: git context in smaller, muted text below or after the action
   - **After the action**: always show a "view on GitHub" link
   
   Examples:
   ```
   [ Save changes ]
     Will commit directly to main
   
   ✓ Saved
     Committed to main · just now · view on GitHub ↗
   
   [ Propose changes ]
     Opens a pull request for review
   
   ✓ Changes proposed
     PR #42 open · waiting for review · view on GitHub ↗
   ```
   
   Never hide git concepts entirely — they build trust and give technical users confidence. Never lead with git concepts — they confuse non-technical users. Always show both layers.

3. **Save state must always be visible** — persistent indicator in the editor toolbar: `Unsaved changes` / `Saving...` / `Saved · view on GitHub ↗` / `PR #42 open · view on GitHub ↗`

4. **Errors must suggest a fix** — never show raw API errors to users. Translate GitHub API errors into plain English with a suggested action.

5. **The editor is the primary surface** — don't clutter it with chrome. Sidebar panels should be collapsible.

---

## What NOT to change without asking

- The GitHub App authentication model — all writes must use `getOctokitForRepo(owner)` from `src/lib/github-app.ts`, never user OAuth tokens
- The Prisma schema for `Comment`, `Reply`, `Suggestion`, `User`, `StarredFile`, `RepoSettings` — additive changes only, never modify existing fields
- The TipTap editor core setup in `src/components/editor/` — extend it, don't replace it
- NextAuth configuration in `src/lib/auth.ts`
- The markdown pipeline in `src/lib/markdown.ts` — extend `prepareFileForEditor()` and `buildRawMarkdown()` if needed, don't rewrite them
- Existing API routes — never change method signatures or response shapes, only add new routes

---

## Code conventions

- TypeScript strict mode — no `any` types
- All GitHub API calls go through `src/lib/github-app.ts` helper functions, never inline in components or API routes
- All database queries go through Prisma client — import from `src/lib/prisma.ts` or equivalent
- API routes live in `/app/api/` using Next.js App Router route handlers
- Components use Tailwind for styling — no inline styles, no CSS modules
- Use `zod` for all API request validation
- Error boundaries around all editor and GitHub API surfaces
- When extending the TipTap editor, use `editor.chain().focus()` command API — never `document.execCommand()`
- When reading editor selection, use `editor.state.selection` — never `window.getSelection()`

---

## Environment variables required

```
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
DATABASE_URL=
ANTHROPIC_API_KEY=
```

---

## Definition of done for the content editing use case

A non-technical user (no GitHub knowledge) should be able to:
1. Sign in with GitHub in under 60 seconds
2. Navigate a familiar folder sidebar to find their blog posts — no raw file paths visible
3. See posts listed by title, date, and published status in a row-based list (like Webflow CMS)
4. Click a post and edit it in a clean WYSIWYG editor
5. Update the title, date, and published status in a friendly sidebar form
6. Paste or drag in an image and have it appear in the document
7. Hit "Propose changes" and have a PR created without any git concepts shown
8. Create a brand new blog post from scratch with a "New post" button

If all eight of these work end-to-end without confusion, the content editing milestone is done.
