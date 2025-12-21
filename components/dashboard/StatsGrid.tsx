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
      iconBg: "bg-blue-400",
      iconColor: "text-white",
    },
    {
      label: "Avg. Score",
      data: averageScore,
      icon: "GraphUp",
      suffix: "%",
      iconBg: "bg-emerald-500",
      iconColor: "text-white",
    },
    {
      label: "Questions",
      data: questionsAnswered,
      icon: "TaskList",
      iconBg: "bg-accent-purple",
      iconColor: "text-white",
    },
    {
      label: "Study Time",
      data: studyTime,
      icon: "Clock",
      suffix: "h",
      iconBg: "bg-amber-400",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="h-full"
        >
          <div className="p-3 rounded-lg bg-white border-2 border-zinc-900 shadow-neo h-full flex flex-col justify-between group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200">
            <div>
              {/* Icon - Smaller */}
              <div className={cn("w-8 h-8 rounded-sm flex items-center justify-center mb-2 border border-zinc-900 shadow-sm", stat.iconBg)}>
                <AppIcon name={stat.icon} className={cn("w-4 h-4", stat.iconColor)} />
              </div>

              {/* Value */}
              <div className="flex items-baseline gap-0.5 mb-0.5">
                <span className="text-xl font-semibold text-foreground tabular-nums">
                  {stat.data.value}
                </span>
                {stat.suffix && (
                  <span className="text-xs font-medium text-muted-foreground">{stat.suffix}</span>
                )}
              </div>

              {/* Label */}
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>

            {/* Trend - Compact */}
            <div className="mt-2">
              {stat.data.trend && (
                <TrendBadge current={stat.data.trend.current} previous={stat.data.trend.previous} />
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
