"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle, TrendUp, ListChecks, Fire } from "@phosphor-icons/react";
import { Sparkline } from "@/components/ui/sparkline";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { cn } from "@/lib/utils";

interface StatData {
  value: number | string;
  trend?: {
    current: number;
    previous: number;
    label?: string;
  };
  sparkline?: number[];
}

interface StatsGridProps {
  totalExams: StatData;
  averageScore: StatData;
  studyTime: StatData;
  questionsAnswered: StatData;
  streak: StatData;
}

export function StatsGrid({ totalExams, averageScore, studyTime, questionsAnswered, streak }: StatsGridProps) {
  const cards = [
    {
      label: "Total Created",
      data: totalExams,
      icon: CheckCircle,
      color: "text-zinc-900",
      bgColor: "bg-zinc-100",
      iconColor: "text-zinc-900",
      subtext: "exams generated",
      showGraph: false,
      special: false
    },
    {
      label: "Average Score",
      data: averageScore,
      icon: TrendUp,
      color: "text-zinc-900",
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
      subtext: "across all tests",
      valueSuffix: "%",
      showGraph: false,
      special: false
    },
    {
      label: "Questions Answered",
      data: questionsAnswered,
      icon: ListChecks,
      color: "text-zinc-900",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
      subtext: "total questions",
      showGraph: false,
      special: false
    },
    {
      label: "Study Time",
      data: studyTime,
      icon: Clock,
      color: "text-zinc-900",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-700",
      subtext: "total hours",
      special: false,
      valueSuffix: "h",
      sparklineColor: "#ea580c",
      showGraph: true
    },
    {
      label: "Current Streak",
      data: streak,
      icon: Fire,
      color: "text-white",
      bgColor: "bg-orange-500",
      iconColor: "text-white",
      subtext: "consecutive days",
      special: true, // Highlight this card
      showGraph: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="h-full"
        >
          <Card className={cn(
            "p-6 flex flex-col justify-center items-center h-40 border-zinc-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden relative gap-3",
            card.special ? "bg-gradient-to-br from-brand-orange to-orange-600 border-orange-500 text-white" : "bg-white"
          )}>
            {/* Header */}
            <div className="flex justify-center items-center z-10 relative">
              <div className={cn("flex items-center gap-2 text-sm font-medium", card.special ? "text-orange-100" : "text-zinc-500")}>
                <div className={cn("p-2 rounded-lg", card.bgColor, card.iconColor)}>
                  <card.icon weight="fill" className="w-4 h-4" />
                </div>
                {card.label}
              </div>
            </div>

            {/* Content */}
            <div className="z-10 relative flex flex-col items-center">
              <div className={cn("text-4xl font-bold tracking-tight", card.special ? "text-white" : "text-zinc-900")}>
                {card.data.value}{card.valueSuffix || ""}
              </div>
              {card.data.trend && (
                <TrendIndicator
                  current={card.data.trend.current}
                  previous={card.data.trend.previous}
                  className="mt-2"
                  darkBackground={card.special}
                />
              )}
            </div>

            {/* Graph (Study Time Only) */}
            {card.showGraph && card.data.sparkline && (
              <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-20">
                <Sparkline
                  data={card.data.sparkline.length > 0 && card.data.sparkline.some(x => x > 0) ? card.data.sparkline : [0, 0, 0, 0, 0, 0, 0]}
                  color={card.sparklineColor || "#000"}
                  width={300}
                  height={100}
                  className="w-full h-full"
                  fill={true}
                />
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
