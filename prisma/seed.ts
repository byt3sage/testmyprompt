import bcrypt from "bcryptjs";
import { PlanTier, WorkspaceRole } from "@prisma/client";

import { db } from "../lib/db";

async function main() {
  const email = "demo@testmyprompt.net";
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const user = await db.user.upsert({
    where: { email },
    update: {
      name: "Demo User",
      passwordHash,
    },
    create: {
      name: "Demo User",
      email,
      passwordHash,
    },
  });

  const workspace = await db.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {
      name: "Demo Workspace",
      plan: PlanTier.FREE,
    },
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      plan: PlanTier.FREE,
    },
  });

  await db.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    },
    update: {
      role: WorkspaceRole.OWNER,
    },
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: WorkspaceRole.OWNER,
    },
  });

  console.log("Seed complete:", {
    email,
    password: "Password123!",
    workspace: workspace.slug,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
