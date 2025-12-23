"use client";

import { UserStats } from "@/lib/services/stats";
import { cn } from "@/lib/utils";

interface ActivityStripProps {
    stats: UserStats;
}

export function ActivityStrip({ stats }: ActivityStripProps) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border-2 border-zinc-900 shadow-none transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 relative h-full flex flex-col justify-center group">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/50">
                <div>
                     <h2 className="font-black text-zinc-900 text-lg tracking-tight">Activity</h2>
                     <p className="text-xs text-slate-500 font-bold mt-0.5">Last 21 days of study</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Best Streak</span>
                    <div className="flex items-center gap-1.5 bg-white text-zinc-900 border-2 border-zinc-900 px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-black text-xs">{stats.bestStreak || stats.streak} days</span>
                    </div>
                </div>
            </div>

            {/* Activity Strip - 21 days */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex gap-1.5 w-full h-10">
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
                                className="group/day relative flex-1"
                            >
                                <div
                                    className={cn(
                                        "w-full h-full rounded-sm transition-all duration-300 border-2",
                                        hasActivity 
                                            ? "bg-emerald-500 border-zinc-900" 
                                            : "bg-white border-zinc-200 hover:border-zinc-400",
                                        isToday && !hasActivity && "border-2 border-dashed border-zinc-400 bg-zinc-50"
                                    )}
                                />
                                {/* Hover tooltip */}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover/day:opacity-100 transition-opacity pointer-events-none z-10">
                                    <div className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                                        {displayDate}
                                    </div>
                                    {/* Arrow */}
                                    <div className="w-2 h-2 bg-zinc-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1.5"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
