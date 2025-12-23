import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, TrendUp, Lightning, Calendar, Scroll, Fire, Cards, Trophy } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { NeoBrutalistChart } from "@/components/dashboard/NeoBrutalistChart";
import { WeakAreas } from "@/components/dashboard/WeakAreas";
import { RecentAchievements } from "@/components/dashboard/RecentAchievements";
import { ActivityStrip } from "@/components/dashboard/ActivityStrip";

import { format, subDays } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCachedUserStats } from "@/lib/utils/cache";
import { cn } from "@/lib/utils";
// import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { DashboardAvatar } from "@/components/dashboard/DashboardAvatar";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  // Fetch all data in parallel for faster load
  const [stats, allExams, allResults] = await Promise.all([
    getCachedUserStats(session.user.id),
    db.select().from(exams)
      .where(eq(exams.userId, session.user.id))
      .orderBy(desc(exams.createdAt)),
    db.select().from(examResults)
      .where(eq(examResults.userId, session.user.id))
      .orderBy(desc(examResults.completedAt))
  ]);

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

  // Achievements calculation
  const totalExams = allExams.length;
  const completedAttempts = allResults.length;
  const perfectScores = allResults.filter(r => r.score === r.totalQuestions).length;

  // Calculate current streak
  const now = new Date();
  const uniqueDates = Array.from(new Set(allResults.map(r => new Date(r.completedAt).toISOString().split('T')[0])))
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = subDays(now, 1).toISOString().split('T')[0];
  const hasActivityToday = uniqueDates.some(d => d.toISOString().split('T')[0] === todayStr);
  const hasActivityYesterday = uniqueDates.some(d => d.toISOString().split('T')[0] === yesterdayStr);

  if (hasActivityToday || hasActivityYesterday) {
    let checkDate = hasActivityToday ? now : subDays(now, 1);
    while (uniqueDates.some(d => d.toISOString().split('T')[0] === checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  // Define unlocked achievements
  const unlockedAchievements = [
    { id: "first-exam", title: "Getting Started", tier: "bronze" as const, category: "creation" as const, unlocked: totalExams >= 1 },
    { id: "exam-creator", title: "Exam Creator", tier: "silver" as const, category: "creation" as const, unlocked: totalExams >= 5 },
    { id: "exam-master", title: "Exam Architect", tier: "gold" as const, category: "creation" as const, unlocked: totalExams >= 25 },
    { id: "first-completion", title: "Test Taker", tier: "bronze" as const, category: "completion" as const, unlocked: completedAttempts >= 1 },
    { id: "dedicated", title: "Dedicated", tier: "silver" as const, category: "completion" as const, unlocked: completedAttempts >= 10 },
    { id: "perfectionist", title: "Perfectionist", tier: "bronze" as const, category: "mastery" as const, unlocked: perfectScores >= 1 },
    { id: "flawless", title: "Flawless", tier: "gold" as const, category: "mastery" as const, unlocked: perfectScores >= 5 },
    { id: "streak-3", title: "On a Roll", tier: "bronze" as const, category: "streak" as const, unlocked: streak >= 3 },
    { id: "streak-7", title: "Week Warrior", tier: "silver" as const, category: "streak" as const, unlocked: streak >= 7 },
  ].filter(a => a.unlocked).slice(0, 3);

  return (
    <div className="flex flex-col flex-1 gap-6">
      {/* Header with Date - Updated to Clean Neobrutalist */}
      <div>
        <div className="bg-indigo-50 border border-indigo-100 shadow-sm rounded-2xl p-5 relative overflow-hidden flex items-center justify-between group">
          {/* Subtle Noise Texture */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-multiply" />
          
          {/* Abstract Shapes */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-violet-200/50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/2 -translate-y-1/2" />
          <div className="absolute right-20 bottom-0 w-48 h-48 bg-blue-200/50 rounded-full blur-3xl opacity-60 pointer-events-none translate-y-1/2" />

          <div className="relative z-10 flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/60 border border-indigo-200/50 w-fit backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>
            <h1 className="text-3xl font-black text-indigo-950 tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-sm text-indigo-900/60 font-medium max-w-lg">
              Ready to continue your prep? You&apos;re doing great.
            </p>
          </div>

          {/* Profile Picture Circle */}
          <div className="relative z-10 hidden md:flex items-center gap-6">
            {/* Streak Badge - Redesigned */}
            {hasExams && (
              <div className="relative flex items-center gap-4 px-4 h-16 rounded-2xl bg-white border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] overflow-hidden group/streak transition-transform hover:-translate-y-1">
                 <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
                
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <Fire weight="fill" className="w-5 h-5 text-orange-500" />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-zinc-900 leading-none tracking-tight">{stats.streak}</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Day Streak</span>
                </div>

                 {stats.streak > 0 && (
                   <div className="absolute top-2 right-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   </div>
                 )}
              </div>
            )}

            <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg overflow-hidden relative">
              <DashboardAvatar sessionImage={userImage} name={firstName} />
            </div>
          </div>
        </div>
      </div>

      {!hasExams ? (
        /* Empty State */
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/50 w-full max-w-lg p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange via-purple-500 to-blue-500" />
            
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-zinc-900/20 rotate-3 transition-transform hover:rotate-6 hover:scale-110 duration-300">
              <Plus weight="bold" className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Create Your First Exam</h2>
            <p className="text-zinc-500 mb-10 text-lg leading-relaxed">
              Upload your study materials and we&apos;ll generate a custom practice exam for you in seconds.
            </p>
            
            <Link href="/dashboard/new" className="block w-full">
              <Button className="w-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold text-lg shadow-lg shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch">
            {/* LEFT COLUMN: Actions */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Start New Simulation Card */}
              <Link href="/dashboard/new" className="group block h-full">
                <div className="bg-emerald-50 rounded-xl p-2.5 border-2 border-zinc-900 shadow-none transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 h-full flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex items-start justify-between mb-1.5 relative z-10">
                    <span className="text-[10px] font-black text-emerald-900/60 uppercase tracking-wider">Assessment</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white border-2 border-emerald-600 transition-colors">
                      <Scroll weight="bold" className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  
                  <div className="mb-1.5 relative z-10">
                    <h2 className="text-lg font-black text-zinc-900 tracking-tight mb-0.5">New Exam</h2>
                    <p className="text-[10px] text-emerald-900/70 font-bold leading-relaxed line-clamp-2">
                      Generate a custom practice test from your materials.
                    </p>
                  </div>

                  <div className="relative z-10">
                     <span className="inline-flex items-center justify-center w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg border-2 border-emerald-600 group-hover:bg-white group-hover:text-emerald-900 group-hover:border-emerald-600 transition-colors">
                        Start Session <ArrowRight weight="bold" className="w-3 h-3 ml-2" />
                     </span>
                  </div>
                </div>
              </Link>

              {/* Generate Flashcards Card */}
              <Link href="/dashboard/flashcards/new" className="group block h-full">
                 <div className="bg-amber-50 rounded-xl p-2.5 border-2 border-zinc-900 shadow-none transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 h-full flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute right-0 top-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

                  <div className="flex items-start justify-between mb-1.5 relative z-10">
                    <span className="text-[10px] font-black text-amber-900/60 uppercase tracking-wider">Study Tool</span>
                     <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white border-2 border-amber-500 transition-colors">
                      <Cards weight="bold" className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  
                  <div className="mb-1.5 relative z-10">
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight mb-0.5">Flashcards</h3>
                    <p className="text-[10px] text-amber-900/70 font-bold leading-relaxed line-clamp-2">
                      Create interactive study decks from your notes.
                    </p>
                  </div>

                  <div className="relative z-10">
                     <span className="inline-flex items-center justify-center w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg border-2 border-amber-500 group-hover:bg-white group-hover:text-amber-900 group-hover:border-amber-500 transition-colors">
                        Create Deck <ArrowRight weight="bold" className="w-3 h-3 ml-2" />
                     </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* RIGHT COLUMN: Stats Panel */}
            <div className="lg:col-span-5">
              <StatsPanel stats={stats} className="h-full" />
            </div>
          </section>

          {/* Middle Section: Trends & Weak Areas */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Performance Chart */}
            <div className="lg:col-span-7 h-[280px]">
              <NeoBrutalistChart data={progressData} />
            </div>

            {/* Weak Areas */}
            <div className="lg:col-span-5 h-[280px]">
              <div className="h-full">
                <WeakAreas weakAreas={stats.weakAreas} />
              </div>
            </div>
          </section>

          {/* Bottom Section: Activity & Achievements */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Activity Strip */}
            <div className="lg:col-span-7 h-[180px]">
              <div className="h-full [&>div]:h-full">
                <ActivityStrip stats={stats} />
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="lg:col-span-5 h-[180px]">
              <div className="h-full [&>div]:h-full">
                <RecentAchievements achievements={unlockedAchievements} />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
