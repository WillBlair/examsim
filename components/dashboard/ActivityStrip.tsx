"use client";

import { useAnimate, stagger } from "framer-motion";
import { useEffect } from "react";
import { UserStats } from "@/lib/services/stats";
import { cn } from "@/lib/utils";
import { Fire } from "@phosphor-icons/react";
import { motion } from "framer-motion";

function useMenuAnimation(isOpen: boolean) {
    const [scope, animate] = useAnimate();

    useEffect(() => {
        animate(
            ".group\\/day",
            { opacity: [0, 1], scale: [0.5, 1] },
            {
                delay: stagger(0.03, { from: "first" }),
                duration: 0.3,
                type: "spring",
                stiffness: 260,
                damping: 20
            }
        );
    }, [isOpen, animate]);

    return scope;
}

export function ActivityStrip({ stats }: { stats: UserStats }) {
    const scope = useMenuAnimation(stats.activityDates.length > 0);

    return (
        <div
            ref={scope}
            className="bg-white rounded-[32px] p-6 border border-indigo-50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative h-full flex flex-col justify-center group"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2 border-b border-zinc-100 pb-2">
                <div>
                    <h2 className="font-black text-indigo-950 text-xl tracking-tight">Activity</h2>
                    <p className="text-xs text-zinc-500 font-bold mt-0.5 uppercase tracking-wide">Last 21 days of study</p>
                </div>
                <div className="flex items-center justify-center gap-2 bg-emerald-50 px-3 h-8 w-[125px] rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-black text-emerald-700 tracking-tight">{stats.streak}</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Streak</span>
                </div>
            </div>

            {/* Calendar Strip - Center Content */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex gap-1.5 w-full h-12">
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
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.03, type: "spring" }}
                                className="group/day relative flex-1"
                            >
                                <div
                                    className={cn(
                                        "w-full h-full rounded-md transition-all duration-300",
                                        hasActivity
                                            ? "bg-emerald-500 shadow-sm" // Warmer/brand green for active
                                            : "bg-white border border-zinc-200 shadow-sm group-hover/day:border-zinc-300", // Solid white with border instead of dashed
                                        isToday && !hasActivity && "border-emerald-300 bg-emerald-50" // Lighter green for today without activity
                                    )}
                                />
                                {/* Hover tooltip */}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/day:opacity-100 transition-opacity pointer-events-none z-10">
                                    <div className="bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-xl">
                                        {displayDate}
                                    </div>
                                    {/* Arrow */}
                                    <div className="w-2 h-2 bg-zinc-800 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
