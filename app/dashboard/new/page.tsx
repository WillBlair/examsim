"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Spinner, 
  Sparkle, 
  CaretLeft, 
  Files,
  TextAa,
  ArrowRight
} from "@phosphor-icons/react";
import { UploadArea } from "@/components/dashboard/UploadArea";
import { GenerationOverlay } from "@/components/dashboard/GenerationOverlay";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [sourceType, setSourceType] = useState<"files" | "text">("files");
  
  // Configuration State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState("");

  // Step 1 validation
  const canProceed = sourceType === "files" ? files.length > 0 : pastedText.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setIsLoading(true);
    setStatusMessage("Initializing...");
    
    // Construct FormData manually since we're using controlled inputs for better UI
    const formData = new FormData();
    formData.append("topic", topic);
    formData.append("difficulty", difficulty);
    formData.append("count", questionCount.toString());
    if (timeLimit > 0) {
        formData.append("timeLimit", timeLimit.toString());
    }
    
    if (sourceType === "files") {
        files.forEach(f => formData.append("files", f));
    } else {
        formData.append("pastedText", pastedText);
    }

    try {
      const response = await fetch("/api/exam/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok || !response.body) throw new Error("Failed to start generation");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.error) throw new Error(data.error);
              if (data.step !== undefined) setCurrentStep(data.step);
              if (data.message) setStatusMessage(data.message);
              if (data.success && data.examId) {
                // Exam ready, redirect without toast
                router.push(`/dashboard/exams/${data.examId}`);
                return;
              }
            } catch { /* Ignore incomplete chunks */ }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error("Generation Failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <GenerationOverlay isOpen={isLoading} currentStep={currentStep} statusMessage={statusMessage} />

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
                            {isLoading ? (
                                <Spinner className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Sparkle weight="fill" className="w-5 h-5 mr-2" />
                            )}
                            Generate Exam
                        </Button>
                        <p className="text-xs text-center text-zinc-400 mt-3 font-medium">
                            Estimated time: ~30 seconds
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
