import { db } from "@/db";
import { exams, examResults, questions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lightning, ArrowRight, Sparkle, CheckCircle, Warning } from "@phosphor-icons/react/dist/ssr";

export default async function QuickPracticePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  // Fetch user's exams and results
  const userExams = await db.select().from(exams)
    .where(eq(exams.userId, session.user.id))
    .orderBy(desc(exams.createdAt));

  const userResults = await db.select().from(examResults)
    .where(eq(examResults.userId, session.user.id));

  const allQuestions = await db.select().from(questions);

  // Calculate weak areas for targeted practice
  const subtopicStats: Record<string, { correct: number; total: number; examIds: number[] }> = {};

  userResults.forEach(result => {
    const answers = (typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers) as Record<string, string>;
    if (answers) {
      Object.entries(answers).forEach(([qIdStr, selectedOption]) => {
        const qId = parseInt(qIdStr);
        const question = allQuestions.find(q => q.id === qId);
        if (question && question.subtopic) {
          if (!subtopicStats[question.subtopic]) {
            subtopicStats[question.subtopic] = { correct: 0, total: 0, examIds: [] };
          }
          subtopicStats[question.subtopic].total += 1;
          if (selectedOption === question.correctAnswer) {
            subtopicStats[question.subtopic].correct += 1;
          }
          if (!subtopicStats[question.subtopic].examIds.includes(question.examId)) {
            subtopicStats[question.subtopic].examIds.push(question.examId);
          }
        }
      });
    }
  });

  const weakAreas = Object.entries(subtopicStats)
    .map(([subtopic, stats]) => ({
      subtopic,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      questions: stats.total,
      examIds: stats.examIds
    }))
    .filter(area => area.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // Get exams not yet taken
  const untakenExams = userExams.filter(exam => 
    !userResults.some(r => r.examId === exam.id)
  ).slice(0, 3);

  // Get exams to retry (score < 80%)
  const examsToRetry = userExams
    .map(exam => {
      const result = userResults.find(r => r.examId === exam.id);
      if (result) {
        const score = Math.round((result.score / result.totalQuestions) * 100);
        if (score < 80) {
          return { ...exam, lastScore: score };
        }
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, 3) as (typeof userExams[0] & { lastScore: number })[];

  const hasData = userExams.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Quick Practice</h1>
        <p className="text-zinc-500">Jump into focused study sessions based on your performance.</p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
            <Lightning className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">No Practice Available</h2>
          <p className="text-zinc-500 max-w-sm mb-6">Create your first exam to unlock quick practice sessions.</p>
          <Link href="/dashboard/new">
            <Button className="bg-brand-orange hover:bg-emerald-600 text-white">Create an Exam</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Practice Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weak Areas Practice */}
            {weakAreas.length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Warning weight="fill" className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">Focus on Weak Areas</h3>
                      <p className="text-xs text-zinc-500">Topics where you scored below 70%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {weakAreas.map((area, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100 group hover:border-zinc-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-sm font-bold text-red-500">
                            {area.accuracy}%
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{area.subtopic}</p>
                            <p className="text-xs text-zinc-500">{area.questions} questions practiced</p>
                          </div>
                        </div>
                        <Link href={`/dashboard/exams/${area.examIds[0]}`}>
                          <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Practice
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Not Yet Taken */}
            {untakenExams.length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-purple/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                      <Sparkle weight="fill" className="w-5 h-5 text-accent-purple" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">Fresh Exams</h3>
                      <p className="text-xs text-zinc-500">Exams you haven&apos;t attempted yet</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {untakenExams.map((exam) => (
                      <Link key={exam.id} href={`/dashboard/exams/${exam.id}`}>
                        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100 group hover:border-accent-purple/30 hover:bg-accent-purple/5 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-sm font-bold text-accent-purple">
                              {exam.title.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900 group-hover:text-accent-purple transition-colors">{exam.title}</p>
                              <p className="text-xs text-zinc-500">{exam.topic}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-accent-purple group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Retry for Better Score */}
            {examsToRetry.length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">Improve Your Score</h3>
                      <p className="text-xs text-zinc-500">Exams where you scored below 80%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {examsToRetry.map((exam) => (
                      <Link key={exam.id} href={`/dashboard/exams/${exam.id}`}>
                        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-100 group hover:border-amber-200 hover:bg-amber-50/30 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-sm font-bold text-amber-600">
                              {exam.lastScore}%
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{exam.title}</p>
                              <p className="text-xs text-zinc-500">Last score: {exam.lastScore}%</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <Lightning weight="fill" className="w-8 h-8 text-accent-purple mb-4" />
                <h3 className="text-lg font-bold mb-2">Quick Practice Tip</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Focus on your weakest topics first. Spaced repetition shows that reviewing difficult material more frequently leads to better retention.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="relative z-10">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Today&apos;s Goal</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-500">Progress</span>
                      <span className="font-medium text-zinc-900">1 / 3 exams</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-[3px] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-[2px]" style={{ width: '33%' }} />
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/goals">
                  <Button variant="outline" className="w-full hover:border-accent-purple/50 hover:text-accent-purple transition-colors">
                    Set Goals
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


