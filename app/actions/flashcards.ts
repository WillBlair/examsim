"use server";

import { db } from "@/db";
import { flashcardDecks, flashcards, flashcardProgress } from "@/db/schema";
import { eq, and, sql, lte, or, isNull, desc, asc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Mastery status is determined by repetitions:
// 0 = new (never reviewed)
// 1-2 = learning
// 3+ = mastered

export type MasteryStatus = "new" | "learning" | "mastered";

export interface FlashcardWithMastery {
    id: number;
    deckId: number;
    front: string;
    back: string;
    hint: string | null;
    order: number | null;
    easeFactor: number | null;
    interval: number | null;
    repetitions: number | null;
    nextReviewAt: Date | null;
    lastReviewedAt: Date | null;
    createdAt: Date;
    masteryStatus: MasteryStatus;
}

function getMasteryStatus(repetitions: number | null): MasteryStatus {
    if (!repetitions || repetitions === 0) return "new";
    if (repetitions < 3) return "learning";
    return "mastered";
}

export async function deleteDeck(deckId: number) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify ownership
        const [deck] = await db.select()
            .from(flashcardDecks)
            .where(
                and(
                    eq(flashcardDecks.id, deckId),
                    eq(flashcardDecks.userId, session.user.id)
                )
            );

        if (!deck) {
            return { success: false, error: "Deck not found or unauthorized" };
        }

        // Delete the deck (cascades to flashcards due to FK constraint)
        await db.delete(flashcardDecks)
            .where(eq(flashcardDecks.id, deckId));

        revalidatePath("/dashboard/flashcards");
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting deck:", error);
        return { success: false, error: "Failed to delete deck" };
    }
}

export async function getFlashcardDeck(deckId: number) {
    const session = await auth();
    
    if (!session?.user?.id) {
        return null;
    }

    const [deck] = await db.select()
        .from(flashcardDecks)
        .where(
            and(
                eq(flashcardDecks.id, deckId),
                eq(flashcardDecks.userId, session.user.id)
            )
        );

    if (!deck) {
        return null;
    }

    const cards = await db.select()
        .from(flashcards)
        .where(eq(flashcards.deckId, deckId))
        .orderBy(flashcards.order);

    const cardsWithMastery: FlashcardWithMastery[] = cards.map(card => ({
        ...card,
        masteryStatus: getMasteryStatus(card.repetitions),
    }));

    return {
        ...deck,
        cards: cardsWithMastery,
    };
}

// Update card mastery after user marks as "Got It" or "Still Learning"
export async function updateCardMastery(
    cardId: number,
    response: "got_it" | "still_learning"
) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Get the card and verify ownership through deck
        const [card] = await db.select({
            id: flashcards.id,
            deckId: flashcards.deckId,
            easeFactor: flashcards.easeFactor,
            interval: flashcards.interval,
            repetitions: flashcards.repetitions,
            deck: {
                userId: flashcardDecks.userId,
            }
        })
        .from(flashcards)
        .leftJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
        .where(eq(flashcards.id, cardId));

        if (!card || card.deck?.userId !== session.user.id) {
            return { success: false, error: "Card not found or unauthorized" };
        }

        const now = new Date();
        let newEaseFactor = card.easeFactor || 250;
        let newInterval = card.interval || 0;
        let newRepetitions = card.repetitions || 0;
        let nextReview: Date;

        if (response === "got_it") {
            // Successful recall - increase interval using SM-2 algorithm variant
            newRepetitions += 1;
            
            if (newRepetitions === 1) {
                newInterval = 1; // 1 day
            } else if (newRepetitions === 2) {
                newInterval = 3; // 3 days
            } else {
                // Multiply previous interval by ease factor
                newInterval = Math.round(newInterval * (newEaseFactor / 100));
            }
            
            // Increase ease factor slightly
            newEaseFactor = Math.min(300, newEaseFactor + 10);
        } else {
            // Failed recall - reset to learning
            newRepetitions = Math.max(0, newRepetitions - 1);
            newInterval = 0; // Review again soon
            
            // Decrease ease factor
            newEaseFactor = Math.max(130, newEaseFactor - 20);
        }

        // Calculate next review date
        nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

        // Update the card
        await db.update(flashcards)
            .set({
                easeFactor: newEaseFactor,
                interval: newInterval,
                repetitions: newRepetitions,
                nextReviewAt: nextReview,
                lastReviewedAt: now,
            })
            .where(eq(flashcards.id, cardId));

        // Record progress for analytics
        await db.insert(flashcardProgress).values({
            userId: session.user.id,
            deckId: card.deckId,
            cardId: cardId,
            rating: response === "got_it" ? 3 : 1, // 3 = good, 1 = again
        });

        return { 
            success: true,
            masteryStatus: getMasteryStatus(newRepetitions),
            nextReviewAt: nextReview,
        };
    } catch (error) {
        console.error("Error updating card mastery:", error);
        return { success: false, error: "Failed to update card" };
    }
}

