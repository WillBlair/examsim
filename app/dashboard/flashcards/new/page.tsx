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
    Cards,
    Lightning,
    CheckCircle,
    Brain,
    MagicWand,
    Lightbulb,
    Stack,
    Shuffle
} from "@phosphor-icons/react";
import { UploadArea } from "@/components/dashboard/UploadArea";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { FlashcardPreview } from "@/components/flashcards/FlashcardPreview";
import { EnhancedGenerationOverlay } from "@/components/dashboard/EnhancedGenerationOverlay";

const CARD_COUNTS = [10, 20, 30, 40, 50];

export default function NewFlashcardsPage() {
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
    const [streamingDeckId, setStreamingDeckId] = useState<number | null>(null);
    const [streamingCards, setStreamingCards] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Configuration State
    const [topic, setTopic] = useState("");
    const [deckTitle, setDeckTitle] = useState("");
    const [cardCount, setCardCount] = useState(20);
    const [files, setFiles] = useState<File[]>([]);
    const [pastedText, setPastedText] = useState("");
    const [includeHints, setIncludeHints] = useState(true);

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
        setStreamingCards([]);
        setLogs([]);

        const fileCount = files.length;
        let baseTime = 10;
        baseTime += fileCount * 2;
        baseTime += cardCount * 0.8;
        setEstimatedTime(baseTime);

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
            setEstimatedTime(prev => Math.max(0, prev - 1));
        }, 1000);

        setStatus(fileCount > 0 ? "uploading" : "analyzing");
        addLog("System initialized. Starting flashcard generation...");

        const logInterval = setInterval(() => {
            const msgs = [
                "Parsing document structure...",
                "Extracting key concepts...",
                "Identifying important terms...",
                "Building knowledge connections...",
                "Structuring learning content...",
                "Optimizing card difficulty...",
            ];
            if (Math.random() > 0.7) {
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                addLog(msg);
            }
        }, 800);

        const formData = new FormData();
        formData.append("topic", topic);
        formData.append("deckTitle", deckTitle || topic || "New Flashcard Deck");
        formData.append("count", cardCount.toString());
        formData.append("includeHints", String(includeHints));

        if (sourceType === "files") {
            addLog(`Preparing ${files.length} files for processing...`);
            files.forEach(f => formData.append("files", f));
        } else {
            addLog("Processing text input...");
            formData.append("pastedText", pastedText);
        }

        try {
            addLog("Transmitting data to AI core...");
            const response = await fetch("/api/flashcards/generate", {
                method: "POST",
                body: formData,
            });

            clearInterval(logInterval);
            setStatus("generating");
            addLog("Content analysis complete. Creating flashcards...");

            if (!response.ok) {
                let errorMessage = "Failed to start generation";
                try {
                    const errorData = await response.json();
                    if (errorData.error) errorMessage = errorData.error;
                } catch { }
                addLog(`Error: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            const deckIdStr = response.headers.get("X-Deck-Id");
            if (!deckIdStr) throw new Error("No deck ID returned");
            const deckId = parseInt(deckIdStr);
            setStreamingDeckId(deckId);
            addLog(`Flashcard deck initialized (ID: ${deckId})`);

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
                        if (parsed.cards && Array.isArray(parsed.cards)) {
                            updateCards(parsed.cards);
                        }
                    } catch {
                        const cardsMatch = accumulatedJson.match(/"cards"\s*:\s*\[([\s\S]*)/);
                        if (cardsMatch) {
                            const arrayContent = cardsMatch[1];
                            const extractedCards: any[] = [];
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
                                                const card = JSON.parse(currentObject);
                                                extractedCards.push(card);
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

                            if (extractedCards.length > 0) {
                                updateCards(extractedCards);
                            }
                        }
                    }
                }
            }

            function updateCards(currentCards: any[]) {
                const count = currentCards.length;
                const streamProgress = 30 + (count / cardCount) * 60;
                setTargetProgress(prev => Math.max(prev, streamProgress));

                const prevCount = streamingCards.length;
                if (count > prevCount) {
                    addLog(`Generated card ${count}/${cardCount}...`);
                }

                if (count > 0) {
                    const validCards = currentCards
                        .filter((card: any) => card.front && card.back)
                        .map((card: any, i: number) => ({
                            id: i,
                            front: card.front,
                            back: card.back,
                            hint: card.hint || null,
                        }));

                    if (validCards.length > 0) {
                        setStreamingCards(validCards);
                    }
                }
            }

            setTargetProgress(100);
            addLog("Generation complete. Finalizing deck...");
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setEstimatedTime(0);

            // Short delay then redirect to study
            await new Promise(resolve => setTimeout(resolve, 1500));
            addLog("Deck ready! Redirecting to study mode...");
            await new Promise(resolve => setTimeout(resolve, 500));
            router.push(`/dashboard/flashcards/${deckId}`);

        } catch (error) {
            console.error(error);
            addLog(`Critical Error: ${error instanceof Error ? error.message : "Unknown"}`);
            toast.error("Generation Failed", {
                description: error instanceof Error ? error.message : "Unknown error"
            });
            if (!streamingDeckId) {
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

    const showOverlay = status !== "idle" && streamingCards.length < 3;

    return (
        <div className={cn(
            "w-full mx-auto py-8 px-6 relative",
            !streamingDeckId ? "min-h-[calc(100vh-4rem)]" : "h-full min-h-[calc(100vh-4rem)]"
        )}>
            <EnhancedGenerationOverlay
                isOpen={showOverlay}
                status={status}
                progress={progress}
                logs={logs}
                estimatedTimeRemaining={Math.round(estimatedTime)}
            />

            {streamingDeckId && streamingCards.length >= 3 ? (
                <div className="pt-8 animate-in fade-in duration-700">
                    <FlashcardPreview
                        cards={streamingCards}
                        deckTitle={deckTitle || topic || "New Flashcard Deck"}
                        isGenerating={isGenerating}
                        totalExpected={cardCount}
                    />
                </div>
            ) : (
                <>
                    {/* Page Header */}
                    <div className="mb-8">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4 group font-medium"
                        >
                            <CaretLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                                <Cards weight="fill" className="w-7 h-7 text-white" />
                            </div>
                            <div
                                className="cursor-pointer group"
                                onClick={() => uploadTriggerRef.current?.click()}
                            >
                                <h1 className="text-3xl font-black tracking-tight text-zinc-900 group-hover:text-amber-700 transition-colors">Create Flashcards</h1>
                                <p className="text-zinc-500 font-medium group-hover:text-amber-600 transition-colors">Generate study cards from your materials using AI</p>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout - Flex with proper sizing */}
                    <div className="flex flex-col xl:flex-row gap-8">
                        {/* Left Column: Source Input */}
                        <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="flex border-b border-zinc-200">
                                <button
                                    onClick={() => setSourceType("files")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2.5 py-4 text-sm font-semibold transition-all relative",
                                        sourceType === "files"
                                            ? "text-amber-700 bg-amber-50"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                    )}
                                >
                                    <Files weight={sourceType === "files" ? "fill" : "regular"} className="w-5 h-5" />
                                    Upload Files
                                    {sourceType === "files" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setSourceType("text")}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2.5 py-4 text-sm font-semibold transition-all relative",
                                        sourceType === "text"
                                            ? "text-amber-700 bg-amber-50"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                    )}
                                >
                                    <TextAa weight={sourceType === "text" ? "fill" : "regular"} className="w-5 h-5" />
                                    Paste Text
                                    {sourceType === "text" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                                    )}
                                </button>
                            </div>

                            <div className="p-5 flex-1 flex flex-col min-h-[280px]">
                                {sourceType === "files" ? (
                                    <UploadArea onFilesChange={setFiles} triggerRef={uploadTriggerRef} />
                                ) : (
                                    <Textarea
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        placeholder="Paste your notes, lecture content, or study material here...

Example:
- Copy/paste your lecture notes
- Paste textbook chapters
- Add your study guides
- Include any text-based material"
                                        className="h-full w-full resize-none border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-zinc-50/50 text-base rounded-xl p-5 placeholder:text-zinc-400"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right Column: Configuration */}
                        <div className="w-full xl:w-[600px] xl:shrink-0 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden h-fit">
                            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                    <Brain weight="fill" className="w-5 h-5 text-amber-500" />
                                    Deck Settings
                                </h3>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Deck Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Deck Title</label>
                                    <Input
                                        value={deckTitle}
                                        onChange={(e) => setDeckTitle(e.target.value)}
                                        placeholder="e.g. Biology Chapter 5"
                                        className="bg-zinc-50 border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 h-11 rounded-xl"
                                    />
                                </div>

                                {/* Topic */}
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                        Topic <span className="text-zinc-400 font-normal">(optional)</span>
                                    </label>
                                    <Input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. Cell Division, Mitosis"
                                        className="bg-zinc-50 border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 h-11 rounded-xl"
                                    />
                                </div>

                                {/* Card Count */}
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                                        Number of Cards
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {CARD_COUNTS.map(count => (
                                            <button
                                                key={count}
                                                onClick={() => setCardCount(count)}
                                                className={cn(
                                                    "h-11 text-sm font-bold rounded-xl transition-all border-2",
                                                    cardCount === count
                                                        ? "bg-zinc-900 text-white border-zinc-900"
                                                        : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
                                                )}
                                            >
                                                {count}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Include Hints Toggle */}
                                <button
                                    onClick={() => setIncludeHints(!includeHints)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all",
                                        includeHints
                                            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
                                            : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-9 h-9 rounded-lg flex items-center justify-center",
                                            includeHints ? "bg-amber-100" : "bg-zinc-200"
                                        )}>
                                            <Lightbulb
                                                weight={includeHints ? "fill" : "regular"}
                                                className={cn("w-5 h-5", includeHints ? "text-amber-600" : "text-zinc-400")}
                                            />
                                        </div>
                                        <span className={cn(
                                            "font-semibold",
                                            includeHints ? "text-amber-900" : "text-zinc-600"
                                        )}>
                                            Include Hints
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "w-12 h-7 rounded-full transition-all duration-200 relative",
                                        includeHints ? "bg-amber-500" : "bg-zinc-300"
                                    )}>
                                        <div className={cn(
                                            "w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-all duration-200",
                                            includeHints ? "left-6" : "left-1"
                                        )} />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Full Width: Generate Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!canProceed || isLoading}
                        className={cn(
                            "w-full h-14 rounded-xl font-bold text-base transition-all shadow-lg mt-6",
                            canProceed && !isLoading
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25"
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
                                Generate Flashcards
                            </>
                        )}
                    </Button>

                    {/* Full Width: Feature Preview Card */}
                    <div className="mt-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-200/60 p-5">
                        <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <MagicWand weight="fill" className="w-5 h-5 text-amber-600" />
                            What you&apos;ll get
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Stack, text: "AI-generated question & answer cards" },
                                { icon: Brain, text: "Spaced repetition study mode" },
                                { icon: Lightning, text: "Progress tracking & mastery levels" },
                                { icon: Shuffle, text: "Shuffle and study sessions" }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/80 border border-amber-200/60 flex items-center justify-center shrink-0">
                                        <feature.icon weight="fill" className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-sm font-medium text-amber-900">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
