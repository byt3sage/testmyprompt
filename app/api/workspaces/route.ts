import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { workspaceSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();

    const workspaces = await db.membership.findMany({
      where: { userId: user.id },
      select: {
        role: true,
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ workspaces });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = workspaceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const workspace = await db.workspace.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        memberships: {
          create: {
            userId: user.id,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
      },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    if (`${error}`.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Workspace slug already taken" },
        { status: 409 }
      );
    }

    if (`${error}`.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to create workspace" }, { status: 500 });
  }
}
