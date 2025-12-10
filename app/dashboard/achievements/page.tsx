import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { subDays } from "date-fns";
import { Trophy, Fire, Exam, Lightning, Star, CheckCircle, Lock } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  current: number;
  unlocked: boolean;
  tier: "bronze" | "silver" | "gold";
}

export default async function AchievementsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const allExams = await db.select().from(exams)
    .where(eq(exams.userId, session.user.id))
    .orderBy(desc(exams.createdAt));

  const allResults = await db.select().from(examResults)
    .where(eq(examResults.userId, session.user.id));

  const totalExams = allExams.length;
  const completedAttempts = allResults.length;
  
  // Calculate stats for achievements
  const perfectScores = allResults.filter(r => r.score === r.totalQuestions).length;
  const totalQuestionsAnswered = allResults.reduce((acc, result) => {
    const answers = (typeof result.answers === 'string'
      ? JSON.parse(result.answers)
      : result.answers) as Record<string, string>;
    return acc + Object.keys(answers || {}).length;
  }, 0);

  // Streak calculation
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

  // Define achievements
  const achievements: Achievement[] = [
    // Exam Creation
    {
      id: "first-exam",
      title: "Getting Started",
      description: "Create your first exam",
      icon: <Exam weight="fill" className="w-5 h-5" />,
      requirement: 1,
      current: totalExams,
      unlocked: totalExams >= 1,
      tier: "bronze"
    },
    {
      id: "exam-creator",
      title: "Exam Creator",
      description: "Create 5 exams",
      icon: <Exam weight="fill" className="w-5 h-5" />,
      requirement: 5,
      current: totalExams,
      unlocked: totalExams >= 5,
      tier: "silver"
    },
    {
      id: "exam-master",
      title: "Exam Architect",
      description: "Create 25 exams",
      icon: <Exam weight="fill" className="w-5 h-5" />,
      requirement: 25,
      current: totalExams,
      unlocked: totalExams >= 25,
      tier: "gold"
    },
    // Completions
    {
      id: "first-completion",
      title: "Test Taker",
      description: "Complete your first exam",
      icon: <CheckCircle weight="fill" className="w-5 h-5" />,
      requirement: 1,
      current: completedAttempts,
      unlocked: completedAttempts >= 1,
      tier: "bronze"
    },
    {
      id: "dedicated",
      title: "Dedicated",
      description: "Complete 10 exams",
      icon: <CheckCircle weight="fill" className="w-5 h-5" />,
      requirement: 10,
      current: completedAttempts,
      unlocked: completedAttempts >= 10,
      tier: "silver"
    },
    {
      id: "marathon",
      title: "Marathon Runner",
      description: "Complete 50 exams",
      icon: <CheckCircle weight="fill" className="w-5 h-5" />,
      requirement: 50,
      current: completedAttempts,
      unlocked: completedAttempts >= 50,
      tier: "gold"
    },
    // Perfect Scores
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Get a perfect score",
      icon: <Star weight="fill" className="w-5 h-5" />,
      requirement: 1,
      current: perfectScores,
      unlocked: perfectScores >= 1,
      tier: "bronze"
    },
    {
      id: "flawless",
      title: "Flawless",
      description: "Get 5 perfect scores",
      icon: <Star weight="fill" className="w-5 h-5" />,
      requirement: 5,
      current: perfectScores,
      unlocked: perfectScores >= 5,
      tier: "gold"
    },
    // Streaks
    {
      id: "streak-3",
      title: "On a Roll",
      description: "Maintain a 3-day streak",
      icon: <Fire weight="fill" className="w-5 h-5" />,
      requirement: 3,
      current: streak,
      unlocked: streak >= 3,
      tier: "bronze"
    },
    {
      id: "streak-7",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: <Fire weight="fill" className="w-5 h-5" />,
      requirement: 7,
      current: streak,
      unlocked: streak >= 7,
      tier: "silver"
    },
    {
      id: "streak-30",
      title: "Unstoppable",
      description: "Maintain a 30-day streak",
      icon: <Fire weight="fill" className="w-5 h-5" />,
      requirement: 30,
      current: streak,
      unlocked: streak >= 30,
      tier: "gold"
    },
    // Questions
    {
      id: "100-questions",
      title: "Scholar",
      description: "Answer 100 questions",
      icon: <Lightning weight="fill" className="w-5 h-5" />,
      requirement: 100,
      current: totalQuestionsAnswered,
      unlocked: totalQuestionsAnswered >= 100,
      tier: "bronze"
    },
    {
      id: "500-questions",
      title: "Knowledge Seeker",
      description: "Answer 500 questions",
      icon: <Lightning weight="fill" className="w-5 h-5" />,
      requirement: 500,
      current: totalQuestionsAnswered,
      unlocked: totalQuestionsAnswered >= 500,
      tier: "silver"
    },
    {
      id: "1000-questions",
      title: "Sage",
      description: "Answer 1,000 questions",
      icon: <Lightning weight="fill" className="w-5 h-5" />,
      requirement: 1000,
      current: totalQuestionsAnswered,
      unlocked: totalQuestionsAnswered >= 1000,
      tier: "gold"
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const tierStyles = {
    bronze: { 
      badge: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200", 
      icon: "text-emerald-600",
      bg: "from-emerald-50/80 to-white",
      glow: "bg-emerald-500/10"
    },
    silver: { 
      badge: "bg-violet-100 text-violet-700 ring-1 ring-violet-200", 
      icon: "text-violet-600",
      bg: "from-violet-50/80 to-white",
      glow: "bg-violet-500/10"
    },
    gold: { 
      badge: "bg-accent-purple/10 text-accent-purple ring-1 ring-accent-purple/20", 
      icon: "text-accent-purple",
      bg: "from-accent-purple/10 to-white",
      glow: "bg-accent-purple/10"
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Achievements</h1>
        <p className="text-zinc-500">Track your milestones and unlock badges.</p>
      </div>

      {/* Summary Cards - Metallic Look */}
      <div className="flex items-center gap-6">
        <div className="relative overflow-hidden group bg-white rounded-xl border border-zinc-200 px-6 py-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-50" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <Trophy weight="fill" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 tracking-tight">{unlockedCount} / {achievements.length}</p>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Unlocked</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden group bg-white rounded-xl border border-zinc-200 px-6 py-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 to-transparent opacity-50" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent-purple/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Fire weight="fill" className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 tracking-tight">{streak}</p>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid - Clean Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const style = tierStyles[achievement.tier];
          const progress = Math.min((achievement.current / achievement.requirement) * 100, 100);

          return (
            <div
              key={achievement.id}
              className={cn(
                "group relative overflow-hidden bg-white rounded-xl border p-5 transition-all duration-300 shadow-sm",
                achievement.unlocked
                  ? "border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:-translate-y-0.5"
                  : "border-zinc-100 opacity-60 grayscale-[0.5]"
              )}
            >
              {/* Subtle Gradient Background */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", style.bg)} />
              {/* Glow effect on hover */}
              <div className={cn("absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", style.glow)} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 duration-300",
                    achievement.unlocked ? "bg-white shadow-md ring-1 ring-black/5 group-hover:shadow-lg" : "bg-zinc-100"
                  )}>
                    <div className={achievement.unlocked ? style.icon : "text-zinc-400"}>
                      {achievement.icon}
                    </div>
                  </div>
                  
                  {achievement.unlocked ? (
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                      style.badge
                    )}>
                      {achievement.tier}
                    </span>
                  ) : (
                    <Lock weight="fill" className="w-4 h-4 text-zinc-300" />
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="text-sm font-bold text-zinc-900 tracking-tight">{achievement.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{achievement.description}</p>
                </div>

                {/* Precision Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-medium">
                    <span className="text-zinc-400">{achievement.current} / {achievement.requirement}</span>
                    <span className={achievement.unlocked ? "text-emerald-600" : "text-zinc-400"}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-[3px] overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-[2px] transition-all duration-1000 ease-out",
                        achievement.unlocked ? (achievement.tier === 'gold' ? "bg-accent-purple" : "bg-emerald-500") : "bg-zinc-300"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
