import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/ui/SignInButton";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span className="text-xl font-bold tracking-tight">MDocs</span>
        </div>
        <SignInButton />
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-1.5 rounded-full">
          <span>🤖</span>
          <span>Built for teams using Claude Code, Cursor, and Copilot</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          Collaborate on docs{" "}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            that live in GitHub
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
          A Google Docs-style editor for CLAUDE.md configs, brand style guides,
          sales playbooks, and AI persona files — with PR workflows, inline
          comments, and AI-assisted editing. All synced to GitHub in real time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <SignInButton size="lg" />
          <p className="text-sm text-gray-500">
            No password required · GitHub identity only
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8">
          {[
            {
              icon: "✏️",
              title: "WYSIWYG Editor",
              desc: "Google Docs experience with a markdown source toggle",
            },
            {
              icon: "🔀",
              title: "PR Workflows",
              desc: "Propose changes as pull requests without knowing git",
            },
            {
              icon: "🤖",
              title: "AI Authoring",
              desc: "Ask Claude to rewrite, expand, or improve any selection",
            },
            {
              icon: "💬",
              title: "Inline Comments",
              desc: "Select text and leave threaded comments for teammates",
            },
            {
              icon: "🔒",
              title: "GitHub Auth",
              desc: "Your GitHub permissions — exactly what you can access",
            },
            {
              icon: "📁",
              title: "File Browser",
              desc: "Navigate all markdown files across your org's repos",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <div className="font-semibold text-white mb-1">{feature.title}</div>
              <div className="text-sm text-gray-400">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-600 py-6 border-t border-gray-800">
        Files always live in GitHub · MDocs is a lens, not a storage layer
      </footer>
    </main>
  );
}
