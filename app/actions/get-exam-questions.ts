"use server";

import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/auth";

// Helper to safely parse JSONB options field
function parseOptions(options: unknown): string[] {
    // If already an array, return it
    if (Array.isArray(options)) {
        return options.filter(opt => typeof opt === 'string');
    }
    // If string, try to parse as JSON
    if (typeof options === 'string') {
        try {
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) {
                return parsed.filter(opt => typeof opt === 'string');
            }
        } catch {
            // Not valid JSON, return empty array
        }
    }
    return [];
}

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
        options: parseOptions(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        hint: q.hint,
        type: q.type
    }));
}
