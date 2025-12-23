import { db } from "@/db";
import { flashcardDecks, flashcards, flashcardProgress } from "@/db/schema";
import { eq, desc, sql, and, lte, or, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
    Cards, 
    Plus, 
    Clock, 
    Brain, 
    ArrowRight, 
    Star,
    Books,
    Target,
    Lightning,
    Fire,
    Timer,
    Sparkle,
    TrendUp,
    GraduationCap,
    Rocket
} from "@phosphor-icons/react/dist/ssr";
import { formatDistanceToNow } from "date-fns";
import { DeckActions } from "@/components/flashcards/DeckActions";

interface DeckStats {
    total: number;
    new: number;
    learning: number;
    mastered: number;
    due: number;
    masteryPercentage: number;
}

function getMasteryStatus(repetitions: number | null): "new" | "learning" | "mastered" {
    if (!repetitions || repetitions === 0) return "new";
    if (repetitions < 3) return "learning";
    return "mastered";
}

async function getDeckStats(deckId: number): Promise<DeckStats> {
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

export default async function FlashcardsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return redirect("/login");
    }

    // Fetch all decks
    const decks = await db.select({
        id: flashcardDecks.id,
        title: flashcardDecks.title,
        description: flashcardDecks.description,
        topic: flashcardDecks.topic,
        cardCount: flashcardDecks.cardCount,
        createdAt: flashcardDecks.createdAt,
        updatedAt: flashcardDecks.updatedAt,
    })
        .from(flashcardDecks)
        .where(eq(flashcardDecks.userId, session.user.id))
        .orderBy(desc(flashcardDecks.createdAt));

    // Get stats for each deck
    const decksWithStats = await Promise.all(
        decks.map(async (deck) => ({
            ...deck,
            stats: await getDeckStats(deck.id),
        }))
    );

    // Calculate overall stats
    const now = new Date();
    const allCards = await db.select({
        id: flashcards.id,
        deckId: flashcards.deckId,
        front: flashcards.front,
        repetitions: flashcards.repetitions,
        nextReviewAt: flashcards.nextReviewAt,
        deckTitle: flashcardDecks.title,
    })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(eq(flashcardDecks.userId, session.user.id));

    let overallNew = 0;
    let overallLearning = 0;
    let overallMastered = 0;
    let overallDue = 0;

    const learningCardsPreview: Array<{ id: number; front: string; deckTitle: string | null; deckId: number }> = [];
    const dueCardsPreview: Array<{ id: number; front: string; deckTitle: string | null; deckId: number }> = [];

    allCards.forEach(card => {
        const status = getMasteryStatus(card.repetitions);
        
        if (status === "new") overallNew++;
        else if (status === "learning") {
            overallLearning++;
            if (learningCardsPreview.length < 5) {
                learningCardsPreview.push({ id: card.id, front: card.front, deckTitle: card.deckTitle, deckId: card.deckId });
            }
        }
        else overallMastered++;

        const isDue = (card.nextReviewAt && card.nextReviewAt <= now) ||
                      (!card.nextReviewAt && card.repetitions && card.repetitions > 0);
        
        if (isDue) {
            overallDue++;
            if (dueCardsPreview.length < 5) {
                dueCardsPreview.push({ id: card.id, front: card.front, deckTitle: card.deckTitle, deckId: card.deckId });
            }
        }
    });

    const totalCards = allCards.length;
    const hasDecks = decks.length > 0;
    const masteryPercentage = totalCards > 0 ? Math.round((overallMastered / totalCards) * 100) : 0;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">My Flashcards</h1>
                    <p className="text-zinc-500 mt-2 text-lg font-medium">
                        {hasDecks ? `${decks.length} deck${decks.length !== 1 ? 's' : ''} · ${totalCards} cards total` : 'Create your first flashcard deck'}
                    </p>
                </div>
                <Link href="/dashboard/flashcards/new">
                    <button className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5">
                        <Plus weight="bold" className="w-5 h-5" />
                        New Deck
                    </button>
                </Link>
            </div>

            {!hasDecks ? (
                /* Empty State */
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl w-full max-w-xl p-12 text-center relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />
                        
                        {/* Decorative circles */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-100 rounded-full opacity-50" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-100 rounded-full opacity-50" />

                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-500/30">
                                <Cards weight="fill" className="w-12 h-12 text-white" />
                            </div>

                            <h2 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Create Your First Deck</h2>
                            <p className="text-zinc-500 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                                Upload your study materials and we&apos;ll generate AI-powered flashcards for effective learning.
                            </p>

                            <Link href="/dashboard/flashcards/new" className="block">
                                <button className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    <Sparkle weight="fill" className="w-5 h-5" />
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Overall Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/60 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200/60 flex items-center justify-center shadow-sm">
                                    <Star weight="fill" className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-emerald-600">{overallMastered}</div>
                                    <div className="text-sm font-medium text-emerald-700/70">Mastered</div>
                                </div>
                            </div>
                            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
                                    style={{ width: `${masteryPercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-white border border-amber-200/60 flex items-center justify-center shadow-sm">
                                    <Books weight="fill" className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-amber-600">{overallLearning}</div>
                                    <div className="text-sm font-medium text-amber-700/70">Learning</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-zinc-50 to-slate-50 rounded-2xl border border-zinc-200/60 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200/60 flex items-center justify-center shadow-sm">
                                    <Target weight="fill" className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-zinc-600">{overallNew}</div>
                                    <div className="text-sm font-medium text-zinc-500">New</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200/60 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-white border border-red-200/60 flex items-center justify-center shadow-sm">
                                    <Timer weight="fill" className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-red-600">{overallDue}</div>
                                    <div className="text-sm font-medium text-red-700/70">Due</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Review Sections */}
                    {(overallLearning > 0 || overallDue > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {/* Still Learning Section */}
                            {overallLearning > 0 && (
                                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <Books weight="fill" className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-amber-900">Still Learning</h3>
                                                <p className="text-xs text-amber-600">Review to move to mastered</p>
                                            </div>
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">
                                                {overallLearning}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {learningCardsPreview.map((card) => (
                                            <Link 
                                                key={card.id} 
                                                href={`/dashboard/flashcards/${card.deckId}?mode=learning`}
                                                className="block group"
                                            >
                                                <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100 group-hover:border-amber-300 group-hover:bg-amber-50/50 transition-all">
                                                    <p className="text-sm font-medium text-zinc-800 line-clamp-1">{card.front}</p>
                                                    <p className="text-xs text-zinc-400 mt-1">{card.deckTitle}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    {overallLearning > 5 && (
                                        <div className="px-4 pb-4">
                                            <p className="text-xs text-amber-600 font-medium">
                                                + {overallLearning - 5} more cards
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Due for Review Section */}
                            {overallDue > 0 && (
                                <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                                <Timer weight="fill" className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-red-900">Due for Review</h3>
                                                <p className="text-xs text-red-600">Review to maintain retention</p>
                                            </div>
                                            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                                                {overallDue}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {dueCardsPreview.map((card) => (
                                            <Link 
                                                key={card.id} 
                                                href={`/dashboard/flashcards/${card.deckId}?mode=due`}
                                                className="block group"
                                            >
                                                <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100 group-hover:border-red-300 group-hover:bg-red-50/50 transition-all">
                                                    <p className="text-sm font-medium text-zinc-800 line-clamp-1">{card.front}</p>
                                                    <p className="text-xs text-zinc-400 mt-1">{card.deckTitle}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    {overallDue > 5 && (
                                        <div className="px-4 pb-4">
                                            <p className="text-xs text-red-600 font-medium">
                                                + {overallDue - 5} more cards
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-xl font-bold text-zinc-900">All Decks</h2>
                        <div className="h-px flex-1 bg-zinc-200" />
                    </div>

                    {/* Deck Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {decksWithStats.map((deck) => (
                            <div
                                key={deck.id}
                                className="group bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
                            >
                                {/* Color Strip - changes based on mastery */}
                                <div 
                                    className="absolute top-0 left-0 w-full h-1"
                                    style={{
                                        background: deck.stats.masteryPercentage >= 80 
                                            ? 'linear-gradient(90deg, #10b981, #14b8a6)' 
                                            : deck.stats.masteryPercentage >= 40
                                                ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                                                : 'linear-gradient(90deg, #94a3b8, #64748b)'
                                    }}
                                />

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <Cards weight="duotone" className="w-7 h-7 text-amber-600" />
                                        </div>
                                        <DeckActions 
                                            deckId={deck.id} 
                                            hasProgress={deck.stats.mastered > 0 || deck.stats.learning > 0}
                                        />
                                    </div>

                                    <h3 className="text-lg font-bold text-zinc-900 mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">{deck.title}</h3>
                                    {deck.topic && (
                                        <p className="text-sm text-zinc-500 mb-4 line-clamp-1">{deck.topic}</p>
                                    )}

                                    {/* Mastery Stats */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Star weight="fill" className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-bold text-emerald-600">{deck.stats.mastered}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Books weight="fill" className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-bold text-amber-600">{deck.stats.learning}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Target weight="fill" className="w-4 h-4 text-zinc-400" />
                                            <span className="text-sm font-bold text-zinc-500">{deck.stats.new}</span>
                                        </div>
                                        {deck.stats.due > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Timer weight="fill" className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-bold text-red-500">{deck.stats.due}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-4">
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
                                            style={{ width: `${deck.stats.masteryPercentage}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-zinc-400 mb-5">
                                        <div className="flex items-center gap-1.5">
                                            <Brain className="w-4 h-4" />
                                            <span className="font-medium">{deck.cardCount || 0} cards</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-medium">
                                                {formatDistanceToNow(new Date(deck.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/dashboard/flashcards/${deck.id}`} className="flex-1">
                                            <button className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-colors">
                                                Study Now
                                                <ArrowRight weight="bold" className="w-4 h-4" />
                                            </button>
                                        </Link>
                                        {deck.stats.learning > 0 && (
                                            <Link href={`/dashboard/flashcards/${deck.id}?mode=learning`}>
                                                <button 
                                                    className="flex items-center justify-center gap-1 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold rounded-xl text-sm transition-colors"
                                                    title="Study cards you're still learning"
                                                >
                                                    <Books weight="bold" className="w-4 h-4" />
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Create New Card */}
                        <Link
                            href="/dashboard/flashcards/new"
                            className="group flex items-center justify-center min-h-[320px] bg-gradient-to-br from-zinc-50 to-slate-50 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-amber-400 hover:from-amber-50/30 hover:to-orange-50/30 transition-all"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-100 group-hover:bg-gradient-to-br group-hover:from-amber-100 group-hover:to-orange-100 border border-zinc-200 group-hover:border-amber-200 flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-105">
                                    <Plus weight="bold" className="w-7 h-7 text-zinc-400 group-hover:text-amber-600 transition-colors" />
                                </div>
                                <p className="text-base font-bold text-zinc-500 group-hover:text-amber-700 transition-colors">
                                    Create New Deck
                                </p>
                                <p className="text-sm text-zinc-400 mt-1 group-hover:text-amber-600 transition-colors">
                                    Generate cards from your materials
                                </p>
                            </div>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
