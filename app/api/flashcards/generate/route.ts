import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { flashcardDecks, flashcards, rateLimits } from "@/db/schema";
import { count, and, eq, gte } from "drizzle-orm";
import * as mammoth from "mammoth";
import { auth } from "@/auth";

export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate Limit Check (exempt owner)
        if (session.user.email !== "willblair47@gmail.com") {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const [requestCount] = await db
                .select({ count: count() })
                .from(rateLimits)
                .where(
                    and(
                        eq(rateLimits.userId, session.user.id),
                        eq(rateLimits.action, "generate_flashcards"),
                        gte(rateLimits.timestamp, oneHourAgo)
                    )
                );

            if (requestCount.count >= 2) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Free tier users can only generate 2 flashcard decks per hour." },
                    { status: 429 }
                );
            }
        }

        // Record this request
        await db.insert(rateLimits).values({
            userId: session.user.id,
            action: "generate_flashcards"
        });

        const formData = await req.formData();
        const topic = formData.get("topic") as string;
        const deckTitle = formData.get("deckTitle") as string || topic || "New Flashcard Deck";
        const cardCount = parseInt(formData.get("count") as string || "20");
        const includeHints = formData.get("includeHints") === "true";

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

        // Create the deck record immediately
        const [newDeck] = await db.insert(flashcardDecks).values({
            userId: session.user.id,
            title: deckTitle,
            topic: topic || "Uploaded Content",
            description: `Generated from ${files.length > 0 ? `${files.length} file(s)` : "pasted text"}`,
            cardCount: cardCount,
        }).returning();

        const prompt = `
            Generate ${cardCount} flashcards ${topic ? `about "${topic}"` : "based on the provided content"}.
            
            ${contextText ? `
            <source_material>
            ${contextText.substring(0, 100000)} 
            </source_material>

            Base the flashcards STRICTLY on the content provided within the <source_material> tags above.
            ` : ""}

            Create flashcards that:
            - Have clear, concise questions or terms on the front
            - Have detailed, comprehensive answers on the back
            - Cover the most important concepts and information
            - Progress from fundamental concepts to more advanced topics
            - Include key definitions, facts, processes, and relationships
            ${includeHints ? "- Include a helpful hint for each card that guides toward the answer without giving it away" : ""}

            Make the cards useful for studying and memorization. Each card should test a single concept.
        `;

        // Create stream
        const result = await streamObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                cards: z.array(z.object({
                    front: z.string().describe("The question, term, or concept to study"),
                    back: z.string().describe("The answer, definition, or explanation"),
                    hint: z.string().optional().describe("An optional hint to help recall the answer"),
                })).length(cardCount),
            }),
            prompt: prompt,
            onFinish: async ({ object }) => {
                if (!object) return;

                // Save flashcards to DB
                await db.insert(flashcards).values(
                    object.cards.map((card, index) => ({
                        deckId: newDeck.id,
                        front: card.front,
                        back: card.back,
                        hint: card.hint || null,
                        order: index,
                    }))
                );

                // Update deck with actual card count
                await db.update(flashcardDecks)
                    .set({ cardCount: object.cards.length })
                    .where(eq(flashcardDecks.id, newDeck.id));
            }
        });

        return result.toTextStreamResponse({
            headers: {
                "X-Deck-Id": newDeck.id.toString()
            }
        });

    } catch (error: unknown) {
        console.error("Flashcard generation error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorName = error instanceof Error ? error.name : "UnknownError";

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

