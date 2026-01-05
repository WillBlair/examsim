import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { exams, questions, rateLimits } from "@/db/schema";
import { count, and, eq, gte } from "drizzle-orm";
import * as mammoth from "mammoth";
import { auth } from "@/auth";

export const maxDuration = 60; // Allow 1 minute timeout

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
] as const;

interface StreamUpdate {
    step?: number;
    message?: string;
    success?: boolean;
    examId?: number;
    error?: string;
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const guestId = req.headers.get("X-Guest-Id");

        // Allow either authenticated users OR guests with a guest ID
        const isAuthenticated = !!session?.user?.id;
        const isGuest = !isAuthenticated && !!guestId;

        if (!isAuthenticated && !isGuest) {
            return NextResponse.json({ error: "Unauthorized. Please provide authentication or guest ID." }, { status: 401 });
        }

        // Rate Limit Check - use subscription-based limits
        if (isAuthenticated) {
            // Exempt owner account from limits
            if (session.user.email !== "willblair47@gmail.com") {
                const { getUserSubscription } = await import("@/lib/subscription");
                const subscription = await getUserSubscription(session.user.id);

                if (!subscription.canGenerateExam) {
                    const message = subscription.tier === "free"
                        ? subscription.isEmailVerified
                            ? "You've used all 2 exams this month. Upgrade to Student for unlimited exams!"
                            : "Verify your email for 2 exams/month, or upgrade to Student for unlimited!"
                        : "Rate limit exceeded. Please try again later.";

                    return NextResponse.json(
                        {
                            error: message,
                            tier: subscription.tier,
                            examsUsed: subscription.examsThisMonth,
                            upgradeRequired: subscription.tier === "free"
                        },
                        { status: 429 }
                    );
                }
            }
        } else if (isGuest) {
            // For guests, check if they've already created an exam with this guest ID
            const existingGuestExam = await db.query.exams.findFirst({
                where: eq(exams.guestId, guestId),
            });

            if (existingGuestExam) {
                return NextResponse.json(
                    { error: "You've already created your free trial exam. Sign up to create more!" },
                    { status: 429 }
                );
            }
        }

        const formData = await req.formData();
        const topic = formData.get("topic") as string;
        const difficulty = formData.get("difficulty") as string || "Medium";
        let questionCount = parseInt(formData.get("count") as string || "5");
        const timeLimit = formData.get("timeLimit") ? parseInt(formData.get("timeLimit") as string) : null;

        // Enforce question count limits based on subscription tier
        if (isAuthenticated && session.user.email !== "willblair47@gmail.com") {
            const { getUserSubscription } = await import("@/lib/subscription");
            const subscription = await getUserSubscription(session.user.id);

            if (questionCount > subscription.questionsLimit) {
                questionCount = subscription.questionsLimit;
            }
        } else if (isGuest) {
            // Guests are limited to 10 questions
            if (questionCount > 10) {
                questionCount = 10;
            }
        }

        // Parse new settings
        const allowHints = formData.get("allowHints") === "true";
        const allowExplanations = formData.get("allowExplanations") === "true";
        let questionTypes: string[] = ["Multiple Choice"];
        try {
            questionTypes = JSON.parse(formData.get("questionTypes") as string || '["Multiple Choice"]');
        } catch { }

        const files = formData.getAll("files") as File[];
        const pastedText = formData.get("pastedText") as string;

        if (!topic && files.length === 0 && !pastedText) {
            return NextResponse.json({ error: "Topic, file, or text content is required" }, { status: 400 });
        }

