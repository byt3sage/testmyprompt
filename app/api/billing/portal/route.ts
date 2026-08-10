import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { assertWorkspaceRole, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";
import { billingPortalSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await request.json();
    const parsed = billingPortalSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await assertWorkspaceRole(user.id, parsed.data.workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const sub = await db.subscription.findFirst({
      where: { workspaceId: parsed.data.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer attached to this workspace" },
        { status: 404 }
      );
    }

    const stripe = getStripeClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    if (`${error}`.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (`${error}`.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Unable to open billing portal", details: `${error}` },
      { status: 500 }
    );
  }
}
