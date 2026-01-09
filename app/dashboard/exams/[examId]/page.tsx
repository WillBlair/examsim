import { db } from "@/db";
import { exams, questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ExamClient } from "@/components/dashboard/ExamClient";
import { auth } from "@/auth";

// Helper to safely parse JSONB options field
function parseOptions(options: unknown): string[] {
  // If already an array, return it
  if (Array.isArray(options)) {
    return options.filter(opt => typeof opt === 'string' && opt.trim().length > 0);
  }
  // If string, try to parse as JSON
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) {
        return parsed.filter(opt => typeof opt === 'string' && opt.trim().length > 0);
      }
    } catch {
      // Not valid JSON, return empty array
    }
  }
  return [];
}

export default async function ExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const id = parseInt(examId);
  if (isNaN(id)) return notFound();

  const session = await auth();
  if (!session?.user?.id) return redirect("/login");

  const exam = await db.select().from(exams).where(eq(exams.id, id)).then(res => res[0]);
  if (!exam) return notFound();

  if (exam.userId !== session.user.id) {
    return notFound();
  }

  const examQuestions = await db.select().from(questions).where(eq(questions.examId, id));

  // Transform questions to match the client component interface
  const formattedQuestions = examQuestions.map(q => ({
    id: q.id,
    questionText: q.questionText,
    options: parseOptions(q.options),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    type: q.type
  }));

  return <ExamClient exam={exam} questions={formattedQuestions} initialTimer={exam.timeLimit || undefined} backHref="/dashboard/library" />;
}

