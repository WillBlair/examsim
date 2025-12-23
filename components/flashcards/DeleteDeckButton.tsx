"use client";

import { useState } from "react";
import { Trash, Spinner } from "@phosphor-icons/react";
import { deleteDeck } from "@/app/actions/flashcards";
import { toast } from "sonner";

interface DeleteDeckButtonProps {
    deckId: number;
}

export function DeleteDeckButton({ deckId }: DeleteDeckButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        try {
            const result = await deleteDeck(deckId);
            if (result.success) {
                toast.success("Deck deleted successfully");
            } else {
                toast.error(result.error || "Failed to delete deck");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the deck");
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    }

    if (showConfirm) {
        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-2 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
                >
                    {isDeleting ? <Spinner className="w-3 h-3 animate-spin" /> : "Delete"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="px-2 py-1 text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded border border-zinc-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Delete deck"
        >
            <Trash className="w-4 h-4" />
        </button>
    );
}

