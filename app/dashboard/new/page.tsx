"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Spinner,
    Sparkle,
    CaretLeft,
    Files,
    TextAa,
    CheckSquare,
    GraduationCap,
    Timer,
    Brain,
    Lightbulb,
    ChatCircleText,
    ListChecks,
    Trophy,
    Target,
    Lightning
} from "@phosphor-icons/react";
import { UploadArea } from "@/components/dashboard/UploadArea";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { ExamClient } from "@/components/dashboard/ExamClient";
import { getExamQuestions } from "@/app/actions/get-exam-questions";
import { EnhancedGenerationOverlay } from "@/components/dashboard/EnhancedGenerationOverlay";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const QUESTION_COUNTS = [5, 10, 15, 20, 30, 50];
const TIME_LIMITS = [
    { label: "None", value: 0 },
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "60m", value: 60 },
];

export default function NewExamPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [sourceType, setSourceType] = useState<"files" | "text">("files");

    // UX State
    const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "generating">("idle");
    const [progress, setProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [targetProgress, setTargetProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Smooth Progress Effect
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(current => {
                const diff = targetProgress - current;
                if (diff <= 0) return current;
                const step = 0.5;
                const move = Math.min(diff, step);
                return current + move;
            });
        }, 50);

        return () => clearInterval(timer);
    }, [targetProgress]);

    // Auto-increment target simulation
    useEffect(() => {
        if (status === "idle") {
            setTargetProgress(0);
            return;
        }

        if (targetProgress < 95) {
            const simulation = setInterval(() => {
                setTargetProgress(prev => {
                    if (prev >= 95) return prev;

                    let increment = 0;
                    const r = Math.random();

                    if (prev < 30) {
                        increment = 6 + (r * 3);
                    } else if (prev < 70) {
                        increment = 4 + (r * 3);
                    } else {
                        increment = 1 + (r * 2);
                    }

                    return Math.min(95, prev + increment);
                });
            }, 250);

            return () => clearInterval(simulation);
        }
    }, [status, targetProgress]);

    // Streaming State
    const [streamingExamId, setStreamingExamId] = useState<number | null>(null);
    const [streamingQuestions, setStreamingQuestions] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Configuration State
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [questionCount, setQuestionCount] = useState(10);
    const [timeLimit, setTimeLimit] = useState(0);
    const [files, setFiles] = useState<File[]>([]);
    const [pastedText, setPastedText] = useState("");

    // Advanced Settings
    const [questionTypes, setQuestionTypes] = useState<string[]>(["Multiple Choice"]);
    const [allowHints, setAllowHints] = useState(true);
    const [allowExplanations, setAllowExplanations] = useState(true);
    
    // Ref to trigger upload from header click
    const uploadTriggerRef = useRef<HTMLDivElement>(null);

    const canProceed = sourceType === "files" ? files.length > 0 : pastedText.trim().length > 0;

    useEffect(() => {
        return () => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, []);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, message]);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setIsLoading(true);
        setIsGenerating(true);
        setStreamingQuestions([]);
        setLogs([]);

        const fileCount = files.length;
        let baseTime = 10;
        baseTime += fileCount * 2;
        baseTime += questionCount * 1.5;
        setEstimatedTime(baseTime);

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
            setEstimatedTime(prev => Math.max(0, prev - 1));
        }, 1000);

        setStatus(fileCount > 0 ? "uploading" : "analyzing");
        addLog("System initialized. Starting pipeline...");

        const logInterval = setInterval(() => {
            const msgs = [
                "Parsing document structure...",
                "Extracting semantic concepts...",
                "Identifying key terminology...",
                "Evaluating difficulty metrics...",
                "Structuring knowledge graph...",
                "Validating content integrity..."
            ];
            if (Math.random() > 0.7) {
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                addLog(msg);
            }
        }, 800);

        const formData = new FormData();
        formData.append("topic", topic);
        formData.append("difficulty", difficulty);
        formData.append("count", questionCount.toString());
        if (timeLimit > 0) {
            formData.append("timeLimit", timeLimit.toString());
        }

        formData.append("questionTypes", JSON.stringify(questionTypes));
        formData.append("allowHints", String(allowHints));
        formData.append("allowExplanations", String(allowExplanations));

        if (sourceType === "files") {
            addLog(`Preparing ${files.length} files for upload...`);
            files.forEach(f => formData.append("files", f));
        } else {
            addLog("Processing text input...");
            formData.append("pastedText", pastedText);
        }

        try {
            addLog("Transmitting data to AI core...");
            const response = await fetch("/api/exam/generate", {
                method: "POST",
                body: formData,
            });

            clearInterval(logInterval);
            setStatus("generating");
            addLog("Content analysis complete. Drafting questions...");

            if (!response.ok) {
                let errorMessage = "Failed to start generation";
                try {
                    const errorData = await response.json();
                    if (errorData.error) errorMessage = errorData.error;
                } catch { }
                addLog(`Error: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            const examIdStr = response.headers.get("X-Exam-Id");
            if (!examIdStr) throw new Error("No exam ID returned");
            const examId = parseInt(examIdStr);
            setStreamingExamId(examId);
            addLog(`Exam session initialized (ID: ${examId})`);

            if (!response.body) throw new Error("No response body received");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulatedJson = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("0:")) {
                            try {
                                const content = JSON.parse(line.substring(2));
                                accumulatedJson += content;
                            } catch { /* ignore */ }
                        }
                    }

                    try {
                        const parsed = JSON.parse(accumulatedJson);
                        if (parsed.questions && Array.isArray(parsed.questions)) {
                            updateQuestions(parsed.questions);
                        }
                    } catch {
                        const questionsMatch = accumulatedJson.match(/"questions"\s*:\s*\[([\s\S]*)/);
                        if (questionsMatch) {
                            const arrayContent = questionsMatch[1];
                            const extractedQuestions: any[] = [];
                            let depth = 0;
                            let currentObject = "";
                            let inString = false;

                            for (let i = 0; i < arrayContent.length; i++) {
                                const char = arrayContent[i];

                                if (char === '"' && arrayContent[i - 1] !== '\\') {
                                    inString = !inString;
                                }

                                if (!inString) {
                                    if (char === '{') {
                                        if (depth === 0) currentObject = "";
                                        depth++;
                                    } else if (char === '}') {
                                        depth--;
                                        if (depth === 0) {
                                            currentObject += char;
                                            try {
                                                const q = JSON.parse(currentObject);
                                                extractedQuestions.push(q);
                                            } catch { /* ignore invalid objects */ }
                                            currentObject = "";
                                            continue;
                                        }
                                    } else if (char === ']' && depth === 0) {
                                        break;
                                    }
                                }

                                if (depth > 0) {
                                    currentObject += char;
                                }
                            }

                            if (extractedQuestions.length > 0) {
                                updateQuestions(extractedQuestions);
                            }
                        }
                    }
                }
            }

            function updateQuestions(currentQuestions: any[]) {
                const count = currentQuestions.length;
                const streamProgress = 30 + (count / questionCount) * 60;
                setTargetProgress(prev => Math.max(prev, streamProgress));

                const prevCount = streamingQuestions.length;
                if (count > prevCount) {
                    addLog(`Generated question ${count}/${questionCount}...`);
                }

                if (count > 0) {
                    const validQuestions = currentQuestions
                        .map((q: any, i: number) => ({
                            id: i,
                            questionText: q.text || "",
                            options: q.options || [],
                            correctAnswer: q.correctAnswer || "",
                            explanation: q.explanation || "",
                            hint: q.hint || null,
                            type: q.type || "Multiple Choice"
                        }))
                        .filter((q: any) =>
                            q.type === "Fill in the Blank" ||
                            (q.options && q.options.length > 0 && q.options.some((opt: string) => opt && opt.trim()))
                        );

                    if (validQuestions.length > 0) {
                        setStreamingQuestions(validQuestions);
                    }
                }
            }

            setTargetProgress(100);
            addLog("Generation complete. Finalizing session...");
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setEstimatedTime(0);

            if (examId) {
                let retries = 0;
                const maxRetries = 5;

                while (retries < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 500 + retries * 300));
                    const finalQuestions = await getExamQuestions(examId);

                    const hasValidOptions = finalQuestions.length > 0 &&
                        finalQuestions.every((q: any) =>
                            q.type === "Fill in the Blank" ||
                            (q.options && q.options.length > 0 && q.options.some((opt: string) => opt && opt.trim()))
                        );

                    if (hasValidOptions) {
                        setStreamingQuestions(finalQuestions);
                        addLog("Exam ready.");
                        break;
                    }

                    retries++;
                    if (retries < maxRetries) {
                        addLog(`Loading options... (attempt ${retries + 1})`);
                    }
                }

                if (retries >= maxRetries) {
                    const finalQuestions = await getExamQuestions(examId);
                    setStreamingQuestions(finalQuestions);
                    addLog("Exam ready.");
                }
            }

        } catch (error) {
            console.error(error);
            addLog(`Critical Error: ${error instanceof Error ? error.message : "Unknown"}`);
            toast.error("Generation Failed", {
                description: error instanceof Error ? error.message : "Unknown error"
            });
            if (!streamingExamId) {
                setIsLoading(false);
                setIsGenerating(false);
                setStatus("idle");
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            }
        } finally {
            setIsGenerating(false);
            setIsLoading(false);
        }
    }

    const showOverlay = status !== "idle" && streamingQuestions.length === 0;

    return (
        <div className={cn(
            "max-w-5xl mx-auto py-6 px-6 relative",
            !streamingExamId ? "min-h-[calc(100vh-4rem)]" : "h-full min-h-[calc(100vh-4rem)]"
        )}>
            <EnhancedGenerationOverlay
                isOpen={showOverlay}
                status={status}
                progress={progress}
                logs={logs}
                estimatedTimeRemaining={Math.round(estimatedTime)}
            />

            {streamingExamId ? (
                <div className="pt-8 animate-in fade-in duration-700">
                    <ExamClient
                        exam={{
                            id: streamingExamId,
                            title: topic ? `${topic} Exam` : "Generated Exam",
                            topic: topic || "Uploaded Content",
                            difficulty: difficulty,
                            timeLimit: timeLimit
                        }}
                        questions={streamingQuestions}
                        initialTimer={timeLimit || undefined}
                        isGenerating={isGenerating}
                        allowHints={allowHints}
                        allowExplanations={allowExplanations}
                    />
                </div>
            ) : (
                <>
                    {/* Page Header */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-3 group font-medium"
                        >
                            <CaretLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <GraduationCap weight="fill" className="w-6 h-6 text-white" />
                            </div>
                            <div 
                                className="cursor-pointer group"
                                onClick={() => uploadTriggerRef.current?.click()}
                            >
                                <h1 className="text-2xl font-black tracking-tight text-zinc-900 group-hover:text-emerald-700 transition-colors">Create New Exam</h1>
                                <p className="text-zinc-500 font-medium text-sm group-hover:text-emerald-600 transition-colors">Transform your study materials into an interactive simulation</p>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                        {/* Left Column: Source Input */}
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="flex border-b border-zinc-200">
                                <button
                                    onClick={() => setSourceType("files")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2.5 py-4 text-sm font-semibold transition-all relative",
                                        sourceType === "files"
                                            ? "text-emerald-700 bg-emerald-50"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                    )}
                                >
                                    <Files weight={sourceType === "files" ? "fill" : "regular"} className="w-5 h-5" />
                                    Upload Files
                                    {sourceType === "files" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setSourceType("text")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2.5 py-4 text-sm font-semibold transition-all relative",
                                        sourceType === "text"
                                            ? "text-emerald-700 bg-emerald-50"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                    )}
                                >
                                    <TextAa weight={sourceType === "text" ? "fill" : "regular"} className="w-5 h-5" />
                                    Paste Text
                                    {sourceType === "text" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                                    )}
                                </button>
                            </div>

                            <div className="p-5 h-[320px]">
                                {sourceType === "files" ? (
                                    <UploadArea onFilesChange={setFiles} triggerRef={uploadTriggerRef} />
                                ) : (
                                    <Textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        placeholder="Paste your notes, syllabus, or lecture transcript here..."
                                        className="h-full w-full resize-none border border-zinc-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-zinc-50/50 text-base rounded-xl p-4 placeholder:text-zinc-400"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right Column: Configuration */}
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden h-fit">
                            <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
                                <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm">
                                    <Brain weight="fill" className="w-4 h-4 text-emerald-500" />
                                    Exam Settings
                                </h3>
                            </div>

                            <div className="p-4 space-y-3">
                                {/* Topic */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Topic</label>
                                    <Input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. Biology 101"
                                        className="bg-zinc-50 border-zinc-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 h-9 rounded-lg text-sm"
                                    />
                                </div>

                                {/* Difficulty & Time Limit - Side by Side */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Difficulty</label>
                                        <div className="grid grid-cols-3 gap-1">
                                            {DIFFICULTY_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setDifficulty(opt)}
                                                    className={cn(
                                                        "h-8 text-xs font-bold rounded-lg transition-all border",
                                                        difficulty === opt
                                                            ? "bg-zinc-900 text-white border-zinc-900"
                                                            : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300"
                                                    )}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Time Limit</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {TIME_LIMITS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setTimeLimit(opt.value)}
                                                className={cn(
                                                    "h-8 text-xs font-bold rounded-lg transition-all border",
                                                    timeLimit === opt.value
                                                        ? "bg-zinc-900 text-white border-zinc-900"
                                                        : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Question Count */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                                        Questions
                                    </label>
                                    <div className="grid grid-cols-6 gap-1">
                                        {QUESTION_COUNTS.map(count => (
                                            <button
                                                key={count}
                                                onClick={() => setQuestionCount(count)}
                                                className={cn(
                                                    "h-8 text-xs font-bold rounded-lg transition-all border",
                                                    questionCount === count
                                                        ? "bg-zinc-900 text-white border-zinc-900"
                                                        : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300"
                                                )}
                                            >
                                                {count}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Types */}
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Question Types</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Multiple Choice", "True/False"].map((type) => {
                                            const isSelected = questionTypes.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setQuestionTypes(prev =>
                                                            prev.includes(type)
                                                                ? (prev.length > 1 ? prev.filter(t => t !== type) : prev)
                                                                : [...prev, type]
                                                        )
                                                    }}
                                                    className={cn(
                                                        "h-9 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-between gap-1",
                                                        isSelected
                                                            ? "bg-zinc-900 text-white border-zinc-900"
                                                            : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300"
                                                    )}
                                                >
                                                    <span>{type}</span>
                                                    <div className={cn(
                                                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                        isSelected ? "border-white bg-white/20" : "border-zinc-300"
                                                    )}>
                                                        {isSelected && <CheckSquare weight="fill" className="w-3 h-3 text-white" />}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setAllowHints(!allowHints)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all",
                                            allowHints
                                                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                                                : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Lightbulb
                                                weight={allowHints ? "fill" : "regular"}
                                                className={cn("w-4 h-4", allowHints ? "text-emerald-600" : "text-zinc-400")}
                                            />
                                            <span className={cn(
                                                "text-xs font-semibold",
                                                allowHints ? "text-emerald-900" : "text-zinc-600"
                                            )}>
                                                Hints
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "w-9 h-5 rounded-full transition-all duration-200 relative",
                                            allowHints ? "bg-emerald-500" : "bg-zinc-300"
                                        )}>
                                            <div className={cn(
                                                "w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-[3px] transition-all duration-200",
                                                allowHints ? "left-[18px]" : "left-[3px]"
                                            )} />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setAllowExplanations(!allowExplanations)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all",
                                            allowExplanations
                                                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                                                : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <ChatCircleText
                                                weight={allowExplanations ? "fill" : "regular"}
                                                className={cn("w-4 h-4", allowExplanations ? "text-emerald-600" : "text-zinc-400")}
                                            />
                                            <span className={cn(
                                                "text-xs font-semibold",
                                                allowExplanations ? "text-emerald-900" : "text-zinc-600"
                                            )}>
                                                Explain
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "w-9 h-5 rounded-full transition-all duration-200 relative",
                                            allowExplanations ? "bg-emerald-500" : "bg-zinc-300"
                                        )}>
                                            <div className={cn(
                                                "w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-[3px] transition-all duration-200",
                                                allowExplanations ? "left-[18px]" : "left-[3px]"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full Width: Generate Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!canProceed || isLoading}
                        className={cn(
                            "w-full h-12 rounded-xl font-bold text-sm transition-all shadow-lg mt-5",
                            canProceed && !isLoading
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/25"
                                : "bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Spinner className="w-5 h-5 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkle weight="fill" className="w-5 h-5 mr-2" />
                                Start Generation
                            </>
                        )}
                    </Button>

                    {/* Full Width: Feature Preview Card */}
                    <div className="mt-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-200/60 p-4">
                        <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2 text-sm">
                            <Trophy weight="fill" className="w-4 h-4 text-emerald-600" />
                            What you&apos;ll get
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { icon: ListChecks, text: "AI-generated questions" },
                                { icon: Target, text: "Adaptive difficulty" },
                                { icon: Timer, text: "Timed simulation" },
                                { icon: Lightning, text: "Instant feedback" }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-white/80 border border-emerald-200/60 flex items-center justify-center shrink-0">
                                        <feature.icon weight="fill" className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-medium text-emerald-900">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
