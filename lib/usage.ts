import { db } from "@/lib/db";
import { getPlanConfig } from "@/lib/plans";
import { PlanTier } from "@prisma/client";

// Max tests per IP per month for FREE workspaces — prevents multi-account abuse
const FREE_IP_MONTHLY_LIMIT = 5;

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

export async function checkIpLimit(ip: string, plan: PlanTier): Promise<boolean> {
  if (plan !== PlanTier.FREE) return true;

  const count = await db.promptTest.count({
    where: {
      ipAddress: ip,
      createdAt: { gte: monthStart() },
      workspace: { plan: PlanTier.FREE },
    },
  });

  return count < FREE_IP_MONTHLY_LIMIT;
}
