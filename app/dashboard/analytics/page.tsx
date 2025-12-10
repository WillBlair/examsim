import { db } from "@/db";
import { exams, examResults, questions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ChartLineUp, Target, Brain, TrendUp, Calendar, Clock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AnalyticsPage() {
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

  const completedAttempts = allResults.length;

  // Average Score
  const averageScore = completedAttempts > 0
    ? Math.round(allResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0) / completedAttempts)
    : 0;

  // Total Questions Answered
  const totalQuestionsAnswered = allResults.reduce((acc, result) => {
    const answers = (typeof result.answers === 'string'
      ? JSON.parse(result.answers)
      : result.answers) as Record<string, string>;
    return acc + Object.keys(answers || {}).length;
  }, 0);

  // Accuracy by Topic
  const topicStats: Record<string, { correct: number; total: number }> = {};
  allResults.forEach(result => {
    const answers = (typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers) as Record<string, string>;
    if (answers) {
      Object.entries(answers).forEach(([qIdStr, selectedOption]) => {
        const qId = parseInt(qIdStr);
        const question = allQuestions.find(q => q.id === qId);
        if (question) {
          const topic = question.subtopic || "General";
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0 };
          }
          topicStats[topic].total += 1;
          if (selectedOption === question.correctAnswer) {
            topicStats[topic].correct += 1;
          }
        }
      });
    }
  });

  const topicAccuracy = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      questions: stats.total
    }))
    .sort((a, b) => b.questions - a.questions)
    .slice(0, 6);

  // Activity Heatmap (Last 7 days)
  const now = new Date();
  const sevenDaysAgo = subDays(now, 6);
  const last7Days = eachDayOfInterval({ start: sevenDaysAgo, end: now });

  const activityByDay = last7Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const count = allResults.filter(r => format(new Date(r.completedAt), 'yyyy-MM-dd') === dayStr).length;
    return {
      date: format(day, 'EEE'),
      fullDate: format(day, 'MMM d'),
      count
    };
  });

  // Study Time (estimate: 1.5 mins per question)
  const totalStudyMinutes = allResults.reduce((acc, r) => acc + (r.totalQuestions * 1.5), 0);
  const totalStudyHours = Math.round(totalStudyMinutes / 60 * 10) / 10;

  const hasData = completedAttempts > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Analytics</h1>
        <p className="text-zinc-500">Deep insights into your learning performance.</p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
            <ChartLineUp className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">No Analytics Yet</h2>
          <p className="text-zinc-500 max-w-sm mb-6">Complete your first exam to unlock detailed performance analytics.</p>
          <Link href="/dashboard/new">
            <Button className="bg-brand-orange hover:bg-emerald-600 text-white">Create an Exam</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-zinc-200 p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-purple/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-lg bg-accent-purple/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Target weight="fill" className="w-5 h-5 text-accent-purple" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 tracking-tight">{averageScore}%</p>
                <p className="text-xs text-zinc-500 font-medium">Average Score</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Brain weight="fill" className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 tracking-tight">{totalQuestionsAnswered}</p>
                <p className="text-xs text-zinc-500 font-medium">Questions Answered</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock weight="fill" className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 tracking-tight">{totalStudyHours}h</p>
                <p className="text-xs text-zinc-500 font-medium">Study Time</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <TrendUp weight="fill" className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 tracking-tight">{completedAttempts}</p>
                <p className="text-xs text-zinc-500 font-medium">Exams Completed</p>
              </div>
            </div>
          </section>

          {/* Activity Heatmap & Topic Accuracy */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-purple/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                    <Calendar weight="fill" className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Weekly Activity</h3>
                    <p className="text-xs text-zinc-500">Exams completed per day</p>
                  </div>
                </div>
                
                <div className="flex items-end justify-between gap-2 h-32">
                  {activityByDay.map((day, i) => {
                    const maxCount = Math.max(...activityByDay.map(d => d.count), 1);
                    const height = day.count > 0 ? Math.max((day.count / maxCount) * 100, 15) : 8;
                    const isToday = i === activityByDay.length - 1;
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className={`w-full rounded-md transition-all ${day.count > 0 ? 'bg-gradient-to-t from-accent-purple to-violet-400' : 'bg-zinc-100'} ${isToday ? 'ring-2 ring-accent-purple/30 shadow-lg shadow-accent-purple/20' : ''}`}
                          style={{ height: `${height}%` }}
                          title={`${day.fullDate}: ${day.count} exams`}
                        />
                        <span className={`text-[10px] font-medium ${isToday ? 'text-accent-purple font-bold' : 'text-zinc-400'}`}>
                          {day.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Topic Accuracy */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Brain weight="fill" className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Accuracy by Topic</h3>
                    <p className="text-xs text-zinc-500">Performance across subjects</p>
                  </div>
                </div>

                {topicAccuracy.length > 0 ? (
                  <div className="space-y-4">
                    {topicAccuracy.map((topic, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-zinc-700 truncate max-w-[60%]">{topic.topic}</span>
                          <span className={`font-semibold ${topic.accuracy >= 70 ? 'text-emerald-600' : topic.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                            {topic.accuracy}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 rounded-[3px] overflow-hidden">
                          <div 
                            className={`h-full rounded-[2px] transition-all duration-500 ${topic.accuracy >= 70 ? 'bg-emerald-500' : topic.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${topic.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 text-center py-8">No topic data available yet.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

