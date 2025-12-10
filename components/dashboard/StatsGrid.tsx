"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, TrendUp, ListChecks, Fire, ArrowUp, ArrowDown, Minus } from "@phosphor-icons/react";
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
        <Minus weight="bold" className="w-3 h-3" />
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
        <ArrowUp weight="bold" className="w-3 h-3" />
      ) : isNeutral ? (
        <Minus weight="bold" className="w-3 h-3" />
      ) : (
        <ArrowDown weight="bold" className="w-3 h-3" />
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
      icon: CheckCircle,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      label: "Avg. Score",
      data: averageScore,
      icon: TrendUp,
      suffix: "%",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      label: "Questions",
      data: questionsAnswered,
      icon: ListChecks,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
    },
    {
      label: "Study Time",
      data: studyTime,
      icon: Clock,
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
          <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col justify-between group">
            <div>
              {/* Icon */}
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110", stat.iconBg)}>
                <stat.icon weight="fill" className={cn("w-4 h-4", stat.iconColor)} />
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
        <div className="p-4 rounded-xl bg-gradient-to-br from-brand-orange to-orange-500 shadow-md h-full flex flex-col justify-between relative overflow-hidden group">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay" />
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-white/90 shadow-sm flex items-center justify-center mb-3">
              <Fire weight="fill" className="w-4 h-4 text-brand-orange" />
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-zinc-950 tabular-nums">
                {streak.value}
              </span>
              <span className="text-sm font-bold text-zinc-800">days</span>
            </div>

            {/* Label */}
            <p className="text-xs text-zinc-800 font-medium">Current Streak</p>
          </div>
          
          {/* Status */}
          <div className="mt-3 relative z-10">
            {Number(streak.value) > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white shadow-sm border border-orange-200/50">
                <Fire weight="fill" className="w-3 h-3 text-brand-orange" />
                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">On fire!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/90 shadow-sm border border-orange-200/50">
                <span className="text-[10px] font-bold text-zinc-800">Start today!</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
