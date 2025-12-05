"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner, UploadSimple, FileText, Sparkle, CaretLeft, Timer } from "@phosphor-icons/react";
import { UploadArea } from "@/components/dashboard/UploadArea";
import { generateExamAction } from "@/app/actions/generate-exam";
import { GenerationOverlay } from "@/components/dashboard/GenerationOverlay";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NewExamPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [sourceType, setSourceType] = useState<"files" | "text">("files");
    const [difficulty, setDifficulty] = useState("Easy");
    const [questionCount, setQuestionCount] = useState<number | string>(5);
    const [isCustomCount, setIsCustomCount] = useState(false);

    // Timer State
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [timerDuration, setTimerDuration] = useState<string>("30");

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);

        if (timerEnabled && timerDuration) {
            formData.append("timeLimit", timerDuration);
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const result = await generateExamAction(formData);
            if (result.success && result.examId) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                router.push(`/dashboard/exams/${result.examId}`);
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            alert(error instanceof Error ? error.message : "Error generating exam");
        }
    }

    const handlePresetClick = (count: number) => {
        setQuestionCount(count);
        setIsCustomCount(false);
    };

    const handleCustomClick = () => {
        setIsCustomCount(true);
        setQuestionCount("");
    };

    return (
        <div className="h-full flex flex-col relative z-10 w-full">
            <GenerationOverlay isOpen={isLoading} />

            {/* Full height background */}
            <div className="fixed top-0 right-0 bottom-0 left-[140px] bg-zinc-200/80 -z-10" />

            <div className="mb-6 flex-shrink-0 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                    <CaretLeft className="w-5 h-5 text-zinc-500" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-zinc-900">Create New Simulation</h1>
                    <p className="text-zinc-500 text-xs">Upload your materials and configure your exam parameters.</p>
                </div>
            </div>

            <form action={handleSubmit} className="flex-1 flex flex-col gap-6 min-h-0 pb-6">

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    {/* Left Column: Source Material */}
                    <div className="lg:col-span-5 h-full flex flex-col min-h-0">
                        <div className="bg-white rounded-3xl p-0 shadow-sm border border-zinc-200 flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div className="p-6 border-b border-zinc-50 bg-zinc-50/50 flex-shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-zinc-900">Source Material</h2>
                                    </div>
                                </div>

                                <div className="flex p-1 bg-white rounded-lg border border-zinc-200 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setSourceType("files")}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                            sourceType === "files"
                                                ? "bg-zinc-100 text-zinc-900 font-bold"
                                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                                        )}
                                    >
                                        <UploadSimple weight="bold" className="w-3.5 h-3.5" />
                                        <span>Upload</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSourceType("text")}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                            sourceType === "text"
                                                ? "bg-zinc-100 text-zinc-900 font-bold"
                                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                                        )}
                                    >
                                        <FileText weight="bold" className="w-3.5 h-3.5" />
                                        <span>Paste Text</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 p-6 flex flex-col">
                                {sourceType === "files" ? (
                                    <UploadArea />
                                ) : (
                                    <Textarea
                                        name="pastedText"
                                        placeholder="Paste your study notes, article, or syllabus content here..."
                                        className="h-full resize-none bg-zinc-50 border-0 focus:ring-0 p-6 text-sm leading-relaxed rounded-xl"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Configuration */}
                    <div className="lg:col-span-7 h-full flex flex-col min-h-0 gap-6">
                        <div className="bg-white rounded-3xl p-0 shadow-sm border border-zinc-200 flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div className="p-6 border-b border-zinc-50 bg-zinc-50/50 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                                    <div>
                                        <h2 className="text-lg font-extrabold text-zinc-900">Configuration</h2>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                {/* Topic Input */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Topic</label>
                                    <div className="relative group">
                                        <Sparkle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-brand-orange transition-colors" />
                                        <Input
                                            name="topic"
                                            placeholder="e.g. Biology 101"
                                            className="bg-zinc-50 border-transparent hover:bg-zinc-100 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 h-12 rounded-xl pl-11 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Difficulty Selector */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between">
                                        <span>Difficulty</span>
                                    </label>
                                    <input type="hidden" name="difficulty" value={difficulty} />
                                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-100/80 rounded-xl">
                                        {["Easy", "Medium", "Hard"].map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setDifficulty(level)}
                                                className={cn(
                                                    "py-2.5 text-xs font-bold rounded-lg transition-all",
                                                    difficulty === level
                                                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-black/5"
                                                        : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Count */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        Question Count
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {[5, 10, 20, 30].map((count) => (
                                            <button
                                                key={count}
                                                type="button"
                                                onClick={() => handlePresetClick(count)}
                                                className={cn(
                                                    "flex-1 h-12 text-sm font-bold rounded-xl border transition-all",
                                                    questionCount === count && !isCustomCount
                                                        ? "bg-zinc-900 text-white border-zinc-900"
                                                        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                                )}
                                            >
                                                {count}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={handleCustomClick}
                                            className={cn(
                                                "flex-1 h-12 text-sm font-bold rounded-xl border transition-all px-4",
                                                isCustomCount
                                                    ? "bg-zinc-900 text-white border-zinc-900"
                                                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                            )}
                                        >
                                            Custom
                                        </button>
                                    </div>

                                    {/* Custom Count Input */}
                                    {isCustomCount && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <div className="relative group">
                                                <Input
                                                    type="number"
                                                    name="count"
                                                    min="1"
                                                    max="50"
                                                    value={questionCount}
                                                    onChange={(e) => setQuestionCount(e.target.value)}
                                                    placeholder="Enter number of questions (1-50)"
                                                    className="bg-zinc-50 border-transparent hover:bg-zinc-100 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 h-12 rounded-xl transition-all text-center font-bold"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Hidden input for form submission when not custom */}
                                    {!isCustomCount && (
                                        <input type="hidden" name="count" value={questionCount} />
                                    )}
                                </div>

                                {/* Timer Configuration */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                            <Timer className="w-4 h-4" />
                                            Exam Timer
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setTimerEnabled(!timerEnabled)}
                                            className={cn(
                                                "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2",
                                                timerEnabled ? "bg-brand-orange" : "bg-zinc-200"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm",
                                                    timerEnabled ? "translate-x-7" : "translate-x-1"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    {timerEnabled && (
                                        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="180"
                                                    value={timerDuration}
                                                    onChange={(e) => setTimerDuration(e.target.value)}
                                                    className="w-20 text-center font-bold text-lg bg-white h-12"
                                                />
                                                <span className="text-zinc-500 font-medium">minutes</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-2">
                                                The timer will start automatically when you begin the exam.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button Area */}
                            <div className="p-6 border-t border-zinc-50 bg-zinc-50/30">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-orange via-orange-400 to-brand-orange rounded-xl blur opacity-20 group-hover:opacity-50 transition duration-500" />
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative w-full h-14 rounded-xl bg-brand-orange hover:bg-orange-400 text-white text-lg font-bold shadow-sm flex items-center justify-center gap-3 overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner className="w-5 h-5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                Generate Simulation
                                                <Sparkle weight="fill" className="w-5 h-5" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

