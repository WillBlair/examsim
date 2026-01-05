"use client";

import { CheckCircle, ArrowRight, Target, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WeakArea {
  topic: string;
  accuracy: number;
  questionsMissed: number;
}

interface WeakAreasProps {
  weakAreas: WeakArea[];
}

export function WeakAreas({ weakAreas }: WeakAreasProps) {
  const router = useRouter();

  if (!weakAreas) return null;

  return (
    <div className="h-full">
      <div className="p-6 rounded-[32px] bg-white border border-indigo-50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden h-full flex flex-col group">

        {weakAreas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center relative z-10 gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-2 border border-emerald-100">
              <Target weight="duotone" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-indigo-950 text-lg tracking-tight">All Systems Go</h3>
              <p className="text-zinc-400 text-xs font-bold max-w-[200px] mx-auto mt-1">
                Complete more exams to identify areas for improvement.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-100 shrink-0 relative z-10">
              <div>
                <h2 className="font-black text-rose-950 text-xl tracking-tight">Focus Areas</h2>
                <p className="text-xs text-zinc-500 font-bold mt-0.5 uppercase tracking-wide">Topics needing attention</p>
              </div>
              <div className="flex items-center justify-center gap-2 bg-rose-50 px-3 h-8 w-[125px] rounded-full border border-rose-100">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-sm font-black text-rose-700 tracking-tight">{weakAreas.length}</span>
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Alerts</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 relative z-10 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0 py-1">
              {weakAreas.slice(0, 3).map((area, i) => (
                <div
                  key={i}
                  className="group/item flex items-center justify-between p-3.5 rounded-xl bg-white border-2 border-rose-200 shadow-[0_2px_8px_-2px_rgba(244,63,94,0.05)] transition-all duration-300 hover:border-rose-300 hover:bg-rose-50/30 hover:shadow-md cursor-pointer"
                  onClick={() => router.push(`/dashboard/new?topic=${encodeURIComponent(area.topic)}`)}
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="font-bold text-zinc-900 truncate text-sm group-hover/item:text-rose-700 transition-colors">
                      {area.topic}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/50 group-hover/item:border-rose-200 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                          {area.questionsMissed} Missed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-rose-900/40 group-hover/item:text-rose-500 transition-colors">
                      {isNaN(area.accuracy) ? '0' : Math.round(area.accuracy)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {weakAreas.length > 3 && (
              <div className="mt-auto pt-3 text-center text-[10px] font-bold text-rose-300 uppercase tracking-wide cursor-pointer hover:text-rose-500 transition-colors">
                + {weakAreas.length - 3} more topics
              </div>
            )}

            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10 pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
}
