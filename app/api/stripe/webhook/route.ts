import { NextRequest, NextResponse } from "next/server";
import { stripe, getTierFromPriceId } from "@/lib/stripe";
import { db } from "@/db";
import { users, subscriptionEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Webhook signature verification failed:", error);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error("No userId in checkout session metadata");
                    break;
                }

                // Get subscription details
                if (session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    );

                    const priceId = subscription.items.data[0]?.price.id;
                    const tier = getTierFromPriceId(priceId) || "student";

                    // Update user subscription
                    await db
                        .update(users)
                        .set({
                            subscriptionTier: tier,
                            subscriptionStatus: "active",
                            stripeSubscriptionId: subscription.id,
                            subscriptionPeriodEnd: new Date(
                                ((subscription as unknown) as { currentPeriodEnd: number }).currentPeriodEnd * 1000
                            ),
                        })
                        .where(eq(users.id, userId));
                }

                // Log the event
                await db.insert(subscriptionEvents).values({
                    userId,
                    eventType: event.type,
                    stripeEventId: event.id,
                    data: event.data.object,
                });

                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (!userId) {
                    // Try to find user by customer ID
                    const user = await db.query.users.findFirst({
                        where: eq(users.stripeCustomerId, subscription.customer as string),
                        columns: { id: true },
                    });

                    if (!user) {
                        console.error("No user found for subscription update");
                        break;
                    }

                    const priceId = subscription.items.data[0]?.price.id;
                    const tier = getTierFromPriceId(priceId) || "free";

                    await db
                        .update(users)
                        .set({
                            subscriptionTier: tier,
                            subscriptionStatus: subscription.status === "active" ? "active" :
                                subscription.status === "past_due" ? "past_due" :
                                    subscription.status === "canceled" ? "canceled" : "active",
                            subscriptionPeriodEnd: new Date(
                                ((subscription as unknown) as { currentPeriodEnd: number }).currentPeriodEnd * 1000
                            ),
                        })
                        .where(eq(users.id, user.id));

                    await db.insert(subscriptionEvents).values({
                        userId: user.id,
                        eventType: event.type,
                        stripeEventId: event.id,
                        data: event.data.object,
                    });
                } else {
                    const priceId = subscription.items.data[0]?.price.id;
                    const tier = getTierFromPriceId(priceId) || "free";

                    await db
                        .update(users)
                        .set({
                            subscriptionTier: tier,
                            subscriptionStatus: subscription.status === "active" ? "active" :
                                subscription.status === "past_due" ? "past_due" :
                                    subscription.status === "canceled" ? "canceled" : "active",
                            subscriptionPeriodEnd: new Date(
                                ((subscription as unknown) as { currentPeriodEnd: number }).currentPeriodEnd * 1000
                            ),
                        })
                        .where(eq(users.id, userId));

                    await db.insert(subscriptionEvents).values({
                        userId,
                        eventType: event.type,
                        stripeEventId: event.id,
                        data: event.data.object,
                    });
                }

                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;

                // Find user by subscription ID or customer ID
                let user = await db.query.users.findFirst({
                    where: eq(users.stripeSubscriptionId, subscription.id),
                    columns: { id: true },
                });

                if (!user) {
                    user = await db.query.users.findFirst({
                        where: eq(users.stripeCustomerId, subscription.customer as string),
                        columns: { id: true },
                    });
                }

                if (user) {
                    // Downgrade to free tier
                    await db
                        .update(users)
                        .set({
                            subscriptionTier: "free",
                            subscriptionStatus: "canceled",
                            stripeSubscriptionId: null,
                            subscriptionPeriodEnd: null,
                        })
                        .where(eq(users.id, user.id));

                    await db.insert(subscriptionEvents).values({
                        userId: user.id,
                        eventType: event.type,
                        stripeEventId: event.id,
                        data: event.data.object,
                    });
                }

                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                const user = await db.query.users.findFirst({
                    where: eq(users.stripeCustomerId, customerId),
                    columns: { id: true },
                });

                if (user) {
                    await db
                        .update(users)
                        .set({ subscriptionStatus: "past_due" })
                        .where(eq(users.id, user.id));

                    await db.insert(subscriptionEvents).values({
                        userId: user.id,
                        eventType: event.type,
                        stripeEventId: event.id,
                        data: event.data.object,
                    });
                }

                break;
            }

            default:
                // Log unhandled events for debugging
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
