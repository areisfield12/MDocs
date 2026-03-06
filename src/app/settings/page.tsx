import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import Image from "next/image";
import { Github } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

          {/* Profile section */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
            <div className="flex items-center gap-4">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {session.user.name?.[0] ?? "U"}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{session.user.name}</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
                {session.user.githubLogin && (
                  <a
                    href={`https://github.com/${session.user.githubLogin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-1"
                  >
                    <Github className="h-3.5 w-3.5" />
                    @{session.user.githubLogin}
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* GitHub App section */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              GitHub App Installation
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              MDocs needs to be installed on your repositories or organization to
              read and write files. Install the GitHub App to get started.
            </p>
            <a
              href={`https://github.com/apps/mdocs/installations/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <Github className="h-4 w-4" />
              Manage GitHub App installations
            </a>
          </section>

          {/* About section */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">About MDocs</h2>
            <p className="text-sm text-gray-500">
              MDocs is a Google Docs-style markdown editor for GitHub-native teams.
              Files always live in your GitHub repositories — MDocs is a lens, not a
              storage layer.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
              <p>Version: 1.0.0-beta</p>
              <p>All data stored in your connected GitHub organization.</p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
