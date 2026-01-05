import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, TrendUp, Lightning, Calendar, Scroll, Fire, Cards, Trophy } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults, users } from "@/db/schema";
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

  // Check if user has completed onboarding
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { hasOnboarded: true },
  });

  // Redirect to onboarding if not completed
  if (!user?.hasOnboarded) {
    return redirect("/get-started");
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
    <div className="flex flex-col flex-1 gap-5">
      {/* Header with Date - Updated to Clean Neobrutalist */}
      <div>
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-600 rounded-[32px] p-6 shadow-xl shadow-indigo-500/20 relative overflow-hidden flex items-center justify-between group transition-all duration-500 hover:shadow-indigo-500/30">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          {/* Noise Texture */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20 w-fit backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-0.5 drop-shadow-sm">
              {hasExams ? `Welcome back, ${firstName}!` : `Welcome, ${firstName}!`}
            </h1>
            <p className="text-sm text-indigo-100 font-medium max-w-lg leading-relaxed">
              Ready to crush your goals today? Let's get learning!
            </p>
          </div>

          {/* Profile Picture Circle */}
          <div className="relative z-10 hidden md:flex items-center gap-5">
            {/* Streak Badge - Redesigned */}
            {hasExams && (
              <div className="relative flex items-center gap-3 px-4 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md overflow-hidden group/streak transition-all duration-300 hover:bg-white/20 hover:-translate-y-1">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <Fire weight="fill" className="w-5 h-5 text-white" />
                </div>

                <div className="flex flex-col relative z-10">
                  <span className="text-xl font-black text-white leading-none tracking-tight">{stats.streak}</span>
                  <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mt-0.5">Day Streak</span>
                </div>
              </div>
            )}

            <div className="w-16 h-16 rounded-[20px] border-4 border-white/30 shadow-2xl overflow-hidden relative transition-transform duration-300 hover:scale-105 hover:rotate-3 bg-white">
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

            <div className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-zinc-900/20 transition-transform hover:scale-110 duration-300">
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
        <div className="flex flex-col gap-5">
          {/* Top Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Actions */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Start New Simulation Card - Candy Colorful */}
              <Link href="/dashboard/new" className="group block h-full">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[32px] p-6 shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden min-h-[260px]">

                  {/* Decorative Background Elements */}
                  <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-bold text-emerald-50 uppercase tracking-widest bg-white/20 border border-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">Assessment</span>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-emerald-600 shadow-lg">
                      <Scroll weight="bold" className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-sm">New Exam</h2>
                    <p className="text-emerald-50 font-medium text-sm leading-relaxed mb-6 max-w-[90%]">
                      Create a custom test from your notes.
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-xl font-bold text-sm shadow-sm group-hover:bg-emerald-50 transition-colors">
                      Start Session <ArrowRight weight="bold" className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Generate Flashcards Card - Candy Colorful */}
              <Link href="/dashboard/flashcards/new" className="group block h-full">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[32px] p-6 shadow-xl shadow-orange-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden min-h-[260px]">

                  {/* Decorative Background Elements */}
                  <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-bold text-amber-50 uppercase tracking-widest bg-white/20 border border-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">Study Tool</span>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-orange-600 shadow-lg">
                      <Cards weight="bold" className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-sm">Flashcards</h2>
                    <p className="text-amber-50 font-medium text-sm leading-relaxed mb-6 max-w-[90%]">
                      Interactive decks from your study material.
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-xl font-bold text-sm shadow-sm group-hover:bg-orange-50 transition-colors">
                      Create Deck <ArrowRight weight="bold" className="w-4 h-4" />
                    </div>
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
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Performance Chart */}
            <div className="lg:col-span-7 h-[320px]">
              <NeoBrutalistChart data={progressData} />
            </div>

            {/* Weak Areas */}
            <div className="lg:col-span-5 h-[320px]">
              <div className="h-full">
                <WeakAreas weakAreas={stats.weakAreas} />
              </div>
            </div>
          </section>

          {/* Bottom Section: Activity & Achievements */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Activity Strip */}
            <div className="lg:col-span-7 h-full min-h-[200px]">
              <div className="h-full [&>div]:h-full">
                <ActivityStrip stats={stats} />
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="lg:col-span-5 h-full min-h-[200px]">
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
