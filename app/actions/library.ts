
"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { examTemplates, templateQuestions, exams, questions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function startExamFromTemplate(templateId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId = session.user.id;

    // 1. Fetch Template
    const template = await db.query.examTemplates.findFirst({
        where: eq(examTemplates.id, templateId),
        with: {
            // Drizzle might not have relation set up yet, so we query manually if needed, 
            // but let's try separate query for safety as I didn't verify relations in schema export
        }
    });

    if (!template) {
        throw new Error("Template not found");
    }

    // 2. Check Permissions
    if (template.isPremium) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { subscriptionTier: true }
        });

        if (user?.subscriptionTier !== 'pro') {
            // In a real app, redirect to checkout
            // For now, just throw or redirect to pricing
            redirect("/pricing");
        }
    }

    // 3. Create Exam and Copy Questions
    // Note: transactional support is limited in neon-http, running sequentially
    let newExamId: number | undefined;

    try {
        // A. Create Exam Instance
        const [newExam] = await db.insert(exams).values({
            userId,
            title: template.title,
            topic: template.topic,
            difficulty: template.difficulty,
            timeLimit: template.timeLimit,
        }).returning({ id: exams.id });

        newExamId = newExam?.id;

        if (!newExamId) throw new Error("Failed to create exam record");

        // B. Fetch Template Questions
        const questionsToCopy = await db.select().from(templateQuestions).where(eq(templateQuestions.templateId, templateId));

        if (questionsToCopy.length > 0) {
            // C. Insert Questions
            await db.insert(questions).values(
                questionsToCopy.map(q => ({
                    examId: newExamId!,
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    hint: q.hint,
                    type: q.type,
                    subtopic: template.subtopic
                }))
            );
        }
    } catch (err) {
        console.error("Error creating exam from template:", err);
        throw new Error("Failed to create exam");
    }

    if (newExamId) {
        redirect(`/dashboard/exams/${newExamId}`);
    } else {
        throw new Error("Failed to create exam");
    }
}
