import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, TrendUp, Lightning, Calendar, Scroll, Fire } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { NeoBrutalistChart } from "@/components/dashboard/NeoBrutalistChart";
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
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* LEFT COLUMN - Action Zone */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Start New Simulation - Featured Card */}
              <Link href="/dashboard/new" className="group block flex-1">
                <div className="h-full min-h-[280px] bg-white rounded-lg p-8 relative overflow-hidden transition-all duration-300 border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  {/* Background Effects */}
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

                  {/* Decorative Icon Background */}
                  <div className="absolute -bottom-6 -right-6 text-zinc-950/[0.03] transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <Scroll weight="fill" className="w-56 h-56" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent-purple/10 text-accent-purple text-xs font-bold tracking-wide uppercase border border-accent-purple/20 w-fit">
                        <Plus weight="bold" className="w-3.5 h-3.5" />
                        <span>Create New</span>
                      </div>

                      {/* Content */}
                      <div>
                        <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight group-hover:text-accent-purple transition-colors duration-300">Start a New Simulation</h2>
                        <p className="text-zinc-500 text-lg max-w-md font-medium leading-relaxed group-hover:text-zinc-700 transition-colors duration-300">
                          Upload materials or paste text to generate a fresh exam instantly.
                        </p>
                      </div>
                    </div>

                    {/* CTA Button look-alike */}
                    <div className="mt-8 flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-zinc-900 text-white font-bold shadow-neo group-hover:bg-brand-orange group-hover:text-white group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all duration-200">
                        <span className="flex items-center gap-2">
                          Begin Now
                          <ArrowRight weight="bold" className="w-4 h-4" />
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Progress Chart - Neo-Brutalist */}
              <section className="h-[200px]">
                <NeoBrutalistChart data={progressData} />
              </section>
            </div>

            {/* RIGHT COLUMN - Insights Zone */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <StatsPanel stats={stats} />

              {/* Focus Areas - flex-1 to fill remaining space */}
              <div className="flex-1 flex flex-col">
                <WeakAreas weakAreas={stats.weakAreas} />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
