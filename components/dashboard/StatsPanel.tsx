"use client";

import { UserStats } from "@/lib/services/stats";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsPanelProps {
    stats: UserStats;
    className?: string;
}

export function StatsPanel({ stats, className }: StatsPanelProps) {
    return (
        <div className={cn("bg-white rounded-lg border-2 border-zinc-900 shadow-neo overflow-hidden", className)}>
            {/* Header */}
            <div className="p-4 pb-3 bg-white">
                <div className="flex items-center">
                    <h2 className="relative font-black text-zinc-900 text-xl tracking-tight z-0">
                        <span className="relative z-10">Your Stats</span>
                        <span className="absolute bottom-0.5 left-0 w-full h-2 bg-brand-orange/20 -rotate-1 -z-10 rounded-sm"></span>
                    </h2>
                </div>
            </div>

            <div className="px-4 pb-4 flex flex-col gap-3">
                {/* Weekly Goal Section */}
                <div className="h-[120px]">
                    <div className="bg-white rounded-lg p-4 border-2 border-zinc-900 shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] h-full flex flex-col justify-center relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-brand-orange text-white border-2 border-zinc-900 flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(24,24,27,1)]">
                                        <AppIcon name="Rocket" className="w-4 h-4" />
                                    </div>
                                    <span className="text-base font-black text-zinc-900 uppercase tracking-tight">Weekly Goal</span>
                                </div>
                                <span className="text-xs font-bold text-zinc-900 bg-white px-3 py-1 rounded-md border-2 border-zinc-900 shadow-[1px_1px_0px_0px_rgba(24,24,27,1)]">
                                    {Math.min(stats.examsCreatedLast7Days, 5)}/5
                                </span>
                            </div>

                            <div className="h-5 w-full bg-white rounded-full overflow-hidden border-2 border-zinc-900 relative">
                                {/* Striped Background for empty part */}
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#09090b_1px,transparent_1px)] [background-size:4px_4px]" />

                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((stats.examsCreatedLast7Days / 5) * 100, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-brand-orange rounded-full relative border-r-2 border-zinc-900"
                                    style={{ boxSizing: 'content-box', marginRight: '-2px' }}
                                >
                                    {/* Optional texture on the bar itself */}
                                    <div className="absolute inset-0 bg-white/10" />
                                </motion.div>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                                    {stats.examsCreatedLast7Days >= 5
                                        ? "Target hit! Splendid work."
                                        : `${5 - stats.examsCreatedLast7Days} exams away from target`
                                    }
                                </p>
                                {stats.examsCreatedLast7Days >= 5 && (
                                    <AppIcon name="Fire" className="w-4 h-4 text-brand-orange animate-bounce" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatCard
                        label="Total Exams"
                        value={stats.examsCreatedLast7Days}
                        icon="CheckCircle"
                        color="bg-blue-500"
                    />
                    <StatCard
                        label="Avg. Score"
                        value={stats.avgScoreLast7Days}
                        suffix="%"
                        icon="GraphUp"
                        color="bg-emerald-500"
                    />
                    <StatCard
                        label="Questions"
                        value={stats.questionsLast7Days}
                        icon="TaskList"
                        color="bg-accent-purple"
                    />
                    <StatCard
                        label="Study Time"
                        value={stats.studyTimeLast7Days}
                        suffix="h"
                        icon="Clock"
                        color="bg-amber-500"
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    suffix,
    icon,
    color,
    trend
}: {
    label: string;
    value: number;
    suffix?: string;
    icon: string;
    color: string;
    trend?: { current: number; previous: number };
}) {
    return (
        <div className="p-2.5 rounded-lg bg-white border-2 border-zinc-900 shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
                <div className={cn("w-7 h-7 rounded-md flex items-center justify-center text-white border border-zinc-900", color)}>
                    <AppIcon name={icon as "Rocket" | "GraphUp" | "TaskList" | "CheckCircle" | "Clock" | "Trophy"} className="w-3.5 h-3.5" />
                </div>
                {trend && (
                    <TrendBadge current={trend.current} previous={trend.previous} />
                )}
            </div>
            <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-black text-zinc-900 tracking-tight leading-none">{value}</span>
                {suffix && <span className="text-xs font-bold text-zinc-400">{suffix}</span>}
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-1">{label}</p>
        </div>
    );
}
function TrendBadge({ current, previous }: { current: number; previous: number }) {
    if (current === 0 && previous === 0) return null;

    const percentChange = previous === 0
        ? (current > 0 ? 100 : 0)
        : Math.round(((current - previous) / previous) * 100);

    const isPositive = percentChange > 0;
    const isNeutral = percentChange === 0;

    return (
        <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm border",
            isPositive
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : isNeutral
                    ? "bg-zinc-100 text-zinc-500 border-zinc-200"
                    : "bg-red-100 text-red-700 border-red-200"
        )}>
            {isPositive ? "↑" : isNeutral ? "–" : "↓"} {Math.abs(percentChange)}%
        </div>
    );
}

// GitHub-style activity calendar
function ActivityCalendar({ activityDates }: { activityDates: string[] }) {
    const activitySet = new Set(activityDates);

    // Generate last 28 days (4 weeks) for better fit
    const days: { date: string; hasActivity: boolean }[] = [];
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        // Use local date format YYYY-MM-DD
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        days.push({
            date: dateStr,
            hasActivity: activitySet.has(dateStr)
        });
    }

    // Split into 4 weeks (7 days each)
    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div className="flex justify-between w-full">
            {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                    {week.map((day, di) => (
                        <div
                            key={di}
                            className={cn(
                                "w-4 h-4 rounded-sm",
                                day.hasActivity
                                    ? "bg-brand-green"
                                    : "bg-zinc-100"
                            )}
                            title={`${day.date}${day.hasActivity ? ' - Active' : ''}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
