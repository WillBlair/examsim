import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { priceId, billingPeriod } = await req.json();

        // Validate the price ID
        const validPriceIds = [
            STRIPE_PRICES.student.monthly,
            STRIPE_PRICES.student.yearly,
            STRIPE_PRICES.pro.monthly,
            STRIPE_PRICES.pro.yearly,
        ];

        if (!validPriceIds.includes(priceId)) {
            return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
        }

        // Get or create Stripe customer
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: {
                id: true,
                email: true,
                stripeCustomerId: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
            // Create a new Stripe customer
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id,
                },
            });

            stripeCustomerId = customer.id;

            // Save the customer ID
            await db
                .update(users)
                .set({ stripeCustomerId })
                .where(eq(users.id, user.id));
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.NEXTAUTH_URL}/pricing?canceled=true`,
            metadata: {
                userId: user.id,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                },
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
