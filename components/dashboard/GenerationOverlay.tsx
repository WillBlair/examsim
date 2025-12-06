"use client";

import { useEffect, useState } from "react";
import { CheckCircle, CircleNotch } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    label: "Analyzing Documents",
  },
  {
    id: 2,
    label: "Structuring Knowledge",
  },
  {
    id: 3,
    label: "Generating Questions",
  },
];

interface GenerationOverlayProps {
  isOpen: boolean;
  currentStep?: number; // 0, 1, 2
  statusMessage?: string;
}

export function GenerationOverlay({ isOpen, currentStep = 0, statusMessage }: GenerationOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen) return null;
  if (!mounted && typeof document === 'undefined') return null; // SSR Safety

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white animate-in fade-in duration-300">

      {/* Central Content */}
      <div className="w-full max-w-lg p-6 flex flex-col items-center space-y-16">

        {/* Spinner & Main Title */}
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Spinning Brand Orange Loader - Large */}
          <div className="relative">
            <div className="absolute inset-0 bg-brand-orange/20 blur-2xl rounded-full scale-150" />
            <CircleNotch weight="bold" className="w-16 h-16 text-brand-orange animate-spin relative z-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Generating your Simulation...</h2>
            <p className="text-zinc-500 font-medium text-lg max-w-[300px] mx-auto leading-relaxed">{statusMessage || "Please wait..."}</p>
          </div>
        </div>

        {/* Pills List */}
        <div className="w-full flex flex-col gap-4 items-center">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "w-full max-w-[380px] py-4 px-8 rounded-full flex items-center justify-between transition-all duration-500",
                  isActive
                    ? "bg-white border-2 border-brand-orange shadow-lg shadow-brand-orange/10 scale-105 z-10"
                    : isCompleted
                      ? "bg-zinc-50 border-2 border-transparent"
                      : "bg-transparent border-2 border-transparent opacity-50"
                )}
              >
                <span className={cn(
                  "font-semibold text-lg transition-colors duration-300",
                  isActive
                    ? "text-zinc-900"
                    : isCompleted
                      ? "text-zinc-500"
                      : "text-zinc-400"
                )}>
                  {step.label}
                </span>

                {/* Right Indicator */}
                <div className="min-w-[24px] flex justify-end">
                  {isCompleted ? (
                    <CheckCircle weight="fill" className="w-7 h-7 text-brand-green" />
                  ) : isActive ? (
                    <div className="w-3 h-3 bg-brand-orange rounded-full animate-pulse" />
                  ) : (
                    <div className="w-7 h-7" /> // spacer
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
