import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch starred files from DB
  const starredFiles = await prisma.starredFile.findMany({
    where: { userId: session.user.id },
    orderBy: { id: "desc" },
  });

  return (
    <AppShell>
      <DashboardClient
        userId={session.user.id}
        initialStarredFiles={starredFiles.map((s) => ({
          id: s.id,
          repoOwner: s.repoOwner,
          repoName: s.repoName,
          filePath: s.filePath,
        }))}
      />
    </AppShell>
  );
}
