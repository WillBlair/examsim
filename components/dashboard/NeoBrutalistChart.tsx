"use client";

import { ChartLineUp } from "@phosphor-icons/react";
import { format } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Dot, ReferenceLine } from "recharts";
import { useState, useEffect } from "react";

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
    const [key, setKey] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => {
            setIsAnimating(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [key]);

    // Transform data for the chart - keep ALL individual data points
    const chartData = data.slice(-10).map((item, index) => ({
        date: format(new Date(item.date), 'MMM d'),
        score: Math.round((item.score / item.total) * 100),
        index: index, // Keep track of index for unique key
    }));

    const hasData = chartData.length > 0;

    // Calculate average
    const avgScore = hasData
        ? Math.round(chartData.reduce((acc, item) => acc + item.score, 0) / chartData.length)
        : 0;

    // Colors
    const chartColor = "#8b5cf6"; // violet-500

    // Calculate appropriate X-axis interval based on data length
    const getXAxisInterval = () => {
        if (chartData.length <= 4) return 0; // Show all labels
        if (chartData.length <= 7) return 1; // Show every other label
        return 2; // Show every 3rd label
    };

    return (
        <div 
            className="h-full p-6 rounded-xl bg-sky-50 border-2 border-zinc-900 shadow-none transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 flex flex-col relative overflow-hidden group"
            onMouseEnter={() => setKey(prev => prev + 1)}
        >
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-sky-200/50 shrink-0 relative z-10">
                <div>
                    <h2 className="font-black text-zinc-900 text-lg tracking-tight">Performance Trends</h2>
                    <p className="text-xs text-sky-900/60 font-bold mt-0.5">Your score history over time</p>
                </div>
                {hasData && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-zinc-900 shadow-none transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-black text-zinc-900 tracking-tight">{avgScore}%</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">avg</span>
                    </div>
                )}
            </div>

            {/* Chart */}
            {hasData ? (
                <div className="flex-1 min-h-0 relative z-10 -ml-2">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <AreaChart
                            key={key}
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 0, right: 40, top: 10, bottom: 0 }}
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
                                dataKey="index"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 10, fill: '#71717a', fontWeight: 500 }}
                                interval={getXAxisInterval()}
                                tickFormatter={(value) => chartData[value]?.date || ''}
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
                            {!isAnimating && (
                                <ChartTooltip
                                    trigger="hover"
                                    cursor={{ stroke: '#18181b', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    content={
                                        <ChartTooltipContent
                                            hideLabel
                                            className="bg-white border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] rounded-lg"
                                            formatter={(value, name) => (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                                                    <span className="font-black text-zinc-900">{value}%</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                            )}
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
                                isAnimationActive={true}
                                animationDuration={500}
                                animationEasing="ease-out"
                                dot={{
                                    fill: chartColor,
                                    stroke: '#fff',
                                    strokeWidth: 2,
                                    r: 6
                                }}
                                activeDot={!isAnimating ? {
                                    fill: chartColor,
                                    stroke: '#fff',
                                    strokeWidth: 3,
                                    r: 8,
                                    className: "drop-shadow-md cursor-pointer"
                                } : false}
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
