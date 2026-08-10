import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { assertWorkspaceRole, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { billingCheckoutSchema } from "@/lib/validators";
import { getStripeClient } from "@/lib/stripe";

const PRICE_ID_BY_PLAN: Record<"PRO" | "BUSINESS", string | undefined> = {
  PRO: process.env.STRIPE_PRICE_PRO,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
};

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = await request.json();
    const parsed = billingCheckoutSchema.safeParse(payload);

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

    const workspace = await db.workspace.findUnique({
      where: { id: parsed.data.workspaceId },
      include: {
        subscriptions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const priceId = PRICE_ID_BY_PLAN[parsed.data.plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe price id for ${parsed.data.plan}` },
        { status: 500 }
      );
    }

    const stripe = getStripeClient();

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    let customerId = workspace.subscriptions[0]?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: workspace.name,
        metadata: {
          workspaceId: workspace.id,
        },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      metadata: {
        workspaceId: workspace.id,
        plan: parsed.data.plan,
      },
    });

    await db.subscription.upsert({
      where: {
        workspaceId: workspace.id,
      },
      update: {
        stripeCustomerId: customerId,
      },
      create: {
        workspaceId: workspace.id,
        stripeCustomerId: customerId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (`${error}`.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (`${error}`.includes("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Unable to create checkout session", details: `${error}` },
      { status: 500 }
    );
  }
}
