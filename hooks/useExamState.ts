"use client";

import { useState, useEffect, useRef } from "react";
import { saveExamResult } from "@/app/actions/save-exam-result";
import { toast } from "sonner";

interface Question {
    id: number;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string | null;
    hint?: string | null;
    type: string;
}

export function useExamState(examId: number, questions: Question[]) {
    const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
    const [visibleHints, setVisibleHints] = useState<Record<number, boolean>>({});
    const prevQuestionsRef = useRef<Question[]>(questions);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load saved answers from localStorage on mount
    useEffect(() => {
        const storageKey = `exam-${examId}-answers`;

        const savedAnswers = localStorage.getItem(storageKey);
        const savedTimestamp = localStorage.getItem(`${storageKey}-timestamp`);

        if (savedAnswers && !isSubmitted) {
            try {
                const parsed = JSON.parse(savedAnswers);
                setAnswers(parsed);
                if (savedTimestamp) {
                    setLastSaved(new Date(savedTimestamp));
                }
            } catch (e) {
                console.error("Failed to load saved answers", e);
            }
        }
    }, [examId, isSubmitted]);

    // Sync answers when question IDs change (e.g. streaming finished and real IDs loaded)
    useEffect(() => {
        const oldQs = prevQuestionsRef.current;
        if (oldQs.length > 0 && questions.length === oldQs.length && oldQs[0].id !== questions[0].id) {
            setAnswers(prev => {
                const newMap: Record<number, string | string[]> = {};
                questions.forEach((q, i) => {
                    const oldId = oldQs[i].id;
                    if (prev[oldId]) {
                        newMap[q.id] = prev[oldId];
                    }
                });
                return newMap;
            });
        }
        prevQuestionsRef.current = questions;
    }, [questions]);

    // Auto-save answers to localStorage
    useEffect(() => {
        if (isSubmitted || Object.keys(answers).length === 0) return;

        const storageKey = `exam-${examId}-answers`;
        setIsSaving(true);

        // Debounce the save
        const timeoutId = setTimeout(() => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(answers));
                localStorage.setItem(`${storageKey}-timestamp`, new Date().toISOString());
                setLastSaved(new Date());
                setIsSaving(false);
            } catch (e) {
                console.error("Failed to save answers", e);
                setIsSaving(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [answers, examId, isSubmitted]);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        if (isSubmitted || Object.keys(answers).length === 0) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "You have unsaved answers. Are you sure you want to leave?";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [answers, isSubmitted]);

    const checkAnswer = (q: Question, userAnswer: string | string[] | undefined) => {
        if (userAnswer === undefined || userAnswer === null) return false;

        if (q.type === "Select All That Apply") {
            try {
                let correctOptions: string[] = [];
                try {
                    correctOptions = JSON.parse(q.correctAnswer);
                } catch {
                    correctOptions = [q.correctAnswer];
                }

                const userOptions = userAnswer as string[];
                if (!Array.isArray(userOptions)) return false;

                if (correctOptions.length !== userOptions.length) return false;
                return correctOptions.every(opt => userOptions.includes(opt));
            } catch {
                return false;
            }
        } else if (q.type === "Fill in the Blank") {
            return (userAnswer as string).trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        } else {
            return userAnswer === q.correctAnswer;
        }
    };

    const handleOptionSelect = (questionId: number, option: string, type: string) => {
        if (isSubmitted) return;

        if (type === "Select All That Apply") {
            setAnswers(prev => {
                const current = (prev[questionId] as string[]) || [];
                if (current.includes(option)) {
                    return { ...prev, [questionId]: current.filter(o => o !== option) };
                } else {
                    return { ...prev, [questionId]: [...current, option] };
                }
            });
        } else {
            setAnswers(prev => ({
                ...prev,
                [questionId]: option,
            }));
        }
    };

    const handleTextChange = (questionId: number, text: string) => {
        if (isSubmitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: text }));
    };

    const toggleHint = (questionId: number) => {
        setVisibleHints(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    };

    const submitExam = async () => {
        setIsSubmitting(true);

        try {
            let correctCount = 0;
            questions.forEach((q) => {
                if (checkAnswer(q, answers[q.id])) {
                    correctCount++;
                }
            });

            const result = await saveExamResult(examId, correctCount, questions.length, answers);

            if (!result.success) {
                throw new Error(result.error || "Failed to save exam result");
            }

            // Clear saved answers from localStorage
            const storageKey = `exam-${examId}-answers`;
            const timerKey = `exam-${examId}-timer`;
            localStorage.removeItem(storageKey);
            localStorage.removeItem(`${storageKey}-timestamp`);
            localStorage.removeItem(timerKey);

            setScore(correctCount);
            setIsSubmitted(true);

            const percentage = Math.round((correctCount / questions.length) * 100);
            toast.success("Exam Submitted!", {
                description: `You scored ${percentage}% (${correctCount}/${questions.length})`,
                duration: 5000
            });

            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            toast.error("Failed to submit exam", {
                description: error instanceof Error ? error.message : "Please try again",
                action: {
                    label: "Retry",
                    onClick: async () => {
                        await submitExam();
                    }
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(answers).length;

        if (answeredCount === 0) {
            toast.error("You haven't answered any questions yet.");
            return;
        }

        await submitExam();
    };

    return {
        answers,
        visibleHints,
        isSubmitted,
        isSubmitting,
        score,
        isSaving,
        lastSaved,
        handleOptionSelect,
        handleTextChange,
        toggleHint,
        handleSubmit,
        checkAnswer,
    };
}
