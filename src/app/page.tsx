import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { LandingNav } from "@/components/landing/LandingNav";
import { ConnectButton } from "@/components/landing/ConnectButton";
import { FolderOpen, PenLine, GitCommitHorizontal, Check } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const isSignedIn = !!session;

  return (
    <main className="min-h-screen bg-bg-base">
      {/* Section 1 — Navbar */}
      <LandingNav isSignedIn={isSignedIn} />

      {/* Section 2 — Hero */}
      <section id="hero" className="py-20 lg:py-24">
        <div className="mx-auto px-6" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left">
              {/* Headline */}
              <h1
                className="font-display font-bold text-text-primary text-4xl lg:text-5xl"
                style={{ lineHeight: 1.15 }}
              >
                An editor for websites that live in code.
              </h1>

              {/* Subheadline */}
              <p
                className="text-lg text-text-secondary mt-5"
                style={{ maxWidth: 480, lineHeight: 1.6 }}
              >
                Commit makes content teams feel like they're editing your website through a CMS, even if your docs live in GitHub.
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
                  <ConnectButton
                    className="btn-primary text-base font-medium"
                    style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
                  />
                )}
              </div>

              {/* Below CTA */}
              <p className="text-sm text-text-tertiary mt-4">
                Free to start · Maintains GitHub as your source-of-truth
              </p>

              {/* Feature checkmarks */}
              <div className="mt-6 flex flex-col gap-2 items-center lg:items-start">
                {[
                  "Add and edit docs in seconds",
                  "Zero terminal workflows required",
                  "Fully GitHub integrated",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check size={15} strokeWidth={2.5} className="text-success shrink-0" />
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Loom demo */}
            <div className="flex-1 w-full lg:max-w-[520px]">
              <div
                className="relative w-full rounded-xl overflow-hidden border border-border-default"
                style={{
                  aspectRatio: "16/9",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                }}
              >
                <iframe
                  src="https://www.loom.com/embed/b654d8c2624941c1abdbf56dafce9844"
                  frameBorder="0"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  title="Commit product demo"
                />
              </div>
              <p className="text-center text-xs text-text-tertiary mt-3">
                See how it works — 2 min demo
              </p>
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
            Commit fixes both sides of this problem.
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
            Commit connects directly to your GitHub repo and gives your content
            team a CMS-like interface for the markdown files already living
            there. Nothing moves. Nothing syncs. GitHub stays the source of
            truth.
          </p>

          {/* Editor screenshot — star of the show */}
          <div className="mt-14 mx-auto" style={{ maxWidth: 960 }}>
            <div
              className="rounded-xl overflow-hidden border border-border-default"
              style={{ boxShadow: "0 12px 48px rgba(0,0,0,0.20)" }}
            >
              <Image
                src="/screenshots/editor.png"
                alt="Commit editor — WYSIWYG editing with frontmatter panel"
                width={1400}
                height={875}
                className="w-full h-auto block"
                priority
              />
            </div>
            <p className="text-center text-sm text-text-tertiary mt-3">
              WYSIWYG editing with live frontmatter fields — no markdown knowledge required.
            </p>
          </div>

          {/* Feature blocks */}
          <div
            className="mx-auto mt-16 flex flex-col gap-10"
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

          {/* File browser screenshot */}
          <div className="mt-16 mx-auto" style={{ maxWidth: 780 }}>
            <div
              className="rounded-xl overflow-hidden border border-border-default"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.14)" }}
            >
              <Image
                src="/screenshots/file-browser.png"
                alt="Commit file browser — CMS-style folder navigation"
                width={1200}
                height={750}
                className="w-full h-auto block"
              />
            </div>
            <p className="text-center text-sm text-text-tertiary mt-3">
              Folders, file titles, status, date, and author — all visible at a glance.
            </p>
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
                  Commit gives them back their workflow — browse, edit, publish —
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
                  Commit makes them collaborative. Your whole team can edit the
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
              <ConnectButton
                className="btn-primary text-base font-medium"
                style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
              />
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
        <span>&copy; 2026 Commit</span>
        <span>Built for GitHub · Not affiliated with GitHub, Inc.</span>
      </footer>
    </main>
  );
}
