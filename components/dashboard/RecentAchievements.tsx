"use client";

import Link from "next/link";
import { Trophy, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { BadgeIcon } from "./BadgeIcon";

interface Achievement {
    id: string;
    title: string;
    tier: "bronze" | "silver" | "gold" | "diamond";
    category: "creation" | "completion" | "mastery" | "streak" | "dedication";
}

interface RecentAchievementsProps {
    achievements: Achievement[];
}



const tierLabels = {
    bronze: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
    silver: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
    gold: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
    diamond: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-300" },
};

export function RecentAchievements({ achievements }: RecentAchievementsProps) {
    const displayAchievements = achievements.slice(0, 3);

    if (displayAchievements.length === 0) {
        return (
            <div className="bg-white rounded-xl border-2 border-zinc-900 shadow-none transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 p-4 h-full flex flex-col justify-center text-center group">
                 <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] mx-auto flex items-center justify-center mb-2">
                    <Trophy weight="fill" className="w-5 h-5 text-amber-700" />
                 </div>
                 <h2 className="font-black text-zinc-900 text-sm">No Achievements Yet</h2>
                 <p className="text-[10px] font-bold text-zinc-500 mt-0.5">
                    Complete exams to unlock your first badge!
                 </p>
                 <Link
                    href="/dashboard/achievements"
                    className="mt-3 text-[10px] font-black text-brand-orange hover:text-orange-600 transition-colors uppercase tracking-wide"
                >
                    View All Badges
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-violet-50 rounded-xl border-2 border-zinc-900 shadow-none transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 p-4 h-full flex flex-col group">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-violet-200/50">
                 <div>
                     <h2 className="font-black text-zinc-900 text-lg tracking-tight">Achievements</h2>
                     <p className="text-xs text-violet-900/60 font-bold mt-0.5">Recent unlocks</p>
                </div>
                <Link
                    href="/dashboard/achievements"
                    className="group inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white border-2 border-zinc-900 shadow-none text-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 transition-all duration-200"
                >
                    <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 flex-1">
                {displayAchievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className="flex flex-col items-center justify-center text-center p-2 rounded-lg border-2 border-zinc-900 bg-white shadow-none hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 transition-all duration-200 group"
                    >
                        {/* Scale down the badge icon */}
                        <div className="w-8 h-8 mb-1 overflow-hidden flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <div className="scale-[0.35] origin-center">
                                <BadgeIcon
                                    tier={achievement.tier}
                                    category={achievement.category}
                                    unlocked={true}
                                />
                            </div>
                        </div>
                        <p className="text-[9px] font-black text-zinc-900 leading-tight line-clamp-2">
                            {achievement.title}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
