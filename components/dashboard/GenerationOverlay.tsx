"use client";

import { useEffect, useState } from "react";
import { CheckCircle, CircleNotch } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Analyzing Documents" },
  { id: 2, label: "Structuring Knowledge" },
  { id: 3, label: "Generating Questions" },
];

interface GenerationOverlayProps {
  isOpen: boolean;
  currentStep?: number;
  statusMessage?: string;
}

export function GenerationOverlay({ isOpen, currentStep = 0, statusMessage }: GenerationOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen) return null;
  if (!mounted && typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-purple/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Content */}
      <div className="relative w-full max-w-md p-6 flex flex-col items-center space-y-12">
        {/* Spinner & Title */}
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-purple/30 blur-2xl rounded-full scale-150 animate-pulse-glow" />
            <CircleNotch weight="bold" className="w-14 h-14 text-accent-purple animate-spin relative z-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Generating Exam</h2>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
              {statusMessage || "Please wait..."}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="w-full flex flex-col gap-3">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "w-full py-3.5 px-5 rounded-xl flex items-center justify-between transition-all duration-500",
                  isActive
                    ? "bg-card border border-accent-purple/50 shadow-lg shadow-accent-purple/10 scale-[1.02]"
                    : isCompleted
                      ? "bg-secondary/50 border border-transparent"
                      : "bg-transparent border border-transparent opacity-40"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    isActive
                      ? "bg-accent-purple text-white"
                      : isCompleted
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-secondary text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <CheckCircle weight="fill" className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span className={cn(
                    "font-medium text-sm transition-colors",
                    isActive ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>

                {/* Indicator */}
                <div className="flex items-center">
                  {isCompleted ? (
                    <span className="text-xs font-medium text-emerald-400">Done</span>
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-accent-purple rounded-full animate-pulse" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
