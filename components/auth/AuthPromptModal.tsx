"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkle, Check, X } from "@phosphor-icons/react";
import { register } from "@/app/actions/auth";
import { transferGuestExams } from "@/app/actions/transfer-guest-exams";
import { getExistingGuestId, clearGuestSession } from "@/lib/guest-session";
import { cn } from "@/lib/utils";

interface AuthPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export function AuthPromptModal({
    isOpen,
    onClose,
    title = "Save Your Progress",
    description = "Create an account to save your exam and track your progress over time.",
}: AuthPromptModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"options" | "email">("options");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            // Store guest ID before redirect
            const guestId = getExistingGuestId();
            if (guestId) {
                sessionStorage.setItem("pending_guest_transfer", guestId);
            }

            await signIn("google", {
                callbackUrl: "/dashboard",
            });
        } catch {
            setError("Failed to sign in with Google");
            setIsLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await register({ email, password, name });

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            // Transfer guest exams after successful registration
            const guestId = getExistingGuestId();
            if (guestId) {
                await transferGuestExams(guestId, ""); // User ID will be set by server
                clearGuestSession();
            }

            router.push("/dashboard");
        } catch {
            setError("Something went wrong");
            setIsLoading(false);
        }
    };

    const benefits = [
        "Save all your exams and results",
        "Track your progress over time",
        "Access from any device",
        "Unlock unlimited exam generation",
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 bg-white rounded-2xl border-2 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)]">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b border-zinc-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg border-2 border-zinc-900">
                            <Sparkle weight="fill" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-zinc-900">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-zinc-500 font-medium">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="p-6">
                    {mode === "options" ? (
                        <>
                            {/* Benefits */}
                            <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/60">
                                <p className="text-sm font-semibold text-emerald-900 mb-3">
                                    Why create an account?
                                </p>
                                <div className="space-y-2">
                                    {benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                                <Check weight="bold" className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-sm text-emerald-800 font-medium">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Google Sign In */}
                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full h-12 bg-white border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 font-semibold rounded-xl shadow-sm transition-all"
                                variant="outline"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </Button>

                            {/* Divider */}
                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-white text-zinc-400 font-medium">or</span>
                                </div>
                            </div>

                            {/* Email option */}
                            <Button
                                onClick={() => setMode("email")}
                                disabled={isLoading}
                                className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold rounded-xl border-2 border-zinc-900"
                            >
                                Sign up with Email
                            </Button>
                        </>
                    ) : (
                        <form onSubmit={handleEmailSignUp} className="space-y-4">
                            <button
                                type="button"
                                onClick={() => setMode("options")}
                                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 font-medium mb-4"
                            >
                                ← Back to options
                            </button>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-zinc-700">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="h-11 rounded-lg border-2 border-zinc-200 focus:border-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-zinc-700">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="h-11 rounded-lg border-2 border-zinc-200 focus:border-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-zinc-700">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="h-11 rounded-lg border-2 border-zinc-200 focus:border-emerald-500"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                    <X weight="bold" className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600 font-medium">{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl border-2 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                            >
                                {isLoading ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>
                    )}

                    {/* Continue as Guest */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={onClose}
                            className="text-sm text-zinc-500 hover:text-zinc-700 font-medium underline underline-offset-2"
                        >
                            Continue without saving
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
