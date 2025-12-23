"use client";

import { cn } from "@/lib/utils";
import { Cards, Spinner, CheckCircle, Sparkle, Lightning } from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface Card {
    id: number;
    front: string;
    back: string;
    hint?: string | null;
}

interface FlashcardPreviewProps {
    cards: Card[];
    deckTitle: string;
    isGenerating: boolean;
    totalExpected: number;
}

export function FlashcardPreview({ cards, deckTitle, isGenerating, totalExpected }: FlashcardPreviewProps) {
    const progress = (cards.length / totalExpected) * 100;

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-6 mb-8 relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                            <Cards weight="fill" className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-zinc-900">{deckTitle}</h1>
                            <p className="text-zinc-500 font-medium mt-0.5">
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkle weight="fill" className="w-4 h-4 text-amber-500 animate-pulse" />
                                        Generating flashcards...
                                    </span>
                                ) : (
                                    `${cards.length} cards ready to study`
                                )}
                            </p>
                        </div>
                    </div>

                    {isGenerating && (
                        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                            <Spinner className="w-5 h-5 text-amber-600 animate-spin" />
                            <span className="text-sm font-bold text-amber-900">
                                {cards.length}/{totalExpected} cards
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-5 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs font-medium text-zinc-400">
                    <span>{cards.length} generated</span>
                    <span>{Math.round(progress)}% complete</span>
                </div>
            </div>

            {/* Card Grid Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cards.slice(0, 9).map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                        className="group bg-white rounded-2xl border border-zinc-200 p-5 hover:border-amber-300 hover:shadow-lg transition-all duration-200 relative overflow-hidden"
                    >
                        {/* Card number badge */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full">
                                Card {index + 1}
                            </span>
                            <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                        </div>
                        
                        {/* Question preview */}
                        <p className="text-sm font-semibold text-zinc-900 line-clamp-3 group-hover:text-amber-700 transition-colors leading-relaxed">
                            {card.front}
                        </p>
                        
                        {/* Hint indicator */}
                        {card.hint && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
                                <Lightning weight="fill" className="w-3.5 h-3.5" />
                                <span className="font-medium">Has hint</span>
                            </div>
                        )}
                        
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
                    </motion.div>
                ))}

                {cards.length > 9 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                        className="bg-gradient-to-br from-zinc-50 to-slate-50 border-2 border-dashed border-zinc-300 rounded-2xl p-5 flex items-center justify-center min-h-[140px]"
                    >
                        <div className="text-center">
                            <span className="text-2xl font-black text-zinc-400">
                                +{cards.length - 9}
                            </span>
                            <p className="text-sm font-medium text-zinc-500 mt-1">more cards</p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Loading Placeholder Cards */}
            {isGenerating && cards.length < totalExpected && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                    {Array.from({ length: Math.min(3, totalExpected - cards.length) }).map((_, i) => (
                        <div
                            key={`loading-${i}`}
                            className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 animate-pulse"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-4 w-16 bg-zinc-200 rounded-full" />
                                <div className="h-5 w-5 bg-zinc-200 rounded-full" />
                            </div>
                            <div className="space-y-2.5">
                                <div className="h-4 w-full bg-zinc-200 rounded" />
                                <div className="h-4 w-4/5 bg-zinc-200 rounded" />
                                <div className="h-4 w-3/5 bg-zinc-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Generating message */}
            {isGenerating && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-zinc-500 font-medium">
                        <Sparkle weight="fill" className="w-4 h-4 inline mr-1.5 text-amber-500" />
                        AI is analyzing your content and generating smart flashcards...
                    </p>
                </motion.div>
            )}
        </div>
    );
}
