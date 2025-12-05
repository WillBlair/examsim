import { db } from "@/db";
import { exams, questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ExamClient } from "@/components/dashboard/ExamClient";

export default async function ExamPage({ 
  params, 
}: { 
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const id = parseInt(examId);
  if (isNaN(id)) return notFound();

  const exam = await db.select().from(exams).where(eq(exams.id, id)).then(res => res[0]);
  if (!exam) return notFound();

  const examQuestions = await db.select().from(questions).where(eq(questions.examId, id));

  // Transform questions to match the client component interface if necessary
  // The schema already matches well, but let's ensure type safety
  const formattedQuestions = examQuestions.map(q => ({
    id: q.id,
    questionText: q.questionText,
    options: q.options as string[],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    type: q.type
  }));

  return <ExamClient exam={exam} questions={formattedQuestions} initialTimer={exam.timeLimit || undefined} />;
}

