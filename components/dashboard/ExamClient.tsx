"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Spinner, Timer, X, Check, CheckCircle, FloppyDisk } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { saveExamResult } from "@/app/actions/save-exam-result";
import { toast } from "sonner";

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  type: string;
}

interface Exam {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
  timeLimit?: number | null;
}

export function ExamClient({ exam, questions, initialTimer, isGenerating = false }: { exam: Exam; questions: Question[]; initialTimer?: number; isGenerating?: boolean }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const prevQuestionsRef = useRef<Question[]>(questions);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Timer State
  const [timerMinutes, setTimerMinutes] = useState<string>(initialTimer ? initialTimer.toString() : "30");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerConfig, setShowTimerConfig] = useState(false);

  // Load saved answers and timer from localStorage on mount
  useEffect(() => {
    const storageKey = `exam-${exam.id}-answers`;
    const timerKey = `exam-${exam.id}-timer`;

    // Load saved answers
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

    // Load saved timer state
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
  }, [exam.id, isSubmitted]);

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

    const storageKey = `exam-${exam.id}-answers`;
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
  }, [answers, exam.id, isSubmitted]);

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

  useEffect(() => {
    // Auto-start timer if initialTimer provided
    if (initialTimer && !isTimerRunning && timeLeft === null) {
      setTimeLeft(initialTimer * 60);
      setIsTimerRunning(true);
    }
  }, [initialTimer, isTimerRunning, timeLeft]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            const timerKey = `exam-${exam.id}-timer`;
            localStorage.removeItem(timerKey);
            return 0;
          }

          // Persist timer state
          const timerKey = `exam-${exam.id}-timer`;
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
      const timerKey = `exam-${exam.id}-timer`;
      localStorage.removeItem(timerKey);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, exam.id]);

  const handleStartTimer = () => {
    const minutes = parseInt(timerMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      const seconds = minutes * 60;
      setTimeLeft(seconds);
      setIsTimerRunning(true);
      setShowTimerConfig(false);

      // Persist timer start
      const timerKey = `exam-${exam.id}-timer`;
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

  const checkAnswer = (q: Question, userAnswer: string | string[] | undefined) => {
    if (userAnswer === undefined || userAnswer === null) return false;

    if (q.type === "Select All That Apply") {
      try {
        // Parse correct answer if it's a JSON string
        let correctOptions: string[] = [];
        try {
          correctOptions = JSON.parse(q.correctAnswer);
        } catch {
          // Fallback if not JSON (shouldn't happen with new generator, but safety)
          correctOptions = [q.correctAnswer];
        }

        const userOptions = userAnswer as string[];
        if (!Array.isArray(userOptions)) return false;

        // Check if set sizes match
        if (correctOptions.length !== userOptions.length) return false;
        // Check if every correct option is in user options
        return correctOptions.every(opt => userOptions.includes(opt));
      } catch (e) {
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

  const handleSubmit = async () => {
    // Only warn if submitting with very few answers (e.g. accidentally clicked immediately)
    // Otherwise just submit without friction
    const answeredCount = Object.keys(answers).length;

    if (answeredCount === 0) {
      toast.error("You haven't answered any questions yet.");
      return;
    }

    await submitExam();
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

      const result = await saveExamResult(exam.id, correctCount, questions.length, answers);

      if (!result.success) {
        throw new Error(result.error || "Failed to save exam result");
      }

      // Clear saved answers and timer from localStorage
      const storageKey = `exam-${exam.id}-answers`;
      const timerKey = `exam-${exam.id}-timer`;
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

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Header */}
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
            <span>{questions.length} Questions</span>
            {!isSubmitted && (
              <>
                <span>•</span>
                <span className={cn(
                  Object.keys(answers).length === questions.length
                    ? "text-emerald-600 font-medium"
                    : "text-amber-600"
                )}>
                  {Object.keys(answers).length}/{questions.length} answered
                </span>
                {Object.keys(answers).length > 0 && (
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

        {/* Timer Control */}
        {!isSubmitted && (
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
        )}
      </div>

      {/* Results Banner */}
      {isSubmitted && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 border-2 border-green-200 p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4">
          <h2 className="text-2xl font-bold mb-2 text-zinc-900">Exam Results</h2>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-green-600">
              {Math.round((score / questions.length) * 100)}%
            </span>
            <span className="text-zinc-600 mb-1 font-medium">
              ({score} out of {questions.length} correct)
            </span>
          </div>
          <p className="mt-4 text-zinc-700">
            Review your answers below. Explanations are now visible.
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const isCorrect = checkAnswer(q, userAnswer);

          return (
            <div
              key={q.id}
              className={cn(
                "bg-white border-2 rounded-lg p-6 space-y-4 transition-all shadow-sm",
                isSubmitted
                  ? isCorrect
                    ? "border-emerald-500 bg-emerald-50/10"
                    : "border-red-500 bg-red-50/10"
                  : "border-zinc-200 hover:border-zinc-900 hover:shadow-neo"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-8 h-8 rounded-sm flex items-center justify-center font-bold text-sm shrink-0 border border-transparent",
                    isSubmitted
                      ? isCorrect
                        ? "bg-emerald-500 text-white border-emerald-700 shadow-sm"
                        : "bg-red-500 text-white border-red-700 shadow-sm"
                      : "bg-brand-orange text-white border-zinc-900 shadow-neo-sm"
                  )}
                >
                  {i + 1}
                </div>
                <div className="space-y-4 w-full">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-zinc-900">
                      {q.questionText}
                    </h3>
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                      {q.type}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {q.type === "Fill in the Blank" ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Type your answer here..."
                          value={(answers[q.id] as string) || ""}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          disabled={isSubmitted}
                          className={cn(
                            "font-medium text-lg p-6",
                            isSubmitted && !isCorrect && "border-red-300 bg-red-50 text-red-900",
                            isSubmitted && isCorrect && "border-green-300 bg-green-50 text-green-900"
                          )}
                        />
                        {isSubmitted && !isCorrect && (
                          <div className="text-sm text-zinc-500">
                            Correct Answer: <span className="font-bold text-green-600">{q.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      q.options.map((option, idx) => {
                        let isSelected = false;
                        let isCorrectOption = false;

                        if (q.type === "Select All That Apply") {
                          const current = (userAnswer as string[]) || [];
                          isSelected = current.includes(option);

                          let correctOptions: string[] = [];
                          try { correctOptions = JSON.parse(q.correctAnswer); } catch { }
                          isCorrectOption = correctOptions.includes(option);
                        } else {
                          isSelected = userAnswer === option;
                          isCorrectOption = option === q.correctAnswer;
                        }

                        let optionStyle = "border-2 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 shadow-sm";
                        if (isSubmitted) {
                          if (isCorrectOption) {
                            optionStyle = "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-neo-sm";
                          } else if (isSelected && !isCorrectOption) {
                            optionStyle = "border-red-600 bg-red-50 text-red-900 shadow-neo-sm";
                          } else {
                            optionStyle = "border-zinc-200 opacity-60 bg-zinc-50 border-2";
                          }
                        } else if (isSelected) {
                          // Addictive, bright, polished style - Enhanced
                          optionStyle = "border-zinc-900 border-2 bg-brand-orange/5 text-zinc-900 shadow-neo-brand";
                        }

                        return (
                          <div
                            key={idx}
                            onClick={() => handleOptionSelect(q.id, option, q.type)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-sm cursor-pointer transition-all duration-200 ease-out group relative overflow-hidden",
                              optionStyle
                            )}
                          >
                            {/* Active selection indicator bar */}
                            {!isSubmitted && isSelected && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-orange border-r border-zinc-900" />
                            )}

                            <div className={cn(
                              "w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 z-10",
                              q.type === "Select All That Apply" ? "rounded-sm" : "rounded-full",
                              isSubmitted
                                ? isCorrectOption
                                  ? "border-emerald-600 bg-emerald-600"
                                  : isSelected
                                    ? "border-red-600 bg-red-600"
                                    : "border-zinc-300 bg-zinc-100"
                                : isSelected
                                  ? "border-zinc-900 bg-brand-orange"
                                  : "border-zinc-300 bg-white group-hover:border-zinc-900"
                            )}>
                              {(isSubmitted ? (isCorrectOption || isSelected) : isSelected) && (
                                q.type === "Select All That Apply" ? (
                                  <Check className="w-3.5 h-3.5 text-white" weight="bold" />
                                ) : (
                                  <div className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-900" />
                                )
                              )}
                            </div>
                            <span className={cn(
                              "font-medium text-base leading-relaxed transition-colors duration-200 z-10",
                              !isSubmitted && isSelected ? "text-zinc-900 font-bold" : "text-zinc-600 group-hover:text-zinc-900"
                            )}>
                              {option}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Explanation - Only shown after submit */}
                  {isSubmitted && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-zinc-200 text-zinc-700 animate-in fade-in slide-in-from-top-2">
                      <p className="font-bold mb-1 text-zinc-900">Explanation:</p>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="flex justify-end mt-12 pb-8">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isGenerating}
            className="h-14 px-8 rounded-full bg-brand-orange text-white hover:bg-emerald-600 font-bold shadow-xl shadow-emerald-500/20 text-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Spinner className="w-5 h-5 animate-spin mr-2" />
                Generating Questions...
              </>
            ) : isSubmitting ? (
              <>
                <Spinner className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Exam"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}