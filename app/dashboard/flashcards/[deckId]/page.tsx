import { db } from "@/db";
import { flashcardDecks, flashcards } from "@/db/schema";
import { eq, and, lte, or, isNull, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { FlashcardStudy } from "@/components/flashcards/FlashcardStudy";
import Link from "next/link";
import { CaretLeft, Books, Timer, Target, Star, ArrowClockwise } from "@phosphor-icons/react/dist/ssr";
import { revalidatePath } from "next/cache";

type StudyMode = "all" | "learning" | "due" | "new";

interface FlashcardDeckPageProps {
    params: Promise<{
        deckId: string;
    }>;
    searchParams: Promise<{
        mode?: string;
    }>;
}

function getMasteryStatus(repetitions: number | null): "new" | "learning" | "mastered" {
    if (!repetitions || repetitions === 0) return "new";
    if (repetitions < 3) return "learning";
    return "mastered";
}

export default async function FlashcardDeckPage({ params, searchParams }: FlashcardDeckPageProps) {
    const session = await auth();

    if (!session?.user?.id) {
        return redirect("/login");
    }

    const { deckId } = await params;
    const { mode: modeParam } = await searchParams;
    const deckIdNum = parseInt(deckId);
    const studyMode: StudyMode = (modeParam as StudyMode) || "all";

    if (isNaN(deckIdNum)) {
        return notFound();
    }

    // Fetch deck
    const [deck] = await db.select()
        .from(flashcardDecks)
        .where(eq(flashcardDecks.id, deckIdNum));

    if (!deck || deck.userId !== session.user.id) {
        return notFound();
    }

    // Fetch all cards first
    const allCards = await db.select()
        .from(flashcards)
        .where(eq(flashcards.deckId, deckIdNum))
        .orderBy(flashcards.order);

    // Filter cards based on study mode
    const now = new Date();
    let filteredCards = allCards;

    if (studyMode === "learning") {
        filteredCards = allCards.filter(card => {
            const status = getMasteryStatus(card.repetitions);
            return status === "learning";
        });
    } else if (studyMode === "due") {
        filteredCards = allCards.filter(card => {
            return (card.nextReviewAt && card.nextReviewAt <= now) ||
                   (!card.nextReviewAt && card.repetitions && card.repetitions > 0);
        });
    } else if (studyMode === "new") {
        filteredCards = allCards.filter(card => {
            const status = getMasteryStatus(card.repetitions);
            return status === "new";
        });
    }

    // Calculate deck stats
    let newCount = 0;
    let learningCount = 0;
    let masteredCount = 0;
    let dueCount = 0;

    allCards.forEach(card => {
        const status = getMasteryStatus(card.repetitions);
        if (status === "new") newCount++;
        else if (status === "learning") learningCount++;
        else masteredCount++;

        if ((card.nextReviewAt && card.nextReviewAt <= now) ||
            (!card.nextReviewAt && card.repetitions && card.repetitions > 0)) {
            dueCount++;
        }
    });

    // Get mode label
    const getModeLabel = () => {
        switch (studyMode) {
            case "learning": return "Still Learning";
            case "due": return "Due for Review";
            case "new": return "New Cards";
            default: return "All Cards";
        }
    };

    if (allCards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">No Cards Yet</h2>
                    <p className="text-zinc-500 mb-4">This deck doesn&apos;t have any flashcards yet.</p>
                    <Link href="/dashboard/flashcards">
                        <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg">
                            Back to Decks
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // If filtered mode has no cards, show a helpful message
    if (filteredCards.length === 0 && studyMode !== "all") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Link
                    href="/dashboard/flashcards"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group font-medium"
                >
                    <CaretLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Flashcards
                </Link>

                <div className="bg-white rounded-2xl border-2 border-zinc-900 shadow-neo p-8 text-center">
                    {studyMode === "learning" && (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-6">
                                <Star weight="duotone" className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-3">Great Progress!</h2>
                            <p className="text-zinc-500 mb-6 text-lg">
                                You don&apos;t have any cards in the &quot;Still Learning&quot; category. 
                                Keep studying to see cards here!
                            </p>
                        </>
                    )}
                    {studyMode === "due" && (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-6">
                                <Star weight="duotone" className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-3">All Caught Up!</h2>
                            <p className="text-zinc-500 mb-6 text-lg">
                                No cards are due for review right now. Check back later!
                            </p>
                        </>
                    )}
                    {studyMode === "new" && (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto mb-6">
                                <Books weight="duotone" className="w-8 h-8 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 mb-3">All Cards Studied!</h2>
                            <p className="text-zinc-500 mb-6 text-lg">
                                You&apos;ve studied all cards in this deck at least once. 
                                Keep reviewing to master them!
                            </p>
                        </>
                    )}

                    <div className="flex gap-3 justify-center">
                        <Link href={`/dashboard/flashcards/${deckId}`}>
                            <button className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-zinc-900 font-bold rounded-lg border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                                Study All Cards
                            </button>
                        </Link>
                        <Link href="/dashboard/flashcards">
                            <button className="px-5 py-3 bg-white hover:bg-zinc-50 text-zinc-900 font-bold rounded-lg border-2 border-zinc-200 transition-all">
                                Back to Decks
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            {/* Mode Selector - only show when viewing all */}
            {studyMode === "all" && (learningCount > 0 || dueCount > 0 || newCount > 0) && (
                <div className="max-w-4xl mx-auto px-4 pt-4 pb-0">
                    <div className="flex flex-wrap items-center gap-2 bg-zinc-50 rounded-lg p-2 border border-zinc-200">
                        <Link href={`/dashboard/flashcards/${deckId}`}>
                            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                studyMode === "all" ? "bg-white shadow-sm border border-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                            }`}>
                                All
                                <span className="text-xs font-bold px-1.5 py-0.5 bg-zinc-100 rounded">{allCards.length}</span>
                            </button>
                        </Link>
                        {newCount > 0 && (
                            <Link href={`/dashboard/flashcards/${deckId}?mode=new`}>
                                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    modeParam === "new" ? "bg-white shadow-sm border border-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                                }`}>
                                    <Target weight="fill" className="w-3.5 h-3.5" />
                                    New
                                    <span className="text-xs font-bold px-1.5 py-0.5 bg-zinc-100 rounded">{newCount}</span>
                                </button>
                            </Link>
                        )}
                        {learningCount > 0 && (
                            <Link href={`/dashboard/flashcards/${deckId}?mode=learning`}>
                                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    modeParam === "learning" ? "bg-white shadow-sm border border-amber-200 text-amber-900" : "text-amber-600 hover:text-amber-700"
                                }`}>
                                    <Books weight="fill" className="w-3.5 h-3.5" />
                                    Learning
                                    <span className="text-xs font-bold px-1.5 py-0.5 bg-amber-100 rounded text-amber-700">{learningCount}</span>
                                </button>
                            </Link>
                        )}
                        {dueCount > 0 && (
                            <Link href={`/dashboard/flashcards/${deckId}?mode=due`}>
                                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    modeParam === "due" ? "bg-white shadow-sm border border-red-200 text-red-900" : "text-red-600 hover:text-red-700"
                                }`}>
                                    <Timer weight="fill" className="w-3.5 h-3.5" />
                                    Due
                                    <span className="text-xs font-bold px-1.5 py-0.5 bg-red-100 rounded text-red-700">{dueCount}</span>
                                </button>
                            </Link>
                        )}
                        {masteredCount > 0 && (
                            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-600">
                                <Star weight="fill" className="w-3.5 h-3.5" />
                                <span className="font-medium">{masteredCount} mastered</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <FlashcardStudy
                deckId={deck.id}
                deckTitle={deck.title}
                studyMode={studyMode}
                cards={filteredCards.map(c => ({
                    id: c.id,
                    front: c.front,
                    back: c.back,
                    hint: c.hint,
                    masteryStatus: getMasteryStatus(c.repetitions),
                    repetitions: c.repetitions,
                }))}
            />
        </div>
    );
}

