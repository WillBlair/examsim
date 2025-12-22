"use client";

import { useState } from "react";
import { UserStats } from "@/lib/services/stats";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StatsPanelProps {
    stats: UserStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
    const [range, setRange] = useState<"weekly" | "all">("weekly");

    const currentData = range === "weekly" ? {
        exams: stats.examsCreatedLast7Days,
        score: stats.avgScoreLast7Days,
        questions: stats.questionsLast7Days,
        time: stats.studyTimeLast7Days,
    } : {
        exams: stats.totalExams,
        score: stats.averageScore,
        questions: stats.totalQuestionsAnswered,
        time: stats.totalStudyHours,
    };

    // Calculate trends for weekly view (vs previous week). 
    const trends = {
        exams: { current: stats.examsCreatedLast7Days, previous: stats.examsCreatedPrev7Days },
        score: { current: stats.avgScoreLast7Days, previous: stats.avgScorePrev7Days },
        questions: { current: stats.questionsLast7Days, previous: stats.questionsPrev7Days },
        time: { current: stats.studyTimeLast7Days, previous: stats.studyTimePrev7Days },
    };

    return (
        <div className="bg-white rounded-lg border-2 border-zinc-900 shadow-neo overflow-hidden flex flex-col">
            {/* Header & Toggle */}
            <div className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div className="flex items-center">
                    <h2 className="relative font-black text-zinc-900 text-xl tracking-tight z-0">
                        <span className="relative z-10">Performance</span>
                        <span className="absolute bottom-0.5 left-0 w-full h-2 bg-brand-orange/20 -rotate-1 -z-10 rounded-sm"></span>
                    </h2>
                </div>

                <div className="flex items-center p-1 bg-zinc-50 rounded-md border border-zinc-200 w-full sm:w-auto">
                    <button
                        onClick={() => setRange("weekly")}
                        className={cn(
                            "flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200",
                            range === "weekly"
                                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                                : "text-zinc-500 hover:text-zinc-900"
                        )}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => setRange("all")}
                        className={cn(
                            "flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200",
                            range === "all"
                                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                                : "text-zinc-500 hover:text-zinc-900"
                        )}
                    >
                        All Time
                    </button>
                </div>
            </div>

            <div className="px-4 pb-4 flex flex-col gap-3">
                {/* Goal / Summary Section - Fixed height for consistency */}
                <div className="h-[120px]">
                    <AnimatePresence mode="wait">
                        {range === "weekly" ? (
                            <motion.div
                                key="weekly-goal"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-lg p-4 border-2 border-zinc-900 shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] h-full flex flex-col justify-center relative overflow-hidden group"
                            >


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
                            </motion.div>
                        ) : (
                            <motion.div
                                key="all-time-summary"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-lg p-4 border-2 border-zinc-900 shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] h-full flex flex-col justify-between relative overflow-hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">Activity</span>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                                        <span>Best streak:</span>
                                        <span className="bg-zinc-100 text-zinc-900 font-black px-2 py-0.5 rounded-md">{stats.bestStreak || stats.streak} days</span>
                                    </div>
                                </div>

                                {/* Activity Strip - 21 days */}
                                <div>
                                    <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
                                        {Array.from({ length: 21 }, (_, idx) => {
                                            const i = 20 - idx;
                                            const activitySet = new Set(stats.activityDates || []);
                                            const today = new Date();
                                            const d = new Date(today);
                                            d.setDate(d.getDate() - i);
                                            const year = d.getFullYear();
                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                            const day = String(d.getDate()).padStart(2, '0');
                                            const dateStr = `${year}-${month}-${day}`;
                                            const hasActivity = activitySet.has(dateStr);
                                            const isToday = i === 0;
                                            const displayDate = isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                                            return (
                                                <div
                                                    key={idx}
                                                    className="group relative"
                                                    style={{ flex: 1 }}
                                                >
                                                    <div
                                                        style={{
                                                            height: '14px',
                                                            borderRadius: '2px',
                                                            backgroundColor: hasActivity ? '#22c55e' : 'transparent',
                                                            border: isToday
                                                                ? '2px solid #18181b'
                                                                : hasActivity
                                                                    ? 'none'
                                                                    : '1px solid #d4d4d8',
                                                        }}
                                                    />
                                                    {/* Hover tooltip */}
                                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                        <div className="bg-zinc-900 text-white text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap">
                                                            {displayDate}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Week markers */}
                                    <div className="flex justify-between mt-1.5 text-[9px] font-medium text-zinc-400">
                                        {(() => {
                                            const today = new Date();
                                            const markers = [];
                                            // First 3 markers show dates
                                            for (let w = 0; w < 3; w++) {
                                                const d = new Date(today);
                                                d.setDate(d.getDate() - (20 - w * 7));
                                                markers.push(
                                                    <span key={w}>
                                                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                );
                                            }
                                            // Last marker shows "Today"
                                            markers.push(<span key={3} className="text-zinc-600 font-bold">Today</span>);
                                            return markers;
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatCard
                        label="Total Exams"
                        value={currentData.exams}
                        icon="CheckCircle"
                        color="bg-blue-500"
                        trend={range === "weekly" ? trends.exams : undefined}
                    />
                    <StatCard
                        label="Avg. Score"
                        value={currentData.score}
                        suffix="%"
                        icon="GraphUp"
                        color="bg-emerald-500"
                        trend={range === "weekly" ? trends.score : undefined}
                    />
                    <StatCard
                        label="Questions"
                        value={currentData.questions}
                        icon="TaskList"
                        color="bg-accent-purple"
                        trend={range === "weekly" ? trends.questions : undefined}
                    />
                    <StatCard
                        label="Study Time"
                        value={currentData.time}
                        suffix="h"
                        icon="Clock"
                        color="bg-amber-500"
                        trend={range === "weekly" ? trends.time : undefined}
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
        <div className="p-2 rounded-lg bg-white border-2 border-zinc-900 shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200">
            <div className="flex items-center justify-between mb-1.5">
                <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white border border-zinc-900", color)}>
                    <AppIcon name={icon as "Rocket" | "GraphUp" | "TaskList" | "CheckCircle" | "Clock" | "Trophy"} className="w-3 h-3" />
                </div>
                {trend && (
                    <div className="scale-[0.8] origin-right">
                        <TrendBadge current={trend.current} previous={trend.previous} />
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-black text-zinc-900 tracking-tight leading-none">{value}</span>
                {suffix && <span className="text-xs font-bold text-zinc-400">{suffix}</span>}
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mt-0.5">{label}</p>
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