// Get deck statistics
export async function getDeckStats(deckId: number) {
    const session = await auth();
    
    if (!session?.user?.id) {
        return null;
    }

    const cards = await db.select({
        repetitions: flashcards.repetitions,
        nextReviewAt: flashcards.nextReviewAt,
    })
    .from(flashcards)
    .where(eq(flashcards.deckId, deckId));

    const now = new Date();
    
    let newCount = 0;
    let learningCount = 0;
    let masteredCount = 0;
    let dueCount = 0;

    cards.forEach(card => {
        const status = getMasteryStatus(card.repetitions);
        
        if (status === "new") newCount++;
        else if (status === "learning") learningCount++;
        else masteredCount++;

        // Check if due for review
        if (card.nextReviewAt && card.nextReviewAt <= now) {
            dueCount++;
        } else if (!card.nextReviewAt && card.repetitions && card.repetitions > 0) {
            dueCount++;
        }
    });

    return {
        total: cards.length,
        new: newCount,
        learning: learningCount,
        mastered: masteredCount,
        due: dueCount,
        masteryPercentage: cards.length > 0 
            ? Math.round((masteredCount / cards.length) * 100) 
            : 0,
    };
}

// Get all decks with their stats
export async function getAllDecksWithStats() {
    const session = await auth();
    
    if (!session?.user?.id) {
        return [];
    }

    const decks = await db.select()
        .from(flashcardDecks)
        .where(eq(flashcardDecks.userId, session.user.id))
        .orderBy(desc(flashcardDecks.createdAt));

    const decksWithStats = await Promise.all(
        decks.map(async (deck) => {
            const stats = await getDeckStats(deck.id);
            return {
                ...deck,
                stats,
            };
        })
    );

    return decksWithStats;
}

// Get cards filtered by mastery status
export async function getCardsByMastery(
    deckId: number,
    status: MasteryStatus | "due"
) {
    const session = await auth();
    
    if (!session?.user?.id) {
        return [];
    }

    // First verify deck ownership
    const [deck] = await db.select()
        .from(flashcardDecks)
        .where(
            and(
                eq(flashcardDecks.id, deckId),
                eq(flashcardDecks.userId, session.user.id)
            )
        );

    if (!deck) {
        return [];
    }

    const cards = await db.select()
        .from(flashcards)
        .where(eq(flashcards.deckId, deckId))
        .orderBy(flashcards.order);

    const now = new Date();

    return cards
        .map(card => ({
            ...card,
            masteryStatus: getMasteryStatus(card.repetitions),
        }))
        .filter(card => {
            if (status === "due") {
                return (card.nextReviewAt && card.nextReviewAt <= now) ||
                       (!card.nextReviewAt && card.repetitions && card.repetitions > 0);
            }
            return card.masteryStatus === status;
        });
}

// Get "Still Learning" cards across all decks
export async function getStillLearningCards() {
    const session = await auth();
    
    if (!session?.user?.id) {
        return [];
    }

    const cards = await db.select({
        id: flashcards.id,
        deckId: flashcards.deckId,
        front: flashcards.front,
        back: flashcards.back,
        hint: flashcards.hint,
        order: flashcards.order,
        easeFactor: flashcards.easeFactor,
        interval: flashcards.interval,
        repetitions: flashcards.repetitions,
        nextReviewAt: flashcards.nextReviewAt,
        lastReviewedAt: flashcards.lastReviewedAt,
        createdAt: flashcards.createdAt,
        deckTitle: flashcardDecks.title,
    })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(
        and(
            eq(flashcardDecks.userId, session.user.id),
            // Learning cards have 1-2 repetitions
            sql`${flashcards.repetitions} > 0 AND ${flashcards.repetitions} < 3`
        )
    )
    .orderBy(asc(flashcards.nextReviewAt));

    return cards.map(card => ({
        ...card,
        masteryStatus: "learning" as MasteryStatus,
    }));
}

