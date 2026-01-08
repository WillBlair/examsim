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
    const progress = Math.min((stats.examsCreatedLast7Days / 5) * 100, 100);

    return (
        <div className={cn("bg-[#7C3BED] rounded-[32px] p-6 h-full min-h-[260px] flex flex-col justify-between overflow-hidden relative transition-all duration-300 hover:-translate-y-1.5 shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 group", className)}>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/8 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-fuchsia-500/25 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3" />

            {/* Dot pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:16px_16px] pointer-events-none" />


            {/* Header / Weekly Goal */}
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-3">
                            <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.15em]">Weekly Goal</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white tracking-tighter leading-none">
                                {Math.min(stats.examsCreatedLast7Days, 5)}
                            </span>
                            <span className="text-xl font-bold text-white/40 ml-1">/ 5</span>
                        </div>
                    </div>
                    {stats.examsCreatedLast7Days >= 5 && (
                        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-[11px] font-black uppercase text-amber-900 tracking-wide shadow-lg shadow-amber-400/40 animate-pulse">
                            Goal Met!
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-white rounded-full"
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 relative z-10 mt-auto pt-5">
                {[
                    { label: "Exams", value: stats.examsCreatedLast7Days },
                    { label: "Score", value: Math.round(stats.avgScoreLast7Days || 0), suffix: "%" },
                    { label: "Questions", value: stats.questionsLast7Days },
                    { label: "Hours", value: Math.round(stats.studyTimeLast7Days * 10) / 10 },
                ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/30">
                        <div className="flex items-baseline justify-center gap-0.5 mb-0.5">
                            <span className="text-xl font-black text-white tracking-tight">{stat.value}</span>
                            {stat.suffix && <span className="text-xs font-bold text-white/60">{stat.suffix}</span>}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">{stat.label}</span>
                    </div>
                ))}
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
