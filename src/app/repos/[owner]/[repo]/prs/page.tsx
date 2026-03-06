import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PRsClient } from "./PRsClient";

interface PRsPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function PRsPage({ params }: PRsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const { owner, repo } = await params;

  return (
    <AppShell repoOwner={owner} repoName={repo}>
      <PRsClient owner={owner} repo={repo} />
    </AppShell>
  );
}
