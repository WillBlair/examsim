"use client";

import { UserStats } from "@/lib/services/stats";

interface ActivityStripProps {
    stats: UserStats;
}

export function ActivityStrip({ stats }: ActivityStripProps) {
    return (
        <div className="bg-white rounded-lg p-6 border-2 border-zinc-900 shadow-neo relative overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">Activity</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                    <span>Best streak:</span>
                    <span className="bg-zinc-100 text-zinc-900 font-black px-2 py-0.5 rounded-md">{stats.bestStreak || stats.streak} days</span>
                </div>
            </div>

            {/* Activity Strip - 21 days */}
            <div>
                <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
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
                                        height: '32px',
                                        borderRadius: '4px',
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
        </div>
    );
}
