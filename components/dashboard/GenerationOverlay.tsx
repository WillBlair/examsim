"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Brain, FileText, PenNib } from "@phosphor-icons/react";
import { createPortal } from "react-dom";

const steps = [
  {
    id: 1,
    label: "Analyzing Documents",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: 2,
    label: "Structuring Knowledge",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: 3,
    label: "Generating Questions",
    icon: PenNib,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

export function GenerationOverlay({ isOpen }: { isOpen: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    // Simulate progress through steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500); // Faster steps to feel snappier

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;
  if (!mounted && typeof document === 'undefined') return null; // SSR Safety

  // Simplified render without Portal first to test visibility
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-300">

      <div className="w-full max-w-md p-8 space-y-8 bg-white border border-zinc-200 rounded-2xl shadow-2xl relative z-[10000]">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900">Building Simulation</h2>
          <p className="text-zinc-500">Please wait while we prepare your exam...</p>
        </div>

        <div className="space-y-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-zinc-100 -z-10" />

          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isActive || isCompleted
                      ? "border-transparent " + step.bg + " " + step.color
                      : "border-zinc-100 bg-white text-zinc-300"
                  }`}
                >
                  {isCompleted ? (
                    <Check weight="bold" className="w-5 h-5" />
                  ) : (
                    <Icon
                      weight="duotone"
                      className={`w-6 h-6 ${isActive ? "animate-pulse" : ""}`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium transition-colors duration-300 ${
                      isActive || isCompleted ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "linear" }}
                      className="h-1 bg-zinc-900 rounded-full mt-2"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
