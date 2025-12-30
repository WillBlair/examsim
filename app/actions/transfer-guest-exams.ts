"use server";

import { db } from "@/db";
import { exams } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

/**
 * Transfer guest-created exams to a newly registered user
 * Called after successful registration/login
 */
export async function transferGuestExams(guestId: string, userId: string): Promise<number> {
    if (!guestId || !userId) {
        return 0;
    }

    // Find all exams with this guest ID that haven't been claimed
    const guestExams = await db
        .update(exams)
        .set({
            userId: userId,
            guestId: null  // Clear the guest ID after transfer
        })
        .where(
            and(
                eq(exams.guestId, guestId),
                isNull(exams.userId)
            )
        )
        .returning({ id: exams.id });

    return guestExams.length;
}
