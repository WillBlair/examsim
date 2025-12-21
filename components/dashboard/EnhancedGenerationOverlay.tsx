"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    CircleNotch,
    CheckCircle,
    CloudArrowUp,
    MagnifyingGlass,
    Sparkle,
    Timer
} from "@phosphor-icons/react";

interface EnhancedGenerationOverlayProps {
    isOpen: boolean;
    status: "idle" | "uploading" | "analyzing" | "generating";
    progress: number;
    logs: string[];
    estimatedTimeRemaining: number;
}

export function EnhancedGenerationOverlay({
    isOpen,
    status,
    progress,
    logs,
    estimatedTimeRemaining
}: EnhancedGenerationOverlayProps) {
    const [mounted, setMounted] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    if (!mounted) return null;

    const statusConfig = {
        idle: {
            title: "Preparing",
            subtitle: "Setting up your exam...",
            icon: CircleNotch
        },
        uploading: {
            title: "Uploading",
            subtitle: "Processing your materials...",
            icon: CloudArrowUp
        },
        analyzing: {
            title: "Analyzing",
            subtitle: "Understanding your content...",
            icon: MagnifyingGlass
        },
        generating: {
            title: "Generating",
            subtitle: "Creating your questions...",
            icon: Sparkle
        }
    };

    const current = statusConfig[status];
    const Icon = current.icon;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-100/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full max-w-xl mx-4 bg-white rounded-lg border-2 border-zinc-900 shadow-neo-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
                                        <Icon weight="duotone" className="w-6 h-6 text-brand-orange" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900">
                                            {current.title}
                                        </h2>
                                        <p className="text-sm text-zinc-500">
                                            {current.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-200">
                                    <Timer weight="bold" className="w-4 h-4 text-zinc-500" />
                                    <span className="font-mono text-sm font-semibold text-zinc-700">
                                        {Math.max(0, estimatedTimeRemaining)}s
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="p-6 space-y-6">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-zinc-600">Progress</span>
                                    <span className="font-bold text-zinc-900">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                    <motion.div
                                        className="h-full bg-brand-orange rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                    />
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="flex items-center justify-between">
                                <Step
                                    label="Upload"
                                    isActive={status === "uploading"}
                                    isDone={status === "analyzing" || status === "generating"}
                                />
                                <div className="flex-1 h-px bg-zinc-200 mx-3" />
                                <Step
                                    label="Analyze"
                                    isActive={status === "analyzing"}
                                    isDone={status === "generating"}
                                />
                                <div className="flex-1 h-px bg-zinc-200 mx-3" />
                                <Step
                                    label="Generate"
                                    isActive={status === "generating"}
                                    isDone={false}
                                />
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="border-t border-zinc-100 bg-zinc-50 p-4 max-h-40 overflow-hidden">
                            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                                Activity
                            </div>
                            <div className="space-y-1 overflow-y-auto max-h-24 custom-scrollbar font-mono text-xs">
                                <AnimatePresence initial={false}>
                                    {logs.slice(-5).map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-zinc-500"
                                        >
                                            {log}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function Step({ label, isActive, isDone }: { label: string; isActive: boolean; isDone: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                isDone
                    ? "bg-brand-orange text-white"
                    : isActive
                        ? "bg-brand-orange/10 text-brand-orange border-2 border-brand-orange"
                        : "bg-zinc-100 text-zinc-400 border border-zinc-200"
            )}>
                {isDone ? (
                    <CheckCircle weight="bold" className="w-4 h-4" />
                ) : isActive ? (
                    <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                ) : (
                    <span className="text-xs">•</span>
                )}
            </div>
            <span className={cn(
                "text-xs font-medium",
                isActive || isDone ? "text-zinc-900" : "text-zinc-400"
            )}>
                {label}
            </span>
        </div>
    );
}
