"use client";

import { useState, useTransition } from "react";
import { Trash, Spinner, ArrowClockwise, DotsThreeVertical } from "@phosphor-icons/react";
import { deleteDeck, resetDeckMastery } from "@/app/actions/flashcards";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeckActionsProps {
    deckId: number;
    hasProgress?: boolean;
}

type ActionType = "delete" | "reset" | null;

export function DeckActions({ deckId, hasProgress = false }: DeckActionsProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ActionType>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteDeck(deckId);
            if (result.success) {
                toast.success("Deck deleted successfully");
            } else {
                toast.error(result.error || "Failed to delete deck");
            }
            setConfirmAction(null);
            setShowMenu(false);
        });
    };

    const handleReset = () => {
        startTransition(async () => {
            const result = await resetDeckMastery(deckId);
            if (result.success) {
                toast.success("Progress reset successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to reset progress");
            }
            setConfirmAction(null);
            setShowMenu(false);
        });
    };

    // Confirmation dialogs
    if (confirmAction === "delete") {
        return (
            <div className="flex items-center gap-1 animate-in fade-in duration-200">
                <span className="text-xs text-zinc-500">Delete?</span>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="px-2 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors disabled:opacity-50"
                >
                    {isPending ? <Spinner className="w-3 h-3 animate-spin" /> : "Yes"}
                </button>
                <button
                    onClick={() => setConfirmAction(null)}
                    disabled={isPending}
                    className="px-2 py-1 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded border border-zinc-200 transition-colors disabled:opacity-50"
                >
                    No
                </button>
            </div>
        );
    }

    if (confirmAction === "reset") {
        return (
            <div className="flex items-center gap-1 animate-in fade-in duration-200">
                <span className="text-xs text-zinc-500">Reset progress?</span>
                <button
                    onClick={handleReset}
                    disabled={isPending}
                    className="px-2 py-1 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors disabled:opacity-50"
                >
                    {isPending ? <Spinner className="w-3 h-3 animate-spin" /> : "Yes"}
                </button>
                <button
                    onClick={() => setConfirmAction(null)}
                    disabled={isPending}
                    className="px-2 py-1 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded border border-zinc-200 transition-colors disabled:opacity-50"
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Deck options"
            >
                <DotsThreeVertical weight="bold" className="w-4 h-4" />
            </button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border-2 border-zinc-200 shadow-lg z-20 py-1 min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200">
                        {hasProgress && (
                            <button
                                onClick={() => {
                                    setConfirmAction("reset");
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                                <ArrowClockwise className="w-4 h-4" />
                                Reset Progress
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setConfirmAction("delete");
                                setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash className="w-4 h-4" />
                            Delete Deck
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

