import { db } from "@/db";
import { users, exams } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { TIER_LIMITS, type SubscriptionTier } from "@/lib/stripe";

interface UserSubscription {
    tier: SubscriptionTier;
    status: string;
    examsThisMonth: number;
    canGenerateExam: boolean;
    questionsLimit: number;
    isEmailVerified: boolean;
}

/**
 * Get user subscription details including usage this month
 */
export async function getUserSubscription(
    userId: string
): Promise<UserSubscription> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            subscriptionTier: true,
            subscriptionStatus: true,
            emailVerified: true,
        },
    });

    if (!user) {
        return {
            tier: "free",
            status: "active",
            examsThisMonth: 0,
            canGenerateExam: true,
            questionsLimit: TIER_LIMITS.free.questionsPerExam,
            isEmailVerified: false,
        };
    }

    const tier = (user.subscriptionTier as SubscriptionTier) || "free";
    const status = user.subscriptionStatus || "active";
    const isEmailVerified = !!user.emailVerified;

    // Count exams created in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [examCountResult] = await db
        .select({ count: count() })
        .from(exams)
        .where(and(eq(exams.userId, userId), gte(exams.createdAt, thirtyDaysAgo)));

    const examsThisMonth = examCountResult?.count || 0;

    // Determine limits based on tier and verification status
    let effectiveLimit = TIER_LIMITS[tier].examsPerMonth;

    // For free tier: unverified users get 1 exam total, verified get 2/month
    if (tier === "free" && !isEmailVerified) {
        effectiveLimit = 1;
    }

    const canGenerateExam = examsThisMonth < effectiveLimit;

    return {
        tier,
        status,
        examsThisMonth,
        canGenerateExam,
        questionsLimit: TIER_LIMITS[tier].questionsPerExam,
        isEmailVerified,
    };
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeature(
    tier: SubscriptionTier,
    feature: string
): boolean {
    return (TIER_LIMITS[tier].features as readonly string[]).includes(feature);
}

/**
 * Get the display name for a subscription tier
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
    const names: Record<SubscriptionTier, string> = {
        free: "Free",
        student: "Student",
        pro: "Pro",
    };
    return names[tier] || "Free";
}

/**
 * Get the remaining exams for a user this month
 */
export function getRemainingExams(
    tier: SubscriptionTier,
    examsThisMonth: number,
    isEmailVerified: boolean
): number | "unlimited" {
    const limit = tier === "free"
        ? (isEmailVerified ? 2 : 1)
        : TIER_LIMITS[tier].examsPerMonth;

    if (limit === Infinity) {
        return "unlimited";
    }

    return Math.max(0, limit - examsThisMonth);
}
