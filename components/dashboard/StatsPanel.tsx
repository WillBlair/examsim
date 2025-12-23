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
        <div className={cn("flex flex-col gap-3", className)}>
            {/* Weekly Goal Section */}
            <div className="bg-emerald-50/50 rounded-xl border-2 border-zinc-900 p-2.5 shadow-none transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 flex flex-col justify-between min-h-[90px] relative overflow-hidden group">
                <div className="flex items-center justify-between relative z-10 border-b border-emerald-900/5 pb-1.5 mb-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-white shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                            <AppIcon name="Rocket" className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Weekly Goal</span>
                    </div>
                    {stats.examsCreatedLast7Days >= 5 && (
                        <div className="px-1.5 py-0.5 rounded border-2 border-zinc-900 bg-white text-[9px] font-black uppercase text-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transform rotate-2">
                            Hit!
                        </div>
                    )}
                </div>

                <div className="relative z-10 mt-1">
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                            {Math.min(stats.examsCreatedLast7Days, 5)}
                        </span>
                        <span className="text-xs font-bold text-zinc-500/80">/ 5 Exams</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-emerald-900 uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{Math.round((Math.min(stats.examsCreatedLast7Days, 5) / 5) * 100)}%</span>
                        </div>
                        <div className="h-3 w-full bg-white rounded-full border-2 border-zinc-900 overflow-hidden p-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((stats.examsCreatedLast7Days / 5) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-emerald-500 rounded-full border border-zinc-900 relative shadow-sm"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:6px_6px]" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    label="Exams Created"
                    value={stats.examsCreatedLast7Days}
                    previousValue={stats.examsCreatedPrev7Days}
                    icon="CheckCircle"
                    color="bg-zinc-900"
                    pattern="circles"
                />
                <StatCard
                    label="Avg. Score"
                    value={stats.avgScoreLast7Days}
                    previousValue={stats.avgScorePrev7Days}
                    suffix="%"
                    icon="GraphUp"
                    color="bg-emerald-600"
                    pattern="lines"
                />
                <StatCard
                    label="Questions"
                    value={stats.questionsLast7Days}
                    previousValue={stats.questionsPrev7Days}
                    icon="TaskList"
                    color="bg-violet-600"
                    pattern="dots"
                />
                <StatCard
                    label="Study Time"
                    value={stats.studyTimeLast7Days}
                    previousValue={stats.studyTimePrev7Days}
                    suffix="h"
                    icon="Clock"
                    color="bg-orange-500"
                    pattern="waves"
                />
            </div>
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
    pattern
}: {
    label: string;
    value: number;
    previousValue: number;
    suffix?: string;
    icon: string;
    color: string;
    pattern?: 'circles' | 'lines' | 'dots' | 'waves';
}) {
    const trend = calculateTrend(value, previousValue);
    const isPositive = trend >= 0;

    return (
        <div className={cn("relative overflow-hidden rounded-xl p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-1", color)}>
            {/* Background Patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                {pattern === 'circles' && (
                    <svg className="absolute right-0 top-0 h-full w-2/3" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="100" cy="0" r="50" fill="white" />
                        <circle cx="100" cy="100" r="30" fill="white" />
                    </svg>
                )}
                {pattern === 'lines' && (
                    <svg className="absolute right-0 top-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 L100 0" stroke="white" strokeWidth="20" />
                    </svg>
                )}
                {pattern === 'dots' && (
                     <div className="absolute inset-0 bg-[radial-gradient(circle,white_2px,transparent_2px)] [background-size:16px_16px]" />
                )}
                {pattern === 'waves' && (
                     <svg className="absolute bottom-0 left-0 w-full h-1/2" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 30 50 70 50 100 100 Z" fill="white" />
                     </svg>
                )}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-2">
                <div className="flex items-start justify-between">
                    <div className="p-1 bg-white/20 rounded-md backdrop-blur-sm">
                        <AppIcon name={icon as any} className="w-3.5 h-3.5 text-white" />
                    </div>
                    {trend !== 0 && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/90 bg-white/10 px-1.5 py-0.5 rounded-full backdrop-blur-md">
                            <span>{isPositive ? '↑' : '↓'} {Math.abs(trend)}%</span>
                        </div>
                    )}
                </div>
                
                <div>
                    <h3 className="text-white/80 text-[10px] font-medium tracking-wide mb-0.5">{label}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white tracking-tight">{value}</span>
                        {suffix && <span className="text-xs font-medium text-white/60">{suffix}</span>}
                    </div>
                    <p className="text-white/50 text-[9px] mt-0.5 font-medium">vs last 7 days</p>
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
