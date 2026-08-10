import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { generateToken } from "@/lib/api-tokens";
import { assertWorkspaceRole, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTokenSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await assertWorkspaceRole(user.id, workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const tokens = await db.apiToken.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tokens });
  } catch (error) {
    const msg = `${error}`;
    if (msg.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg.includes("Forbidden"))    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Unable to list tokens" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await request.json();
    const parsed = createTokenSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await assertWorkspaceRole(user.id, parsed.data.workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const { raw, hash, prefix } = generateToken();

    const token = await db.apiToken.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        userId: user.id,
        name: parsed.data.name,
        tokenHash: hash,
        prefix,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
      },
    });

    // Return the raw token once — it is never retrievable again
    return NextResponse.json({ token, rawToken: raw }, { status: 201 });
  } catch (error) {
    const msg = `${error}`;
    if (msg.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg.includes("Forbidden"))    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Unable to create token" }, { status: 500 });
  }
}
