import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/ui/SignInButton";
import { MDocsLogo, MDocsMark } from "@/components/ui/MDocsLogo";
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
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <MDocsLogo size={28} />
        <SignInButton />
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 max-w-3xl mx-auto">
        <MDocsLogo size={48} className="mb-2" />

        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 text-sm px-4 py-1.5 rounded-full">
          Fully GitHub integrated
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          GitHub files.{" "}
          <span className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Docs experience.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
          Your agents&apos; brains live in markdown files. MDocs makes them as
          easy to edit and collaborate on as a Google Doc.
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
