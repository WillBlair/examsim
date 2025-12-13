"use server";

import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/auth";

export async function getExamQuestions(examId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const result = await db
        .select()
        .from(questions)
        .where(eq(questions.examId, examId))
        .orderBy(asc(questions.id)); // Ensure order matches generation order if IDs are sequential

    // Format to match ExamClient interface
    return result.map(q => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options as string[],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        type: q.type
    }));
}
