import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/ui/SignInButton";
import {
  FileText,
  GitPullRequest,
  Sparkles,
  MessageSquare,
  Shield,
  FolderOpen,
} from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: FileText,
      title: "WYSIWYG Editor",
      desc: "Rich editing with a markdown source toggle",
    },
    {
      icon: GitPullRequest,
      title: "PR Workflows",
      desc: "Propose changes as pull requests without knowing git",
    },
    {
      icon: Sparkles,
      title: "AI Authoring",
      desc: "Ask Claude to rewrite, expand, or improve any selection",
    },
    {
      icon: MessageSquare,
      title: "Inline Comments",
      desc: "Select text and leave threaded comments for teammates",
    },
    {
      icon: Shield,
      title: "GitHub Auth",
      desc: "Your GitHub permissions — exactly what you can access",
    },
    {
      icon: FolderOpen,
      title: "File Browser",
      desc: "Navigate all markdown files across your org's repos",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white flex flex-col antialiased">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-gray-400" />
          <span className="text-[15px] font-semibold tracking-tight text-gray-100">MDocs</span>
        </div>
        <SignInButton />
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] text-gray-400 text-[13px] px-3.5 py-1.5 rounded-full">
          <span>Built for teams using Claude Code, Cursor, and Copilot</span>
        </div>

        <h1 className="text-[40px] md:text-5xl font-semibold tracking-[-0.025em] leading-[1.15] text-gray-50">
          Collaborate on docs{" "}
          <span className="text-gray-400">
            that live in GitHub
          </span>
        </h1>

        <p className="text-[15px] md:text-base text-gray-500 max-w-xl leading-relaxed">
          A Google Docs-style editor for CLAUDE.md configs, brand style guides,
          sales playbooks, and AI persona files — with PR workflows, inline
          comments, and AI-assisted editing.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
          <SignInButton size="lg" />
          <p className="text-[13px] text-gray-600">
            No password required · GitHub identity only
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
            >
              <feature.icon className="h-4 w-4 text-gray-500 mb-3" />
              <div className="text-[13px] font-medium text-gray-200 mb-1">{feature.title}</div>
              <div className="text-[13px] text-gray-500 leading-relaxed">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[12px] text-gray-600 py-6 border-t border-white/[0.06]">
        Files always live in GitHub · MDocs is a lens, not a storage layer
      </footer>
    </main>
  );
}
