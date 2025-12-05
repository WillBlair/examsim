"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { exams, questions } from "@/db/schema";
// import pdfParse from "pdf-parse"; // Removed in favor of require
import * as mammoth from "mammoth";
import { auth } from "@/auth";

export async function generateExamAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const topic = formData.get("topic") as string;
  const difficulty = formData.get("difficulty") as string || "Medium";
  const count = parseInt(formData.get("count") as string || "5");
  const timeLimit = formData.get("timeLimit") ? parseInt(formData.get("timeLimit") as string) : null;
  const files = formData.getAll("files") as File[];
  const pastedText = formData.get("pastedText") as string;

  if (!topic && files.length === 0 && !pastedText) {
    throw new Error("Topic, file, or text content is required");
  }

  let contextText = "";

  // Process Pasted Text
  if (pastedText) {
    contextText += `\n\n--- Pasted Content ---\n${pastedText}`;
  }

  // Parse Uploaded Files
  if (files.length > 0) {
    for (const file of files) {
      if (file.size === 0) continue;

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === "application/pdf") {
        // Robust import handling for pdf-parse using require
        // @ts-ignore
        const pdfLib = require("pdf-parse");
        const PDFParseClass = pdfLib.PDFParse || pdfLib.default?.PDFParse;

        let text = "";
        // v2 Class based API
        if (PDFParseClass) {
          const parser = new PDFParseClass({ data: buffer });
          const result = await parser.getText();
          text = result.text;
        } else {
          // Fallback to v1 function based API
          const pdf = pdfLib.default || pdfLib;
          if (typeof pdf !== "function") {
            throw new Error(`pdf-parse import failed. pdfLib is ${typeof pdfLib}, pdf is ${typeof pdf}`);
          }
          const data = await pdf(buffer);
          text = data.text;
        }

        console.log(`[GenerateExam] Extracted ${text.length} chars from PDF: ${file.name}`);
        contextText += `\n\n--- Content from ${file.name} ---\n${text}`;
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({ buffer });
        console.log(`[GenerateExam] Extracted ${result.value.length} chars from DOCX: ${file.name}`);
        contextText += `\n\n--- Content from ${file.name} ---\n${result.value}`;
      } else if (file.type === "text/plain") {
        const text = buffer.toString("utf-8");
        console.log(`[GenerateExam] Extracted ${text.length} chars from TXT: ${file.name}`);
        contextText += `\n\n--- Content from ${file.name} ---\n${text}`;
      }
    }
  }

  const prompt = `
    Generate a ${difficulty} difficulty exam about "${topic}" with ${count} questions.
    ${contextText ? `Base the questions STRICTLY on the following source material:\n${contextText}` : ""}
    The questions should be challenging and test deep understanding.
    For each question, identify a specific sub-topic (e.g., 'Cell Biology > Mitosis').

    Mix the following question types:
    1. Multiple Choice: 4 options, 1 correct.
    2. True/False: 2 options (True/False), 1 correct. Rapid fire concept checking.
    3. Fill in the Blank: No options provided, answer is a specific word/phrase. Tests recall.
    4. Select All That Apply: 4+ options, multiple correct answers. Increases difficulty.

    Ensure a diverse mix of these types to test different cognitive skills.
  `;

  console.log(`[GenerateExam] Total context length: ${contextText.length}`);
  if (contextText.length > 0) {
    console.log(`[GenerateExam] Context preview: ${contextText.substring(0, 200)}...`);
  }

  // 1. Generate Exam with Gemini
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"), // Updated model name if applicable, keeping consistent with prev code or updating
    schema: z.object({
      title: z.string().describe("A creative title for the exam based on the content"),
      questions: z.array(z.object({
        text: z.string(),
        type: z.enum(["Multiple Choice", "True/False", "Fill in the Blank", "Select All That Apply"]),
        options: z.array(z.string()).describe("Options for the question. Empty for Fill in the Blank."),
        correctAnswer: z.union([z.string(), z.array(z.string())]).describe("The correct answer. For 'Select All That Apply', provide an array of strings. For others, a single string."),
        explanation: z.string().describe("Why the answer is correct"),
        subtopic: z.string().describe("Specific sub-topic for the question"),
      })).length(count),
    }),
    prompt: prompt,
  });

  // 2. Save to Database
  const [newExam] = await db.insert(exams).values({
    userId: session.user.id, // Link to user
    title: object.title,
    topic: topic || "Uploaded Content",
    difficulty: difficulty,
    timeLimit: timeLimit,
  }).returning();

  await db.insert(questions).values(
    object.questions.map(q => {
      let finalCorrectAnswer = q.correctAnswer;
      // Serialize array answers for DB storage
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

  // 3. Return the Exam ID
  return { success: true, examId: newExam.id };
}
