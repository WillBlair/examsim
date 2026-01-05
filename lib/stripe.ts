import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Server-side Stripe client
 * Only use this in server components, API routes, and server actions
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
});

/**
 * Stripe price IDs for each subscription tier
 */
export const STRIPE_PRICES = {
    student: {
        monthly: env.STRIPE_STUDENT_MONTHLY_PRICE_ID,
        yearly: env.STRIPE_STUDENT_YEARLY_PRICE_ID,
    },
    pro: {
        monthly: env.STRIPE_PRO_MONTHLY_PRICE_ID,
        yearly: env.STRIPE_PRO_YEARLY_PRICE_ID,
    },
} as const;

/**
 * Map Stripe price IDs back to tier names
 */
export function getTierFromPriceId(priceId: string): "student" | "pro" | null {
    if (
        priceId === STRIPE_PRICES.student.monthly ||
        priceId === STRIPE_PRICES.student.yearly
    ) {
        return "student";
    }
    if (
        priceId === STRIPE_PRICES.pro.monthly ||
        priceId === STRIPE_PRICES.pro.yearly
    ) {
        return "pro";
    }
    return null;
}

/**
 * Subscription tier limits
 */
export const TIER_LIMITS = {
    free: {
        examsPerMonth: 2,
        questionsPerExam: 10,
        features: ["basic_analytics"],
    },
    student: {
        examsPerMonth: Infinity,
        questionsPerExam: 50,
        features: ["basic_analytics", "full_analytics", "priority_generation"],
    },
    pro: {
        examsPerMonth: Infinity,
        questionsPerExam: 100,
        features: [
            "basic_analytics",
            "full_analytics",
            "priority_generation",
            "pdf_export",
            "api_access",
            "advanced_analytics",
        ],
    },
} as const;

export type SubscriptionTier = keyof typeof TIER_LIMITS;
