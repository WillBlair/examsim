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
  const previewAreas = weakAreas.slice(0, 3);

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <div className="p-4 rounded-lg bg-white border-2 border-zinc-900 shadow-neo relative overflow-hidden flex-1 flex flex-col">
        {/* Subtle accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-full blur-xl pointer-events-none" />

        {weakAreas.length === 0 ? (
          <div className="flex items-center gap-3 py-2 relative z-10">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">All Systems Go</p>
              <p className="text-[10px] text-zinc-500">No weak areas detected.</p>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="relative font-black text-zinc-900 text-xl tracking-tight">
                <span className="relative z-10">Focus Areas</span>
                <span className="absolute bottom-0.5 left-0 w-full h-2 bg-brand-orange/20 -rotate-1 -z-10 rounded-sm"></span>
              </h2>
              <Link
                href="/dashboard/practice"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-[11px] font-bold border-2 border-zinc-900 shadow-neo-sm hover:bg-brand-orange hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                Review Topics <ArrowRight weight="bold" className="w-3 h-3" />
              </Link>
            </div>

            {/* Topic List */}
            <div className="space-y-1">
              {previewAreas.map((area) => {
                const isCritical = area.score < 40;
                const simpleTopic = getSimpleTopic(area.subtopic);

                return (
                  <div
                    key={area.subtopic}
                    className="flex items-center gap-3 p-2 -mx-1 rounded-md hover:bg-zinc-100/50 transition-colors group cursor-pointer"
                  >
                    {/* Score Badge */}
                    <div className={cn(
                      "w-10 h-6 rounded flex items-center justify-center text-[10px] font-black shrink-0 border",
                      isCritical
                        ? "bg-red-50 text-red-600 border-red-300"
                        : "bg-amber-50 text-amber-600 border-amber-300"
                    )}>
                      {Math.round(area.score)}%
                    </div>

                    {/* Topic */}
                    <span className="text-xs font-bold text-zinc-800 truncate flex-1 group-hover:text-zinc-900">
                      {simpleTopic}
                    </span>

                    {/* Missed Count */}
                    <span className="text-[10px] text-zinc-500 shrink-0 font-medium">
                      {area.totalQuestions} missed
                    </span>

                    {/* Arrow on hover */}
                    <ArrowRight
                      weight="bold"
                      className="w-3 h-3 text-zinc-400 group-hover:text-brand-orange transition-colors shrink-0"
                    />
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
