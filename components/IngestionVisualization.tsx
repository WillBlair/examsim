"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, FilePdf, FilePpt, Database, Lightning } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

export function IngestionVisualization() {
  const [step, setStep] = useState<"chaos" | "processing" | "structured">("chaos");

  // Cycle through states for the demo
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev === "chaos") return "processing";
        if (prev === "processing") return "structured";
        return "chaos";
      });
    }, 5000); // Increased cycle time for better readability
    return () => clearInterval(interval);
  }, []);

  // Positions for chaos state (random-ish but contained)
  const chaosPositions = [
    { x: -120, y: -80, rotate: -15, delay: 0 },
    { x: 100, y: -60, rotate: 10, delay: 0.1 },
    { x: -60, y: 90, rotate: -5, delay: 0.2 },
    { x: 130, y: 50, rotate: 20, delay: 0.05 },
    { x: 20, y: -120, rotate: 5, delay: 0.15 },
    { x: -100, y: 30, rotate: -25, delay: 0.25 },
    // Extra items for more chaos
    { x: 80, y: 110, rotate: 15, delay: 0.3 },
    { x: -50, y: -50, rotate: -10, delay: 0.12 },
  ];

  // Positions for structured state (hexagonal/graph layout)
  const structuredPositions = [
    { x: 0, y: -100 },    // Top
    { x: 86, y: -50 },    // Top Right
    { x: 86, y: 50 },     // Bottom Right
    { x: 0, y: 100 },     // Bottom
    { x: -86, y: 50 },    // Bottom Left
    { x: -86, y: -50 },   // Top Left
    // Inner ring
    { x: 45, y: -25 },
    { x: -45, y: 25 },
  ];

  // Particle effects for the "processing" stage
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    angle: (i * 360) / 12,
  }));

  return (
    <div className="w-full h-full min-h-[450px] bg-zinc-950 rounded-xl overflow-hidden relative flex items-center justify-center border border-zinc-800 shadow-2xl">
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        />
      </div>

      {/* Central Processor / Black Hole Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {step === "processing" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Spinning Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border-2 border-green-500/30 border-t-green-500 absolute -top-16 -left-16"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-2 border-green-400/30 border-b-green-400 absolute -top-12 -left-12"
              />
              
              {/* Sucking Particles */}
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute w-1 h-1 bg-green-400 rounded-full"
                  initial={{ x: Math.cos(p.angle * Math.PI / 180) * 150, y: Math.sin(p.angle * Math.PI / 180) * 150, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: [0, 1, 0] }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: p.id * 0.1,
                    ease: "easeIn"
                  }}
                />
              ))}

              {/* Center Glow */}
              <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_30px_10px_rgba(34,197,94,0.5)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Central Hub (Structured State) */}
      <AnimatePresence>
        {step === "structured" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute z-20 w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(22,163,74,0.4)] border-4 border-zinc-900"
          >
            <Database weight="fill" className="text-white w-8 h-8" />
            {/* Pulse Effect */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-green-500/30"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <AnimatePresence>
          {step === "structured" && structuredPositions.map((pos, i) => (
            <motion.line
              key={`line-${i}`}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${pos.x}px)`}
              y2={`calc(50% + ${pos.y}px)`}
              stroke="url(#gradient-line)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1,
                opacity: 0.4
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          ))}
        </AnimatePresence>
        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="1" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Document Items */}
      {chaosPositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute z-30 flex flex-col items-center justify-center"
          animate={{
            x: step === "chaos" ? pos.x : (step === "processing" ? 0 : structuredPositions[i]?.x || 0),
            y: step === "chaos" ? pos.y : (step === "processing" ? 0 : structuredPositions[i]?.y || 0),
            rotate: step === "chaos" ? pos.rotate : 0,
            scale: step === "processing" ? 0 : 1,
            opacity: step === "processing" ? 0 : 1
          }}
          transition={{
            type: "spring",
            stiffness: step === "processing" ? 50 : 80,
            damping: 15,
            delay: step === "structured" ? i * 0.05 : 0
          }}
        >
          {step === "chaos" ? (
            // File Icon (Chaos State)
            <div className="w-14 h-16 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              {i % 3 === 0 && <FilePdf weight="duotone" className="w-8 h-8 text-red-400/80" />}
              {i % 3 === 1 && <FileText weight="duotone" className="w-8 h-8 text-blue-400/80" />}
              {i % 3 === 2 && <FilePpt weight="duotone" className="w-8 h-8 text-orange-400/80" />}
              <div className="absolute bottom-2 w-8 h-1 bg-zinc-700 rounded-full" />
            </div>
          ) : (
            // Node Icon (Structured State)
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-green-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <Lightning weight="fill" className="w-4 h-4 text-green-500" />
              </div>
              <motion.div 
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-green-500/60 whitespace-nowrap bg-zinc-950/80 px-2 py-0.5 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Concept_{i + 1}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Status Label */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-md text-xs font-medium shadow-xl flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${
              step === "chaos" ? "bg-red-500 animate-pulse" :
              step === "processing" ? "bg-yellow-500 animate-pulse" :
              "bg-green-500"
            }`} />
            <span className="text-zinc-300">
              {step === "chaos" && "Raw Files Detected"}
              {step === "processing" && "Processing & Vectorizing..."}
              {step === "structured" && "Knowledge Graph Ready"}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
