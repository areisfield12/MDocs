import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";
import { FolderOpen, PenLine, GitCommitHorizontal } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const isSignedIn = !!session;

  return (
    <main className="min-h-screen bg-bg-base">
      {/* Section 1 — Navbar */}
      <LandingNav isSignedIn={isSignedIn} />

      {/* Section 2 — Hero */}
      <section id="hero" className="py-24 text-center">
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          {/* Badge */}
          <div
            className="inline-flex items-center bg-bg-emphasis border border-border-default text-text-secondary text-xs rounded-full px-4 py-2"
          >
            Built for teams using Claude Code, Cursor, and Next.js
          </div>

          {/* Headline */}
          <h1
            className="font-display font-bold text-text-primary text-5xl mt-6 mx-auto"
            style={{ maxWidth: 800 }}
          >
            Your website moved to code.
            <br />
            Your content team got left behind.
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg text-text-secondary mt-6 mx-auto"
            style={{ maxWidth: 560, lineHeight: 1.6 }}
          >
            MDocs gives your content team a real editor for the markdown files
            living in your GitHub repo — without pulling them into your codebase.
          </p>

          {/* CTA Button */}
          <div className="mt-6">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="btn-primary text-base font-medium"
                style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
              >
                Go to dashboard &rarr;
              </Link>
            ) : (
              <a
                href="/api/auth/signin"
                className="btn-primary text-base font-medium"
                style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
              >
                Connect your GitHub repo &rarr;
              </a>
            )}
          </div>

          {/* Below CTA */}
          <p className="text-sm text-text-tertiary mt-6">
            Free to start · No credit card · Your files stay in GitHub
          </p>

          {/* Terminal line */}
          <div className="mt-6">
            <div
              className="inline-block bg-bg-subtle border border-border-default rounded-md font-mono text-sm text-text-secondary"
              style={{ padding: "var(--space-2) var(--space-4)" }}
            >
              Saved · Committed to main · view on GitHub ↗
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Trust Bar */}
      <section className="border-t border-b border-border-subtle py-10 text-center">
        <p
          className="text-base text-text-tertiary italic mx-auto px-6"
          style={{ maxWidth: 1100 }}
        >
          The editor for teams who moved from Webflow — and miss having a place
          to write.
        </p>
      </section>

      {/* Section 4 — Problem */}
      <section id="problem" className="py-24 border-b border-border-subtle">
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <h2 className="font-display font-bold text-text-primary text-3xl text-center mb-12">
            Something broke when you moved to code.
          </h2>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mx-auto"
            style={{ maxWidth: 960 }}
          >
            {/* Engineer voice */}
            <div className="bg-bg-subtle border border-border-default rounded-lg p-8">
              <div
                className="text-accent uppercase mb-4 font-medium text-xs"
                style={{ letterSpacing: "0.08em" }}
              >
                For Engineers
              </div>
              <div
                className="text-base text-text-secondary space-y-4"
                style={{ lineHeight: 1.7 }}
              >
                <p>You built something great.</p>
                <p>
                  A fast, maintainable codebase. Blog posts as markdown files.
                  No more Webflow lock-in. Clean deploys.
                </p>
                <p>And then the Slack messages started.</p>
                <p>&ldquo;Can you fix the typo on the homepage?&rdquo;</p>
                <p>&ldquo;Can you publish this post?&rdquo;</p>
                <p>&ldquo;Can you update the author name?&rdquo;</p>
                <p>
                  You became the bottleneck for content that has nothing to do
                  with engineering.
                </p>
              </div>
            </div>

            {/* Marketer voice */}
            <div className="bg-bg-subtle border border-border-default rounded-lg p-8">
              <div
                className="text-accent uppercase mb-4 font-medium text-xs"
                style={{ letterSpacing: "0.08em" }}
              >
                For Content Teams
              </div>
              <div
                className="text-base text-text-secondary space-y-4"
                style={{ lineHeight: 1.7 }}
              >
                <p>You used to own your content.</p>
                <p>
                  You could publish a blog post in ten minutes. Update a landing
                  page without asking anyone. See exactly what you were editing
                  before it went live.
                </p>
                <p>Then engineering moved to a new stack.</p>
                <p>
                  Now your content lives in GitHub. You don&apos;t have access.
                  Or you do, but you&apos;re afraid to break something. So you
                  file a ticket and wait.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xl text-text-primary font-semibold text-center mt-10">
            MDocs fixes both sides of this problem.
          </p>
        </div>
      </section>

      {/* Section 5 — Product */}
      <section id="product" className="py-24 border-b border-border-subtle">
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <h2
            className="font-display font-bold text-text-primary text-3xl text-center mx-auto"
            style={{ maxWidth: 600 }}
          >
            Engineers own the code.
            <br />
            Content teams own the content.
            <br />
            That&apos;s how it should work.
          </h2>

          <p
            className="text-base text-text-secondary text-center mx-auto mt-6"
            style={{ maxWidth: 560, lineHeight: 1.7 }}
          >
            MDocs connects directly to your GitHub repo and gives your content
            team a CMS-like interface for the markdown files already living
            there. Nothing moves. Nothing syncs. GitHub stays the source of
            truth.
          </p>

          {/* Feature blocks */}
          <div
            className="mx-auto mt-12 flex flex-col gap-10"
            style={{ maxWidth: 680 }}
          >
            {/* Block 1 */}
            <div className="flex gap-4">
              <FolderOpen
                className="text-accent shrink-0 mt-1"
                size={20}
                strokeWidth={1.5}
              />
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Browse like a CMS, not a codebase
                </h3>
                <p
                  className="text-base text-text-secondary mt-2"
                  style={{ lineHeight: 1.7 }}
                >
                  Your content team sees &ldquo;Blog Posts&rdquo; and
                  &ldquo;Docs&rdquo; — not
                  /content/blog/2024-03-01-post-slug.md. Navigate folders, find
                  files by title, click to edit. No terminal required.
                </p>
              </div>
            </div>

            {/* Block 2 */}
            <div className="flex gap-4">
              <PenLine
                className="text-accent shrink-0 mt-1"
                size={20}
                strokeWidth={1.5}
              />
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Edit without knowing markdown
                </h3>
                <p
                  className="text-base text-text-secondary mt-2"
                  style={{ lineHeight: 1.7 }}
                >
                  A clean WYSIWYG editor with the formatting tools your team
                  already knows. Toggle to raw markdown if you want it. Tables,
                  headings, code blocks, images — all handled.
                </p>
              </div>
            </div>

            {/* Block 3 */}
            <div className="flex gap-4">
              <GitCommitHorizontal
                className="text-accent shrink-0 mt-1"
                size={20}
                strokeWidth={1.5}
              />
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Publish with a clear paper trail
                </h3>
                <p
                  className="text-base text-text-secondary mt-2"
                  style={{ lineHeight: 1.7 }}
                >
                  Every save tells you exactly what happened in plain English —
                  and shows you the GitHub action underneath. &ldquo;Saved ·
                  Committed to main · view on GitHub ↗&rdquo; Your engineer can
                  see every change. Your content team never has to care what a
                  commit is.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Use Cases */}
      <section id="use-cases" className="py-24">
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <h2 className="font-display font-bold text-text-primary text-3xl text-center mb-12">
            Two problems. One editor.
          </h2>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto"
            style={{ maxWidth: 960 }}
          >
            {/* Content Teams */}
            <div className="bg-bg-subtle border border-border-default rounded-lg p-8">
              <div
                className="text-accent uppercase mb-4 font-medium text-xs"
                style={{ letterSpacing: "0.08em" }}
              >
                Content Teams
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                Content teams on code-based sites
              </h3>
              <div
                className="text-base text-text-secondary space-y-4"
                style={{ lineHeight: 1.7 }}
              >
                <p>
                  Your marketing site is Next.js. Your blog is markdown files in
                  a repo. Your content team has been locked out since the
                  migration.
                </p>
                <p>
                  MDocs gives them back their workflow — browse, edit, publish —
                  without touching the codebase.
                </p>
              </div>
            </div>

            {/* AI-Native Teams */}
            <div className="bg-bg-subtle border border-border-default rounded-lg p-8">
              <div
                className="text-accent uppercase mb-4 font-medium text-xs"
                style={{ letterSpacing: "0.08em" }}
              >
                AI-Native Teams
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                Teams managing agent configs
              </h3>
              <div
                className="text-base text-text-secondary space-y-4"
                style={{ lineHeight: 1.7 }}
              >
                <p>
                  CLAUDE.md files. Cursor rules. Brand style guides. Sales
                  playbooks. The files your AI reads live in GitHub because
                  that&apos;s where they belong.
                </p>
                <p>
                  MDocs makes them collaborative. Your whole team can edit the
                  files that govern how your AI behaves — without a developer in
                  the loop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Final CTA */}
      <section
        id="cta"
        className="bg-bg-subtle border-t border-b border-border-subtle py-24 text-center"
      >
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <h2 className="font-display font-bold text-text-primary text-4xl">
            Your content belongs to your content team.
          </h2>

          <p
            className="text-lg text-text-secondary mx-auto mt-4"
            style={{ maxWidth: 480, lineHeight: 1.6 }}
          >
            Connect your GitHub repo and give them back their editor. Takes
            about 60 seconds.
          </p>

          <div className="mt-8">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="btn-primary text-base font-medium"
                style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
              >
                Go to dashboard &rarr;
              </Link>
            ) : (
              <a
                href="/api/auth/signin"
                className="btn-primary text-base font-medium"
                style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
              >
                Connect your GitHub repo &rarr;
              </a>
            )}
          </div>

          <p className="text-sm text-text-tertiary mt-4">
            Free for public repos · Private repos from $19/month · No password
            required · GitHub identity only
          </p>
        </div>
      </section>

      {/* Section 8 — Footer */}
      <footer className="flex items-center justify-between px-8 py-8 text-sm text-text-tertiary border-t border-border-subtle">
        <span>&copy; 2026 MDocs</span>
        <span>Built for GitHub · Not affiliated with GitHub, Inc.</span>
      </footer>
    </main>
  );
}
