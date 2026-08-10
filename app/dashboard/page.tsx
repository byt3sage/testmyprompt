import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard-client";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getWorkspaceUsage } from "@/lib/usage";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const memberships = await db.membership.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const workspaces = memberships.map((membership) => membership.workspace);
  const activeWorkspaceId = workspaces[0]?.id;

  const initialTests = activeWorkspaceId
    ? await db.promptTest.findMany({
        where: { workspaceId: activeWorkspaceId },
        include: { findings: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const initialUsage = activeWorkspaceId
    ? await getWorkspaceUsage(activeWorkspaceId)
    : null;

  return (
    <DashboardClient
      workspaces={workspaces}
      initialWorkspaceId={activeWorkspaceId ?? null}
      initialTests={initialTests}
      initialUsage={initialUsage}
    />
  );
}
