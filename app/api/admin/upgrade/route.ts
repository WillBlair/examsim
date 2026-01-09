
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const targetEmail = "willblair47@gmail.com";

        const [updatedUser] = await db.update(users)
            .set({ subscriptionTier: "pro" })
            .where(eq(users.email, targetEmail))
            .returning();

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `Upgraded ${updatedUser.email} to ${updatedUser.subscriptionTier}`,
            user: { name: updatedUser.name, tier: updatedUser.subscriptionTier }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to upgrade" }, { status: 500 });
    }
}
