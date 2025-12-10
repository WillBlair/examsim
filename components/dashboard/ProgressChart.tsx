"use client";

import { motion } from "framer-motion";
import { ChartLineUp, Trophy } from "@phosphor-icons/react";
import { format } from "date-fns";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

interface ProgressChartProps {
  data: {
    label: string;
    score: number;
    total: number;
    date: Date;
  }[];
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--brand-orange))",
  },
} satisfies ChartConfig;

export function ProgressChart({ data }: ProgressChartProps) {
  // Take last 10 items for a better "stock market" trend view
  const chartData = data.slice(-10).map(item => ({
    date: format(new Date(item.date), 'MMM d'),
    score: Math.round((item.score / item.total) * 100),
    label: item.label
  }));

  const hasData = chartData.length > 0;
  
  // Calculate average
  const avgScore = hasData 
    ? Math.round(chartData.reduce((acc, item) => acc + item.score, 0) / chartData.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="h-full min-h-[400px]"
    >
      <div className="h-full p-6 rounded-2xl bg-white border border-zinc-200 flex flex-col relative overflow-hidden shadow-md">
        {/* Header */}
        <div className="relative flex items-center justify-between mb-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <ChartLineUp weight="duotone" className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Performance Trend</h3>
              <p className="text-xs text-zinc-500">Last {chartData.length} exams</p>
            </div>
          </div>
          {hasData && (
            <div className="text-right">
              <p className="text-2xl font-bold text-zinc-900 tracking-tight">{avgScore}%</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Avg Score</p>
            </div>
          )}
        </div>

        {/* Chart */}
        {hasData ? (
          <div className="flex-1 w-full min-h-[300px] relative z-10">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <AreaChart accessibilityLayer data={chartData} margin={{ top: 20, right: 0, bottom: 20, left: -20 }}>
                <defs>
                  <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--brand-orange))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--brand-orange))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  domain={[0, 100]}
                />
                <ChartTooltip 
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={
                    <ChartTooltipContent 
                        hideLabel 
                        className="bg-white border-zinc-200 text-zinc-900 shadow-lg" 
                    />
                  } 
                />
                <Area
                  dataKey="score"
                  type="monotone"
                  fill="url(#fillScore)"
                  fillOpacity={0.4}
                  stroke="hsl(var(--brand-orange))"
                  strokeWidth={2}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--brand-orange))" }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4">
              <Trophy weight="duotone" className="w-8 h-8 text-zinc-300" />
            </div>
            <p className="text-sm font-medium text-zinc-900 mb-1">No data yet</p>
            <p className="text-xs text-zinc-500 max-w-[200px]">Complete your first exam to see your performance analytics here.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
