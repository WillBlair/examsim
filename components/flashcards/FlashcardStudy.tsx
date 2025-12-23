"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Shuffle,
    Lightning,
    CheckCircle,
    X,
    Eye,
    ArrowClockwise,
    Trophy,
    Fire,
    CaretLeft,
    Spinner,
    Books,
    Target,
    Star,
    Confetti,
    Sparkle,
    ArrowsClockwise
} from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { updateCardMastery, type MasteryStatus } from "@/app/actions/flashcards";
import { toast } from "sonner";

interface Flashcard {
    id: number;
    front: string;
    back: string;
    hint?: string | null;
    masteryStatus?: MasteryStatus;
    repetitions?: number | null;
}

interface FlashcardStudyProps {
    deckId: number;
    deckTitle: string;
    cards: Flashcard[];
    studyMode?: "all" | "learning" | "due" | "new";
    onComplete?: () => void;
}

export function FlashcardStudy({ 
    deckId, 
    deckTitle, 
    cards: initialCards,
    studyMode = "all",
    onComplete 
}: FlashcardStudyProps) {
    const [cards, setCards] = useState<Flashcard[]>(initialCards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [masteredCards, setMasteredCards] = useState<Set<number>>(() => {
        const mastered = new Set<number>();
        initialCards.forEach(card => {
            if (card.masteryStatus === "mastered" || (card.repetitions && card.repetitions >= 3)) {
                mastered.add(card.id);
            }
        });
        return mastered;
    });
    const [learningCards, setLearningCards] = useState<Set<number>>(() => {
        const learning = new Set<number>();
        initialCards.forEach(card => {
            if (card.masteryStatus === "learning" || (card.repetitions && card.repetitions > 0 && card.repetitions < 3)) {
                learning.add(card.id);
            }
        });
        return learning;
    });
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [sessionStats, setSessionStats] = useState({ gotIt: 0, stillLearning: 0 });
    const [direction, setDirection] = useState<1 | -1>(1);

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;
    const totalMastered = masteredCards.size;
    const totalLearning = learningCards.size;
    const totalNew = cards.length - totalMastered - totalLearning;

    const handleFlip = useCallback(() => {
        if (!isAnimating && !isPending) {
            setIsFlipped(prev => !prev);
            setShowHint(false);
        }
    }, [isAnimating, isPending]);

    const handleNext = useCallback(() => {
        if (currentIndex < cards.length - 1) {
            setDirection(1);
            setIsAnimating(true);
            setIsFlipped(false);
            setShowHint(false);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
            }, 150);
        }
    }, [currentIndex, cards.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setDirection(-1);
            setIsAnimating(true);
            setIsFlipped(false);
            setShowHint(false);
            setTimeout(() => {
                setCurrentIndex(prev => prev - 1);
                setIsAnimating(false);
            }, 150);
        }
    }, [currentIndex]);

    const handleShuffle = useCallback(() => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowHint(false);
    }, [cards]);

    const handleRestart = useCallback(() => {
        setCards(initialCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowHint(false);
        setSessionStats({ gotIt: 0, stillLearning: 0 });
    }, [initialCards]);

    const markAsKnown = useCallback(() => {
        if (!currentCard || isPending) return;

        startTransition(async () => {
            const result = await updateCardMastery(currentCard.id, "got_it");
            
            if (result.success) {
                setSessionStats(prev => ({ ...prev, gotIt: prev.gotIt + 1 }));
                
                if (result.masteryStatus === "mastered") {
                    setMasteredCards(prev => new Set([...prev, currentCard.id]));
                    setLearningCards(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(currentCard.id);
                        return newSet;
                    });
                } else if (result.masteryStatus === "learning") {
                    setLearningCards(prev => new Set([...prev, currentCard.id]));
                }
            } else {
                toast.error("Failed to save progress");
            }
        });

        handleNext();
    }, [currentCard, isPending, handleNext]);

    const markAsUnknown = useCallback(() => {
        if (!currentCard || isPending) return;

        startTransition(async () => {
            const result = await updateCardMastery(currentCard.id, "still_learning");
            
            if (result.success) {
                setSessionStats(prev => ({ ...prev, stillLearning: prev.stillLearning + 1 }));
                
                setMasteredCards(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentCard.id);
                    return newSet;
                });
                
                if (result.masteryStatus === "learning") {
                    setLearningCards(prev => new Set([...prev, currentCard.id]));
                } else {
                    setLearningCards(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(currentCard.id);
                        return newSet;
                    });
                }
            } else {
                toast.error("Failed to save progress");
            }
        });

        handleNext();
    }, [currentCard, isPending, handleNext]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                handleFlip();
            } else if (e.key === "ArrowRight" || e.key === "l") {
                handleNext();
            } else if (e.key === "ArrowLeft" || e.key === "h") {
                handlePrev();
            } else if (e.key === "1" && isFlipped) {
                markAsUnknown();
            } else if (e.key === "2" && isFlipped) {
                markAsKnown();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleFlip, handleNext, handlePrev, isFlipped, markAsKnown, markAsUnknown]);

    const isComplete = currentIndex === cards.length - 1 && isFlipped;

    // Get mastery status indicator for current card
    const getCurrentCardStatus = () => {
        if (!currentCard) return null;
        if (masteredCards.has(currentCard.id)) return "mastered";
        if (learningCards.has(currentCard.id)) return "learning";
        return "new";
    };

    const cardStatus = getCurrentCardStatus();

    // Study mode label
    const getModeLabel = () => {
        switch (studyMode) {
            case "learning": return "Still Learning";
            case "due": return "Due for Review";
            case "new": return "New Cards";
            default: return null;
        }
    };

    const modeLabel = getModeLabel();

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-b from-zinc-50 to-white">
            {/* Header */}
            <div className="px-4 py-4 shrink-0">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/flashcards"
                            className="p-2.5 hover:bg-zinc-100 rounded-xl transition-colors"
                        >
                            <CaretLeft className="w-5 h-5 text-zinc-500" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-lg font-bold text-zinc-900">{deckTitle}</h1>
                                {modeLabel && (
                                    <span className="px-2.5 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200/60">
                                        {modeLabel}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-zinc-500 font-medium">
                                    Card {currentIndex + 1} of {cards.length}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-emerald-600">
                                        <Star weight="fill" className="w-4 h-4" />
                                        <span className="text-sm font-bold">{totalMastered}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 text-amber-600">
                                        <Books weight="fill" className="w-4 h-4" />
                                        <span className="text-sm font-bold">{totalLearning}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                        <Target weight="fill" className="w-4 h-4" />
                                        <span className="text-sm font-bold">{totalNew}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {isPending && (
                            <div className="p-2.5">
                                <Spinner className="w-5 h-5 text-amber-500 animate-spin" />
                            </div>
                        )}
                        <button
                            onClick={handleShuffle}
                            className="p-2.5 hover:bg-zinc-100 rounded-xl transition-colors group"
                            title="Shuffle"
                        >
                            <Shuffle className="w-5 h-5 text-zinc-400 group-hover:text-zinc-700" />
                        </button>
                        <button
                            onClick={handleRestart}
                            className="p-2.5 hover:bg-zinc-100 rounded-xl transition-colors group"
                            title="Restart"
                        >
                            <ArrowsClockwise className="w-5 h-5 text-zinc-400 group-hover:text-zinc-700" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pb-6 shrink-0">
                <div className="max-w-4xl mx-auto">
                    <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </div>

            {/* Card Area */}
            <div className="flex-1 flex items-center justify-center px-4 py-4">
                <div className="w-full max-w-2xl">
                    {/* Card status indicator */}
                    <div className="flex justify-center mb-4">
                        <AnimatePresence mode="wait">
                            {cardStatus === "mastered" && (
                                <motion.span
                                    key="mastered"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200"
                                >
                                    <Star weight="fill" className="w-3.5 h-3.5" />
                                    Mastered
                                </motion.span>
                            )}
                            {cardStatus === "learning" && (
                                <motion.span
                                    key="learning"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200"
                                >
                                    <Books weight="fill" className="w-3.5 h-3.5" />
                                    Learning
                                </motion.span>
                            )}
                            {cardStatus === "new" && (
                                <motion.span
                                    key="new"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full border border-zinc-200"
                                >
                                    <Target weight="fill" className="w-3.5 h-3.5" />
                                    New
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Flashcard */}
                    <div
                        className="relative cursor-pointer perspective-1000 aspect-[5/3]"
                        onClick={handleFlip}
                    >
                        <motion.div
                            className="relative w-full h-full"
                            style={{ transformStyle: "preserve-3d" }}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {/* Front Side */}
                            <div
                                className="absolute inset-0 rounded-3xl grid place-items-center p-8 md:p-12 shadow-xl"
                                style={{ 
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                    transform: "rotateY(0deg)",
                                    background: "linear-gradient(145deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
                                    border: "1px solid rgba(251, 191, 36, 0.3)",
                                }}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-4 right-4 w-20 h-20 bg-amber-300/20 rounded-full blur-2xl" />
                                <div className="absolute bottom-4 left-4 w-16 h-16 bg-orange-300/20 rounded-full blur-2xl" />
                                
                                <div className="text-center relative z-10">
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-950 leading-relaxed">
                                        {currentCard?.front}
                                    </p>
                                </div>
                                
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium text-amber-600/70">
                                    Click to flip
                                </div>
                            </div>

                            {/* Back Side */}
                            <div
                                className="absolute inset-0 rounded-3xl grid place-items-center p-8 md:p-12 shadow-xl"
                                style={{
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                    background: "linear-gradient(145deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)",
                                    border: "1px solid rgba(16, 185, 129, 0.2)",
                                }}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-4 left-4 w-20 h-20 bg-emerald-300/20 rounded-full blur-2xl" />
                                <div className="absolute bottom-4 right-4 w-16 h-16 bg-teal-300/20 rounded-full blur-2xl" />
                                
                                <div className="text-center relative z-10">
                                    <p className="text-lg sm:text-xl md:text-2xl font-medium text-emerald-950 leading-relaxed">
                                        {currentCard?.back}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="shrink-0 py-6 space-y-4">
                {/* Hint (only on front, if available) */}
                {currentCard?.hint && !isFlipped && (
                    <div className="flex justify-center">
                        {!showHint ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowHint(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200/60"
                            >
                                <Eye weight="bold" className="w-4 h-4" />
                                Show Hint
                            </button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-5 py-3 max-w-xl text-center"
                            >
                                <p className="text-amber-800 text-sm font-medium flex items-center justify-center gap-2">
                                    <Lightning weight="fill" className="w-4 h-4 text-amber-600 shrink-0" />
                                    {currentCard.hint}
                                </p>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Rating Buttons (only on back) */}
                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex justify-center gap-4"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); markAsUnknown(); }}
                                disabled={isPending}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-200 rounded-xl text-red-600 font-bold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                            >
                                <X weight="bold" className="w-5 h-5" />
                                Still Learning
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); markAsKnown(); }}
                                disabled={isPending}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
                            >
                                <CheckCircle weight="fill" className="w-5 h-5" />
                                Got It!
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        disabled={currentIndex === 0}
                        className={cn(
                            "p-3.5 rounded-xl transition-all",
                            currentIndex === 0
                                ? "text-zinc-300 cursor-not-allowed"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Card indicator dots */}
                    <div className="flex items-center gap-1.5">
                        {cards.length <= 20 ? (
                            cards.map((card, i) => (
                                <button
                                    key={card.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(i);
                                        setIsFlipped(false);
                                        setShowHint(false);
                                    }}
                                    className={cn(
                                        "h-2 rounded-full transition-all",
                                        i === currentIndex
                                            ? "bg-gradient-to-r from-amber-400 to-orange-400 w-8"
                                            : masteredCards.has(card.id)
                                                ? "bg-emerald-400 w-2"
                                                : learningCards.has(card.id)
                                                    ? "bg-amber-400 w-2"
                                                    : "bg-zinc-300 hover:bg-zinc-400 w-2"
                                    )}
                                />
                            ))
                        ) : (
                            <span className="text-sm font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                                {currentIndex + 1} / {cards.length}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        disabled={currentIndex === cards.length - 1}
                        className={cn(
                            "p-3.5 rounded-xl transition-all",
                            currentIndex === cards.length - 1
                                ? "text-zinc-300 cursor-not-allowed"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Keyboard hints */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <kbd className="px-2 py-1 bg-zinc-100 rounded-md text-zinc-500 font-mono text-[10px] border border-zinc-200">Space</kbd>
                        <span>flip</span>
                        <span className="mx-1">·</span>
                        <kbd className="px-2 py-1 bg-zinc-100 rounded-md text-zinc-500 font-mono text-[10px] border border-zinc-200">←</kbd>
                        <kbd className="px-2 py-1 bg-zinc-100 rounded-md text-zinc-500 font-mono text-[10px] border border-zinc-200">→</kbd>
                        <span>navigate</span>
                        <span className="mx-1">·</span>
                        <kbd className="px-2 py-1 bg-zinc-100 rounded-md text-zinc-500 font-mono text-[10px] border border-zinc-200">1</kbd>
                        <kbd className="px-2 py-1 bg-zinc-100 rounded-md text-zinc-500 font-mono text-[10px] border border-zinc-200">2</kbd>
                        <span>rate</span>
                    </div>
                </div>
            </div>

            {/* Session Complete Modal */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative gradient */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
                            
                            {/* Decorative circles */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100 rounded-full opacity-50" />
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-orange-100 rounded-full opacity-50" />

                            <div className="relative">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                    <Trophy weight="fill" className="w-10 h-10 text-white" />
                                </div>

                                <h2 className="text-3xl font-black text-zinc-900 mb-2">Session Complete!</h2>
                                <p className="text-zinc-500 mb-8 text-lg">
                                    You&apos;ve reviewed all {cards.length} cards. Keep it up!
                                </p>

                                {/* Session Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
                                        <CheckCircle weight="fill" className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                        <div className="text-3xl font-black text-emerald-700">{sessionStats.gotIt}</div>
                                        <div className="text-sm font-medium text-emerald-600">Got It</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                                        <Books weight="fill" className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                        <div className="text-3xl font-black text-amber-700">{sessionStats.stillLearning}</div>
                                        <div className="text-sm font-medium text-amber-600">Still Learning</div>
                                    </div>
                                </div>

                                {/* Overall Progress */}
                                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 mb-6">
                                    <div className="text-sm font-semibold text-zinc-600 mb-3">Overall Mastery</div>
                                    <div className="flex items-center justify-center gap-6 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Star weight="fill" className="w-5 h-5 text-emerald-500" />
                                            <span className="text-lg font-black text-emerald-700">{totalMastered}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Books weight="fill" className="w-5 h-5 text-amber-500" />
                                            <span className="text-lg font-black text-amber-700">{totalLearning}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target weight="fill" className="w-5 h-5 text-zinc-400" />
                                            <span className="text-lg font-black text-zinc-600">{totalNew}</span>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
                                            style={{ width: `${(totalMastered / cards.length) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-sm font-bold text-zinc-600 mt-2">
                                        {Math.round((totalMastered / cards.length) * 100)}% mastered
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleRestart}
                                        variant="outline"
                                        className="flex-1 h-12 rounded-xl font-bold"
                                    >
                                        <ArrowsClockwise className="w-5 h-5 mr-2" />
                                        Study Again
                                    </Button>
                                    <Link href="/dashboard/flashcards" className="flex-1">
                                        <Button 
                                            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold"
                                            onClick={onComplete}
                                        >
                                            Done
                                        </Button>
                                    </Link>
                                </div>

                                {totalLearning > 0 && (
                                    <p className="text-sm text-amber-600 mt-5 font-medium bg-amber-50 rounded-xl py-2 px-4 border border-amber-200">
                                        💡 You have {totalLearning} cards still learning. Come back to review!
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
