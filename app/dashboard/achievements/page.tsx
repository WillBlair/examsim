import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { subDays } from "date-fns";
import { 
  Trophy, Fire, CheckCircle, Lock, Medal, Crown, Sparkle, Star
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { BadgeIcon } from "@/components/dashboard/BadgeIcon";

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  tier: "bronze" | "silver" | "gold" | "diamond";
  category: "creation" | "completion" | "mastery" | "streak" | "dedication";
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
      requirement: 1,
      current: totalExams,
      unlocked: totalExams >= 1,
      tier: "bronze",
      category: "creation"
    },
    {
      id: "exam-creator",
      title: "Exam Creator",
      description: "Create 5 exams",
      requirement: 5,
      current: totalExams,
      unlocked: totalExams >= 5,
      tier: "silver",
      category: "creation"
    },
    {
      id: "exam-master",
      title: "Exam Architect",
      description: "Create 25 exams",
      requirement: 25,
      current: totalExams,
      unlocked: totalExams >= 25,
      tier: "gold",
      category: "creation"
    },
    {
      id: "exam-legend",
      title: "Exam Legend",
      description: "Create 100 exams",
      requirement: 100,
      current: totalExams,
      unlocked: totalExams >= 100,
      tier: "diamond",
      category: "creation"
    },
    // Completions
    {
      id: "first-completion",
      title: "Test Taker",
      description: "Complete your first exam",
      requirement: 1,
      current: completedAttempts,
      unlocked: completedAttempts >= 1,
      tier: "bronze",
      category: "completion"
    },
    {
      id: "dedicated",
      title: "Dedicated",
      description: "Complete 10 exams",
      requirement: 10,
      current: completedAttempts,
      unlocked: completedAttempts >= 10,
      tier: "silver",
      category: "completion"
    },
    {
      id: "marathon",
      title: "Marathon Runner",
      description: "Complete 50 exams",
      requirement: 50,
      current: completedAttempts,
      unlocked: completedAttempts >= 50,
      tier: "gold",
      category: "completion"
    },
    {
      id: "eternal",
      title: "Eternal Scholar",
      description: "Complete 200 exams",
      requirement: 200,
      current: completedAttempts,
      unlocked: completedAttempts >= 200,
      tier: "diamond",
      category: "completion"
    },
    // Perfect Scores
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Get a perfect score",
      requirement: 1,
      current: perfectScores,
      unlocked: perfectScores >= 1,
      tier: "bronze",
      category: "mastery"
    },
    {
      id: "flawless",
      title: "Flawless",
      description: "Get 5 perfect scores",
      requirement: 5,
      current: perfectScores,
      unlocked: perfectScores >= 5,
      tier: "gold",
      category: "mastery"
    },
    {
      id: "legendary",
      title: "Legendary",
      description: "Get 10 perfect scores",
      requirement: 10,
      current: perfectScores,
      unlocked: perfectScores >= 10,
      tier: "diamond",
      category: "mastery"
    },
    // Streaks
    {
      id: "streak-3",
      title: "On a Roll",
      description: "Maintain a 3-day streak",
      requirement: 3,
      current: streak,
      unlocked: streak >= 3,
      tier: "bronze",
      category: "streak"
    },
    {
      id: "streak-7",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      requirement: 7,
      current: streak,
      unlocked: streak >= 7,
      tier: "silver",
      category: "streak"
    },
    {
      id: "streak-30",
      title: "Unstoppable",
      description: "Maintain a 30-day streak",
      requirement: 30,
      current: streak,
      unlocked: streak >= 30,
      tier: "gold",
      category: "streak"
    },
    {
      id: "streak-100",
      title: "Immortal",
      description: "Maintain a 100-day streak",
      requirement: 100,
      current: streak,
      unlocked: streak >= 100,
      tier: "diamond",
      category: "streak"
    },
    // Questions
    {
      id: "100-questions",
      title: "Scholar",
      description: "Answer 100 questions",
      requirement: 100,
      current: totalQuestionsAnswered,
      unlocked: totalQuestionsAnswered >= 100,
      tier: "bronze",
      category: "dedication"
    },
    {
      id: "500-questions",
      title: "Knowledge Seeker",
      description: "Answer 500 questions",
      requirement: 500,
      current: totalQuestionsAnswered,
      unlocked: totalQuestionsAnswered >= 500,
      tier: "silver",
      category: "dedication"
    },
    {
      id: "1000-questions",
      title: "Sage",
      description: "Answer 1,000 questions",
      requirement: 1000,
      current: totalQuestionsAnswered,
      unlocked: totalQuestionsAnswered >= 1000,
      tier: "gold",
      category: "dedication"
    },
    {
      id: "5000-questions",
      title: "Omniscient",
      description: "Answer 5,000 questions",
      requirement: 5000,
      current: totalQuestionsAnswered,
      unlocked: totalQuestionsAnswered >= 5000,
      tier: "diamond",
      category: "dedication"
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const bronzeUnlocked = achievements.filter(a => a.unlocked && a.tier === "bronze").length;
  const silverUnlocked = achievements.filter(a => a.unlocked && a.tier === "silver").length;
  const goldUnlocked = achievements.filter(a => a.unlocked && a.tier === "gold").length;

  const tierConfig = {
    bronze: { 
      badgeBg: "bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500",
      cardGlow: "shadow-[0_0_60px_-5px_rgba(205,127,50,0.9)] shadow-[0_0_35px_-10px_rgba(205,127,50,0.7)_inset] shadow-[0_0_20px_-5px_rgba(205,127,50,0.8)]",
      shine: "bg-gradient-to-br from-white/70 via-amber-200/40 to-transparent",
      label: "Bronze",
      labelStyle: "bg-gradient-to-r from-amber-500/40 to-orange-500/40 text-amber-950 border-amber-600/80 backdrop-blur-sm font-black shadow-[0_0_20px_rgba(205,127,50,0.6)]"
    },
    silver: { 
      badgeBg: "bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-400",
      cardGlow: "shadow-[0_0_60px_-5px_rgba(200,200,200,0.9)] shadow-[0_0_35px_-10px_rgba(200,200,200,0.7)_inset] shadow-[0_0_20px_-5px_rgba(200,200,200,0.8)]",
      shine: "bg-gradient-to-br from-white/80 via-slate-100/50 to-transparent",
      label: "Silver",
      labelStyle: "bg-gradient-to-r from-slate-500/40 to-zinc-500/40 text-slate-950 border-slate-600/80 backdrop-blur-sm font-black shadow-[0_0_20px_rgba(200,200,200,0.6)]"
    },
    gold: { 
      badgeBg: "bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500",
      cardGlow: "shadow-[0_0_80px_5px_rgba(255,215,0,1)] shadow-[0_0_50px_-2px_rgba(255,215,0,0.9)_inset] shadow-[0_0_30px_0px_rgba(255,215,0,0.95)] shadow-[0_0_15px_0px_rgba(255,215,0,0.9)]",
      shine: "bg-gradient-to-br from-white/90 via-yellow-100/60 to-transparent",
      label: "Gold",
      labelStyle: "bg-gradient-to-r from-yellow-400/50 to-amber-400/50 text-yellow-950 border-yellow-600/90 backdrop-blur-sm font-black shadow-[0_0_30px_rgba(255,215,0,0.8)]"
    },
    diamond: { 
      badgeBg: "bg-gradient-to-br from-cyan-300 via-blue-300 to-purple-400",
      cardGlow: "shadow-[0_0_90px_10px_rgba(59,130,246,1)] shadow-[0_0_60px_0px_rgba(168,85,247,0.95)_inset] shadow-[0_0_40px_5px_rgba(59,130,246,1)] shadow-[0_0_20px_5px_rgba(168,85,247,0.95)]",
      shine: "bg-gradient-to-br from-white/95 via-cyan-100/70 to-transparent",
      label: "Diamond",
      labelStyle: "bg-gradient-to-r from-cyan-400/60 to-purple-400/60 text-blue-950 border-blue-600/90 backdrop-blur-sm font-black shadow-[0_0_35px_rgba(59,130,246,0.9)]"
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white border-[3px] border-zinc-900 shadow-neo-xl rounded-2xl p-8 relative overflow-hidden group">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#EAB308_1px,transparent_1px),linear-gradient(to_bottom,#EAB308_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.05]" />
        
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-2xl rotate-6 opacity-20 blur-sm" />
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 border-[3px] border-zinc-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10">
                  <Trophy weight="fill" className="w-10 h-10 text-white drop-shadow-md" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Achievements</h1>
                <p className="text-base text-zinc-500 font-bold mt-1">Collect badges and showcase your progress</p>
              </div>
            </div>
          </div>
          
          {/* Unlocked Count Badge */}
          <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border-[3px] border-zinc-900 shadow-neo-sm group-hover:scale-105 transition-transform duration-300">
            <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center border-2 border-zinc-900 shadow-inner overflow-hidden">
                {/* Glowing effect background */}
                <div className="absolute inset-0 bg-white/10 blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-50" />
                
                {/* The Trophy Icon */}
                <Trophy weight="fill" className="w-7 h-7 text-white relative z-10 drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black tracking-tighter text-zinc-900 leading-none">{unlockedCount}</p>
                <span className="text-xs font-bold text-zinc-400 uppercase">/ {achievements.length}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Unlocked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Collection Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-4">
            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
            <Sparkle weight="fill" className="w-4 h-4 text-zinc-400" />
            Badge Collection
            </h2>
            <div className="text-xs font-bold text-zinc-400">
                {Math.round((unlockedCount / achievements.length) * 100)}% Complete
            </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {achievements.map((achievement) => {
            const tier = tierConfig[achievement.tier];
            const progressPercent = Math.min((achievement.current / achievement.requirement) * 100, 100);

            return (
              <div
                key={achievement.id}
                className={cn(
                  "relative flex flex-col items-center text-center p-6 rounded-2xl border-[3px] transition-all duration-500 group overflow-hidden",
                  achievement.unlocked
                    ? "bg-white border-zinc-900 shadow-neo hover:-translate-y-2 hover:shadow-neo-lg cursor-pointer"
                    : "bg-gradient-to-br from-zinc-50 to-zinc-100/50 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {/* Unlocked Card Background Pattern */}
                {achievement.unlocked && (
                  <>
                    <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10", tier.cardGlow)} />
                  </>
                )}

                {/* Premium Badge Container */}
                <div className="relative mb-5 mt-1">
                  {/* Badge Background Circle */}
                  <div className={cn(
                    "absolute inset-0 w-28 h-28 rounded-full transition-all duration-500 -left-2",
                    achievement.unlocked
                      ? cn(tier.badgeBg, "group-hover:scale-110 opacity-100")
                      : "bg-zinc-100 opacity-60"
                  )} />
                  
                  {/* Shine Effect for Unlocked */}
                  {achievement.unlocked && (
                    <div className={cn(
                      "absolute inset-0 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -left-2",
                      tier.shine
                    )} />
                  )}

                  {/* Badge Icon Container */}
                  <div className="relative flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out">
                    <BadgeIcon 
                      tier={achievement.tier}
                      category={achievement.category}
                      unlocked={achievement.unlocked}
                    />
                    
                    {/* Lock Overlay for Locked Badges */}
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm rounded-full">
                        <Lock weight="fill" className="w-10 h-10 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>

                  {/* Tier Badge Ribbon */}
                  {achievement.unlocked && (
                    <div className="absolute -top-2 -right-2 z-20">
                      <div className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border-2 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                        tier.labelStyle
                      )}>
                        {tier.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="space-y-2 w-full relative z-10">
                  <h3 className={cn(
                    "text-sm font-black tracking-tight leading-tight",
                    achievement.unlocked ? "text-zinc-900" : "text-zinc-500"
                  )}>
                    {achievement.title}
                  </h3>
                  
                  <p className={cn(
                    "text-[11px] font-medium leading-relaxed line-clamp-2 min-h-[2.5em]",
                    achievement.unlocked ? "text-zinc-600" : "text-zinc-400"
                  )}>
                    {achievement.description}
                  </p>
                  
                  {/* Progress for Locked Items */}
                  {!achievement.unlocked && (
                    <div className="pt-2 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="relative h-2 w-full bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                        <div 
                          className="h-full bg-gradient-to-r from-zinc-400 to-zinc-500 rounded-full transition-all duration-700 relative overflow-hidden" 
                          style={{ width: `${progressPercent}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
                        </div>
                      </div>
                      <p className="text-[9px] font-medium text-zinc-400">
                        {achievement.current} / {achievement.requirement}
                      </p>
                    </div>
                  )}

                  {/* Unlock Status */}
                  {achievement.unlocked && (
                    <div className="pt-2 flex items-center justify-center gap-1.5">
                      <CheckCircle weight="fill" className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Unlocked</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
