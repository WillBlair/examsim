import { db } from "@/db";
import { exams, examResults, questions } from "@/db/schema";
import { eq, inArray, desc, sql } from "drizzle-orm";
import { subDays, isWithinInterval } from "date-fns";

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
  streak: number;
}

export async function calculateUserStats(userId: string): Promise<UserStats> {
  // Fetch user's exams and results
  const userExams = await db
    .select()
    .from(exams)
    .where(eq(exams.userId, userId))
    .orderBy(desc(exams.createdAt));

  const userResults = await db
    .select()
    .from(examResults)
    .where(eq(examResults.userId, userId));

  // Only fetch questions for user's exams (performance optimization)
  const userExamIds = userExams.map((e) => e.id);
  const userQuestions =
    userExamIds.length > 0
      ? await db
          .select()
          .from(questions)
          .where(inArray(questions.examId, userExamIds))
      : [];

  const totalExams = userExams.length;
  const completedExams = userResults.length;

  // Calculate overall average score
  const averageScore =
    completedExams > 0
      ? Math.round(
          userResults.reduce(
            (acc, curr) => acc + (curr.score / curr.totalQuestions) * 100,
            0
          ) / completedExams
        )
      : 0;

  // Calculate weak areas (optimized)
  const subtopicStats: Record<string, { correct: number; total: number }> = {};

  userResults.forEach((result) => {
    const answers =
      typeof result.answers === "string"
        ? (JSON.parse(result.answers) as Record<string, string>)
        : (result.answers as Record<string, string>);

    if (answers) {
      Object.entries(answers).forEach(([qIdStr, selectedOption]) => {
        const qId = parseInt(qIdStr);
        const question = userQuestions.find((q) => q.id === qId);

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
    }
  });

  const weakAreas: SubtopicStats[] = Object.entries(subtopicStats)
    .map(([subtopic, stats]) => ({
      subtopic,
      score: (stats.correct / stats.total) * 100,
      totalQuestions: stats.total,
    }))
    .filter((area) => area.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  // Trend calculations
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);

  const examsCreatedLast7Days = userExams.filter((e) =>
    isWithinInterval(new Date(e.createdAt), { start: sevenDaysAgo, end: now })
  ).length;

  const examsCreatedPrev7Days = userExams.filter((e) =>
    isWithinInterval(new Date(e.createdAt), {
      start: fourteenDaysAgo,
      end: sevenDaysAgo,
    })
  ).length;

  const resultsLast7Days = userResults.filter((r) =>
    isWithinInterval(new Date(r.completedAt), { start: sevenDaysAgo, end: now })
  );

  const resultsPrev7Days = userResults.filter((r) =>
    isWithinInterval(new Date(r.completedAt), {
      start: fourteenDaysAgo,
      end: sevenDaysAgo,
    })
  );

  const avgScoreLast7Days =
    resultsLast7Days.length > 0
      ? resultsLast7Days.reduce(
          (acc, r) => acc + (r.score / r.totalQuestions) * 100,
          0
        ) / resultsLast7Days.length
      : 0;

  const avgScorePrev7Days =
    resultsPrev7Days.length > 0
      ? resultsPrev7Days.reduce(
          (acc, r) => acc + (r.score / r.totalQuestions) * 100,
          0
        ) / resultsPrev7Days.length
      : 0;

  // Study Time (1.5 mins per question)
  const calculateStudyTime = (results: typeof userResults) => {
    const minutes = results.reduce(
      (acc, r) => acc + r.totalQuestions * 1.5,
      0
    );
    return minutes / 60;
  };

  const totalStudyHours = calculateStudyTime(userResults);
  const studyTimeLast7Days = calculateStudyTime(resultsLast7Days);
  const studyTimePrev7Days = calculateStudyTime(resultsPrev7Days);

  // Questions Answered
  const totalQuestionsAnswered = userResults.reduce((acc, result) => {
    const answers =
      typeof result.answers === "string"
        ? (JSON.parse(result.answers) as Record<string, string>)
        : (result.answers as Record<string, string>);
    return acc + Object.keys(answers || {}).length;
  }, 0);

  // Current Streak
  const uniqueDates = Array.from(
    new Set(
      userResults.map((r) =>
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
    totalExams,
    completedExams,
    averageScore,
    weakAreas,
    examsCreatedLast7Days,
    examsCreatedPrev7Days,
    avgScoreLast7Days,
    avgScorePrev7Days,
    totalStudyHours,
    studyTimeLast7Days,
    studyTimePrev7Days,
    totalQuestionsAnswered,
    streak,
  };
}

