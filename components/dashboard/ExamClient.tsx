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
  hint?: string | null; // Add hint field
  type: string;
}

interface Exam {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
  timeLimit?: number | null;
}

export function ExamClient({
  exam,
  questions,
  initialTimer,
  isGenerating = false,
  allowHints = false,
  allowExplanations = true
}: {
  exam: Exam;
  questions: Question[];
  initialTimer?: number;
  isGenerating?: boolean;
  allowHints?: boolean;
  allowExplanations?: boolean;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [visibleHints, setVisibleHints] = useState<Record<number, boolean>>({});
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
            Review your answers below. {allowExplanations ? "Explanations are now visible." : "See how you did!"}
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const isCorrect = checkAnswer(q, userAnswer);
          const showExplanation = allowExplanations && isSubmitted;

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

                  {/* Hint Section */}
                  {allowHints && q.hint && !isSubmitted && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVisibleHints(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider flex items-center gap-2 h-8 px-3 rounded-sm border-2 transition-all",
                          visibleHints[q.id]
                            ? "bg-violet-50 text-violet-900 border-violet-200 hover:bg-violet-100"
                            : "bg-white text-violet-600 border-violet-200 hover:border-violet-400 hover:bg-violet-50"
                        )}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M192,112a64.07,64.07,0,0,0-64-64,32,32,0,0,0-32-32,8,8,0,0,0-8,8,32,32,0,0,0-32,32,64.07,64.07,0,0,0-64,64c0,16.51,10.61,46.51,26.69,67.24a8,8,0,0,0,6.34,3.09h7.49a8,8,0,0,0,7.09-4.7l6.55-15.29A8,8,0,0,1,59.39,160h9.22a8,8,0,0,0,7.24-4.52l9-18A8,8,0,0,1,103.55,136H112a8,8,0,0,0,0-16h-4.66a8,8,0,0,1-6.9-3.95l-12-20A8,8,0,0,1,87.67,93.6l19-33.15A8,8,0,0,0,103.36,49.88,48,48,0,0,1,176,112c0,35.6-26.08,66.86-30.7,72.16-1.55,1.78-3.07,3.52-4.48,5.08a8,8,0,0,1-11.84-10.66c1.37-1.52,2.83-3.2,4.32-4.91,2.06-2.36,10.7-12.72,10.7-33.67a8,8,0,0,0-16,0c0,16.88-5.74,25.32-8.59,28.61a23.85,23.85,0,0,1-5.61,4.71c-3.79,2.22-4.29,6.59-4.76,10.8l-.05.41h16a8,8,0,0,0,0,16h-16c-.09.83-.19,1.66-.29,2.49-.62,5.22-1.33,11.1-6.7,11.1H88c-5.37,0-6.08-5.88-6.7-11.1l-.29-2.49H72a8,8,0,0,0,0-16h8.05l.05-.41c.47-4.21,1-8.58,4.76-10.8a23.85,23.85,0,0,1,5.61-4.71,8,8,0,0,0-1.87-14.73l9-18a8,8,0,0,0-1.68-9.42l-12-20A24,24,0,0,0,81.16,77.29l-19,33.15A24,23,0,0,0,67.8,116h4.66a24,24,0,0,0,20.72,11.84l9,18a24,24,0,0,0,10.66,10.74l-6.28,14.65C104.22,187,95.53,164.38,84.66,150.36,75.09,138,48,118.78,48,112A48.05,48.05,0,0,1,96,64a8,8,0,0,0,0-16ZM128,216a24,24,0,0,1-24,24H72a24,24,0,0,1-24-24,8,8,0,0,1,16,0,8,8,0,0,0,8,8h32a8,8,0,0,0,8-8,8,8,0,0,1,16,0Z"></path></svg>
                        {visibleHints[q.id] ? "Hide Hint" : "Show Hint"}
                      </Button>
                      {visibleHints[q.id] && (
                        <div className="mt-2 p-3 bg-violet-50 border border-violet-100 rounded-sm text-sm text-violet-900 animate-in fade-in slide-in-from-top-1">
                          <span className="font-bold mr-1">💡 Hint:</span>
                          {q.hint}
                        </div>
                      )}
                    </div>
                  )}

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
                      (q.options && q.options.length > 0) ? (
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
                                    ? "bg-brand-orange border-zinc-900 shadow-sm"
                                    : "bg-zinc-100 border-zinc-300 group-hover:border-zinc-400"
                              )}>
                                {isSubmitted && isCorrectOption && <CheckCircle className="w-4 h-4 text-white" weight="bold" />}
                                {isSubmitted && !isCorrectOption && isSelected && <X className="w-4 h-4 text-white" weight="bold" />}
                                {!isSubmitted && isSelected && <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full" />}
                              </div>

                              <span className={cn(
                                "font-medium text-base",
                                isSubmitted && isCorrectOption ? "text-emerald-900" : "text-zinc-700"
                              )}>
                                {option}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        // Skeleton/Loading State for Options
                        <div className="space-y-3">
                          <div className="h-14 w-full bg-zinc-100 rounded-sm animate-pulse border border-zinc-200" />
                          <div className="h-14 w-full bg-zinc-100 rounded-sm animate-pulse border border-zinc-200" />
                          <div className="h-14 w-full bg-zinc-100 rounded-sm animate-pulse border border-zinc-200" />
                        </div>
                      )
                    )}
                  </div>
                  {/* Explanation Section */}
                  {showExplanation && (
                    <div className={cn(
                      "mt-4 p-4 rounded-lg border-2 animate-in fade-in slide-in-from-top-2",
                      isCorrect
                        ? "bg-emerald-100/50 border-emerald-200 text-emerald-900"
                        : "bg-red-50 border-red-200 text-red-900"
                    )}>
                      <h4 className="font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                        {isCorrect ? <CheckCircle weight="fill" className="w-4 h-4" /> : <X weight="bold" className="w-4 h-4" />}
                        Explanation
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}

                  {/* Hints used in review (optional) */}
                  {isSubmitted && q.hint && visibleHints[q.id] && (
                    <div className="text-xs text-zinc-500 italic mt-2">
                      Used Hint: {q.hint}
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