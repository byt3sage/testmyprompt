import { db } from "@/lib/db";
import { getPlanConfig } from "@/lib/plans";

function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getWorkspaceUsage(workspaceId: string) {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const start = monthStart();
  const used = await db.promptTest.count({
    where: {
      workspaceId,
      createdAt: {
        gte: start,
      },
    },
  });

  const limit = getPlanConfig(workspace.plan).monthlyTests;

  return {
    plan: workspace.plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function ensureWithinPlanLimit(workspaceId: string) {
  const usage = await getWorkspaceUsage(workspaceId);

  if (usage.used >= usage.limit) {
    return {
      allowed: false,
      usage,
    };
  }

  return {
    allowed: true,
    usage,
  };
}
