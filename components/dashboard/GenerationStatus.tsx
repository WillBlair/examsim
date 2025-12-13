"use client";

import { motion } from "framer-motion";
import { Spinner, Sparkle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GenerationStatusProps {
    status: "idle" | "uploading" | "analyzing" | "generating";
    progress: number; // 0 to 100
    estimatedTimeRemaining: number; // seconds
}

export function GenerationStatus({ status, progress, estimatedTimeRemaining }: GenerationStatusProps) {
    const [internalProgress, setInternalProgress] = useState(0);

    // Smoothly animate progress
    useEffect(() => {
        setInternalProgress(progress);
    }, [progress]);

    // Messages based on status
    const getStatusMessage = () => {
        switch (status) {
            case "uploading":
                return "Uploading files...";
            case "analyzing":
                return "Reading & analyzing content...";
            case "generating":
                return "Drafting questions...";
            default:
                return "Initializing...";
        }
    };

    if (status === "idle") return null;

    return (
        <div className="w-full bg-white border-2 border-zinc-900 rounded-lg p-5 shadow-neo animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    {status === "generating" ? (
                        <Sparkle weight="fill" className="w-5 h-5 text-brand-orange animate-pulse" />
                    ) : (
                        <Spinner className="w-5 h-5 text-zinc-400 animate-spin" />
                    )}
                    <span className="font-bold text-zinc-900 text-lg">
                        {getStatusMessage()}
                    </span>
                </div>
                <span className="font-mono text-zinc-500 font-medium text-sm">
                    ~{Math.max(0, estimatedTimeRemaining)}s remaining
                </span>
            </div>

            {/* Progress Bar Container */}
            <div className="h-4 w-full bg-zinc-100 rounded-full border border-zinc-200 overflow-hidden relative">
                {/* Animated Stripe Background */}
                <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)',
                        backgroundSize: '1rem 1rem',
                    }}
                />

                {/* Progress Fill */}
                <motion.div
                    className="h-full bg-brand-orange relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${internalProgress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                >
                    {/* Glossy highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20" />
                </motion.div>
            </div>

            <p className="text-xs text-zinc-400 mt-2 font-medium text-right">
                {Math.round(internalProgress)}% complete
            </p>
        </div>
    );
}
