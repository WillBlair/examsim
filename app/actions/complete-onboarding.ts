"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function completeOnboarding() {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        await db.update(users)
            .set({
                hasOnboarded: true,
            })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (error) {
        console.error("Failed to complete onboarding:", error);
        return { error: "Failed to complete onboarding" };
    }
}
