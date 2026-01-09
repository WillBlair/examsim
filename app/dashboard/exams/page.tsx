import { db } from "@/db";
import { exams, examResults, questions } from "@/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Exam,
    Plus,
    Clock,
    ArrowRight,
    Star,
    CheckCircle,
    Target,
    Timer,
    TrendUp,
    ChartLine,
    ClipboardText,
    Trophy,
    XCircle,
    Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { formatDistanceToNow } from "date-fns";
import { ExamsEmptyState } from "@/components/dashboard/EmptyState";

interface ExamStats {
    total: number;
    completed: number;
    pending: number;
    averageScore: number;
    bestScore: number;
}

function getScoreColor(percentage: number | null): {
    gradient: string;
    stripGradient: string;
    textColor: string;
    bgColor: string;
} {
    if (percentage === null) {
        return {
            gradient: 'linear-gradient(90deg, #94a3b8, #64748b)',
            stripGradient: 'linear-gradient(90deg, #94a3b8, #64748b)',
            textColor: 'text-zinc-500',
            bgColor: 'from-zinc-100 to-slate-100',
        };
    }
    if (percentage >= 90) {
        return {
            gradient: 'linear-gradient(90deg, #10b981, #14b8a6)',
            stripGradient: 'linear-gradient(90deg, #10b981, #14b8a6)',
            textColor: 'text-emerald-600',
            bgColor: 'from-emerald-100 to-teal-100',
        };
    }
    if (percentage >= 70) {
        return {
            gradient: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            stripGradient: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            textColor: 'text-blue-600',
            bgColor: 'from-blue-100 to-indigo-100',
        };
    }
    if (percentage >= 50) {
        return {
            gradient: 'linear-gradient(90deg, #f59e0b, #f97316)',
            stripGradient: 'linear-gradient(90deg, #f59e0b, #f97316)',
            textColor: 'text-amber-600',
            bgColor: 'from-amber-100 to-orange-100',
        };
    }
    return {
        gradient: 'linear-gradient(90deg, #ef4444, #f97316)',
        stripGradient: 'linear-gradient(90deg, #ef4444, #f97316)',
        textColor: 'text-red-600',
        bgColor: 'from-red-100 to-orange-100',
    };
}

