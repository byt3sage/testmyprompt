import { createHash, randomBytes } from "node:crypto";

import { db } from "@/lib/db";

export function generateToken(): { raw: string; hash: string; prefix: string } {
  const bytes = randomBytes(24);
  const raw = `tmp_${bytes.toString("base64url")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function validateApiToken(authHeader: string | null | undefined) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: missing Bearer token");
  }

  const raw = authHeader.slice(7).trim();

  if (!raw.startsWith("tmp_")) {
    throw new Error("Unauthorized: invalid token format");
  }

  const tokenHash = hashToken(raw);

  const apiToken = await db.apiToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      workspaceId: true,
      userId: true,
      workspace: {
        select: { id: true, plan: true, name: true },
      },
    },
  });

  if (!apiToken) {
    throw new Error("Unauthorized: invalid or revoked token");
  }

  // Non-blocking last-used update
  void db.apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsedAt: new Date() },
  });

  return apiToken;
}
