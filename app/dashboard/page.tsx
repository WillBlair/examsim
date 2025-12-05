import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults, questions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { WeakAreas } from "@/components/dashboard/WeakAreas";
import { isSameDay, subDays, isWithinInterval } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
      return redirect("/login");
  }

  const allExams = await db.select().from(exams)
      .where(eq(exams.userId, session.user.id))
      .orderBy(desc(exams.createdAt));
      
  const allResults = await db.select().from(examResults)
      .where(eq(examResults.userId, session.user.id));
      
  const allQuestions = await db.select().from(questions);
  
  const recentExams = allExams.slice(0, 3);
  const totalExams = allExams.length;
  const completedExams = allResults.length;
  
  // Calculate overall average score
  const averageScore = completedExams > 0 
    ? Math.round(allResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0) / completedExams)
    : 0;

  // --- Weak Areas Calculation ---
  const subtopicStats: Record<string, { correct: number; total: number }> = {};

  allResults.forEach(result => {
    // Ensure answers is an object, not null/undefined/string
    const answers = (typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers) as Record<string, string>;
    
    if (answers) {
        Object.entries(answers).forEach(([qIdStr, selectedOption]) => {
        const qId = parseInt(qIdStr);
        const question = allQuestions.find(q => q.id === qId);
        
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

  const weakAreas = Object.entries(subtopicStats)
    .map(([subtopic, stats]) => ({
      subtopic,
      score: (stats.correct / stats.total) * 100,
      totalQuestions: stats.total
    }))
    .filter(area => area.score < 60) // Threshold: <60% score
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  // --- Trend & Sparkline Calculations ---
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);

  // 1. Exams Created Trend
  const examsCreatedLast7Days = allExams.filter(e => 
    isWithinInterval(new Date(e.createdAt), { start: sevenDaysAgo, end: now })
  ).length;
  
  const examsCreatedPrev7Days = allExams.filter(e => 
    isWithinInterval(new Date(e.createdAt), { start: fourteenDaysAgo, end: sevenDaysAgo })
  ).length;

  const examsCreatedSparkline = [];
  for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const count = allExams.filter(e => isSameDay(new Date(e.createdAt), date)).length;
      examsCreatedSparkline.push(count);
  }

  // 2. Average Score Trend
  const resultsLast7Days = allResults.filter(r => 
    isWithinInterval(new Date(r.completedAt), { start: sevenDaysAgo, end: now })
  );
  const resultsPrev7Days = allResults.filter(r => 
    isWithinInterval(new Date(r.completedAt), { start: fourteenDaysAgo, end: sevenDaysAgo })
  );

  const avgScoreLast7Days = resultsLast7Days.length > 0
    ? resultsLast7Days.reduce((acc, r) => acc + (r.score / r.totalQuestions * 100), 0) / resultsLast7Days.length
    : 0;
    
  const avgScorePrev7Days = resultsPrev7Days.length > 0
    ? resultsPrev7Days.reduce((acc, r) => acc + (r.score / r.totalQuestions * 100), 0) / resultsPrev7Days.length
    : 0;

  const avgScoreSparkline = [];
  for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dayResults = allResults.filter(r => isSameDay(new Date(r.completedAt), date));
      const dayAvg = dayResults.length > 0
          ? dayResults.reduce((acc, r) => acc + (r.score / r.totalQuestions * 100), 0) / dayResults.length
          : 0;
      avgScoreSparkline.push(dayAvg);
  }

  // 3. Study Time (1.5 mins per question)
  const calculateStudyTime = (results: typeof allResults) => {
      const minutes = results.reduce((acc, r) => acc + (r.totalQuestions * 1.5), 0);
      return minutes / 60;
  };

  const totalStudyHours = calculateStudyTime(allResults);
  const studyTimeLast7Days = calculateStudyTime(resultsLast7Days);
  const studyTimePrev7Days = calculateStudyTime(resultsPrev7Days);

  const studyTimeSparkline = [];
  for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dayResults = allResults.filter(r => isSameDay(new Date(r.completedAt), date));
      const dayHours = calculateStudyTime(dayResults);
      studyTimeSparkline.push(dayHours);
  }

  // Prepare data for Progress Chart
  const progressData = allResults
    .map(result => {
      const exam = allExams.find(e => e.id === result.examId);
      return {
        label: exam ? exam.title : "Unknown Exam",
        score: result.score,
        total: result.totalQuestions,
        date: result.completedAt
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 h-full flex flex-col py-4">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
            <p className="text-zinc-500 mt-2">Welcome back, {session.user.name || 'Student'}. Here is your progress overview.</p>
        </div>
        <Link href="/dashboard/new">
            <Button className="h-11 px-6 rounded-full bg-brand-orange hover:bg-orange-600 text-white font-bold gap-2 shadow-lg shadow-orange-900/20 transition-all hover:scale-105 active:scale-95">
                <Plus weight="bold" className="w-4 h-4" />
                Create New Exam
            </Button>
        </Link>
      </div>

      {/* Stats Grid with Animations */}
      <StatsGrid 
        totalExams={{
            value: totalExams,
            trend: { current: examsCreatedLast7Days, previous: examsCreatedPrev7Days },
            sparkline: examsCreatedSparkline
        }}
        averageScore={{
            value: averageScore,
            trend: { current: avgScoreLast7Days, previous: avgScorePrev7Days },
            sparkline: avgScoreSparkline
        }}
        studyTime={{
            value: totalStudyHours.toFixed(1),
            trend: { current: studyTimeLast7Days, previous: studyTimePrev7Days },
            sparkline: studyTimeSparkline
        }}
      />

      {/* Progress Chart & Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-full">
              <ProgressChart data={progressData} />
          </div>
          <div className="h-full">
              <WeakAreas weakAreas={weakAreas} />
          </div>
      </div>

      {/* Recent Activity Section with Animations */}
      <RecentActivity 
        exams={recentExams} 
        results={allResults} 
      />
    </div>
  );
}