// Get due cards across all decks
export async function getDueCards() {
    const session = await auth();
    
    if (!session?.user?.id) {
        return [];
    }

    const now = new Date();

    const cards = await db.select({
        id: flashcards.id,
        deckId: flashcards.deckId,
        front: flashcards.front,
        back: flashcards.back,
        hint: flashcards.hint,
        order: flashcards.order,
        easeFactor: flashcards.easeFactor,
        interval: flashcards.interval,
        repetitions: flashcards.repetitions,
        nextReviewAt: flashcards.nextReviewAt,
        lastReviewedAt: flashcards.lastReviewedAt,
        createdAt: flashcards.createdAt,
        deckTitle: flashcardDecks.title,
    })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(
        and(
            eq(flashcardDecks.userId, session.user.id),
            or(
                lte(flashcards.nextReviewAt, now),
                and(
                    isNull(flashcards.nextReviewAt),
                    sql`${flashcards.repetitions} > 0`
                )
            )
        )
    )
    .orderBy(asc(flashcards.nextReviewAt));

    return cards.map(card => ({
        ...card,
        masteryStatus: getMasteryStatus(card.repetitions),
    }));
}

// Get user's overall flashcard statistics
export async function getOverallFlashcardStats() {
    const session = await auth();
    
    if (!session?.user?.id) {
        return null;
    }

    const cards = await db.select({
        repetitions: flashcards.repetitions,
        nextReviewAt: flashcards.nextReviewAt,
    })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(eq(flashcardDecks.userId, session.user.id));

    const deckCount = await db.select({ count: sql<number>`count(*)` })
        .from(flashcardDecks)
        .where(eq(flashcardDecks.userId, session.user.id));

    const now = new Date();
    
    let newCount = 0;
    let learningCount = 0;
    let masteredCount = 0;
    let dueCount = 0;

    cards.forEach(card => {
        const status = getMasteryStatus(card.repetitions);
        
        if (status === "new") newCount++;
        else if (status === "learning") learningCount++;
        else masteredCount++;

        if (card.nextReviewAt && card.nextReviewAt <= now) {
            dueCount++;
        } else if (!card.nextReviewAt && card.repetitions && card.repetitions > 0) {
            dueCount++;
        }
    });

    // Get recent study activity
    const recentActivity = await db.select({ count: sql<number>`count(*)` })
        .from(flashcardProgress)
        .where(
            and(
                eq(flashcardProgress.userId, session.user.id),
                sql`${flashcardProgress.reviewedAt} > NOW() - INTERVAL '7 days'`
            )
        );

    return {
        totalCards: cards.length,
        totalDecks: Number(deckCount[0]?.count) || 0,
        new: newCount,
        learning: learningCount,
        mastered: masteredCount,
        due: dueCount,
        masteryPercentage: cards.length > 0 
            ? Math.round((masteredCount / cards.length) * 100) 
            : 0,
        cardsStudiedThisWeek: Number(recentActivity[0]?.count) || 0,
    };
}

// Reset a card's mastery status
export async function resetCardMastery(cardId: number) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify ownership through deck
        const [card] = await db.select({
            id: flashcards.id,
            deck: {
                userId: flashcardDecks.userId,
            }
        })
        .from(flashcards)
        .leftJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
        .where(eq(flashcards.id, cardId));

        if (!card || card.deck?.userId !== session.user.id) {
            return { success: false, error: "Card not found or unauthorized" };
        }

        await db.update(flashcards)
            .set({
                easeFactor: 250,
                interval: 0,
                repetitions: 0,
                nextReviewAt: null,
                lastReviewedAt: null,
            })
            .where(eq(flashcards.id, cardId));

        return { success: true };
    } catch (error) {
        console.error("Error resetting card:", error);
        return { success: false, error: "Failed to reset card" };
    }
}

// Reset entire deck's mastery status
export async function resetDeckMastery(deckId: number) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify deck ownership
        const [deck] = await db.select()
            .from(flashcardDecks)
            .where(
                and(
                    eq(flashcardDecks.id, deckId),
                    eq(flashcardDecks.userId, session.user.id)
                )
            );

        if (!deck) {
            return { success: false, error: "Deck not found or unauthorized" };
        }

        await db.update(flashcards)
            .set({
                easeFactor: 250,
                interval: 0,
                repetitions: 0,
                nextReviewAt: null,
                lastReviewedAt: null,
            })
            .where(eq(flashcards.deckId, deckId));

        revalidatePath("/dashboard/flashcards");
        revalidatePath(`/dashboard/flashcards/${deckId}`);

        return { success: true };
    } catch (error) {
        console.error("Error resetting deck:", error);
        return { success: false, error: "Failed to reset deck" };
    }
}

