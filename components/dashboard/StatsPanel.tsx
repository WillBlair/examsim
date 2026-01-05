"use client";

import { UserStats } from "@/lib/services/stats";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsPanelProps {
    stats: UserStats;
    className?: string;
}

// ... imports remain the same ...

export function StatsPanel({ stats, className }: StatsPanelProps) {
    return (
        <div className={cn("bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[32px] p-6 shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1.5 h-full min-h-[260px] flex flex-col justify-between relative overflow-hidden group", className)}>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

            {/* Header / Weekly Goal */}
            <div className="relative z-10">
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h3 className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 w-fit backdrop-blur-md">Weekly Goal</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-4xl font-black text-white tracking-tighter leading-none drop-shadow-sm">{Math.min(stats.examsCreatedLast7Days, 5)}</span>
                            <span className="text-lg font-bold text-indigo-200">/ 5</span>
                        </div>
                    </div>
                    {stats.examsCreatedLast7Days >= 5 && (
                        <div className="px-3 py-1.5 rounded-full bg-white text-[10px] font-bold uppercase text-indigo-600 tracking-wide shadow-sm mb-1">
                            Goal Met!
                        </div>
                    )}
                </div>

                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stats.examsCreatedLast7Days / 5) * 100, 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0 }}
                        className="h-full bg-white rounded-full relative shadow-sm"
                    >
                        <div className="absolute inset-0 bg-white opacity-50" />
                    </motion.div>
                </div>
            </div>

            {/* Stats Grid - Glassmorphic & Integrated */}
            <div className="grid grid-cols-4 relative z-10 mt-6 pt-6 border-t border-white/10 divide-x divide-white/10">
                <MiniStat
                    label="Exams"
                    value={stats.examsCreatedLast7Days}
                    textColor="text-white"
                    labelColor="text-indigo-200"
                />
                <MiniStat
                    label="Score"
                    value={Math.round(stats.avgScoreLast7Days || 0)}
                    suffix="%"
                    textColor="text-white"
                    labelColor="text-indigo-200"
                />
                <MiniStat
                    label="Questions"
                    value={stats.questionsLast7Days}
                    textColor="text-white"
                    labelColor="text-indigo-200"
                />
                <MiniStat
                    label="Hours"
                    value={Math.round(stats.studyTimeLast7Days * 10) / 10}
                    textColor="text-white"
                    labelColor="text-indigo-200"
                />
            </div>
        </div>
    );
}

function MiniStat({
    label,
    value,
    suffix,
    textColor,
    labelColor,
}: {
    label: string;
    value: number;
    suffix?: string;
    textColor?: string;
    labelColor?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center text-center px-1">
            <div className="flex items-baseline justify-center gap-0.5 mb-1">
                <span className={cn("text-2xl font-black tracking-tighter leading-none drop-shadow-sm", textColor)}>{value}</span>
                {suffix && <span className={cn("text-[10px] font-bold opacity-80", textColor)}>{suffix}</span>}
            </div>
            <span className={cn("text-[9px] font-bold uppercase tracking-wide", labelColor)}>{label}</span>
        </div>
    );
}

function StatCard({
    label,
    value,
    previousValue,
    suffix,
    icon,
    color,
    textColor = "text-zinc-900",
    iconColor = "text-zinc-900",
    pattern
}: {
    label: string;
    value: number;
    previousValue: number;
    suffix?: string;
    icon: string;
    color: string;
    textColor?: string;
    iconColor?: string;
    pattern?: 'circles' | 'lines' | 'dots' | 'waves';
}) {
    const trend = calculateTrend(value, previousValue);
    const isPositive = trend >= 0;

    return (
        <div className={cn("relative overflow-hidden rounded-3xl p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 border border-indigo-50 bg-white", color)}>
            {/* Background Patterns */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none text-zinc-900/10">
                {pattern === 'circles' && (
                    <svg className="absolute right-0 top-0 h-full w-2/3" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="100" cy="0" r="50" fill="currentColor" />
                        <circle cx="100" cy="100" r="30" fill="currentColor" />
                    </svg>
                )}
                {pattern === 'lines' && (
                    <svg className="absolute right-0 top-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 L100 0" stroke="currentColor" strokeWidth="20" />
                    </svg>
                )}
                {pattern === 'dots' && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle,currentColor_2px,transparent_2px)] [background-size:16px_16px]" />
                )}
                {pattern === 'waves' && (
                    <svg className="absolute right-0 bottom-0 h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="8" fill="none" />
                        <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="8" fill="none" />
                        <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="8" fill="none" />
                    </svg>
                )}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                <div className="flex items-start justify-between">
                    <div className={cn("p-2 rounded-xl border", iconColor)}>
                        <AppIcon name={icon as any} className="w-4 h-4" />
                    </div>
                    {trend !== 0 && (
                        <div className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full", isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                            <span>{isPositive ? '↑' : '↓'} {Math.abs(trend)}%</span>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className={cn("text-[11px] font-bold uppercase tracking-wide mb-1 text-zinc-400")}>{label}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tracking-tight text-zinc-900">{value}</span>
                        {suffix && <span className="text-xs font-bold text-zinc-400">{suffix}</span>}
                    </div>
                    <p className="text-[10px] mt-1 font-bold text-zinc-300">vs last 7 days</p>
                </div>
            </div>
        </div>
    );
}

function calculateTrend(current: number, previous: number) {
    if (current === 0 && previous === 0) return 0;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
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
