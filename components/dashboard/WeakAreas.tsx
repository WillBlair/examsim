import { CheckCircle, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WeakArea {
  subtopic: string;
  score: number;
  totalQuestions: number;
}

interface WeakAreasProps {
  weakAreas: WeakArea[];
}

function getSimpleTopic(subtopic: string): string {
  const parts = subtopic.split(/\s*[>\/\-]\s*/);
  return parts[parts.length - 1].trim();
}

export function WeakAreas({ weakAreas }: WeakAreasProps) {
  // Use all weak areas, not just top 3, now that it's scrollable
  const previewAreas = weakAreas;

    return (
    <div className="animate-fade-in-up h-full">
      <div className="p-6 rounded-xl bg-rose-50 border-2 border-zinc-900 shadow-none transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 relative overflow-hidden h-full flex flex-col group">
        {/* Subtle accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        {weakAreas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center relative z-10 gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border-2 border-zinc-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
              <CheckCircle weight="fill" className="w-6 h-6 text-zinc-900" />
            </div>
            <div>
              <p className="font-black text-zinc-900">All Systems Go</p>
              <p className="text-xs font-bold text-rose-900/60 mt-1">No weak areas detected yet.</p>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col h-full min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-rose-200/50 shrink-0">
               <div>
                    <h2 className="font-black text-zinc-900 text-lg tracking-tight">Focus Areas</h2>
                    <p className="text-xs text-rose-900/60 font-bold mt-0.5">Topics needing attention</p>
                </div>
              <Link
                href="/dashboard/practice"
                className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border-2 border-zinc-900 shadow-none text-zinc-900 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
            </div>

            {/* Topic List */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
              {previewAreas.map((area) => {
                const isCritical = area.score < 40;
                const simpleTopic = getSimpleTopic(area.subtopic);

                return (
                  <div
                    key={area.subtopic}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border-2 border-zinc-900 shadow-none hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 transition-all group cursor-pointer"
                  >
                    {/* Score Ring */}
                    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={isCritical ? "#fee2e2" : "#f4f4f5"}
                                strokeWidth="4"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={isCritical ? "#ef4444" : "#f59e0b"}
                                strokeWidth="4"
                                strokeDasharray={`${area.score}, 100`}
                            />
                        </svg>
                         <span className={cn(
                             "absolute text-[10px] font-black",
                             isCritical ? "text-red-600" : "text-amber-600"
                         )}>
                             {Math.round(area.score)}%
                         </span>
                    </div>

                    {/* Topic */}
                    <div className="flex-1 min-w-0">
                        <span className="block text-sm font-black text-zinc-900 truncate group-hover:text-brand-orange transition-colors">
                        {simpleTopic}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold block mt-0.5">
                        {area.totalQuestions} questions missed
                        </span>
                    </div>

                    {/* Action */}
                    <div className="w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                        <ArrowRight weight="bold" className="w-4 h-4 text-zinc-900" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
