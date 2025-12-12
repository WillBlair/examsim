"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const updateProfilePicture = async (imageBase64: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Basic validation to ensure it's an image string
    if (!imageBase64.startsWith("data:image")) {
      return { error: "Invalid image format" };
    }

    await db
      .update(users)
      .set({ image: imageBase64 })
      .where(eq(users.id, session.user.id));

    // Revalidate all dashboard pages to ensure fresh session data
    revalidatePath("/dashboard", "layout");
    
    return { success: "Profile picture updated" };
  } catch (error) {
    console.error("Failed to update profile picture:", error);
    return { error: "Failed to update profile picture" };
  }
};
