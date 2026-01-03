"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SaveProfileInput {
    displayName: string;
    school?: string;
    subjects: string[];
}

export async function saveProfile({ displayName, school, subjects }: SaveProfileInput) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        await db.update(users)
            .set({
                name: displayName,
                grade: school || null,
                subjects: subjects,
                // Note: hasOnboarded is set separately after the walkthrough completes
            })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (error) {
        console.error("Failed to save profile:", error);
        return { error: "Failed to save profile" };
    }
}
