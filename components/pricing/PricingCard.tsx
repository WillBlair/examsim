"use client";

import { useState } from "react";
import { Check, X, Star } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PlanFeature {
    name: string;
    included: boolean;
    highlight?: boolean;
}

interface Plan {
    name: string;
    badge?: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    savings?: string;
    features: PlanFeature[];
    cta: string;
    href: string;
    popular: boolean;
    tier: "free" | "student" | "pro";
}

interface PricingCardProps {
    plan: Plan;
    isAuthenticated: boolean;
}

export function PricingCard({ plan, isAuthenticated }: PricingCardProps) {
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
    const monthlyEquivalent = billingPeriod === "yearly" && plan.yearlyPrice > 0
        ? (plan.yearlyPrice / 12).toFixed(2)
        : null;

    async function handleSubscribe() {
        if (plan.tier === "free") {
            router.push(plan.href);
            return;
        }

        if (!isAuthenticated) {
            router.push(`/register?plan=${plan.tier}&billing=${billingPeriod}`);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId: getPriceId(plan.tier, billingPeriod),
                    billingPeriod,
                }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Checkout error:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div
            className={cn(
                "relative rounded-2xl p-6 flex flex-col transition-all duration-300",
                plan.popular
                    ? "bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-700 text-white shadow-2xl shadow-purple-500/30 scale-[1.02] border-2 border-purple-400/50"
                    : "bg-white border-2 border-zinc-200 hover:border-zinc-300 hover:shadow-lg"
            )}
        >
            {/* Badge */}
            {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-300 to-yellow-300 text-zinc-900 text-xs font-black rounded-full shadow-lg">
                    {plan.badge}
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    {plan.popular && <Star weight="fill" className="w-5 h-5 text-amber-300" />}
                    <h3 className={cn(
                        "text-xl font-black",
                        plan.popular ? "text-white" : "text-zinc-900"
                    )}>
                        {plan.name}
                    </h3>
                </div>
                <p className={cn(
                    "text-sm",
                    plan.popular ? "text-zinc-400" : "text-zinc-500"
                )}>
                    {plan.description}
                </p>
            </div>

            {/* Billing Toggle (only for paid plans) */}
            {plan.monthlyPrice > 0 && (
                <div className={cn(
                    "flex gap-1 mb-4 p-1 rounded-lg",
                    plan.popular ? "bg-white/10" : "bg-zinc-100"
                )}>
                    <button
                        onClick={() => setBillingPeriod("monthly")}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                            billingPeriod === "monthly"
                                ? plan.popular ? "bg-white/20 text-white" : "bg-white text-zinc-900 shadow-sm"
                                : plan.popular ? "text-white/60 hover:text-white/80" : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingPeriod("yearly")}
                        className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-md transition-all relative",
                            billingPeriod === "yearly"
                                ? plan.popular ? "bg-white text-purple-700" : "bg-emerald-500 text-white shadow-sm"
                                : plan.popular ? "text-white/60 hover:text-white/80" : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        Yearly
                        {billingPeriod !== "yearly" && (
                            <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-amber-400 text-zinc-900 text-[9px] font-black rounded">
                                -40%
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Price */}
            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className={cn(
                        "text-4xl font-black",
                        plan.popular ? "text-white" : "text-zinc-900"
                    )}>
                        ${price === 0 ? "0" : price.toFixed(2)}
                    </span>
                    {price > 0 && (
                        <span className={cn(
                            "text-sm",
                            plan.popular ? "text-zinc-400" : "text-zinc-500"
                        )}>
                            /{billingPeriod === "monthly" ? "mo" : "yr"}
                        </span>
                    )}
                </div>
                {monthlyEquivalent && price > 0 && (
                    <p className={cn(
                        "text-xs mt-1",
                        plan.popular ? "text-amber-300" : "text-emerald-600"
                    )}>
                        Just ${monthlyEquivalent}/month • {plan.savings}
                    </p>
                )}
                {plan.tier === "free" && (
                    <p className="text-xs text-zinc-500 mt-1">
                        Forever free, no card needed
                    </p>
                )}
            </div>

            {/* CTA Button */}
            <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={cn(
                    "w-full py-3.5 rounded-xl font-bold text-sm transition-all mb-6",
                    plan.popular
                        ? "bg-white text-purple-700 hover:bg-purple-50 shadow-lg shadow-white/25 font-black"
                        : plan.tier === "pro"
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400"
                            : "bg-zinc-900 text-white hover:bg-zinc-800",
                    isLoading && "opacity-50 cursor-not-allowed"
                )}
            >
                {isLoading ? "Loading..." : plan.cta}
            </button>

            {/* Features */}
            <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-2">
                        {feature.included ? (
                            <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                feature.highlight
                                    ? "bg-amber-400"
                                    : plan.popular ? "bg-white/20" : "bg-emerald-100"
                            )}>
                                <Check weight="bold" className={cn(
                                    "w-3 h-3",
                                    feature.highlight ? "text-zinc-900" : plan.popular ? "text-white" : "text-emerald-600"
                                )} />
                            </div>
                        ) : (
                            <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                plan.popular ? "bg-white/10" : "bg-zinc-100"
                            )}>
                                <X weight="bold" className={cn(
                                    "w-3 h-3",
                                    plan.popular ? "text-white/40" : "text-zinc-400"
                                )} />
                            </div>
                        )}
                        <span
                            className={cn(
                                "text-sm",
                                feature.included
                                    ? feature.highlight
                                        ? plan.popular ? "text-amber-300 font-semibold" : "text-emerald-600 font-semibold"
                                        : plan.popular ? "text-white/90" : "text-zinc-700"
                                    : plan.popular ? "text-white/40" : "text-zinc-400"
                            )}
                        >
                            {feature.name}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function getPriceId(tier: "student" | "pro", billingPeriod: "monthly" | "yearly"): string {
    const priceMap: Record<string, string> = {
        "student-monthly": process.env.NEXT_PUBLIC_STRIPE_STUDENT_MONTHLY_PRICE_ID || "price_placeholder",
        "student-yearly": process.env.NEXT_PUBLIC_STRIPE_STUDENT_YEARLY_PRICE_ID || "price_placeholder",
        "pro-monthly": process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || "price_placeholder",
        "pro-yearly": process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || "price_placeholder",
    };
    return priceMap[`${tier}-${billingPeriod}`];
}
