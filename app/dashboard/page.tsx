import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Clock, CheckCircle, Warning, Trophy, TrendUp, Lightning, CaretRight, Calendar, Scroll } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { WeakAreas } from "@/components/dashboard/WeakAreas";
import { DashboardEmptyState } from "@/components/dashboard/EmptyState";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCachedUserStats } from "@/lib/utils/cache";

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

  const recentExams = allExams.slice(0, 3);
  const recentResults = allResults
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .slice(0, 10); 

  return (
    <div className="space-y-8 flex-1">
      {/* Header with Date */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Welcome back, {firstName}!
        </h1>
        <p className="text-sm text-zinc-500">
            Ready to continue your prep? You're doing great.
        </p>
      </div>

      {!hasExams ? (
        /* Empty State - Goal Gradient: clear path forward */
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm w-full max-w-lg p-1 relative overflow-hidden">
             <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none" />
             <div className="p-8 text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6">
                    <Plus weight="bold" className="w-8 h-8 text-brand-orange" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2">Create Your First Exam</h2>
                <p className="text-zinc-500 mb-8">
                    Upload your study materials and we'll generate a custom practice exam for you in seconds.
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
          {/* Primary Action & Weekly Progress (Redesigned) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/new" className="group md:col-span-2 relative">
                <div className="h-full min-h-[220px] bg-white rounded-2xl p-8 relative overflow-hidden transition-all duration-300 border border-zinc-200 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-zinc-300">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
                    
                    {/* Decorative Icon Background */}
                    <div className="absolute -bottom-6 -right-6 text-zinc-950/[0.03] transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                         <Scroll weight="fill" className="w-56 h-56" />
                    </div>

                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="space-y-4">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold tracking-wide uppercase border border-brand-orange/20 w-fit">
                                <Plus weight="bold" className="w-3.5 h-3.5" />
                                <span>Create New</span>
                            </div>
                            
                            {/* Content */}
                            <div>
                                <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight group-hover:text-brand-orange transition-colors">Start a New Simulation</h2>
                                <p className="text-zinc-500 text-lg max-w-md font-medium leading-relaxed">
                                    Upload materials or paste text to generate a fresh exam instantly.
                                </p>
                            </div>
                        </div>

                        {/* CTA Button look-alike */}
                        <div className="mt-8 flex items-center gap-3">
                            <span className="inline-flex items-center justify-center h-11 px-6 rounded-[10px] bg-zinc-900 text-white font-medium shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(255,255,255,0.1)_inset] group-hover:bg-zinc-800 transition-all duration-200 transform group-hover:-translate-y-0.5 group-hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)] active:scale-[0.98] active:translate-y-0">
                                Begin Now
                                <ArrowRight weight="bold" className="ml-2 w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Redesigned Weekly Summary Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-full hover:shadow-lg hover:-translate-y-1 hover:border-zinc-300 transition-all duration-300">
                <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar weight="fill" className="w-4 h-4 text-zinc-400" />
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Weekly Recap</span>
                        </div>
                        <span className="text-[10px] font-medium text-zinc-400 border border-zinc-100 px-2 py-1 rounded-full bg-zinc-50">
                            Last 7 Days
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50/50 rounded-xl p-3 border border-zinc-100/80">
                            <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                <Lightning weight="fill" className="w-3.5 h-3.5 text-brand-orange" />
                                <span className="text-[10px] uppercase font-bold tracking-wide">Exams</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.examsCreatedLast7Days}</span>
                                <span className="text-xs text-zinc-400 font-medium">taken</span>
                            </div>
                        </div>

                        <div className="bg-zinc-50/50 rounded-xl p-3 border border-zinc-100/80">
                            <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                <TrendUp weight="fill" className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] uppercase font-bold tracking-wide">Avg Score</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-zinc-900 tracking-tight">{Math.round(stats.avgScoreLast7Days)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-dashed border-zinc-200">
                     <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-zinc-500 font-medium">Weekly Goal</span>
                        <span className="text-zinc-900 font-bold">{stats.examsCreatedLast7Days}/5 Exams</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-brand-orange transition-all duration-500 rounded-full" 
                            style={{ width: `${Math.min((stats.examsCreatedLast7Days / 5) * 100, 100)}%` }} 
                         />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2 text-center">
                        {stats.examsCreatedLast7Days >= 5 ? "Goal reached! Great job!" : `${5 - stats.examsCreatedLast7Days} more to reach your weekly target`}
                    </p>
                </div>
            </div>
          </section>

          {/* Stats Row */}
          <section>
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
                trend: { current: 0, previous: 0 }
              }}
              streak={{
                value: stats.streak,
                trend: { current: 0, previous: 0 }
              }}
            />
          </section>

          {/* Recent Activity & Weak Areas Split */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Recent Activity</h2>
                    <Link href="/dashboard/exams" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1">
                        View All <CaretRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="flex-1">
                    <RecentActivity exams={recentExams} results={recentResults} />
                </div>
            </div>
            
            <div className="space-y-4 h-full flex flex-col">
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Focus Areas</h2>
                <div className="flex-1">
                    <WeakAreas weakAreas={stats.weakAreas} />
                </div>
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
