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
        <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex flex-col bg-zinc-50/50">
            {/* Header */}
            <div className="px-4 py-4 shrink-0 bg-white/50 backdrop-blur-xl border-b border-zinc-200/50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/flashcards"
                            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
                        >
                            <CaretLeft className="w-5 h-5 text-zinc-500" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-base md:text-lg font-bold text-zinc-900 truncate max-w-[200px] md:max-w-md">{deckTitle}</h1>
                                {modeLabel && (
                                    <span className="px-2.5 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200/60 whitespace-nowrap">
                                        {modeLabel}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs md:text-sm text-zinc-500 font-medium">
                                    Card {currentIndex + 1} of {cards.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {isPending && (
                            <div className="p-2">
                                <Spinner className="w-5 h-5 text-amber-500 animate-spin" />
                            </div>
                        )}
                        <button
                            onClick={handleShuffle}
                            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors group"
                            title="Shuffle"
                        >
                            <Shuffle className="w-5 h-5 text-zinc-400 group-hover:text-zinc-700" />
                        </button>
                        <button
                            onClick={handleRestart}
                            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors group"
                            title="Restart"
                        >
                            <ArrowsClockwise className="w-5 h-5 text-zinc-400 group-hover:text-zinc-700" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-zinc-100 shrink-0 relative z-10">
                <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Main Content Area - Full Height relative */}
            <div className="flex-1 relative w-full bg-zinc-50/50 flex flex-col items-center justify-center p-4">

                {/* Card Container - Centered */}
                <div className="w-full max-w-3xl flex flex-col items-center justify-center h-full gap-6 pb-32"> {/* Increased padding for larger dock */}

                    {/* Card Counter - Moved to Top */}
                    <div className="flex justify-center shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100/50 rounded-full border border-zinc-200/50">
                            <span className="text-xs font-bold text-zinc-900">{currentIndex + 1}</span>
                            <span className="text-zinc-400 text-xs">/</span>
                            <span className="text-xs font-medium text-zinc-500">{cards.length}</span>
                        </div>
                    </div>  {/* Flashcard Container - Fixed Aspect Ratio 3:2 and slightly smaller max-width */}
                    <div className="w-full max-w-xl relative perspective-1000 aspect-[3/2]">
                        <div
                            className="relative w-full h-full cursor-pointer"
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
                                    className={cn(
                                        "absolute inset-0 rounded-3xl grid place-items-center p-6 md:p-10 shadow-neo border-2 overflow-hidden transition-colors",
                                        "bg-amber-50 border-zinc-900",
                                        "hover:bg-amber-100/50"
                                    )}
                                    style={{
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                        transform: "rotateY(0deg)",
                                    }}
                                >
                                    {/* Scrollable Content Area */}
                                    <div className="w-full h-full overflow-y-auto scrollbar-none">
                                        <div className="min-h-full w-full flex items-center justify-center p-6">
                                            <div className="max-w-2xl text-center">
                                                <p className="text-xl md:text-3xl font-bold text-zinc-900 leading-snug font-serif">
                                                    {currentCard?.front}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider opacity-60 pointer-events-none">
                                        Tap to flip <ArrowClockwise className="w-3.5 h-3.5" />
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div
                                    className="absolute inset-0 rounded-3xl grid place-items-center p-6 md:p-10 shadow-neo bg-amber-50 border-2 border-zinc-900 overflow-hidden"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)",
                                    }}
                                >
                                    {/* Scrollable Content Area */}
                                    <div className="w-full h-full overflow-y-auto scrollbar-none">
                                        <div className="min-h-full w-full flex items-center justify-center p-6">
                                            <div className="max-w-2xl text-left">
                                                <p className="text-base md:text-xl font-medium text-zinc-900 leading-relaxed font-serif">
                                                    {currentCard?.back}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Floating Bottom Controls - Absolute */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 md:pb-12 z-20 pointer-events-none">
                    <div className="max-w-3xl mx-auto flex flex-col gap-3">



                        {/* Main Navigation - Floating */}
                        <div className="flex items-center justify-between gap-3 pointer-events-auto">
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                disabled={currentIndex === 0}
                                className={cn(
                                    "flex items-center px-5 py-4 rounded-2xl font-bold transition-all border text-sm sm:text-base shadow-xl",
                                    currentIndex === 0
                                        ? "bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed"
                                        : "bg-white border-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:scale-105 active:scale-95"
                                )}
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                <span>Previous</span>
                            </button>

                            <div className="flex-1 flex justify-center z-30 min-h-[56px] min-w-[280px] items-center">
                                <AnimatePresence mode="wait">
                                    {!isFlipped ? (
                                        currentCard?.hint ? (
                                            !showHint ? (
                                                <motion.button
                                                    key="hint-btn"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowHint(true);
                                                    }}
                                                    className="flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-2xl transition-all border border-amber-200 shadow-sm"
                                                >
                                                    <Eye weight="bold" className="w-5 h-5" />
                                                    Show Hint
                                                </motion.button>
                                            ) : (
                                                <motion.div
                                                    key="hint-content"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="bg-amber-100 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center gap-2 max-w-full shadow-sm cursor-help"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title={currentCard.hint}
                                                >
                                                    <Lightning weight="fill" className="w-5 h-5 text-amber-500 shrink-0" />
                                                    <span className="text-amber-900 text-sm font-medium">{currentCard.hint}</span>
                                                </motion.div>
                                            )
                                        ) : (
                                            <div className="w-8" /> /* Spacer if no hint */
                                        )
                                    ) : (
                                        <motion.div
                                            key="rating-actions"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex gap-3"
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markAsUnknown(); }}
                                                disabled={isPending}
                                                className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all text-xs sm:text-sm shadow-sm hover:scale-105 active:scale-95"
                                            >
                                                <X weight="bold" className="w-5 h-5" />
                                                <span className="hidden sm:inline">Still Learning</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markAsKnown(); }}
                                                disabled={isPending}
                                                className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-emerald-500 border border-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-sm text-xs sm:text-sm hover:scale-105 active:scale-95"
                                            >
                                                <CheckCircle weight="fill" className="w-5 h-5" />
                                                <span className="hidden sm:inline">Got It!</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                disabled={currentIndex === cards.length - 1}
                                className={cn(
                                    "flex items-center px-6 py-4 rounded-2xl font-bold transition-all border text-sm sm:text-base shadow-xl",
                                    currentIndex === cards.length - 1
                                        ? "bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed"
                                        : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800 hover:scale-105 active:scale-95"
                                )}
                            >
                                <span className="mr-2">Next</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
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
                                        className="flex-1 h-12 rounded-xl font-bold border-2"
                                    >
                                        <ArrowsClockwise className="w-5 h-5 mr-2" />
                                        Study Again
                                    </Button>
                                    <Link href="/dashboard/flashcards" className="flex-1">
                                        <Button
                                            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
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
