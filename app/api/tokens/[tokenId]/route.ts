import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { assertWorkspaceRole, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ tokenId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { tokenId } = await params;

    const token = await db.apiToken.findUnique({
      where: { id: tokenId },
      select: { workspaceId: true },
    });

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    await assertWorkspaceRole(user.id, token.workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    await db.apiToken.delete({ where: { id: tokenId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = `${error}`;
    if (msg.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg.includes("Forbidden"))    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Unable to revoke token" }, { status: 500 });
  }
}
