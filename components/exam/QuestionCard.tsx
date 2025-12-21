"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Question {
    id: number;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string | null;
    hint?: string | null;
    type: string;
}

interface QuestionCardProps {
    question: Question;
    index: number;
    userAnswer: string | string[] | undefined;
    isSubmitted: boolean;
    isCorrect: boolean;
    allowHints: boolean;
    allowExplanations: boolean;
    visibleHint: boolean;
    onOptionSelect: (option: string, type: string) => void;
    onTextChange: (text: string) => void;
    onToggleHint: () => void;
}

export function QuestionCard({
    question,
    index,
    userAnswer,
    isSubmitted,
    isCorrect,
    allowHints,
    allowExplanations,
    visibleHint,
    onOptionSelect,
    onTextChange,
    onToggleHint,
}: QuestionCardProps) {
    const showExplanation = allowExplanations && isSubmitted;

    return (
        <div
            className={cn(
                "bg-white border-2 rounded-lg p-6 space-y-4 transition-all shadow-sm",
                isSubmitted
                    ? isCorrect
                        ? "border-emerald-500"
                        : "border-red-500"
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
                    {index + 1}
                </div>
                <div className="space-y-4 w-full">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-zinc-900">
                            {question.questionText}
                        </h3>
                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                            {question.type}
                        </span>
                    </div>

                    {/* Hint Section */}
                    {allowHints && question.hint && !isSubmitted && (
                        <div className="mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onToggleHint}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-wider flex items-center gap-2 h-8 px-3 rounded-sm border-2 transition-all",
                                    visibleHint
                                        ? "bg-violet-50 text-violet-900 border-violet-200 hover:bg-violet-100"
                                        : "bg-white text-violet-600 border-violet-200 hover:border-violet-400 hover:bg-violet-50"
                                )}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M192,112a64.07,64.07,0,0,0-64-64,32,32,0,0,0-32-32,8,8,0,0,0-8,8,32,32,0,0,0-32,32,64.07,64.07,0,0,0-64,64c0,16.51,10.61,46.51,26.69,67.24a8,8,0,0,0,6.34,3.09h7.49a8,8,0,0,0,7.09-4.7l6.55-15.29A8,8,0,0,1,59.39,160h9.22a8,8,0,0,0,7.24-4.52l9-18A8,8,0,0,1,103.55,136H112a8,8,0,0,0,0-16h-4.66a8,8,0,0,1-6.9-3.95l-12-20A8,8,0,0,1,87.67,93.6l19-33.15A8,8,0,0,0,103.36,49.88,48,48,0,0,1,176,112c0,35.6-26.08,66.86-30.7,72.16-1.55,1.78-3.07,3.52-4.48,5.08a8,8,0,0,1-11.84-10.66c1.37-1.52,2.83-3.2,4.32-4.91,2.06-2.36,10.7-12.72,10.7-33.67a8,8,0,0,0-16,0c0,16.88-5.74,25.32-8.59,28.61a23.85,23.85,0,0,1-5.61,4.71c-3.79,2.22-4.29,6.59-4.76,10.8l-.05.41h16a8,8,0,0,0,0,16h-16c-.09.83-.19,1.66-.29,2.49-.62,5.22-1.33,11.1-6.7,11.1H88c-5.37,0-6.08-5.88-6.7-11.1l-.29-2.49H72a8,8,0,0,0,0-16h8.05l.05-.41c.47-4.21,1-8.58,4.76-10.8a23.85,23.85,0,0,1,5.61-4.71,8,8,0,0,0-1.87-14.73l9-18a8,8,0,0,0-1.68-9.42l-12-20A24,24,0,0,0,81.16,77.29l-19,33.15A24,23,0,0,0,67.8,116h4.66a24,24,0,0,0,20.72,11.84l9,18a24,24,0,0,0,10.66,10.74l-6.28,14.65C104.22,187,95.53,164.38,84.66,150.36,75.09,138,48,118.78,48,112A48.05,48.05,0,0,1,96,64a8,8,0,0,0,0-16ZM128,216a24,24,0,0,1-24,24H72a24,24,0,0,1-24-24,8,8,0,0,1,16,0,8,8,0,0,0,8,8h32a8,8,0,0,0,8-8,8,8,0,0,1,16,0Z"></path></svg>
                                {visibleHint ? "Hide Hint" : "Show Hint"}
                            </Button>
                            {visibleHint && (
                                <div className="mt-2 p-3 bg-violet-50 border border-violet-100 rounded-sm text-sm text-violet-900 animate-in fade-in slide-in-from-top-1">
                                    <span className="font-bold mr-1">💡 Hint:</span>
                                    {question.hint}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        {question.type === "Fill in the Blank" ? (
                            <div className="space-y-2">
                                <Input
                                    placeholder="Type your answer here..."
                                    value={(userAnswer as string) || ""}
                                    onChange={(e) => onTextChange(e.target.value)}
                                    disabled={isSubmitted}
                                    className={cn(
                                        "font-medium text-lg p-6",
                                        isSubmitted && !isCorrect && "border-red-300 bg-red-50 text-red-900",
                                        isSubmitted && isCorrect && "border-green-300 bg-green-50 text-green-900"
                                    )}
                                />
                                {isSubmitted && !isCorrect && (
                                    <div className="text-sm text-zinc-500">
                                        Correct Answer: <span className="font-bold text-green-600">{question.correctAnswer}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Check for valid options (non-empty array with actual content)
                            (question.options && question.options.length > 0 && question.options.some(opt => opt && opt.trim())) ? (
                                question.options.filter(opt => opt && opt.trim()).map((option, idx) => {
                                    let isSelected = false;
                                    let isCorrectOption = false;

                                    if (question.type === "Select All That Apply") {
                                        const current = (userAnswer as string[]) || [];
                                        isSelected = current.includes(option);

                                        let correctOptions: string[] = [];
                                        try { correctOptions = JSON.parse(question.correctAnswer); } catch { }
                                        isCorrectOption = correctOptions.includes(option);
                                    } else {
                                        isSelected = userAnswer === option;
                                        isCorrectOption = option === question.correctAnswer;
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
                                        optionStyle = "border-zinc-900 border-2 bg-brand-orange/5 text-zinc-900 shadow-neo-brand";
                                    }

                                    return (
                                        <div
                                            key={`${question.id}-${idx}`}
                                            onClick={() => !isSubmitted && onOptionSelect(option, question.type)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-sm cursor-pointer transition-all duration-200 ease-out group relative overflow-hidden",
                                                optionStyle,
                                                isSubmitted && "cursor-default"
                                            )}
                                        >
                                            {/* Active selection indicator bar */}
                                            {!isSubmitted && isSelected && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-orange border-r border-zinc-900" />
                                            )}

                                            <div className={cn(
                                                "w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 z-10",
                                                question.type === "Select All That Apply" ? "rounded-sm" : "rounded-full",
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
                                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                                : "bg-red-50 border-red-300 text-red-900"
                        )}>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                {isCorrect ? <CheckCircle weight="fill" className="w-4 h-4" /> : <X weight="bold" className="w-4 h-4" />}
                                Explanation
                            </h4>
                            <p className="text-sm leading-relaxed">
                                {question.explanation}
                            </p>
                        </div>
                    )}

                    {/* Hints used in review (optional) */}
                    {isSubmitted && question.hint && visibleHint && (
                        <div className="text-xs text-zinc-500 italic mt-2">
                            Used Hint: {question.hint}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
