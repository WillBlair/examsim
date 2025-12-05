"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Spinner, Timer, X, Check, CheckSquare, Square } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { saveExamResult } from "@/app/actions/save-exam-result";

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

export function ExamClient({ exam, questions, initialTimer }: { exam: Exam; questions: Question[]; initialTimer?: number }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  // Timer State
  const [timerMinutes, setTimerMinutes] = useState<string>(initialTimer ? initialTimer.toString() : "30");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerConfig, setShowTimerConfig] = useState(false);

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
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleStartTimer = () => {
    const minutes = parseInt(timerMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      setTimeLeft(minutes * 60);
      setIsTimerRunning(true);
      setShowTimerConfig(false);
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
    if (Object.keys(answers).length < questions.length) {
      if (!confirm("You haven't answered all questions. Are you sure you want to submit?")) {
        return;
      }
    }

    setIsSubmitting(true);

    let correctCount = 0;
    questions.forEach((q) => {
      if (checkAnswer(q, answers[q.id])) {
        correctCount++;
      }
    });

    await saveExamResult(exam.id, correctCount, questions.length, answers);

    setScore(correctCount);
    setIsSubmitted(true);
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-900">{exam.title}</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 font-medium">
              {exam.topic}
            </span>
            <span>•</span>
            <span>{exam.difficulty}</span>
            <span>•</span>
            <span>{questions.length} Questions</span>
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
                        className="bg-brand-orange hover:bg-orange-600 shrink-0"
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
        <div className="bg-zinc-900 text-white p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4">
          <h2 className="text-2xl font-bold mb-2">Exam Results</h2>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-green-400">
              {Math.round((score / questions.length) * 100)}%
            </span>
            <span className="text-zinc-400 mb-1">
              ({score} out of {questions.length} correct)
            </span>
          </div>
          <p className="mt-4 text-zinc-300">
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
                "bg-white border rounded-xl p-6 space-y-4 transition-all",
                isSubmitted 
                  ? isCorrect 
                    ? "border-green-200 bg-green-50/30"
                    : "border-red-200 bg-red-50/30"
                  : "border-zinc-200"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                    isSubmitted
                      ? isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-brand-orange text-white"
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
                                try { correctOptions = JSON.parse(q.correctAnswer); } catch {}
                                isCorrectOption = correctOptions.includes(option);
                            } else {
                                isSelected = userAnswer === option;
                                isCorrectOption = option === q.correctAnswer;
                            }
                            
                            let optionStyle = "border-zinc-200 hover:bg-zinc-50";
                            if (isSubmitted) {
                                if (isCorrectOption) {
                                    optionStyle = "border-green-500 bg-green-100 text-green-900";
                                } else if (isSelected && !isCorrectOption) {
                                    optionStyle = "border-red-500 bg-red-100 text-red-900";
                                } else {
                                    optionStyle = "border-zinc-200 opacity-50";
                                }
                            } else if (isSelected) {
                                optionStyle = "border-brand-orange bg-brand-orange text-white shadow-md";
                            }

                            return (
                            <div
                                key={idx}
                                onClick={() => handleOptionSelect(q.id, option, q.type)}
                                className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                optionStyle
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 border flex items-center justify-center",
                                    q.type === "Select All That Apply" ? "rounded" : "rounded-full",
                                    isSubmitted 
                                        ? isCorrectOption 
                                            ? "border-green-600 bg-green-600" 
                                            : isSelected 
                                                ? "border-red-600 bg-red-600"
                                                : "border-zinc-300"
                                        : isSelected 
                                            ? "border-white bg-white" 
                                            : "border-zinc-300"
                                )}>
                                    {(isSubmitted ? (isCorrectOption || isSelected) : isSelected) && (
                                        q.type === "Select All That Apply" ? (
                                            <Check className={cn("w-3 h-3", isSubmitted ? "text-white" : "text-zinc-900")} weight="bold" />
                                        ) : (
                                            <div className={cn(
                                                "w-2 h-2 rounded-full", 
                                                isSubmitted ? "bg-white" : "bg-zinc-900"
                                            )} />
                                        )
                                    )}
                                </div>
                                <span className={cn(
                                    "font-medium",
                                    !isSubmitted && isSelected ? "text-white" : "text-zinc-700"
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
        <div className="flex justify-end sticky bottom-8">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-14 px-8 rounded-full bg-brand-orange text-white hover:bg-orange-600 font-bold shadow-xl shadow-orange-900/20 text-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
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