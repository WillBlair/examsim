"use client";

import { ChartLineUp } from "@phosphor-icons/react";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface NeoBrutalistChartProps {
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
        color: "#10b981", // emerald-500
    },
} satisfies ChartConfig;

export function NeoBrutalistChart({ data }: NeoBrutalistChartProps) {
    // Transform data for the chart
    const chartData = data.slice(-10).map(item => ({
        date: format(new Date(item.date), 'MMM d'),
        score: Math.round((item.score / item.total) * 100),
    }));

    const hasData = chartData.length > 0;

    // Calculate average
    const avgScore = hasData
        ? Math.round(chartData.reduce((acc, item) => acc + item.score, 0) / chartData.length)
        : 0;

    // Colors
    const chartColor = "#8b5cf6"; // violet-500

    return (
        <div className="h-full p-3 rounded-lg bg-white border-2 border-zinc-900 shadow-neo flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-violet-500 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] flex items-center justify-center">
                        <ChartLineUp weight="fill" className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Performance</h3>
                </div>
                {hasData && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black text-zinc-900 tracking-tight leading-none">{avgScore}%</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">avg</span>
                    </div>
                )}
            </div>

            {/* Chart */}
            {hasData ? (
                <div className="flex-1 min-h-0">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <AreaChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 0, right: 8, top: 5, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f4f4f5" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={6}
                                tick={{ fontSize: 9, fill: '#a1a1aa' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickCount={3}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                                tick={{ fontSize: 9, fill: '#a1a1aa' }}
                            />
                            <ChartTooltip
                                cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }}
                                content={<ChartTooltipContent hideLabel className="bg-white border-zinc-200 shadow-lg" />}
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey="score"
                                type="monotone"
                                fill="url(#scoreGradient)"
                                stroke={chartColor}
                                strokeWidth={2.5}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-xs text-zinc-400">Complete an exam to see trends</p>
                </div>
            )}
        </div>
    );
}
