import bcrypt from "bcryptjs";
import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token }),
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, workspaceName, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    if (TURNSTILE_SECRET) {
      const token = (parsed.data as { turnstileToken?: string }).turnstileToken;
      if (!token || !(await verifyTurnstile(token))) {
        return NextResponse.json({ error: "Security check failed" }, { status: 403 });
      }
    }

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
        },
      });

      const baseSlug = toSlug(workspaceName) || "workspace";
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: `${baseSlug}-${user.id.slice(-6).toLowerCase()}`,
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

      return { user, workspace };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to register user", details: `${error}` },
      { status: 500 }
    );
  }
}
