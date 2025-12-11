import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Plus, Play, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExamsEmptyState } from "@/components/dashboard/EmptyState";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

// Helper to get grade color config based on percentage
function getGradeConfig(percentage: number | null) {
  if (percentage === null) {
    return {
      bg: "bg-violet-200",
      text: "text-violet-900",
      border: "border-violet-300",
      iconColor: "text-violet-900",
      label: "Not Taken"
    };
  }
  
  if (percentage >= 90) return { bg: "bg-emerald-300", text: "text-emerald-950", border: "border-emerald-400", iconColor: "text-emerald-900", label: "A" };
  if (percentage >= 80) return { bg: "bg-blue-300", text: "text-blue-950", border: "border-blue-400", iconColor: "text-blue-900", label: "B" };
  if (percentage >= 70) return { bg: "bg-yellow-300", text: "text-yellow-950", border: "border-yellow-400", iconColor: "text-yellow-900", label: "C" };
  if (percentage >= 60) return { bg: "bg-orange-300", text: "text-orange-950", border: "border-orange-400", iconColor: "text-orange-900", label: "D" };
  return { bg: "bg-red-300", text: "text-red-950", border: "border-red-400", iconColor: "text-red-900", label: "F" };
}

export default async function ExamsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all exams ordered by creation date for the current user
  const allExams = await db.select().from(exams)
    .where(eq(exams.userId, session.user.id))
    .orderBy(desc(exams.createdAt));
  
  // Fetch all results for the current user
  const allResults = await db.select().from(examResults)
    .where(eq(examResults.userId, session.user.id));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-6">
      <div className="bg-white border-2 border-zinc-900 shadow-neo rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6">
        <div>
            <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">My Exams</h1>
            <p className="text-zinc-500 font-medium">Track your progress and performance history.</p>
        </div>
        <Link href="/dashboard/new">
            <Button className="h-11 px-6 rounded-sm bg-brand-orange text-white font-bold border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all gap-2">
                <Plus className="w-5 h-5" weight="bold" />
                NEW EXAM
            </Button>
        </Link>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        
        {allExams.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-zinc-900 shadow-neo p-1">
                <div className="border border-zinc-200 border-dashed rounded-md">
                    <ExamsEmptyState />
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-5">
                {allExams.map(exam => {
                    // Find latest result for this exam
                    const examResult = allResults
                        .filter(r => r.examId === exam.id)
                        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];
                    
                    const scorePercentage = examResult 
                        ? Math.round((examResult.score / examResult.totalQuestions) * 100) 
                        : null;

                    const gradeConfig = getGradeConfig(scorePercentage);

                    return (
                        <Link key={exam.id} href={`/dashboard/exams/${exam.id}`}>
                            <div className="group bg-white rounded-lg border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex flex-col md:flex-row items-stretch overflow-hidden">
                                
                                {/* Status Strip / Icon Area */}
                                <div className={cn(
                                    "w-full md:w-24 shrink-0 flex items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-zinc-900 p-4 md:p-0 transition-colors",
                                    gradeConfig.bg
                                )}>
                                    <span className={cn(
                                        "text-2xl font-black",
                                        gradeConfig.text
                                    )}>
                                        {scorePercentage !== null ? gradeConfig.label : exam.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-6 justify-between">
                                    <div className="space-y-2 min-w-0">
                                        <h3 className="text-lg font-bold text-zinc-900 truncate pr-4">
                                            {exam.title}
                                        </h3>
                                        
                                        <div className="flex flex-wrap items-center gap-3 text-xs">
                                            <span className="px-2.5 py-1 rounded-sm bg-zinc-100 border border-zinc-900 font-bold text-zinc-700 uppercase tracking-wide text-[10px]">
                                                {exam.topic}
                                            </span>
                                            
                                            <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                                                <Clock className="w-4 h-4" weight="fill" />
                                                <span>{formatDistanceToNow(exam.createdAt, { addSuffix: true })}</span>
                                            </div>

                                            {examResult && (
                                                <div className={cn("flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-sm border", gradeConfig.bg, gradeConfig.text, gradeConfig.border)}>
                                                    <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                                                    <span>COMPLETED</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Action Area */}
                                    <div className="flex items-center gap-5 justify-between md:justify-end pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 md:border-none mt-2 md:mt-0">
                                        {scorePercentage !== null ? (
                                            <div className="text-right">
                                                <div className={cn(
                                                    "text-2xl font-black leading-none",
                                                    gradeConfig.text
                                                )}>
                                                    {scorePercentage}%
                                                </div>
                                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Score</div>
                                            </div>
                                        ) : (
                                            <div className="text-right px-2">
                                                <div className="text-2xl font-black leading-none text-zinc-200">--</div>
                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">Not Taken</div>
                                            </div>
                                        )}

                                        <Button 
                                            className={cn(
                                                "h-10 px-5 rounded-sm border-2 border-zinc-900 font-bold shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all",
                                                scorePercentage !== null
                                                    ? "bg-white text-zinc-900 hover:bg-zinc-50"
                                                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                                            )}
                                        >
                                            {scorePercentage !== null ? (
                                                <span className="flex items-center gap-2">Review <ArrowRight weight="bold" /></span>
                                            ) : (
                                                <span className="flex items-center gap-2">Start <Play weight="fill" /></span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}
