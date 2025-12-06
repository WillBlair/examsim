"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendUp, Trophy } from "@phosphor-icons/react";

interface ProgressChartProps {
  data: {
    label: string;
    score: number;
    total: number;
    date: Date;
  }[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  // Take only the last 7 exams (Newest)
  const chartData = data.slice(-7); // Removed .reverse() to keep chronological order (Old -> New)

  console.log("ProgressChart Data:", { total: data.length, chartData });
  const maxScore = 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Performance History</h3>
            <p className="text-sm text-zinc-500">Your recent exam scores</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <TrendUp weight="bold" />
            <span>Keep it up!</span>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-48 flex items-end gap-4 w-full">
            {chartData.map((item, index) => {
              const percentage = Math.round((item.score / item.total) * 100);
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                    {item.label}: {percentage}%
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-zinc-100 rounded-t-lg relative h-full overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                      className={`absolute bottom-0 w-full rounded-t-lg transition-colors ${percentage >= 80 ? "bg-green-500 group-hover:bg-green-600" :
                          percentage >= 60 ? "bg-brand-orange group-hover:bg-orange-600" :
                            "bg-red-400 group-hover:bg-red-500"
                        }`}
                    />
                  </div>

                  {/* Date/Label */}
                  <span className="text-xs text-zinc-400 font-medium truncate max-w-full text-center">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
            <Trophy weight="duotone" className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Complete exams to see your progress</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}



