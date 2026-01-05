import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BillingClient } from "@/components/dashboard/BillingClient";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const metadata = {
    title: "Billing | ExamSim",
    description: "Manage your subscription",
};

export default async function BillingPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: {
            subscriptionTier: true,
            subscriptionStatus: true,
            subscriptionPeriodEnd: true,
            stripeCustomerId: true,
            email: true,
        },
    });

    if (!user) {
        redirect("/login");
    }

    const subscription = {
        tier: (user.subscriptionTier as "free" | "student" | "pro") || "free",
        status: user.subscriptionStatus || "active",
        periodEnd: user.subscriptionPeriodEnd,
        hasStripeCustomer: !!user.stripeCustomerId,
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-8 px-6">
            <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group font-medium"
            >
                <CaretLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Settings
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Billing</h1>
                <p className="text-zinc-500 font-medium">Manage your subscription and payment details</p>
            </div>

            <BillingClient subscription={subscription} userEmail={user.email} />
        </div>
    );
}
