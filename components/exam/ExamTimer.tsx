"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
    examId: number;
    initialTimer?: number;
    isSubmitted: boolean;
}

export function ExamTimer({ examId, initialTimer, isSubmitted }: ExamTimerProps) {
    const [timerMinutes, setTimerMinutes] = useState<string>(initialTimer ? initialTimer.toString() : "30");
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showTimerConfig, setShowTimerConfig] = useState(false);

    // Load saved timer state from localStorage on mount
    useEffect(() => {
        const timerKey = `exam-${examId}-timer`;

        const savedTimer = localStorage.getItem(timerKey);
        if (savedTimer && !isSubmitted) {
            try {
                const timerData = JSON.parse(savedTimer);
                const { timeLeft: savedTimeLeft, startedAt } = timerData;

                if (savedTimeLeft > 0 && startedAt) {
                    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
                    const remaining = Math.max(0, savedTimeLeft - elapsed);

                    if (remaining > 0) {
                        setTimeLeft(remaining);
                        setIsTimerRunning(true);
                    } else {
                        setTimeLeft(0);
                        setIsTimerRunning(false);
                        localStorage.removeItem(timerKey);
                    }
                }
            } catch (e) {
                console.error("Failed to load saved timer", e);
            }
        }
    }, [examId, isSubmitted]);

    // Auto-start timer if initialTimer provided
    useEffect(() => {
        if (initialTimer && !isTimerRunning && timeLeft === null) {
            setTimeLeft(initialTimer * 60);
            setIsTimerRunning(true);
        }
    }, [initialTimer, isTimerRunning, timeLeft]);

    // Timer countdown effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev === null || prev <= 0) {
                        clearInterval(interval);
                        const timerKey = `exam-${examId}-timer`;
                        localStorage.removeItem(timerKey);
                        return 0;
                    }

                    // Persist timer state
                    const timerKey = `exam-${examId}-timer`;
                    try {
                        const savedTimer = localStorage.getItem(timerKey);
                        if (savedTimer) {
                            const timerData = JSON.parse(savedTimer);
                            localStorage.setItem(
                                timerKey,
                                JSON.stringify({
                                    timeLeft: prev - 1,
                                    startedAt: timerData.startedAt,
                                })
                            );
                        }
                    } catch (e) {
                        console.error("Failed to save timer state", e);
                    }

                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            const timerKey = `exam-${examId}-timer`;
            localStorage.removeItem(timerKey);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, examId]);

    const handleStartTimer = () => {
        const minutes = parseInt(timerMinutes);
        if (!isNaN(minutes) && minutes > 0) {
            const seconds = minutes * 60;
            setTimeLeft(seconds);
            setIsTimerRunning(true);
            setShowTimerConfig(false);

            // Persist timer start
            const timerKey = `exam-${examId}-timer`;
            try {
                localStorage.setItem(
                    timerKey,
                    JSON.stringify({
                        timeLeft: seconds,
                        startedAt: Date.now(),
                    })
                );
            } catch (e) {
                console.error("Failed to save timer start", e);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (isSubmitted) return null;

    return (
        <div className="relative">
            <Button
                variant={isTimerRunning ? "outline" : "ghost"}
                className={cn(
                    "gap-2 font-mono min-w-[120px]",
                    isTimerRunning && timeLeft !== null && timeLeft < 60 && "text-red-600 border-red-200 bg-red-50 animate-pulse",
                    !isTimerRunning && timeLeft === 0 && "text-red-600 bg-red-50 border-red-200"
                )}
                onClick={() => setShowTimerConfig(!showTimerConfig)}
            >
                <Timer className={cn("w-5 h-5", isTimerRunning && "text-brand-orange", !isTimerRunning && timeLeft === 0 && "text-red-600")} />
                {isTimerRunning && timeLeft !== null
                    ? formatTime(timeLeft)
                    : timeLeft === 0
                        ? "Time's Up!"
                        : "Set Timer"}
            </Button>

            {showTimerConfig && (
                <div className="absolute right-0 top-full mt-2 p-4 bg-white rounded-xl shadow-xl border border-zinc-200 w-72 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-sm text-zinc-900">Configure Timer</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowTimerConfig(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-500">Duration (minutes)</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    value={timerMinutes}
                                    onChange={(e) => setTimerMinutes(e.target.value)}
                                    className="font-mono"
                                />
                                <Button
                                    className="bg-brand-orange hover:bg-emerald-600 shrink-0"
                                    onClick={handleStartTimer}
                                >
                                    Start
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Timer will count down while you take the exam. Good luck!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
