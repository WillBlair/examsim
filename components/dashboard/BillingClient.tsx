"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CreditCard, ArrowSquareOut, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Subscription {
    tier: "free" | "student" | "pro";
    status: string;
    periodEnd: Date | null;
    hasStripeCustomer: boolean;
}

interface BillingClientProps {
    subscription: Subscription;
    userEmail: string;
}

const TIER_DISPLAY = {
    free: { name: "Free", color: "zinc", icon: null },
    student: { name: "Student", color: "emerald", icon: Crown },
    pro: { name: "Pro", color: "purple", icon: Crown },
};

export function BillingClient({ subscription, userEmail }: BillingClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const tierInfo = TIER_DISPLAY[subscription.tier];

    async function handleManageSubscription() {
        if (!subscription.hasStripeCustomer) {
            router.push("/pricing");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/stripe/portal", {
                method: "POST",
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Portal error:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 mb-1">Current Plan</h2>
                        <p className="text-sm text-zinc-500">
                            {subscription.tier === "free"
                                ? "You're on the free plan"
                                : `You're subscribed to ${tierInfo.name}`}
                        </p>
                    </div>
                    <div
                        className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5",
                            subscription.tier === "free"
                                ? "bg-zinc-100 text-zinc-700"
                                : subscription.tier === "student"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-purple-100 text-purple-700"
                        )}
                    >
                        {tierInfo.icon && <tierInfo.icon weight="fill" className="w-4 h-4" />}
                        {tierInfo.name}
                    </div>
                </div>

                {subscription.tier !== "free" && subscription.periodEnd && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600 mb-4">
                        <CreditCard className="w-4 h-4" />
                        {subscription.status === "canceled" ? (
                            <span>
                                Access until {new Date(subscription.periodEnd).toLocaleDateString()}
                            </span>
                        ) : (
                            <span>
                                Next billing date: {new Date(subscription.periodEnd).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                )}

                {subscription.status === "past_due" && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                        <Warning weight="fill" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Payment Failed</p>
                            <p className="text-sm text-amber-700">
                                Please update your payment method to continue your subscription.
                            </p>
                        </div>
                    </div>
                )}

                {subscription.status === "canceled" && (
                    <div className="flex items-start gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg mb-4">
                        <Warning weight="fill" className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-zinc-700">Subscription Canceled</p>
                            <p className="text-sm text-zinc-600">
                                Your subscription has been canceled but you'll retain access until the end of your billing period.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    {subscription.tier === "free" ? (
                        <button
                            onClick={() => router.push("/pricing")}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                        >
                            Upgrade to Pro
                        </button>
                    ) : (
                        <button
                            onClick={handleManageSubscription}
                            disabled={isLoading}
                            className="px-4 py-2.5 bg-zinc-900 text-white font-bold text-sm rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? "Loading..." : "Manage Subscription"}
                            <ArrowSquareOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Plan Features */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                <h2 className="text-lg font-bold text-zinc-900 mb-4">What's included</h2>
                <ul className="space-y-3">
                    {subscription.tier === "free" && (
                        <>
                            <FeatureItem included>2 exams per month</FeatureItem>
                            <FeatureItem included>Up to 10 questions per exam</FeatureItem>
                            <FeatureItem included>Basic analytics</FeatureItem>
                            <FeatureItem>Unlimited exams</FeatureItem>
                            <FeatureItem>Priority AI processing</FeatureItem>
                        </>
                    )}
                    {subscription.tier === "student" && (
                        <>
                            <FeatureItem included>Unlimited exams</FeatureItem>
                            <FeatureItem included>Up to 50 questions per exam</FeatureItem>
                            <FeatureItem included>Full performance analytics</FeatureItem>
                            <FeatureItem included>Priority AI processing</FeatureItem>
                            <FeatureItem>PDF export</FeatureItem>
                        </>
                    )}
                    {subscription.tier === "pro" && (
                        <>
                            <FeatureItem included>Unlimited exams</FeatureItem>
                            <FeatureItem included>Up to 100 questions per exam</FeatureItem>
                            <FeatureItem included>Advanced analytics</FeatureItem>
                            <FeatureItem included>PDF export</FeatureItem>
                            <FeatureItem included>API access preview</FeatureItem>
                        </>
                    )}
                </ul>
            </div>

            {/* Billing Email */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                <h2 className="text-lg font-bold text-zinc-900 mb-2">Billing email</h2>
                <p className="text-sm text-zinc-600">
                    Receipts and invoices are sent to: <span className="font-semibold">{userEmail}</span>
                </p>
            </div>
        </div>
    );
}

function FeatureItem({ children, included = false }: { children: React.ReactNode; included?: boolean }) {
    return (
        <li className="flex items-center gap-3 text-sm">
            <div
                className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    included ? "bg-emerald-100" : "bg-zinc-100"
                )}
            >
                {included ? (
                    <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
            <span className={included ? "text-zinc-700" : "text-zinc-400"}>{children}</span>
        </li>
    );
}
