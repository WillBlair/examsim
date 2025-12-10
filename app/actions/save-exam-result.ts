"use server";

import { db } from "@/db";
import { examResults } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function saveExamResult(
  examId: number,
  score: number,
  totalQuestions: number,
  answers: Record<number, string | string[]>
) {
  const session = await auth();
  // We allow saving results even if not logged in? The requirements imply logged in flow.
  // But for safety, we should check.
  // If not logged in, we might fail or just save without user ID (if schema allows, which it does).
  // But per requirements, user must be logged in to generate exam, so they should be logged in to take it.
  
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "You must be logged in to save exam results" };
  }

  try {
    await db.insert(examResults).values({
      userId,
      examId,
      score,
      totalQuestions,
      answers,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/exams");
    return { success: true };
  } catch (error) {
    console.error("Failed to save exam result:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save result";
    return { success: false, error: errorMessage };
  }
}
