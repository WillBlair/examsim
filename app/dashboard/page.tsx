import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, TrendUp, Lightning, Calendar, Scroll, Fire } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { WeakAreas } from "@/components/dashboard/WeakAreas";

import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCachedUserStats } from "@/lib/utils/cache";
import { cn } from "@/lib/utils";
import { DashboardAvatar } from "@/components/dashboard/DashboardAvatar";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  // Use cached and optimized stats service
  const stats = await getCachedUserStats(session.user.id);

  // Fetch exams and results for display
  const allExams = await db.select().from(exams)
    .where(eq(exams.userId, session.user.id))
    .orderBy(desc(exams.createdAt));

  const allResults = await db.select().from(examResults)
    .where(eq(examResults.userId, session.user.id))
    .orderBy(desc(examResults.completedAt));

  // Progress Chart Data
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

  const hasExams = stats.totalExams > 0;
  const firstName = session.user.name?.split(' ')[0] || 'there';
  const userImage = session.user.image;

  const recentExams = allExams.slice(0, 3);
  const recentResults = allResults
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8 flex-1">
      {/* Header with Date */}
      <div className="bg-white border-[3px] border-black shadow-neo-xl rounded-lg p-6 relative overflow-hidden flex items-center justify-between">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#8B5CF6_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.07]" />

        {/* Glow Effects - positioned on the right side away from text */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent-purple/30 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-purple/20 rounded-full blur-[100px] opacity-60 pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col gap-1">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight mt-1">
            Welcome back, {firstName}!
          </h1>
          <p className="text-base text-zinc-500 font-medium max-w-lg leading-relaxed">
            Ready to continue your prep? You&apos;re doing great.
          </p>
        </div>

        {/* Profile Picture Circle */}
        <div className="relative z-10 hidden md:flex items-center gap-4">
          {/* Streak Badge */}
          {hasExams && (
            <div className="relative flex items-center justify-between gap-5 px-5 h-16 rounded-lg bg-brand-orange border-2 border-zinc-900 shadow-neo min-w-[340px] overflow-hidden group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200">
              {/* Background effects */}
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.08] mix-blend-overlay pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.15)_0%,transparent_50%)] pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 pointer-events-none" />

              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-accent-purple border-2 border-zinc-900 flex items-center justify-center shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-purple to-purple-700" />
                  <Fire weight="fill" className="w-5 h-5 text-white relative z-10" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1 leading-none">
                    <span className="text-2xl font-black text-zinc-900 tracking-tight leading-none">{stats.streak}</span>
                    <span className="text-xs font-bold text-zinc-900/80 leading-none">days</span>
                  </div>
                  <p className="text-[10px] text-zinc-900/70 font-semibold tracking-wide mt-0.5 leading-none">Current Streak</p>
                </div>
              </div>

              {stats.streak > 0 && (
                <div className="relative z-10 px-2.5 py-1 rounded-md bg-accent-purple border-2 border-zinc-900 shadow-neo flex items-center gap-1 group-hover:shadow-none transition-all overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-purple to-purple-700" />
                  <Fire weight="fill" className="w-3.5 h-3.5 text-white relative z-10 flex-shrink-0" />
                  <span className="text-[10px] font-black text-white uppercase tracking-wide relative z-10 leading-none">On fire!</span>
                </div>
              )}
            </div>
          )}

          <div className="w-16 h-16 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
            <DashboardAvatar sessionImage={userImage} name={firstName} />
          </div>
        </div>
      </div>

      {!hasExams ? (
        /* Empty State - Goal Gradient: clear path forward */
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm w-full max-w-lg p-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none" />
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <Plus weight="bold" className="w-8 h-8 text-brand-orange" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Create Your First Exam</h2>
              <p className="text-zinc-500 mb-8">
                Upload your study materials and we&apos;ll generate a custom practice exam for you in seconds.
              </p>
              <Link href="/dashboard/new" className="block w-full">
                <Button className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-medium shadow-lg shadow-zinc-900/10 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Two-Column Command Center Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT COLUMN - Action Zone */}
            <div className="lg:col-span-7 space-y-6">
              {/* Start New Simulation - Featured Card */}
              <Link href="/dashboard/new" className="group block">
                <div className="min-h-[280px] bg-white rounded-lg p-8 relative overflow-hidden transition-all duration-300 border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  {/* Background Effects */}
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

                  {/* Decorative Icon Background */}
                  <div className="absolute -bottom-6 -right-6 text-zinc-950/[0.03] transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <Scroll weight="fill" className="w-56 h-56" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-accent-purple/10 text-accent-purple text-xs font-bold tracking-wide uppercase border border-accent-purple/20 w-fit">
                        <Plus weight="bold" className="w-3.5 h-3.5" />
                        <span>Create New</span>
                      </div>

                      {/* Content */}
                      <div>
                        <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight group-hover:text-accent-purple transition-colors duration-300">Start a New Simulation</h2>
                        <p className="text-zinc-500 text-lg max-w-md font-medium leading-relaxed group-hover:text-zinc-700 transition-colors duration-300">
                          Upload materials or paste text to generate a fresh exam instantly.
                        </p>
                      </div>
                    </div>

                    {/* CTA Button look-alike */}
                    <div className="mt-8 flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-11 px-8 rounded-sm bg-zinc-900 text-white font-bold shadow-neo-lg group-hover:bg-brand-orange group-hover:text-white group-hover:shadow-none group-hover:translate-x-[4px] group-hover:translate-y-[4px] group-hover:border group-hover:border-zinc-900 transition-all duration-200">
                        <span className="flex items-center">
                          Begin Now
                          <ArrowRight weight="bold" className="ml-2 w-4 h-4" />
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Focus Areas */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Focus Areas</h2>
                <WeakAreas weakAreas={stats.weakAreas} />
              </div>
            </div>

            {/* RIGHT COLUMN - Insights Zone */}
            <div className="lg:col-span-5 space-y-6">
              {/* Weekly Recap Card */}
              <div className="bg-white rounded-lg border-2 border-zinc-900 shadow-neo p-5 relative overflow-hidden transition-all duration-300 group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar weight="fill" className="w-4 h-4 text-zinc-900" />
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider bg-zinc-100 px-2 py-1 rounded-sm border border-zinc-200 group-hover:bg-white group-hover:border-zinc-900 transition-all">Weekly Recap</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 border border-zinc-200 px-2 py-1 rounded-sm bg-zinc-50 group-hover:border-zinc-900 group-hover:bg-white transition-colors">
                      Last 7 Days
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 group-hover:border-zinc-900 group-hover:bg-white transition-all">
                      <div className="flex items-center gap-2 mb-1.5 text-zinc-500">
                        <Lightning weight="fill" className="w-3.5 h-3.5 text-brand-orange" />
                        <span className="text-[10px] uppercase font-bold tracking-wide">Exams</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-zinc-900 tracking-tight">{stats.examsCreatedLast7Days}</span>
                        <span className="text-xs text-zinc-400 font-medium">taken</span>
                      </div>
                    </div>

                    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200 group-hover:border-zinc-900 group-hover:bg-white transition-all">
                      <div className="flex items-center gap-2 mb-1.5 text-zinc-500">
                        <TrendUp weight="fill" className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] uppercase font-bold tracking-wide">Avg Score</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-zinc-900 tracking-tight">{Math.round(stats.avgScoreLast7Days)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 group-hover:border-zinc-900/20 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-500 font-medium group-hover:text-zinc-900">Weekly Goal</span>
                      <span className="text-zinc-900 font-bold">{stats.examsCreatedLast7Days}/5 Exams</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-sm overflow-hidden border border-transparent group-hover:border-zinc-200">
                      <div
                        className="h-full bg-brand-orange transition-all duration-500 rounded-sm"
                        style={{ width: `${Math.min((stats.examsCreatedLast7Days / 5) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1.5 text-center group-hover:text-zinc-600">
                      {stats.examsCreatedLast7Days >= 5 ? "Goal reached! Great job!" : `${5 - stats.examsCreatedLast7Days} more to reach your weekly target`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Bento Grid - 2x2 compact */}
              <StatsGrid
                totalExams={{
                  value: stats.totalExams,
                  trend: { current: stats.examsCreatedLast7Days, previous: stats.examsCreatedPrev7Days }
                }}
                averageScore={{
                  value: stats.averageScore,
                  trend: { current: stats.avgScoreLast7Days, previous: stats.avgScorePrev7Days }
                }}
                studyTime={{
                  value: stats.totalStudyHours.toFixed(1),
                  trend: { current: stats.studyTimeLast7Days, previous: stats.studyTimePrev7Days }
                }}
                questionsAnswered={{
                  value: stats.totalQuestionsAnswered,
                  trend: { current: stats.questionsLast7Days, previous: stats.questionsPrev7Days }
                }}
                streak={{
                  value: stats.streak,
                  trend: { current: 0, previous: 0 }
                }}
              />


            </div>
          </section>

          {/* Progress Chart - Full Width at Bottom */}
          <section className="h-[400px] mt-8">
            <ProgressChart data={progressData} />
          </section>
        </>
      )}
    </div>
  );
}
