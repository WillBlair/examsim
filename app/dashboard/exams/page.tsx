import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Plus } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExamsEmptyState } from "@/components/dashboard/EmptyState";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">My Exams</h1>
            <p className="text-zinc-500">Track your progress and performance history.</p>
        </div>
        <Link href="/dashboard/new">
            <Button className="rounded-lg bg-brand-orange hover:bg-emerald-600 text-white font-medium gap-2">
                <Plus className="w-4 h-4" />
                New Exam
            </Button>
        </Link>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        
        {allExams.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200">
                <ExamsEmptyState />
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {allExams.map(exam => {
                    // Find latest result for this exam
                    const examResult = allResults
                        .filter(r => r.examId === exam.id)
                        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0];
                    
                    const scorePercentage = examResult 
                        ? Math.round((examResult.score / examResult.totalQuestions) * 100) 
                        : null;

                    return (
                        <Link key={exam.id} href={`/dashboard/exams/${exam.id}`}>
                            <div className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg hover:shadow-accent-purple/5 hover:-translate-y-0.5 hover:border-accent-purple/30 transition-all cursor-pointer group shadow-sm relative overflow-hidden">
                                {/* Spine */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="flex items-center gap-6 w-full md:w-auto pl-2 md:pl-0 group-hover:pl-4 md:group-hover:pl-0 transition-all">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold border shrink-0 transition-colors duration-300 ${
                                        scorePercentage !== null 
                                            ? scorePercentage >= 70 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                            : "bg-zinc-50 text-zinc-500 border-zinc-100 group-hover:bg-accent-purple group-hover:text-white group-hover:border-accent-purple"
                                    }`}>
                                        {exam.title.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-accent-purple transition-colors truncate">
                                            {exam.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-1">
                                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 font-medium">
                                                {exam.topic}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatDistanceToNow(exam.createdAt, { addSuffix: true })}</span>
                                            </div>
                                            {examResult && (
                                                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Completed</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pl-18 md:pl-0">
                                    {scorePercentage !== null ? (
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${scorePercentage >= 70 ? "text-emerald-600" : "text-red-500"}`}>
                                                {scorePercentage}%
                                            </div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Score</div>
                                        </div>
                                    ) : (
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-zinc-300">--</div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wider">Not Taken</div>
                                        </div>
                                    )}
                                    <Button variant="outline" className="rounded-full hover:bg-zinc-50 whitespace-nowrap">
                                        {scorePercentage !== null ? "Review / Retake" : "Start Exam"}
                                    </Button>
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
