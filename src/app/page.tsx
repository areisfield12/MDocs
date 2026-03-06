import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/ui/SignInButton";
import { MDocsLogo, MDocsMark } from "@/components/ui/MDocsLogo";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

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

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <SignInButton size="lg" />
          <p className="text-sm text-gray-600">
            No password required · GitHub identity only
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-12">
          {[
            {
              title: "Just Write",
              desc: "A rich-text editor you already know how to use — no markdown syntax needed",
            },
            {
              title: "Suggest Changes",
              desc: "Propose edits as pull requests without ever opening a terminal",
            },
            {
              title: "AI Assist",
              desc: "Ask Claude to draft, rewrite, or improve any section for you",
            },
            {
              title: "Comment Together",
              desc: "Select text and leave threaded comments — just like Google Docs",
            },
            {
              title: "Files Stay in GitHub",
              desc: "Engineers and agents find your docs exactly where they expect them",
            },
            {
              title: "Browse Everything",
              desc: "See every markdown file across your org — no cloning required",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-left hover:border-white/10 transition-colors"
            >
              <div className="font-semibold text-white mb-1">{feature.title}</div>
              <div className="text-sm text-gray-500">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-700 py-6 border-t border-white/5">
        Your files never leave GitHub · MDocs is just a better way to edit them
      </footer>
    </main>
  );
}
