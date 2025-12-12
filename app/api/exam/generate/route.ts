import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
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
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate Limit Check (5 requests per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const [requestCount] = await db
            .select({ count: count() })
            .from(rateLimits)
            .where(
                and(
                    eq(rateLimits.userId, session.user.id),
                    eq(rateLimits.action, "generate_exam"),
                    gte(rateLimits.timestamp, oneHourAgo)
                )
            );

        if (requestCount.count >= 5) {
            return NextResponse.json(
                { error: "Rate limit exceeded. You can only generate 5 exams per hour." },
                { status: 429 }
            );
        }

        // Record this request
        await db.insert(rateLimits).values({
            userId: session.user.id,
            action: "generate_exam"
        });

        const formData = await req.formData();
        const topic = formData.get("topic") as string;
        const difficulty = formData.get("difficulty") as string || "Medium";
        const count = parseInt(formData.get("count") as string || "5");
        const timeLimit = formData.get("timeLimit") ? parseInt(formData.get("timeLimit") as string) : null;
        const files = formData.getAll("files") as File[];
        const pastedText = formData.get("pastedText") as string;

        if (!topic && files.length === 0 && !pastedText) {
            return NextResponse.json({ error: "Topic, file, or text content is required" }, { status: 400 });
        }

        // Validate file uploads
        for (const file of files) {
            console.log(`[Exam Generate] Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
            
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File "${file.name}" exceeds the 10MB size limit` },
                    { status: 400 }
                );
            }
            
            // Check file type - be lenient with PDF detection (some browsers report different types)
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

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        // Helper to send updates
        const sendUpdate = async (data: StreamUpdate) => {
            await writer.write(encoder.encode(JSON.stringify(data) + "\n"));
        };

        // Run async processing without awaiting it to allow streaming response immediately
        (async () => {
            try {
                await sendUpdate({ step: 0, message: "Analyzing uploaded documents..." });

                let contextText = "";

                // Process Pasted Content
                if (pastedText) {
                    contextText += `\n\n--- Pasted Content ---\n${pastedText}`;
                }

                // Process Files
                if (files.length > 0) {
                    for (const file of files) {
                        if (file.size === 0) continue;

                        await sendUpdate({ step: 0, message: `Reading ${file.name}...` });

                        const buffer = Buffer.from(await file.arrayBuffer());

                        const isPdfFile = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                        const isDocxFile = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
                        const isTxtFile = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

                        if (isPdfFile) {
                            // eslint-disable-next-line @typescript-eslint/no-require-imports
                            const pdfLib = require("pdf-parse");
                            const PDFParseClass = pdfLib.PDFParse || pdfLib.default?.PDFParse;

                            let text = "";
                            try {
                                if (PDFParseClass) {
                                    const parser = new PDFParseClass({ data: buffer });
                                    const result = await parser.getText();
                                    text = result.text;
                                } else {
                                    const pdf = pdfLib.default || pdfLib;
                                    const data = await pdf(buffer);
                                    text = data.text;
                                }
                            } catch (pdfError) {
                                const errorMessage = pdfError instanceof Error ? pdfError.message : "Failed to parse PDF";
                                console.error(`PDF parse error for ${file.name}:`, pdfError);
                                await sendUpdate({ error: `Failed to parse PDF "${file.name}": ${errorMessage}` });
                                continue;
                            }
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

                await sendUpdate({ step: 1, message: "Structuring knowledge context..." });

                // Debug: Log context length to verify content was extracted
                console.log(`[Exam Generate] Context text length: ${contextText.length} characters`);
                if (contextText.length > 0) {
                    console.log(`[Exam Generate] Context preview: ${contextText.substring(0, 200)}...`);
                }

                const prompt = `
            Generate a ${difficulty} difficulty exam ${topic ? `about "${topic}"` : "based on the provided content"} with ${count} questions.
            ${contextText ? `Base the questions STRICTLY on the following source material:\n${contextText}` : ""}
            The questions should be challenging and test deep understanding.
            For each question, identify a specific sub-topic (e.g., 'Cell Biology > Mitosis').

            Mix the following question types:
            1. Multiple Choice: 4 options, 1 correct.
            2. True/False: 2 options (True/False), 1 correct. Rapid fire concept checking.
            3. Fill in the Blank: No options provided, answer is a specific word/phrase. Tests recall.
            4. Select All That Apply: 4+ options, multiple correct answers. Increases difficulty.
        `;

                await sendUpdate({ step: 2, message: `Generating ${count} questions...` });

                const { object } = await generateObject({
                    model: google("gemini-2.5-flash"),
                    schema: z.object({
                        title: z.string().describe("A creative title for the exam"),
                        questions: z.array(z.object({
                            text: z.string(),
                            type: z.enum(["Multiple Choice", "True/False", "Fill in the Blank", "Select All That Apply"]),
                            options: z.array(z.string()),
                            correctAnswer: z.union([z.string(), z.array(z.string())]),
                            explanation: z.string(),
                            subtopic: z.string(),
                        })).length(count),
                    }),
                    prompt: prompt,
                });

                await sendUpdate({ step: 2, message: "Finalizing and saving exam..." });

                const [newExam] = await db.insert(exams).values({
                    userId: session.user.id,
                    title: object.title,
                    topic: topic || "Uploaded Content",
                    difficulty: difficulty,
                    timeLimit: timeLimit,
                }).returning();

                await db.insert(questions).values(
                    object.questions.map(q => {
                        let finalCorrectAnswer = q.correctAnswer;
                        if (Array.isArray(q.correctAnswer)) {
                            finalCorrectAnswer = JSON.stringify(q.correctAnswer);
                        }
                        return {
                            examId: newExam.id,
                            questionText: q.text,
                            options: q.options,
                            correctAnswer: finalCorrectAnswer as string,
                            explanation: q.explanation,
                            type: q.type,
                            subtopic: q.subtopic,
                        };
                    })
                );

                await sendUpdate({ success: true, examId: newExam.id });

            } catch (error: unknown) {
                console.error("Stream processing error:", error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
                await sendUpdate({ error: errorMessage });
            } finally {
                writer.close();
            }
        })();

        return new NextResponse(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
