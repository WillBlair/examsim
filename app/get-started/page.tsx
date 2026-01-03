import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
    title: "Get Started | ExamSim",
    description: "Create your first practice exam in just a few clicks. Upload your study materials and let AI generate personalized questions.",
};

export default async function OnboardingPage() {
    const session = await auth();

    // If user is signed in, check if they've already completed onboarding
    if (session?.user?.id) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { hasOnboarded: true },
        });

        // If user has already completed onboarding, redirect to dashboard
        if (user?.hasOnboarded) {
            redirect("/dashboard");
        }
    }

    return <OnboardingWizard />;
}
