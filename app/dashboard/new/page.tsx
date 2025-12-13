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
    TextAa
} from "@phosphor-icons/react";
import { UploadArea } from "@/components/dashboard/UploadArea";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { ExamClient } from "@/components/dashboard/ExamClient";
import { getExamQuestions } from "@/app/actions/get-exam-questions";
import { EnhancedGenerationOverlay } from "@/components/dashboard/EnhancedGenerationOverlay";

// Simplified options for a cleaner UI
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const QUESTION_COUNTS = [5, 10, 15, 20, 30, 50];
const TIME_LIMITS = [
    { label: "None", value: 0 },
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "45m", value: 45 },
    { label: "60m", value: 60 },
    { label: "90m", value: 90 },
];

export default function NewExamPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [sourceType, setSourceType] = useState<"files" | "text">("files");

    // UX State
    const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "generating">("idle");
    const [progress, setProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    // SMOOTH PROGRESS LOGIC
    const [targetProgress, setTargetProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Smooth Progress Effect
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(current => {
                const diff = targetProgress - current;
                if (diff <= 0) return current;
                // Move towards target. 
                // If difference is large (e.g. 0 -> 30), move fast.
                // If difference is small (creeping to 95), move steady.

                // Base speed: 0.5% per tick (tick is 50ms) => ~10% per second
                const step = 0.5;

                // Acceleration for finishing
                const move = Math.min(diff, step);
                return current + move;
            });
        }, 50); // 20fps updates

        return () => clearInterval(timer);
    }, [targetProgress]);

    // Auto-increment target to simulate a ~10s loading time with "natural" pauses
    useEffect(() => {
        if (status === "idle") {
            setTargetProgress(0);
            return;
        }

        // Only simulate if we haven't finished
        if (targetProgress < 95) {
            const simulation = setInterval(() => {
                setTargetProgress(prev => {
                    if (prev >= 95) return prev;

                    // Natural Loading Algorithm (~6s total)
                    // 1. Fast start (0-30%)
                    // 2. Fast middle (30-70%)
                    // 3. Steady finish (70-95%)

                    let increment = 0;
                    const r = Math.random();

                    if (prev < 30) {
                        // Very Fast: 6-9% per tick (250ms) -> ~30% per sec (~1s total)
                        increment = 6 + (r * 3);
                    } else if (prev < 70) {
                        // Fast: 4-7% per tick -> ~22% per sec (~1.8s total)
                        increment = 4 + (r * 3);
                    } else {
                        // Steady: 1-3% per tick -> ~8% per sec (~3s tail)
                        increment = 1 + (r * 2);
                    }

                    return Math.min(95, prev + increment);
                });
            }, 250); // Update 4 times per second

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

    // Step 1 validation
    const canProceed = sourceType === "files" ? files.length > 0 : pastedText.trim().length > 0;

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, []);

    // Helper to add logs
    const addLog = (message: string) => {
        setLogs(prev => [...prev, message]);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setIsLoading(true);
        setIsGenerating(true);
        setStreamingQuestions([]);
        setLogs([]);

        // Initial estimates
        const fileCount = files.length;
        let baseTime = 10; // Connection overhead
        baseTime += fileCount * 2; // Processing time per file
        baseTime += questionCount * 1.5; // Generation time per question
        setEstimatedTime(baseTime);

        // Start countdown timer
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
            setEstimatedTime(prev => Math.max(0, prev - 1));
        }, 1000);

        // Initial Status
        setStatus(fileCount > 0 ? "uploading" : "analyzing");
        // setTargetProgress(10); // Handled by effect
        addLog("System initialized. Starting pipeline...");

        // Simulated Log Loop during upload/analysis
        const logInterval = setInterval(() => {
            const msgs = [
                "Parsing document structure...",
                "Extracting semantic concepts...",
                "Identifying key terminology...",
                "Evaluating difficulty metrics...",
                "Structuring knowledge graph...",
                "Validating content integrity..."
            ];
            // Randomly pick a log if analyzing
            if (Math.random() > 0.7) {
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                addLog(msg);
            }
        }, 800);

        // Construct FormData
        const formData = new FormData();
        formData.append("topic", topic);
        formData.append("difficulty", difficulty);
        formData.append("count", questionCount.toString());
        if (timeLimit > 0) {
            formData.append("timeLimit", timeLimit.toString());
        }

        if (sourceType === "files") {
            addLog(`Preparing ${files.length} files for upload...`);
            files.forEach(f => formData.append("files", f));
        } else {
            addLog("Processing text input...");
            formData.append("pastedText", pastedText);
        }

        try {
            addLog("Transmitting data to AI core...");
            // setTargetProgress(30); // Handled by effect
            const response = await fetch("/api/exam/generate", {
                method: "POST",
                body: formData,
            });

            // Headers received -> Processing Done -> Generating Starts
            // clearInterval(progressInterval); // Removed old interval
            clearInterval(logInterval);

            setStatus("generating");
            // Don't reset progress, just let it continue from where it was (approx 30%)
            // We removed setProgress(20) which was causing the jump back.
            // setProgress(20); 
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

            // Get Exam ID immediately
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

            // We want to dismiss the overlay only when we have actual questions to show (or maybe just the first one)
            // so the user can see the exam "start".
            // But we keep the overlay up to explain the "wait" before the first question.
            let hasHiddenOverlay = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("0:")) {
                            try {
                                // AI SDK stream format: "0:" + JSON string chunk
                                const content = JSON.parse(line.substring(2));
                                accumulatedJson += content;
                            } catch { /* ignore */ }
                        }
                    }

                    // Attempt partial parsing
                    try {
                        // 1. Try fully valid JSON first (efficient)
                        const parsed = JSON.parse(accumulatedJson);
                        if (parsed.questions && Array.isArray(parsed.questions)) {
                            updateQuestions(parsed.questions);
                        }
                    } catch {
                        // 2. Fallback: Heuristic extraction of questions array
                        // We look for "questions": [ ...
                        // And try to extract complete objects from inside
                        const questionsMatch = accumulatedJson.match(/"questions"\s*:\s*\[([\s\S]*)/);
                        if (questionsMatch) {
                            const arrayContent = questionsMatch[1];
                            const extractedQuestions: any[] = [];
                            let depth = 0;
                            let currentObject = "";
                            let inString = false;

                            // Simple state machine to extract full objects from the array string
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
                                        break; // End of questions array
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

                // Update Progress
                // We don't really rely on question count for the smooth bar anymore, 
                // but we can ensure the target floor rises if we are getting close.
                // Let the auto-creep handle the "feel", just ensure we don't lag behind actual count if it's fast.
                const streamProgress = 30 + (count / questionCount) * 60; // Map to 30-90 range
                setTargetProgress(prev => Math.max(prev, streamProgress));

                // Add log for new questions
                const prevCount = streamingQuestions.length;
                if (count > prevCount && !hasHiddenOverlay) {
                    addLog(`Generated question ${count}/${questionCount}...`);
                }

                // If we have questions, update state
                if (count > 0) {
                    setStreamingQuestions(currentQuestions.map((q: any, i: number) => ({
                        id: i,
                        questionText: q.text || "",
                        options: q.options || [],
                        correctAnswer: q.correctAnswer || "",
                        explanation: q.explanation || "",
                        type: q.type || "Multiple Choice"
                    })));
                }
            }

            // Stream Finished
            setTargetProgress(100); // Zoom to finish
            addLog("Generation complete. Finalizing session...");
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setEstimatedTime(0);

            // Fetch final
            if (examId) {
                const finalQuestions = await getExamQuestions(examId);
                setStreamingQuestions(finalQuestions);
                addLog("Exam ready.");
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

    // Logic: Unify rendering to prevent flashes.
    // Overlay is ALWAYS rendered but controlled by 'isOpen'.
    // We keep overlay OPEN if status is not idle AND (we are still generating OR we haven't hit 100% viz yet)

    // We want to keep overlay up until we have hit 100% AND a small delay has passed.
    // BUT user wants to answer questions "while generating".
    // So we should dismiss overlay as soon as we have questions? 
    // User said: "progress line never hits 100".
    // Maybe we should keep overlay until 100% IF the user wants to wait? 
    // BUT the text says "Answer while generating".
    // Compromise: 
    // 1. Show overlay during "Uploading" & "Analyzing".
    // 2. Once "Generating" starts (questions arrive), we CAN dismiss it to let them answer.
    // 3. BUT to show 100%, we might need a mini-progress bar in the main UI?
    // 4. OR, user complaining about "restart" implies they saw the overlay disappear and reappear.
    //    That happened because of the `if (streamingExamId)` block switching the whole tree.
    //    By fixing the tree, the flash goes away. 
    //    We can dismiss overlay once `streamingQuestions.length > 0` effectively.
    //    The "100%" comment might refer to the "Analyzing" bar never finishing before it vanished.

    // Let's ensure smoother transition:
    // When switching to 'generating', we keep overlay for 500ms to show "Analysis Complete".
    // Then fade out.

    const showOverlay = status !== "idle" && streamingQuestions.length === 0;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 relative min-h-screen">
            {/* Unified Overlay Instance - Persists across state changes */}
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
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
                    {/* Left Column: Header & Input Source */}
                    <div className="lg:col-span-2 flex flex-col gap-8 h-full">
                        {/* Header */}
                        <div className="bg-white border-2 border-zinc-900 shadow-neo rounded-lg p-6 w-full">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-2 group font-medium"
                            >
                                <CaretLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create New Exam</h1>
                            <p className="text-zinc-500 mt-1 font-medium">Transform your study materials into an interactive simulation.</p>
                        </div>

                        <div className="bg-white rounded-lg border-2 border-zinc-900 p-1 shadow-neo flex flex-col flex-1 h-full">
                            <div className="flex p-1 bg-zinc-100 rounded-sm mb-6 mx-6 mt-6 border border-zinc-200 shrink-0">
                                <button
                                    onClick={() => setSourceType("files")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-sm transition-all",
                                        sourceType === "files"
                                            ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                                            : "text-zinc-500 hover:text-zinc-900"
                                    )}
                                >
                                    <Files className="w-4 h-4" />
                                    Upload Files
                                </button>
                                <button
                                    onClick={() => setSourceType("text")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-sm transition-all",
                                        sourceType === "text"
                                            ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                                            : "text-zinc-500 hover:text-zinc-900"
                                    )}
                                >
                                    <TextAa className="w-4 h-4" />
                                    Paste Text
                                </button>
                            </div>

                            <div className="px-6 pb-8 flex-1">
                                {sourceType === "files" ? (
                                    <div className="h-full">
                                        <UploadArea onFilesChange={setFiles} />
                                    </div>
                                ) : (
                                    <Textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        placeholder="Paste your notes, syllabus, or lecture transcript here..."
                                        className="min-h-[350px] h-full resize-none border-2 border-zinc-200 focus:border-zinc-900 focus:ring-0 bg-zinc-50/30 text-base rounded-sm"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Configuration & Action */}
                    <div className="flex flex-col h-full">
                        <div className="bg-white rounded-lg border-2 border-zinc-900 p-5 shadow-neo flex flex-col h-full">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 shrink-0">Exam Settings</h3>

                            <div className="space-y-5 flex-1 flex flex-col">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">Topic <span className="text-zinc-400 font-normal">(Optional)</span></label>
                                    <Input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. Biology 101"
                                        className="bg-white border-2 border-zinc-200 focus:border-zinc-900 focus:ring-0 h-10 rounded-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">Difficulty</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {DIFFICULTY_OPTIONS.map(opt => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setDifficulty(opt)}
                                                className={cn(
                                                    "px-3 py-2 text-sm rounded-sm border-2 transition-all",
                                                    difficulty === opt
                                                        ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                                                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">Questions</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {QUESTION_COUNTS.map(count => (
                                            <button
                                                key={count}
                                                type="button"
                                                onClick={() => setQuestionCount(count)}
                                                className={cn(
                                                    "px-3 py-2 text-sm rounded-sm border-2 transition-all",
                                                    questionCount === count
                                                        ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                                                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
                                                )}
                                            >
                                                {count}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">Time Limit</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {TIME_LIMITS.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setTimeLimit(opt.value)}
                                                className={cn(
                                                    "px-3 py-2 text-sm rounded-sm border-2 transition-all",
                                                    timeLimit === opt.value
                                                        ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                                                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-100 mt-auto">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canProceed || isLoading}
                                        className="w-full h-11 bg-brand-orange hover:bg-emerald-600 text-white rounded-sm font-bold text-base border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                                    >
                                        <Sparkle weight="fill" className="w-5 h-5 mr-2" />
                                        Generate Exam
                                    </Button>
                                    <p className="text-xs text-center text-zinc-400 mt-3 font-medium">
                                        Starts immediately - Answer while generating
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
