import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { assertWorkspaceRole, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addMemberSchema } from "@/lib/validators";

type Params = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { workspaceId } = await params;

    await assertWorkspaceRole(user.id, workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const payload = await request.json();
    const parsed = addMemberSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const target = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: { id: true },
    });

    if (!target) {
      return NextResponse.json(
        { error: "User not found. Ask them to sign up first." },
        { status: 404 }
      );
    }

    const member = await db.membership.upsert({
      where: {
        userId_workspaceId: {
          userId: target.id,
          workspaceId,
        },
      },
      update: {
        role: parsed.data.role,
      },
      create: {
        userId: target.id,
        workspaceId,
        role: parsed.data.role,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (`${error}`.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (`${error}`.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Unable to add member", details: `${error}` },
      { status: 500 }
    );
  }
}
