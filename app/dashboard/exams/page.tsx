import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle, TrendUp, Plus } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { exams, examResults } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function ExamsPage() {
  // Fetch all exams ordered by creation date
  const allExams = await db.select().from(exams).orderBy(desc(exams.createdAt));
  
  // Fetch all results
  const allResults = await db.select().from(examResults);

  // Process stats
  const totalExams = allExams.length;
  const completedExams = allResults.length;
  const averageScore = completedExams > 0 
    ? Math.round(allResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0) / completedExams)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-zinc-900">My Exams</h1>
            <p className="text-zinc-500">Track your progress and performance history.</p>
        </div>
        <Link href="/dashboard/new">
            <Button className="rounded-full bg-brand-orange hover:bg-orange-600 text-white font-bold gap-2">
                <Plus className="w-4 h-4" />
                New Exam
            </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2 bg-white border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
             <CheckCircle className="w-4 h-4" />
             Total Exams Created
          </div>
          <div className="text-3xl font-bold text-zinc-900">{totalExams}</div>
        </Card>
        <Card className="p-6 space-y-2 bg-white border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
             <TrendUp className="w-4 h-4" />
             Average Score
          </div>
          <div className="text-3xl font-bold text-green-600">{averageScore}%</div>
        </Card>
        <Card className="p-6 space-y-2 bg-white border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
             <CheckCircle className="w-4 h-4" />
             Completed Attempts
          </div>
          <div className="text-3xl font-bold text-zinc-900">{completedExams}</div>
        </Card>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900">Past Simulations</h2>
        
        {allExams.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 rounded-xl border border-zinc-200 border-dashed">
                <h3 className="text-zinc-900 font-semibold mb-2">No exams yet</h3>
                <p className="text-zinc-500 mb-6 max-w-sm mx-auto">Upload your notes to generate your first practice exam.</p>
                <Link href="/dashboard/new">
                    <Button variant="outline">Create First Exam</Button>
                </Link>
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
                            <div className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border shrink-0 ${
                                        scorePercentage !== null 
                                            ? scorePercentage >= 70 ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                                            : "bg-zinc-100 text-zinc-500 border-zinc-200"
                                    }`}>
                                        {exam.title.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors truncate">
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
                                                <div className="flex items-center gap-1 text-green-600 font-medium">
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
                                            <div className={`text-2xl font-bold ${scorePercentage >= 70 ? "text-green-600" : "text-red-500"}`}>
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
