"use client";

import { ChartLineUp } from "@phosphor-icons/react";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Dot, ReferenceLine } from "recharts";

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
    // Transform data for the chart - deduplicate dates by averaging scores for same day
    const rawData = data.slice(-10).map(item => ({
        date: format(new Date(item.date), 'MMM d'),
        fullDate: new Date(item.date),
        score: Math.round((item.score / item.total) * 100),
    }));

    // Group by date and average scores for duplicate dates
    const groupedData = rawData.reduce((acc, item) => {
        const existingIndex = acc.findIndex(d => d.date === item.date);
        if (existingIndex >= 0) {
            // Average the scores for duplicate dates
            acc[existingIndex].scores.push(item.score);
        } else {
            acc.push({ date: item.date, fullDate: item.fullDate, scores: [item.score] });
        }
        return acc;
    }, [] as { date: string; fullDate: Date; scores: number[] }[]);

    const chartData = groupedData.map(item => ({
        date: item.date,
        score: Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length),
    }));

    const hasData = chartData.length > 0;

    // Calculate average
    const avgScore = hasData
        ? Math.round(chartData.reduce((acc, item) => acc + item.score, 0) / chartData.length)
        : 0;

    // Colors
    const chartColor = "#8b5cf6"; // violet-500

    // Custom tick formatter for X-axis - only show first and last if many points
    const getXAxisTicks = () => {
        if (chartData.length <= 3) {
            return undefined; // Show all ticks
        }
        // Show first and last date only
        return [chartData[0].date, chartData[chartData.length - 1].date];
    };

    return (
        <div className="h-full p-3 rounded-lg bg-white border-2 border-zinc-900 shadow-neo flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="relative font-black text-zinc-900 text-xl tracking-tight">
                    <span className="relative z-10">Performance Trends</span>
                    <span className="absolute bottom-0.5 left-0 w-full h-2 bg-brand-orange/20 -rotate-1 -z-10 rounded-sm"></span>
                </h2>
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
                            margin={{ left: 0, right: 8, top: 10, bottom: 0 }}
                        >
                            {/* Horizontal grid lines at key percentages */}
                            <CartesianGrid
                                horizontal={true}
                                vertical={false}
                                strokeDasharray="3 3"
                                stroke="#e4e4e7"
                            />
                            {/* Reference lines for key percentage markers */}
                            <ReferenceLine y={25} stroke="#f4f4f5" strokeDasharray="3 3" />
                            <ReferenceLine y={50} stroke="#e4e4e7" strokeDasharray="3 3" />
                            <ReferenceLine y={75} stroke="#f4f4f5" strokeDasharray="3 3" />

                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 10, fill: '#71717a', fontWeight: 500 }}
                                ticks={getXAxisTicks()}
                                interval={chartData.length <= 3 ? 0 : "preserveStartEnd"}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickCount={5}
                                domain={[0, 100]}
                                ticks={[0, 25, 50, 75, 100]}
                                tickFormatter={(value) => `${value}%`}
                                tick={{ fontSize: 9, fill: '#a1a1aa' }}
                            />
                            <ChartTooltip
                                cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                content={
                                    <ChartTooltipContent
                                        hideLabel
                                        className="bg-white border-2 border-zinc-900 shadow-neo rounded-md"
                                        formatter={(value, name) => (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-violet-500" />
                                                <span className="font-bold text-zinc-900">{value}%</span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey="score"
                                type="monotone"
                                fill="url(#scoreGradient)"
                                stroke={chartColor}
                                strokeWidth={2.5}
                                dot={{
                                    fill: chartColor,
                                    stroke: '#fff',
                                    strokeWidth: 2,
                                    r: 4
                                }}
                                activeDot={{
                                    fill: chartColor,
                                    stroke: '#fff',
                                    strokeWidth: 2,
                                    r: 6,
                                    className: "drop-shadow-md"
                                }}
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
