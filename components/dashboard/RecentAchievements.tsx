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
            <div className="bg-white rounded-lg border-2 border-zinc-900 shadow-neo p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="relative font-black text-zinc-900 text-xl tracking-tight z-0 flex items-center gap-2">
                         <span className="relative z-10 flex items-center gap-2">
                             <Trophy weight="fill" className="w-5 h-5 text-amber-500" />
                             Recent Achievements
                         </span>
                        <span className="absolute bottom-0.5 left-0 w-full h-2 bg-brand-orange/20 -rotate-1 -z-10 rounded-sm"></span>
                    </h2>
                    <Link
                        href="/dashboard/achievements"
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                    >
                        View All <ArrowRight weight="bold" className="w-3 h-3" />
                    </Link>
                </div>
                <p className="text-sm text-zinc-500 text-center py-4">
                    Complete exams to unlock achievements!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border-2 border-zinc-900 shadow-neo p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                 <h2 className="relative font-black text-zinc-900 text-xl tracking-tight z-0 flex items-center gap-2">
                     <span className="relative z-10 flex items-center gap-2">
                         <Trophy weight="fill" className="w-5 h-5 text-amber-500" />
                         Recent Achievements
                     </span>
                    <span className="absolute bottom-0.5 left-0 w-full h-2 bg-brand-orange/20 -rotate-1 -z-10 rounded-sm"></span>
                </h2>
                <Link
                    href="/dashboard/achievements"
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                    View All <ArrowRight weight="bold" className="w-3 h-3" />
                </Link>
            </div>

            <div className="flex gap-2 flex-1 min-h-0">
                {displayAchievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className="flex-1 flex flex-col items-center justify-center text-center p-2 rounded-lg border border-zinc-200 bg-zinc-50/50 hover:bg-white transition-colors"
                    >
                        {/* Scale down the badge icon */}
                        <div className="w-10 h-10 mb-1.5 overflow-hidden flex items-center justify-center">
                            <div className="scale-[0.42] origin-center">
                                <BadgeIcon
                                    tier={achievement.tier}
                                    category={achievement.category}
                                    unlocked={true}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-700 leading-tight line-clamp-2">
                            {achievement.title}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
