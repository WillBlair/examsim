"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Spinner, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Exam {
    id: number;
    title: string;
    topic: string;
    difficulty: string;
    timeLimit?: number | null;
}

interface ExamProgressProps {
    exam: Exam;
    questionsCount: number;
    answeredCount: number;
    isSubmitted: boolean;
    isSaving: boolean;
    lastSaved: Date | null;
    children?: React.ReactNode; // For timer slot
}

export function ExamProgress({
    exam,
    questionsCount,
    answeredCount,
    isSubmitted,
    isSaving,
    lastSaved,
    children,
}: ExamProgressProps) {
    return (
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border-2 border-zinc-200 shadow-sm">
            <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-zinc-50 rounded-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <div className="flex-1">
                <div className="flex items-center gap-3 min-h-[32px]">
                    <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{exam.title}</h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1 flex-wrap font-medium">
                    <span className="px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {exam.topic}
                    </span>
                    <span>•</span>
                    <span>{exam.difficulty}</span>
                    <span>•</span>
                    <span>{questionsCount} Questions</span>
                    {!isSubmitted && (
                        <>
                            <span>•</span>
                            <span className={cn(
                                answeredCount === questionsCount
                                    ? "text-emerald-600 font-medium"
                                    : "text-amber-600"
                            )}>
                                {answeredCount}/{questionsCount} answered
                            </span>
                            {answeredCount > 0 && (
                                <>
                                    <span>•</span>
                                    <div className={cn(
                                        "flex items-center gap-1.5 text-xs font-medium transition-colors",
                                        isSaving
                                            ? "text-blue-600"
                                            : lastSaved
                                                ? "text-green-600"
                                                : ""
                                    )}>
                                        {isSaving ? (
                                            <>
                                                <Spinner className="w-3 h-3 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : lastSaved ? (
                                            <>
                                                <CheckCircle weight="fill" className="w-3 h-3" />
                                                <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Timer slot */}
            {children}
        </div>
    );
}
