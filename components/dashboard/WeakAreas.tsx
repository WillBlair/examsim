import { CheckCircle, ArrowRight, Target } from "@phosphor-icons/react/dist/ssr";
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

export function WeakAreas({ weakAreas }: WeakAreasProps) {
  return (
    <div className="h-full animate-fade-in-up">
      <div className="h-full p-6 rounded-lg bg-white border-2 border-zinc-900 shadow-neo flex flex-col relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {weakAreas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <CheckCircle weight="fill" className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-zinc-900">All Systems Go</p>
              <p className="text-xs text-zinc-500 mt-1">No major weak areas detected in your recent performance.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {weakAreas.slice(0, 4).map((area) => {
                // Simplified logic: red for really bad, amber for warning
                const isCritical = area.score < 40;

                return (
                  <div key={area.subtopic}>
                    <div className="group flex items-center justify-between p-3 rounded-sm border border-zinc-200 bg-white hover:bg-red-50/10 hover:border-zinc-900 hover:shadow-neo-sm transition-all">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold text-zinc-700 truncate pr-2">
                            {area.subtopic}
                          </p>
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            isCritical ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                          )}>
                            {Math.round(area.score)}%
                          </span>
                        </div>

                        {/* Clean Progress Bar */}
                        <div className="h-1.5 w-full bg-zinc-100 rounded-[3px] overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-[2px] transition-all duration-500",
                              isCritical ? "bg-red-500" : "bg-amber-500"
                            )}
                            style={{ width: `${area.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link href="/dashboard/practice">
                        <button className="p-2 rounded-md text-zinc-400 hover:text-brand-orange hover:bg-emerald-50 transition-colors">
                          <Target weight="duotone" className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {weakAreas.length > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-100 text-center">
              <Link href="/dashboard/practice" className="inline-flex items-center text-xs font-medium text-brand-orange hover:text-emerald-600 transition-colors">
                Practice these topics <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
