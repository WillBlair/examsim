import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { PricingCard } from "@/components/pricing/PricingCard";
import { Sparkle, CheckCircle, Upload, Brain, Target } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
    title: "Pricing | ExamSim",
    description: "Ace your exams with AI-powered practice tests",
};

const PLANS = [
    {
        name: "Free",
        description: "Try it out, no strings attached",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            { name: "2 exams per month", included: true },
            { name: "10 questions per exam", included: true },
            { name: "Basic progress tracking", included: true },
            { name: "AI flashcards", included: false },
            { name: "Unlimited exams", included: false },
            { name: "Priority AI", included: false },
        ],
        cta: "Get Started",
        href: "/register",
        popular: false,
        tier: "free" as const,
    },
    {
        name: "Student",
        badge: "MOST POPULAR",
        description: "Everything you need to ace your exams",
        monthlyPrice: 6.99,
        yearlyPrice: 49.99,
        savings: "Save 40%",
        features: [
            { name: "Unlimited practice exams", included: true, highlight: true },
            { name: "50 questions per exam", included: true },
            { name: "AI flashcard generation", included: true },
            { name: "Full analytics dashboard", included: true },
            { name: "Priority AI processing", included: true },
            { name: "Weakness detection", included: true },
        ],
        cta: "Start Free Trial",
        href: "/register?plan=student",
        popular: true,
        tier: "student" as const,
    },
    {
        name: "Certification Pro",
        description: "Built for serious certification prep",
        monthlyPrice: 14.99,
        yearlyPrice: 119.99,
        savings: "Save 40%",
        features: [
            { name: "Everything in Student", included: true, highlight: true },
            { name: "100 questions per exam", included: true },
            { name: "Certification-style questions", included: true },
            { name: "PDF export & printing", included: true },
            { name: "Advanced analytics", included: true },
            { name: "Priority support", included: true },
        ],
        cta: "Go Pro",
        href: "/register?plan=pro",
        popular: false,
        tier: "pro" as const,
    },
];

export default async function PricingPage() {
    const session = await auth();
    const isAuthenticated = !!session?.user;

    return (
        <main className="min-h-screen bg-white relative">
            {/* Floating back link for authenticated users */}
            {isAuthenticated && (
                <Link
                    href="/dashboard"
                    className="fixed top-6 left-6 z-50 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors group"
                >
                    <svg
                        className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-semibold">Back to Dashboard</span>
                </Link>
            )}

            {/* Header - only for unauthenticated users */}
            {!isAuthenticated && (
                <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
                    <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/images/examsimlogogreen-compressed.webp"
                                alt="ExamSim Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                            />
                            <span className="text-xl font-black text-zinc-900 tracking-tight">ExamSim</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 text-sm font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </header>
            )}

            {/* Hero - Compact */}
            <section className="pt-12 pb-6 text-center">
                <div className="container max-w-3xl mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-4">
                        <Sparkle weight="fill" className="w-3 h-3" />
                        7-day free trial on all paid plans
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-3">
                        Choose your plan
                    </h1>
                    <p className="text-zinc-500 text-base">
                        Start free. Upgrade when you&apos;re ready. Cancel anytime.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-8">
                <div className="container max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-5">
                        {PLANS.map((plan) => (
                            <PricingCard
                                key={plan.name}
                                plan={plan}
                                isAuthenticated={isAuthenticated}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Simple */}
            <section className="py-12 border-t border-zinc-100">
                <div className="container max-w-4xl mx-auto px-4">
                    <h2 className="text-xl font-bold text-zinc-900 text-center mb-8">
                        How ExamSim works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Upload weight="bold" className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-1">1. Upload your notes</h3>
                            <p className="text-sm text-zinc-500">
                                Drag in your lecture slides, textbook chapters, or study guides.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Brain weight="bold" className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-1">2. AI generates your exam</h3>
                            <p className="text-sm text-zinc-500">
                                Our AI creates realistic practice questions from your material.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Target weight="bold" className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-1">3. Know your weak spots</h3>
                            <p className="text-sm text-zinc-500">
                                See exactly where you need to study more before the real exam.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust badges */}
            <section className="py-8 border-t border-zinc-100">
                <div className="container max-w-3xl mx-auto px-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
                            <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
                            <span>7-day money-back guarantee</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
