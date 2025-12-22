import { db } from "@/db";
import { exams, examResults, questions } from "@/db/schema";
import { eq, inArray, desc, sql, count, avg, sum, and, gte, lte } from "drizzle-orm";
import { subDays, startOfDay, endOfDay } from "date-fns";

interface SubtopicStats {
  subtopic: string;
  score: number;
  totalQuestions: number;
}

interface UserStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  weakAreas: SubtopicStats[];
  examsCreatedLast7Days: number;
  examsCreatedPrev7Days: number;
  avgScoreLast7Days: number;
  avgScorePrev7Days: number;
  totalStudyHours: number;
  studyTimeLast7Days: number;
  studyTimePrev7Days: number;
  totalQuestionsAnswered: number;
  questionsLast7Days: number;
  questionsPrev7Days: number;
  streak: number;
}

export async function calculateUserStats(userId: string): Promise<UserStats> {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);

  // Parallelize independent queries
  const [
    examStats,
    resultStats,
    recentExamCount,
    prevExamCount,
    recentResultStats,
    prevResultStats,
    weakAreas,
    streakData
  ] = await Promise.all([
    // 1. Total Exams
    db
      .select({ count: count() })
      .from(exams)
      .where(eq(exams.userId, userId))
      .then((res) => res[0]?.count || 0),

    // 2. Completed Exams & Average Score (All Time)
    db
      .select({
        count: count(),
        averageScore: avg(examResults.score), // Score is raw score (integers usually), check if adjustment needed. 
        // Note: examResults.score is usually correct answers. We need per-exam percentage.
        // SQL avg of raw scores isn't percentage if totalQuestions varies.
        // Let's stick to solving "total completed" here and do avg score carefully or keep approximation?
        // Actually, let's fetch sum(score) and sum(totalQuestions) to get a weighted average, 
        // OR simpler: just avg(score/totalQuestions). Drizzle/SQL integer division might be tricky.
        // Safe approach for specific app logic: Fetch minimal necessary fields for advanced math if SQL is complex,
        // BUT for simple totals, aggregates are best.
        // Let's calculate precise weighted average on DB if possible, or fetch just scores.
        // Let's try: AVG(score::float / total_questions) * 100
        avgPercentage: sql<number>`AVG(CAST(${examResults.score} AS FLOAT) / ${examResults.totalQuestions}) * 100`,
        totalStudyMinutes: sum(sql<number>`${examResults.totalQuestions} * 1.5`), // 1.5 mins per question
        totalQuestionsAnswered: sum(examResults.totalQuestions) // Assuming answered = total questions in completed exam
      })
      .from(examResults)
      .where(eq(examResults.userId, userId)),

    // 3. Exams Created (Last 7 Days)
    db
      .select({ count: count() })
      .from(exams)
      .where(
        and(
          eq(exams.userId, userId),
          gte(exams.createdAt, sevenDaysAgo),
          lte(exams.createdAt, now)
        )
      )
      .then((res) => res[0]?.count || 0),

    // 4. Exams Created (Previous 7 Days)
    db
      .select({ count: count() })
      .from(exams)
      .where(
        and(
          eq(exams.userId, userId),
          gte(exams.createdAt, fourteenDaysAgo),
          lte(exams.createdAt, sevenDaysAgo)
        )
      )
      .then((res) => res[0]?.count || 0),

    // 5. Results Last 7 Days (Avg Score, Study Time, Questions)
    db
      .select({
        avgPercentage: sql<number>`AVG(CAST(${examResults.score} AS FLOAT) / ${examResults.totalQuestions}) * 100`,
        studyMinutes: sum(sql<number>`${examResults.totalQuestions} * 1.5`),
        questionsAnswered: sum(examResults.totalQuestions)
      })
      .from(examResults)
      .where(
        and(
          eq(examResults.userId, userId),
          gte(examResults.completedAt, sevenDaysAgo),
          lte(examResults.completedAt, now)
        )
      ),

    // 6. Results Previous 7 Days
    db
      .select({
        avgPercentage: sql<number>`AVG(CAST(${examResults.score} AS FLOAT) / ${examResults.totalQuestions}) * 100`,
        studyMinutes: sum(sql<number>`${examResults.totalQuestions} * 1.5`),
        questionsAnswered: sum(examResults.totalQuestions)
      })
      .from(examResults)
      .where(
        and(
          eq(examResults.userId, userId),
          gte(examResults.completedAt, fourteenDaysAgo),
          lte(examResults.completedAt, sevenDaysAgo)
        )
      ),

    // 7. Weak Areas Calculation - Optimized Fetch
    // We still need to parse JSON answers to map to subtopics, but we can fetch drastically less data.
    // Fetch only results with answers and the minimal question data needed.
    (async () => {
      // Get all results for user
      const results = await db
        .select({
          examId: examResults.examId,
          answers: examResults.answers
        })
        .from(examResults)
        .where(eq(examResults.userId, userId));

      if (results.length === 0) return [];

      const examIds = [...new Set(results.map(r => r.examId))];

      // Fetch only necessary question fields
      const relevantQuestions = await db
        .select({
          id: questions.id,
          subtopic: questions.subtopic,
          correctAnswer: questions.correctAnswer,
          examId: questions.examId
        })
        .from(questions)
        .where(inArray(questions.examId, examIds));

      // In-memory processing for simplified dataset
      const subtopicStats: Record<string, { correct: number; total: number }> = {};

      results.forEach(result => {
        const answers = typeof result.answers === "string"
          ? (JSON.parse(result.answers) as Record<string, string>)
          : (result.answers as Record<string, string>);

        if (!answers) return;

        Object.entries(answers).forEach(([qIdStr, selectedOption]) => {
          const qId = parseInt(qIdStr);
          // Optimize find with a Map if dataset was huge, but find is okay for typical user load here
          // compared to full DB fetch.
          const question = relevantQuestions.find(q => q.id === qId);

          if (question && question.subtopic) {
            if (!subtopicStats[question.subtopic]) {
              subtopicStats[question.subtopic] = { correct: 0, total: 0 };
            }
            subtopicStats[question.subtopic].total += 1;
            if (selectedOption === question.correctAnswer) {
              subtopicStats[question.subtopic].correct += 1;
            }
          }
        });
      });

      return Object.entries(subtopicStats)
        .map(([subtopic, stats]) => ({
          subtopic,
          score: (stats.correct / stats.total) * 100,
          totalQuestions: stats.total,
        }))
        .filter((area) => area.score < 60)
        .sort((a, b) => a.score - b.score)
        .slice(0, 5);
    })(),

    // 8. Streak Calculation
    // We only need the completedAt dates.
    db
      .select({ completedAt: examResults.completedAt })
      .from(examResults)
      .where(eq(examResults.userId, userId))
      .orderBy(desc(examResults.completedAt))
  ]);

  // Process Aggregated Results
  const totalStats = resultStats[0] || {};
  const recentStats = recentResultStats[0] || {};
  const prevStats = prevResultStats[0] || {};

  // Streak Calculation Logic
  const uniqueDates = Array.from(
    new Set(
      streakData.map((r) =>
        new Date(r.completedAt).toISOString().split("T")[0]
      )
    )
  )
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const todayStr = now.toISOString().split("T")[0];
  const yesterdayStr = subDays(now, 1).toISOString().split("T")[0];

  const hasActivityToday = uniqueDates.some(
    (d) => d.toISOString().split("T")[0] === todayStr
  );
  const hasActivityYesterday = uniqueDates.some(
    (d) => d.toISOString().split("T")[0] === yesterdayStr
  );

  if (hasActivityToday || hasActivityYesterday) {
    let checkDate = hasActivityToday ? now : subDays(now, 1);
    while (
      uniqueDates.some(
        (d) => d.toISOString().split("T")[0] === checkDate.toISOString().split("T")[0]
      )
    ) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  return {
    totalExams: examStats,
    completedExams: Number(totalStats.count || 0),
    averageScore: Math.round(Number(totalStats.avgPercentage || 0)),
    weakAreas,
    examsCreatedLast7Days: recentExamCount,
    examsCreatedPrev7Days: prevExamCount,
    avgScoreLast7Days: Math.round(Number(recentStats.avgPercentage || 0)),
    avgScorePrev7Days: Math.round(Number(prevStats.avgPercentage || 0)),
    totalStudyHours: Number((Number(totalStats.totalStudyMinutes || 0) / 60).toFixed(1)),
    studyTimeLast7Days: Number((Number(recentStats.studyMinutes || 0) / 60).toFixed(1)),
    studyTimePrev7Days: Number((Number(prevStats.studyMinutes || 0) / 60).toFixed(1)),
    totalQuestionsAnswered: Number(totalStats.totalQuestionsAnswered || 0),
    questionsLast7Days: Number(recentStats.questionsAnswered || 0),
    questionsPrev7Days: Number(prevStats.questionsAnswered || 0),
    streak,
  };
}


