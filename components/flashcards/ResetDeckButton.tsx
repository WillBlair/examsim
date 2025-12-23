"use client";

import { useState, useTransition } from "react";
import { ArrowClockwise, Spinner } from "@phosphor-icons/react";
import { resetDeckMastery } from "@/app/actions/flashcards";
import { toast } from "sonner";

interface ResetDeckButtonProps {
    deckId: number;
    onReset?: () => void;
}

export function ResetDeckButton({ deckId, onReset }: ResetDeckButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleReset = () => {
        startTransition(async () => {
            const result = await resetDeckMastery(deckId);
            
            if (result.success) {
                toast.success("Progress reset successfully");
                setShowConfirm(false);
                onReset?.();
            } else {
                toast.error(result.error || "Failed to reset progress");
            }
        });
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Reset all progress?</span>
                <button
                    onClick={handleReset}
                    disabled={isPending}
                    className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                >
                    {isPending ? <Spinner className="w-3 h-3 animate-spin" /> : "Yes"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="px-2 py-1 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded transition-colors disabled:opacity-50"
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors group"
            title="Reset Progress"
        >
            <ArrowClockwise className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
        </button>
    );
}

