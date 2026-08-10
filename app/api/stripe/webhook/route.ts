import { PlanTier, SubscriptionStatus } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";

function planFromInput(value: string | null | undefined): PlanTier {
  if (!value) {
    return PlanTier.PRO;
  }

  if (value === "BUSINESS" || value === process.env.STRIPE_PRICE_BUSINESS) {
    return PlanTier.BUSINESS;
  }

  return PlanTier.PRO;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${error}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;

      if (workspaceId && session.customer) {
        await db.subscription.upsert({
          where: { workspaceId },
          update: {
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id,
            status: SubscriptionStatus.ACTIVE,
            plan: planFromInput(session.metadata?.plan),
          },
          create: {
            workspaceId,
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id,
            status: SubscriptionStatus.ACTIVE,
            plan: planFromInput(session.metadata?.plan),
          },
        });

        await db.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: planFromInput(session.metadata?.plan),
          },
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;

      await db.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: planFromInput(priceId),
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const subs = await db.subscription.findMany({
        where: { stripeSubscriptionId: subscription.id },
      });

      for (const sub of subs) {
        await db.subscription.update({
          where: { id: sub.id },
          data: {
            status: SubscriptionStatus.CANCELED,
            plan: PlanTier.FREE,
          },
        });

        await db.workspace.update({
          where: { id: sub.workspaceId },
          data: {
            plan: PlanTier.FREE,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed", details: `${error}` },
      { status: 500 }
    );
  }
}
