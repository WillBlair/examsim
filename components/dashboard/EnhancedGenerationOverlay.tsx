"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    CircleNotch,
    CheckCircle,
    Cpu,
    FileText,
    Lightning,
    Hourglass
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

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="w-full max-w-2xl bg-white border-2 border-zinc-900 rounded-xl shadow-neo-xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b-2 border-zinc-900 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand-orange/20 blur-xl rounded-full" />
                                    <CircleNotch weight="bold" className="w-10 h-10 text-brand-orange animate-spin relative z-10" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight font-display uppercase">
                                        {status === "uploading" && "Uploading"}
                                        {status === "analyzing" && "Analyzing"}
                                        {status === "generating" && "Generating"}
                                        {status === "idle" && "Initializing"}
                                    </h2>
                                    <p className="text-zinc-500 text-xs font-mono font-bold tracking-wider uppercase">
                                        AI Processing Engine
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border-2 border-zinc-900 shadow-neo-sm">
                                <Hourglass weight="fill" className="w-4 h-4 text-zinc-900" />
                                <span className="text-zinc-900 font-mono text-sm font-bold">
                                    {Math.max(0, estimatedTimeRemaining)}s
                                </span>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="p-8 flex flex-col gap-8 bg-white">
                            {/* Progress Visualization */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-zinc-900 font-bold mb-1 uppercase tracking-tight">
                                    <span>Overall Progress</span>
                                    <span className="font-mono">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-6 w-full bg-zinc-50 rounded-full overflow-hidden border-2 border-zinc-900 relative shadow-inner">
                                    <div className="absolute inset-0 w-full h-full opacity-10"
                                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 10px)' }}
                                    />
                                    <motion.div
                                        className="h-full bg-brand-orange relative border-r-2 border-zinc-900"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ type: "spring", stiffness: 40, damping: 20 }}
                                    >
                                    </motion.div>
                                </div>
                            </div>

                            {/* Steps Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <StepCard
                                    icon={FileText}
                                    label="Upload"
                                    isActive={status === "uploading"}
                                    isDone={status !== "uploading" && status !== "idle"}
                                    color="brand-orange"
                                />
                                <StepCard
                                    icon={Cpu}
                                    label="Analyze"
                                    isActive={status === "analyzing"}
                                    isDone={status === "generating"}
                                    color="accent-purple"
                                />
                                <StepCard
                                    icon={Lightning}
                                    label="Generate"
                                    isActive={status === "generating"}
                                    isDone={false}
                                    color="brand-orange"
                                />
                            </div>
                        </div>

                        {/* Terminal / Log Output */}
                        <div className="bg-zinc-900 border-t-2 border-zinc-900 p-4 font-mono text-xs h-48 overflow-hidden flex flex-col relative">
                            <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                <Cpu weight="duotone" className="w-24 h-24 text-white" />
                            </div>
                            <div className="text-brand-orange mb-3 flex items-center gap-2 select-none font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
                                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                System Activity Log
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pb-2 relative z-10">
                                <AnimatePresence initial={false}>
                                    {logs.map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-3 text-zinc-300 font-medium"
                                        >
                                            <span className="text-zinc-600 shrink-0 font-light">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                            <span className="text-zinc-100">{log}</span>
                                        </motion.div>
                                    ))}
                                    {logs.length === 0 && (
                                        <div className="text-zinc-600 italic">Waiting for process start...</div>
                                    )}
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

function StepCard({ icon: Icon, label, isActive, isDone, color }: { icon: any, label: string, isActive: boolean, isDone: boolean, color: string }) {
    // Dynamic color classes based on the prop
    const activeBorderColor = color === "accent-purple" ? "border-accent-purple" : "border-brand-orange";
    const activeTextColor = color === "accent-purple" ? "text-accent-purple" : "text-brand-orange";
    const activeBgColor = color === "accent-purple" ? "bg-accent-purple" : "bg-brand-orange";

    return (
        <div className={cn(
            "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 bg-white",
            isActive
                ? `border-zinc-900 shadow-neo-lg -translate-y-1`
                : isDone
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 opacity-60 grayscale"
        )}>
            <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all font-bold",
                isActive
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : isDone
                        ? "bg-white border-zinc-900"
                        : "bg-zinc-50 border-zinc-200 text-zinc-300"
            )}>
                {isDone ?
                    <CheckCircle weight="fill" className={cn("w-6 h-6", activeTextColor)} />
                    :
                    <Icon weight={isActive ? "fill" : "bold"} className={cn("w-6 h-6", isActive ? "text-white" : "text-zinc-400")} />
                }
            </div>
            <span className={cn(
                "text-xs font-bold uppercase tracking-widest",
                isActive ? "text-zinc-900" : "text-zinc-500"
            )}>
                {label}
            </span>
        </div>
    );
}
