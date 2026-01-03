"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Envelope,
    ArrowRight,
    ArrowLeft,
    CircleNotch,
    Sparkle
} from "@phosphor-icons/react";

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.734 42.379 C -8.804 40.439 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
        </g>
    </svg>
);

export function NewLoginForm() {
    const router = useRouter();
    const [authMode, setAuthMode] = useState<"options" | "email">("options");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard" });
        } catch {
            setIsSubmitting(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsSubmitting(true);
        setAuthError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setAuthError("Invalid email or password");
                setIsSubmitting(false);
                return;
            }

            router.push("/dashboard");
        } catch {
            setAuthError("Something went wrong");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background decorations - Subtle and Premium */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-emerald-100/30 to-purple-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-50" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/30 to-emerald-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 opacity-50" />

            {/* Subtle grid pattern for texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">

                {/* Logo */}
                <div className="mb-8 relative w-20 h-20 drop-shadow-xl animate-in fade-in zoom-in duration-700">
                    <Image
                        src="/images/examsimlogogreen-removebg-preview.png"
                        alt="ExamSim Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Main Card - Premium Glass-like effect */}
                <div className="w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 ring-1 ring-zinc-900/5 backdrop-blur-sm overflow-hidden p-10 md:p-12">

                    {authMode === "options" ? (
                        <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Welcome back</h1>
                                <p className="text-zinc-500 font-medium">Sign in to your account</p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleGoogleSignIn}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 font-semibold text-zinc-700 text-[15px] gap-3 transition-all duration-200 shadow-sm"
                                >
                                    <GoogleIcon />
                                    Continue with Google
                                </Button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-zinc-100" />
                                    </div>
                                    <div className="relative flex justify-center text-[11px] uppercase tracking-widest text-zinc-300 font-semibold bg-white px-3">
                                        Or
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setAuthMode("email")}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 font-semibold text-zinc-700 text-[15px] gap-3 transition-all duration-200 shadow-sm"
                                >
                                    <Envelope weight="fill" className="w-5 h-5 text-zinc-400" />
                                    Sign in with Email
                                </Button>
                            </div>

                            <p className="text-sm font-medium text-zinc-500">
                                Don&apos;t have an account?{" "}
                                <Link href="/get-started" className="text-purple-600 hover:text-purple-700 font-bold transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleEmailSignIn} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode("options")}
                                    className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-bold text-zinc-900">Sign in with Email</h2>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-700 ml-1">Email</label>
                                    <Input
                                        type="email"
                                        disabled={isSubmitting}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-700 ml-1">Password</label>
                                    <Input
                                        type="password"
                                        disabled={isSubmitting}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 font-medium"
                                        required
                                    />
                                </div>

                                {authError && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center justify-center gap-2">
                                        <Sparkle weight="fill" className="w-4 h-4" />
                                        {authError}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-black hover:to-zinc-900 text-white font-bold text-base shadow-lg shadow-zinc-900/20 mt-2 select-none cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <CircleNotch className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
