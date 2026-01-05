import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CheckCircle, Confetti } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
    title: "Welcome to ExamSim Pro! | ExamSim",
    description: "Your subscription is now active",
};

export default async function CheckoutSuccessPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-6 relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                        <CheckCircle weight="fill" className="w-10 h-10 text-white" />
                    </div>
                    <Confetti weight="fill" className="w-8 h-8 text-amber-400 absolute -top-2 -right-8" />
                    <Confetti weight="fill" className="w-6 h-6 text-purple-400 absolute -bottom-1 -left-6 rotate-45" />
                </div>

                <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-3">
                    Welcome to ExamSim Pro! 🎉
                </h1>
                <p className="text-lg text-zinc-600 mb-8">
                    Your subscription is now active. You have unlimited access to all premium features.
                </p>

                <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-8 text-left">
                    <h2 className="font-bold text-zinc-900 mb-4">What's unlocked:</h2>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-zinc-700">
                            <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                            Unlimited exam generation
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-700">
                            <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                            Up to 100 questions per exam
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-700">
                            <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                            Priority AI processing
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-700">
                            <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                            Full performance analytics
                        </li>
                        <li className="flex items-center gap-3 text-sm text-zinc-700">
                            <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                            PDF export
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/dashboard/new"
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                    >
                        Create Your First Exam
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-all"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
