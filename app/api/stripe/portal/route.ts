import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's Stripe customer ID
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: {
                stripeCustomerId: true,
            },
        });

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: "No subscription found" },
                { status: 400 }
            );
        }

        // Create a billing portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${env.NEXTAUTH_URL}/dashboard/settings/billing`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error("Portal error:", error);
        return NextResponse.json(
            { error: "Failed to create portal session" },
            { status: 500 }
        );
    }
}