export default async function ExamsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return redirect("/login");
    }

    // Fetch all exams for the user (including templateId and iconUrl)
    const allExams = await db.select({
        id: exams.id,
        title: exams.title,
        topic: exams.topic,
        templateId: exams.templateId,
        iconUrl: exams.iconUrl,
        createdAt: exams.createdAt,
    })
        .from(exams)
        .where(eq(exams.userId, session.user.id))
        .orderBy(desc(exams.createdAt));

    // Get question counts for each exam
    const questionCounts = await db
        .select({
            examId: questions.examId,
            count: count(),
        })
        .from(questions)
        .groupBy(questions.examId);

    const questionCountMap = new Map(questionCounts.map(q => [q.examId, Number(q.count)]));

    // Fetch all results for the user
    const allResults = await db.select({
        id: examResults.id,
        examId: examResults.examId,
        score: examResults.score,
        totalQuestions: examResults.totalQuestions,
        completedAt: examResults.completedAt,
    })
        .from(examResults)
        .where(eq(examResults.userId, session.user.id));

    // Process exams: group template-based exams, keep custom exams separate
    const templateGroups = new Map<number, {
        templateId: number;
        title: string;
        topic: string;
        iconUrl: string | null;
        examIds: number[];
        mostRecentExamId: number;
        mostRecentCreatedAt: Date;
    }>();

    const customExams: typeof allExams = [];

    // Separate template-based exams from custom exams
    for (const exam of allExams) {
        if (exam.templateId) {
            const existing = templateGroups.get(exam.templateId);
            if (existing) {
                existing.examIds.push(exam.id);
                // Keep track of the most recent exam
                if (exam.createdAt > existing.mostRecentCreatedAt) {
                    existing.mostRecentExamId = exam.id;
                    existing.mostRecentCreatedAt = exam.createdAt;
                }
            } else {
                templateGroups.set(exam.templateId, {
                    templateId: exam.templateId,
                    title: exam.title,
                    topic: exam.topic,
                    iconUrl: exam.iconUrl,
                    examIds: [exam.id],
                    mostRecentExamId: exam.id,
                    mostRecentCreatedAt: exam.createdAt,
                });
            }
        } else {
            customExams.push(exam);
        }
    }

    // Build the final display list
    interface DisplayExam {
        id: number;
        title: string;
        topic: string;
        iconUrl: string | null;
        templateId: number | null;
        createdAt: Date;
        questionCount: number;
        attemptCount: number;
        latestScore: number | null;
        bestScore: number | null;
        latestResult: { examId: number; completedAt: Date } | null;
        isTemplateGroup: boolean;
    }

    const displayExams: DisplayExam[] = [];

    // Add template groups (one card per template)
    for (const group of templateGroups.values()) {
        // Get all results for all exams in this template group
        const groupResults = allResults.filter(r => group.examIds.includes(r.examId));

        const attemptCount = groupResults.length;
        const latestResult = groupResults.length > 0
            ? groupResults.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())[0]
            : null;

        const latestScore = latestResult
            ? Math.round((latestResult.score / latestResult.totalQuestions) * 100)
            : null;

        const bestScore = groupResults.length > 0
            ? Math.max(...groupResults.map(r => Math.round((r.score / r.totalQuestions) * 100)))
            : null;

        // Get question count from the most recent exam
        const questionCount = questionCountMap.get(group.mostRecentExamId) || 0;

        displayExams.push({
            id: group.mostRecentExamId,
            title: group.title,
            topic: group.topic,
            iconUrl: group.iconUrl,
            templateId: group.templateId,
            createdAt: group.mostRecentCreatedAt,
            questionCount,
            attemptCount,
            latestScore,
            bestScore,
            latestResult: latestResult ? { examId: latestResult.examId, completedAt: latestResult.completedAt } : null,
            isTemplateGroup: true,
        });
    }

    // Add custom exams (one card per exam)
    for (const exam of customExams) {
        const examResultsForExam = allResults
            .filter(r => r.examId === exam.id)
            .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

        const latestResult = examResultsForExam[0] || null;
        const attemptCount = examResultsForExam.length;

        const latestScore = latestResult
            ? Math.round((latestResult.score / latestResult.totalQuestions) * 100)
            : null;

        const bestScore = examResultsForExam.length > 0
            ? Math.max(...examResultsForExam.map(r => Math.round((r.score / r.totalQuestions) * 100)))
            : null;

        displayExams.push({
            id: exam.id,
            title: exam.title,
            topic: exam.topic,
            iconUrl: exam.iconUrl,
            templateId: exam.templateId,
            createdAt: exam.createdAt,
            questionCount: questionCountMap.get(exam.id) || 0,
            attemptCount,
            latestScore,
            bestScore,
            latestResult: latestResult ? { examId: latestResult.examId, completedAt: latestResult.completedAt } : null,
            isTemplateGroup: false,
        });
    }

    // Sort display exams by most recent activity
    displayExams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate overall stats (count unique exams, not individual attempts)
    const totalExams = displayExams.length;
    const completedExams = displayExams.filter(e => e.latestResult !== null).length;
    const pendingExams = totalExams - completedExams;

    const completedScores = displayExams
        .filter(e => e.bestScore !== null)
        .map(e => e.bestScore as number);

    const averageScore = completedScores.length > 0
        ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
        : 0;

    const bestOverallScore = completedScores.length > 0
        ? Math.max(...completedScores)
        : 0;

    const hasExams = displayExams.length > 0;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">My Exams</h1>
                    <p className="text-zinc-500 mt-2 text-lg font-medium">
                        {hasExams ? `${totalExams} exam${totalExams !== 1 ? 's' : ''} · ${completedExams} completed` : 'Create your first practice exam'}
                    </p>
                </div>
                <Link href="/dashboard/new">
                    <button className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5">
                        <Plus weight="bold" className="w-5 h-5" />
                        New Exam
                    </button>
                </Link>
            </div>

            {!hasExams ? (
                /* Empty State */
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl w-full max-w-xl p-12 text-center relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />

                        {/* Decorative circles */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-100 rounded-full opacity-50" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-100 rounded-full opacity-50" />

                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-500/30">
                                <ClipboardText weight="fill" className="w-12 h-12 text-white" />
                            </div>

                            <h2 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Create Your First Exam</h2>
                            <p className="text-zinc-500 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                                Upload your study materials and we&apos;ll generate AI-powered practice exams to test your knowledge.
                            </p>

                            <Link href="/dashboard/new" className="block">
                                <button className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    <Sparkle weight="fill" className="w-5 h-5" />
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Overall Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-emerald-500 rounded-2xl p-3 shadow-lg shadow-emerald-500/20">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <CheckCircle weight="fill" className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-white leading-none">{completedExams}</div>
                                    <div className="text-[10px] font-medium text-emerald-100 uppercase tracking-wider mt-0.5">Completed</div>
                                </div>
                            </div>
                            <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all"
                                    style={{ width: `${totalExams > 0 ? (completedExams / totalExams) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-amber-500 rounded-2xl p-3 shadow-lg shadow-amber-500/20">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Target weight="fill" className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-white leading-none">{pendingExams}</div>
                                    <div className="text-[10px] font-medium text-amber-100 uppercase tracking-wider mt-0.5">Pending</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500 rounded-2xl p-3 shadow-lg shadow-blue-500/20">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <ChartLine weight="fill" className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-white leading-none">{averageScore}%</div>
                                    <div className="text-[10px] font-medium text-blue-100 uppercase tracking-wider mt-0.5">Avg Score</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-violet-500 rounded-2xl p-3 shadow-lg shadow-violet-500/20">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Trophy weight="fill" className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-white leading-none">{bestOverallScore}%</div>
                                    <div className="text-[10px] font-medium text-violet-100 uppercase tracking-wider mt-0.5">Best Score</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-xl font-bold text-zinc-900">All Exams</h2>
                        <div className="h-px flex-1 bg-zinc-200" />
                    </div>

                    {/* Exam Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayExams.map((exam) => {
                            const scoreColors = getScoreColor(exam.bestScore);

                            return (
                                <div
                                    key={exam.templateId ? `template-${exam.templateId}` : `exam-${exam.id}`}
                                    className="group bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
                                >
                                    {/* Color Strip - changes based on score */}
                                    <div
                                        className="absolute top-0 left-0 w-full h-1"
                                        style={{ background: scoreColors.stripGradient }}
                                    />

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            {/* Custom icon for template exams, default icon otherwise */}
                                            {exam.iconUrl ? (
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-200/60 group-hover:scale-105 transition-transform relative">
                                                    <Image
                                                        src={exam.iconUrl}
                                                        alt={exam.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scoreColors.bgColor} border border-zinc-200/60 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                                    <ClipboardText weight="duotone" className={`w-7 h-7 ${scoreColors.textColor}`} />
                                                </div>
                                            )}
                                            {exam.bestScore !== null && (
                                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${scoreColors.textColor} bg-white border border-current`}>
                                                    {exam.bestScore}%
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-zinc-900 mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">{exam.title}</h3>
                                        {exam.topic && (
                                            <p className="text-sm text-zinc-500 mb-4 line-clamp-1">{exam.topic}</p>
                                        )}

                                        {/* Exam Stats */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Target weight="fill" className="w-4 h-4 text-zinc-400" />
                                                <span className="text-sm font-bold text-zinc-500">{exam.questionCount} questions</span>
                                            </div>
                                            {exam.attemptCount > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <TrendUp weight="fill" className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm font-bold text-emerald-600">{exam.attemptCount} attempt{exam.attemptCount !== 1 ? 's' : ''}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress/Score Bar */}
                                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-4">
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${exam.bestScore || 0}%`,
                                                    background: scoreColors.gradient,
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-zinc-400 mb-5">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">
                                                    {formatDistanceToNow(new Date(exam.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            {exam.latestResult && (
                                                <div className="flex items-center gap-1.5 text-emerald-500">
                                                    <CheckCircle weight="fill" className="w-4 h-4" />
                                                    <span className="font-medium">Completed</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Link href={`/dashboard/exams/${exam.id}`} className="flex-1">
                                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-colors">
                                                    {exam.latestResult ? 'Review' : 'Start Exam'}
                                                    <ArrowRight weight="bold" className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            {exam.latestResult && (
                                                <Link href={`/dashboard/exams/${exam.id}?retake=true`}>
                                                    <button
                                                        className="flex items-center justify-center gap-1 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold rounded-xl text-sm transition-colors"
                                                        title="Retake this exam"
                                                    >
                                                        <TrendUp weight="bold" className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Create New Exam Card */}
                        <Link
                            href="/dashboard/new"
                            className="group flex items-center justify-center min-h-[320px] bg-gradient-to-br from-zinc-50 to-slate-50 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-amber-400 hover:from-amber-50/30 hover:to-orange-50/30 transition-all"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-100 group-hover:bg-gradient-to-br group-hover:from-amber-100 group-hover:to-orange-100 border border-zinc-200 group-hover:border-amber-200 flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-105">
                                    <Plus weight="bold" className="w-7 h-7 text-zinc-400 group-hover:text-amber-600 transition-colors" />
                                </div>
                                <p className="text-base font-bold text-zinc-500 group-hover:text-amber-700 transition-colors">
                                    Create New Exam
                                </p>
                                <p className="text-sm text-zinc-400 mt-1 group-hover:text-amber-600 transition-colors">
                                    Generate exams from your materials
                                </p>
                            </div>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