        // Validate file uploads
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File "${file.name}" exceeds the 10MB size limit` },
                    { status: 400 }
                );
            }

            // Check file type - be lenient with PDF detection
            const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
            const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
            const isTxt = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

            if (!isPdf && !isDocx && !isTxt) {
                return NextResponse.json(
                    { error: `File type "${file.type}" is not allowed. Supported types: PDF, DOCX, TXT` },
                    { status: 400 }
                );
            }
        }

        let contextText = "";

        // Process Pasted Content
        if (pastedText) {
            contextText += `\n\n--- Pasted Content ---\n${pastedText}`;
        }

        // Process Files
        if (files.length > 0) {
            for (const file of files) {
                if (file.size === 0) continue;
                const buffer = Buffer.from(await file.arrayBuffer());

                const isPdfFile = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                const isDocxFile = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
                const isTxtFile = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

                if (isPdfFile) {
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    const pdfParse = require("pdf-parse-fork");
                    let text = "";
                    try {
                        const data = await pdfParse(buffer);
                        text = data.text;
                    } catch (e) { console.error("PDF parse error:", e); }
                    contextText += `\n\n--- Content from ${file.name} ---\n${text}`;

                } else if (isDocxFile) {
                    const result = await mammoth.extractRawText({ buffer });
                    contextText += `\n\n--- Content from ${file.name} ---\n${result.value}`;
                } else if (isTxtFile) {
                    const text = buffer.toString("utf-8");
                    contextText += `\n\n--- Content from ${file.name} ---\n${text}`;
                }
            }
        }

        // Create the exam record immediately so we have an ID
        const [newExam] = await db.insert(exams).values({
            userId: isAuthenticated ? session!.user.id : null,
            guestId: isGuest ? guestId : null,
            title: topic ? `${topic} Exam` : "Generated Exam",
            topic: topic || "Uploaded Content",
            difficulty: difficulty,
            timeLimit: timeLimit,
        }).returning();

        const prompt = `
            Generate a ${difficulty} difficulty exam ${topic ? `about "${topic}"` : "based on the provided content"} with ${questionCount} questions.
            
            ${contextText ? `
            <source_material>
            ${contextText.substring(0, 100000)} 
            </source_material>

            Base the questions STRICTLY on the content provided within the <source_material> tags above.
            ` : ""}

            The questions should be challenging and test deep understanding.
            For each question, identify a specific sub-topic.
            ${allowHints ? "Provide a helpful hint for each question. The hint should either: (1) provide a clue that points toward the correct answer, (2) eliminate one incorrect option, or (3) give a memorable fact or mnemonic. NEVER tell the user to 'refer to' or 'review' any material - the hint must be self-contained and actionable." : "Do not provide hints."}
            ${allowExplanations ? "Provide a detailed explanation for the correct answer." : "Provide a brief explanation."}

            Use ONLY the following question types:
            ${questionTypes.map(t => `- ${t}`).join("\n")}

            IMPORTANT: For each question, you MUST provide the "options" array:
            - For Multiple Choice: provide exactly 4 answer options
            - For True/False: provide exactly ["True", "False"] as options
            - For Select All That Apply: provide 4-6 answer options
        `;

        // Create stream
        const result = await streamObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                questions: z.array(z.object({
                    text: z.string(),
                    type: z.enum(["Multiple Choice", "True/False", "Select All That Apply"]),
                    options: z.array(z.string()).min(2), // Required: at least 2 options
                    correctAnswer: z.union([z.string(), z.array(z.string())]),
                    explanation: z.string(),
                    hint: z.string().optional(),
                    subtopic: z.string(),
                })).length(questionCount),
            }),
            prompt: prompt,
            onFinish: async ({ object }) => {
                if (!object) return;

                // Save questions to DB
                await db.insert(questions).values(
                    object.questions.map(q => {
                        let finalCorrectAnswer = q.correctAnswer;
                        if (Array.isArray(q.correctAnswer)) {
                            finalCorrectAnswer = JSON.stringify(q.correctAnswer);
                        }
                        return {
                            examId: newExam.id,
                            questionText: q.text,
                            options: q.options || [],
                            correctAnswer: finalCorrectAnswer as string,
                            explanation: q.explanation,
                            hint: q.hint || null,
                            type: q.type,
                            subtopic: q.subtopic,
                        };
                    })
                );
            }
        });

        return result.toTextStreamResponse({
            headers: {
                // Send the exam ID in a header so client knows it immediately
                "X-Exam-Id": newExam.id.toString()
            }
        });

    } catch (error: unknown) {
        console.error("Exam generation error:", error);

        // Return more detailed error for debugging
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorName = error instanceof Error ? error.name : "UnknownError";

        // Check for common issues
        if (errorMessage.includes("API key")) {
            return NextResponse.json({
                error: "API key configuration error. Please check GOOGLE_GENERATIVE_AI_API_KEY."
            }, { status: 500 });
        }

        if (errorMessage.includes("database") || errorMessage.includes("connection")) {
            return NextResponse.json({
                error: "Database connection error. Please check DATABASE_URL."
            }, { status: 500 });
        }

        return NextResponse.json({
            error: `Generation failed: ${errorName} - ${errorMessage}`
        }, { status: 500 });
    }
}

