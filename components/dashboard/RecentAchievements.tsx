"use client";

import { Trophy, Medal, Star, Lightning, Target, Crown, Sparkle, Fire } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Achievement {
    id: string;
    title: string;
    tier: 'bronze' | 'silver' | 'gold';
    category: 'creation' | 'completion' | 'mastery' | 'streak';
    unlocked: boolean;
}

export function RecentAchievements({ achievements }: { achievements: Achievement[] }) {
    const hasAchievements = achievements.length > 0;

    const getAchievementIcon = (category: string) => {
        switch (category) {
            case 'creation': return <Sparkle weight="fill" className="w-5 h-5" />;
            case 'completion': return <CheckCircle weight="fill" className="w-5 h-5" />;
            case 'mastery': return <Crown weight="fill" className="w-5 h-5" />;
            case 'streak': return <Fire weight="fill" className="w-5 h-5" />;
            default: return <Trophy weight="fill" className="w-5 h-5" />;
        }
    };

    return (
        <div className="bg-white rounded-[32px] border border-indigo-50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 p-6 h-full flex flex-col group min-h-[200px]">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-100">
                <div>
                    <h2 className="font-black text-indigo-950 text-xl tracking-tight">Achievements</h2>
                    <p className="text-xs text-zinc-500 font-bold mt-0.5 uppercase tracking-wide">Recent unlocks</p>
                </div>
                <div className="flex items-center justify-center gap-2 bg-amber-50 px-3 h-8 w-[125px] rounded-full border border-amber-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-sm font-black text-amber-700 tracking-tight">{achievements.length}</span>
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Unlocked</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {hasAchievements ? (
                    <div className="flex flex-col gap-3 py-2">
                        {achievements.map((achievement) => (
                            <div key={achievement.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:bg-white group-hover:border-indigo-50 transition-colors shadow-sm">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border shrink-0",
                                    achievement.tier === 'gold' && "bg-gradient-to-br from-amber-100 to-amber-50 border-amber-200 text-amber-600",
                                    achievement.tier === 'silver' && "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200 text-slate-600",
                                    achievement.tier === 'bronze' && "bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200 text-orange-700",
                                )}>
                                    {getAchievementIcon(achievement.category)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-zinc-900 text-sm leading-tight truncate pr-2">{achievement.title}</h4>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-wide mt-0.5 inline-block px-1.5 py-0.5 rounded border",
                                        achievement.tier === 'gold' && "bg-amber-50 text-amber-700 border-amber-100",
                                        achievement.tier === 'silver' && "bg-slate-50 text-slate-600 border-slate-100",
                                        achievement.tier === 'bronze' && "bg-orange-50 text-orange-700 border-orange-100",
                                    )}>
                                        {achievement.tier}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 gap-2 min-h-[100px]">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-1 border border-zinc-100">
                            <Trophy weight="duotone" className="w-6 h-6 opacity-30" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-500">No achievements yet</p>
                            <p className="text-xs text-zinc-400 mt-1 max-w-[150px] mx-auto">Start taking exams to earn badges!</p>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

// Helper for icons if needed inline or imported
function CheckCircle(props: any) { return <Sparkle {...props} /> } // Quick fix if imports missing, but I added imports above.
