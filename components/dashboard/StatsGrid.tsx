"use client";

import { motion } from "framer-motion";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface StatData {
  value: number | string;
  trend?: {
    current: number;
    previous: number;
  };
}

interface StatsGridProps {
  totalExams: StatData;
  averageScore: StatData;
  studyTime: StatData;
  questionsAnswered: StatData;
  streak: StatData;
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (current === 0 && previous === 0) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <AppIcon name="Minus" className="w-3 h-3" />
        No change
      </span>
    );
  }

  const percentChange = previous === 0 
    ? (current > 0 ? 100 : 0)
    : Math.round(((current - previous) / previous) * 100);

  const isPositive = percentChange > 0;
  const isNeutral = percentChange === 0;

  return (
    <span className={cn(
      "text-xs font-medium flex items-center gap-1",
      isPositive ? "text-emerald-400" : isNeutral ? "text-muted-foreground" : "text-red-400"
    )}>
      {isPositive ? (
        <AppIcon name="ArrowUp" className="w-3 h-3" />
      ) : isNeutral ? (
        <AppIcon name="Minus" className="w-3 h-3" />
      ) : (
        <AppIcon name="ArrowDown" className="w-3 h-3" />
      )}
      {Math.abs(percentChange)}% vs last week
    </span>
  );
}

export function StatsGrid({ totalExams, averageScore, studyTime, questionsAnswered, streak }: StatsGridProps) {
  const stats = [
    {
      label: "Total Exams",
      data: totalExams,
      icon: "CheckCircle",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      label: "Avg. Score",
      data: averageScore,
      icon: "GraphUp",
      suffix: "%",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      label: "Questions",
      data: questionsAnswered,
      icon: "TaskList",
      iconBg: "bg-accent-purple/10",
      iconColor: "text-accent-purple",
    },
    {
      label: "Study Time",
      data: studyTime,
      icon: "Clock",
      suffix: "h",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Regular Stats */}
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="h-full"
        >
          <div className="p-4 rounded-lg bg-white border-2 border-zinc-900 shadow-neo h-full flex flex-col justify-between group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200">
            <div>
              {/* Icon */}
              <div className={cn("w-9 h-9 rounded-md flex items-center justify-center mb-3 border border-zinc-900", stat.iconBg)}>
                <AppIcon name={stat.icon} className={cn("w-4 h-4", stat.iconColor)} />
              </div>

              {/* Value */}
              <div className="flex items-baseline gap-0.5 mb-1">
                <span className="text-2xl font-semibold text-foreground tabular-nums">
                  {stat.data.value}
                </span>
                {stat.suffix && (
                  <span className="text-sm font-medium text-muted-foreground">{stat.suffix}</span>
                )}
              </div>

              {/* Label */}
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>

            {/* Trend */}
            <div className="mt-3">
              {stat.data.trend && (
                <TrendBadge current={stat.data.trend.current} previous={stat.data.trend.previous} />
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Streak Card - Special Styling */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="h-full"
      >
        <div className="p-4 rounded-lg bg-brand-orange border-2 border-zinc-900 shadow-neo h-full flex flex-col justify-between relative overflow-hidden group">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="w-9 h-9 rounded-md bg-white border border-zinc-900 shadow-sm flex items-center justify-center mb-3">
              <AppIcon name="Fire" className="w-4 h-4 text-brand-orange" />
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-white tabular-nums text-shadow-sm">
                {streak.value}
              </span>
              <span className="text-sm font-bold text-white/90">days</span>
            </div>

            {/* Label */}
            <p className="text-xs text-white/80 font-medium">Current Streak</p>
          </div>
          
          {/* Status */}
          <div className="mt-3 relative z-10">
            {Number(streak.value) > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white shadow-sm border border-zinc-900">
                <AppIcon name="Fire" className="w-3 h-3 text-brand-orange" />
                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">On fire!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white shadow-sm border border-zinc-900">
                <span className="text-[10px] font-bold text-zinc-900">Start today!</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
