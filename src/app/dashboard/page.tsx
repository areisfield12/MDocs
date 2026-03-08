import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { defaultRepo: true },
  });

  if (user?.defaultRepo) {
    const [owner, repo] = user.defaultRepo.split("/");
    redirect(`/repos/${owner}/${repo}`);
  }

  return (
    <AppShell>
      <DashboardEmptyState />
    </AppShell>
  );
}
