"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as z from "zod";

const OnboardingSchema = z.object({
  username: z.string().min(3),
  grade: z.string().min(1),
  subjects: z.array(z.string()).min(1),
});

export const completeOnboarding = async (values: z.infer<typeof OnboardingSchema>) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = OnboardingSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { username, grade, subjects } = validatedFields.data;

  // Check if username is taken
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (existingUser && existingUser.id !== session.user.id) {
    return { error: "Username already taken!" };
  }

  await db
    .update(users)
    .set({
      username,
      grade,
      subjects,
      hasOnboarded: true,
    })
    .where(eq(users.id, session.user.id));

  return { success: "Profile updated!" };
};





