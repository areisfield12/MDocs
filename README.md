# MDocs

Websites are moving from Webflow to code. But the CMS isn't coming with them. MDocs gives your content team back their editor — without moving the files.

---

**GitHub files. Google Docs experience.**

MDocs is a collaborative markdown editor for GitHub. Non-technical team members — marketers, content writers, PMs — can browse, edit, and publish markdown files in GitHub repos without knowing what a branch, commit, or pull request is.

Every action uses plain language. The git context is always there for those who want it — just never in the way.

## Who it's for

**Content teams on code-based websites.** Your marketing site is built in Next.js, Astro, or Remix. Blog posts, how-to guides, and changelog entries live as `.md` files in the repo. Your content team shouldn't need to touch GitHub to update them.

**AI-native teams managing agent configs and GTM docs.** `CLAUDE.md` files, `cursor_rules`, brand style guides, and sales playbooks increasingly live in GitHub because AI tools need to read them from source. MDocs makes it easy for the non-engineers who own that content to keep it updated.

## The core workflow

1. Sign in with GitHub
2. Browse your repo like a CMS — folder sidebar, posts listed by title, not filename
3. Click any post to open it in a clean WYSIWYG editor
4. Edit content and update metadata (title, date, author, tags) in a friendly sidebar form
5. Hit **Save** or **Propose changes** — MDocs handles the commit or PR automatically

No terminal. No git knowledge required. No separate CMS to sync.

## How saving works

Every GitHub action shows plain language first, git context second:

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

## Tech stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Editor**: TipTap v3 (ProseMirror-based WYSIWYG with markdown toggle)
- **Auth**: NextAuth.js — GitHub OAuth for identity, GitHub App for repo access
- **GitHub integration**: Octokit via GitHub App installation tokens
- **Database**: PostgreSQL via Prisma (comments, collection config, starred files)
- **AI**: Anthropic Claude API (inline editing, PR description generation)

## Running locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all values — see Environment Variables below

# Push database schema to Neon (or your Postgres instance)
npx dotenv -e .env.local -- npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

```
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=        # Contents of your .pem file, newlines as \n
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
NEXTAUTH_URL=                  # http://localhost:3000 for local dev
NEXTAUTH_SECRET=               # Any random string
DATABASE_URL=                  # Postgres connection string (Neon recommended)
ANTHROPIC_API_KEY=
```

## GitHub App setup

MDocs uses a GitHub App for all repo read/write operations. On first sign-in, users are prompted to install the app on their account or org.

Required permissions:
- `contents: read/write`
- `pull_requests: read/write`
- `metadata: read`

Set your callback URL to `http://localhost:3000/api/auth/callback/github` for local development. Update to your production URL before deploying.

## Project structure

```
/src
  /app
    /api
      /auth           → NextAuth handler
      /github         → Repo, file, commit, PR, collaborator routes
      /comments       → Comment CRUD and replies
      /ai             → Inline edit + PR description generation
      /settings       → Repo settings
      /stars          → File starring
    /dashboard        → Repo grid + starred files
    /repos            → File browser and editor
    /settings         → Per-repo configuration
  /components
    /editor           → TipTap editor, toolbar, markdown toggle, frontmatter editor
    /ui               → Shared UI components (Radix-based)
  /lib
    /github-app.ts    → GitHub App singleton + getOctokitForRepo()
    /auth.ts          → NextAuth config
    /markdown.ts      → Frontmatter parsing, HTML↔markdown conversion
  /hooks
    /useEditorState.ts → Save state machine
/prisma
  schema.prisma       → Data model
```

## Current status

Core editing and GitHub PR flow are working. Actively building toward a full CMS-like experience:

- **Content collections** — map folder paths to friendly labels, browse posts by title not filename
- **Schema-driven frontmatter editor** — right sidebar with typed fields (date picker, tags, published toggle)
- **New post creation flow** — "New post" button, auto-slug, draft-first workflow
- **Image upload** — drag/paste images into editor, committed directly to repo

## Contributing

PRs welcome. Please read `CLAUDE.md` in the repo root before contributing — it describes the current architecture, known bugs, and what's actively being built.

## License

MIT
