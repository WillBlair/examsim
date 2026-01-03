"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
    Sparkle,
    ArrowRight,
    ArrowLeft,
    GraduationCap,
    User,
    Buildings,
    Check,
    Envelope,
    Rocket,
    Spinner,
    CircleNotch,
    CheckCircle,
    BookOpen,
    Atom,
    Calculator,
    Globe,
    Code,
    Palette,
    MusicNote,
    Heartbeat,
    Scales,
    Lightning,
    Upload,
    Sliders,
    Play,
    Cursor,
    CaretRight,
    Brain,
    FilePdf,
    FileDoc,
    RadioButton,
    ToggleLeft,
    Lightbulb
} from "@phosphor-icons/react";
import { register } from "@/app/actions/auth";
import { saveProfile } from "@/app/actions/save-profile";
import { completeOnboarding } from "@/app/actions/complete-onboarding";

// FLOW: Welcome → Account → Profile → Walkthrough → Complete
const STEPS = [
    { id: "welcome", label: "Welcome" },
    { id: "account", label: "Account" },
    { id: "profile", label: "Profile" },
    { id: "walkthrough", label: "Tour" },
] as const;

type StepId = typeof STEPS[number]["id"];

// Available subjects for selection
const SUBJECTS = [
    { id: "math", label: "Mathematics", icon: Calculator },
    { id: "science", label: "Science", icon: Atom },
    { id: "history", label: "History", icon: Globe },
    { id: "english", label: "English", icon: BookOpen },
    { id: "cs", label: "Computer Science", icon: Code },
    { id: "art", label: "Art & Design", icon: Palette },
    { id: "music", label: "Music", icon: MusicNote },
    { id: "health", label: "Health & PE", icon: Heartbeat },
    { id: "business", label: "Business", icon: Scales },
    { id: "other", label: "Other", icon: Lightning },
];

// Walkthrough tour steps
const TOUR_STEPS = [
    {
        title: "Upload Your Materials",
        description: "Drag and drop your PDFs, lecture notes, or study guides. Our AI will analyze the content.",
        icon: Upload,
        highlight: "upload"
    },
    {
        title: "Configure Settings",
        description: "Choose difficulty, question count, time limits, and question types to match your needs.",
        icon: Sliders,
        highlight: "settings"
    },
    {
        title: "Generate & Practice",
        description: "Hit generate and watch as AI creates personalized practice questions in seconds.",
        icon: Play,
        highlight: "generate"
    },
];

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


export function OnboardingWizard() {
    const router = useRouter();
    const { data: session, status: authStatus, update: updateSession } = useSession();

    const isAuthenticated = authStatus === "authenticated" && session !== null;
    const isLoading = authStatus === "loading";

    const [currentStep, setCurrentStep] = useState<StepId>("welcome");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Profile data
    const [displayName, setDisplayName] = useState("");
    const [school, setSchool] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [profileError, setProfileError] = useState("");

    // Walkthrough tour state
    const [tourStep, setTourStep] = useState(0);

    // Auth state
    const [authMode, setAuthMode] = useState<"options" | "email">("options");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");

    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

    const goToStep = useCallback((stepId: StepId) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentStep(stepId);
            setIsTransitioning(false);
        }, 150);
    }, []);

    // Effect to redirect already onboarded users to dashboard
    useEffect(() => {
        if (isAuthenticated && !isLoading && (session?.user as { hasOnboarded?: boolean })?.hasOnboarded) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isLoading, session, router]);

    // Effect to skip account step if authenticated
    useEffect(() => {
        if (currentStep === "account" && isAuthenticated && !isLoading) {
            goToStep("profile");
        }
    }, [currentStep, isAuthenticated, isLoading, goToStep]);

    // Pre-fill name from session if available
    useEffect(() => {
        if (session?.user?.name && !displayName) {
            setDisplayName(session.user.name);
        }
    }, [session?.user?.name]);

    const nextStep = useCallback(() => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
            goToStep(STEPS[nextIndex].id);
        }
    }, [currentStepIndex, goToStep]);

    const prevStep = useCallback(() => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            goToStep(STEPS[prevIndex].id);
        }
    }, [currentStepIndex, goToStep]);

    const handleGoogleSignIn = async () => {
        await signIn("google", { callbackUrl: "/get-started" });
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAuthError("");

        try {
            // Use email prefix as name fallback
            const emailName = email.split("@")[0] || "User";
            const result = await register({ email, password, name: emailName });
            if (result?.error) {
                setAuthError(result.error);
                setIsSubmitting(false);
                return;
            }
            const signInResult = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signInResult?.error) {
                setAuthError("Account created but login failed. Please try logging in.");
                setIsSubmitting(false);
                return;
            }

            await updateSession();
            goToStep("profile");
            setIsSubmitting(false);
        } catch {
            setAuthError("Something went wrong");
            setIsSubmitting(false);
        }
    };

    const handleSaveProfile = async () => {
        setProfileError("");

        if (!displayName.trim()) {
            setProfileError("Please enter a display name to continue");
            return;
        }

        setIsSubmitting(true);

        // Ensure session is fresh before saving context
        await updateSession();

        try {
            const result = await saveProfile({
                displayName: displayName.trim(),
                school: school.trim() || undefined,
                subjects: selectedSubjects,
            });

            if (result.error) {
                console.error(result.error);
                setIsSubmitting(false);
                return;
            }

            await updateSession();
            goToStep("walkthrough");
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = async () => {
        // Mark onboarding as complete before redirecting
        await completeOnboarding();
        router.push("/dashboard/new");
    };

    const toggleSubject = (subjectId: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(s => s !== subjectId)
                : [...prev, subjectId]
        );
    };

    // Progress indicator - visual only, not clickable
    const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background decorations - Subtle and Premium */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-emerald-100/30 to-purple-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-50" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/30 to-emerald-100/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 opacity-50" />

            {/* Subtle grid pattern for texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
                {/* Progress bar - Thinner, cleaner */}
                <div className="w-full mb-8 max-w-md">
                    <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-purple-500 transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Main Card - Premium Glass-like effect */}
                <div
                    className={cn(
                        "w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 ring-1 ring-zinc-900/5 backdrop-blur-sm overflow-hidden transition-all duration-500 ease-out",
                        isTransitioning ? "opacity-0 scale-[0.98] translate-y-2" : "opacity-100 scale-100 translate-y-0"
                    )}
                >
                    {/* ============ WELCOME STEP ============ */}
                    {currentStep === "welcome" && (
                        <div className="p-12 text-center space-y-10">
                            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                                <div className="relative w-28 h-28 drop-shadow-2xl">
                                    <Image
                                        src="/images/examsimlogogreen-removebg-preview.png"
                                        alt="ExamSim Logo"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                <div className="space-y-3">
                                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
                                        Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">ExamSim</span>
                                    </h1>
                                    <p className="text-zinc-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
                                        The most advanced AI-powered exam preparation platform. Let's personalize your experience.
                                    </p>
                                </div>
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <Button
                                    onClick={nextStep}
                                    className="h-14 px-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg shadow-xl shadow-zinc-900/20 hover:shadow-2xl hover:shadow-zinc-900/30 hover:-translate-y-0.5 transition-all duration-300 select-none cursor-pointer"
                                >
                                    Get Started
                                    <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ============ ACCOUNT STEP ============ */}
                    {/* ============ ACCOUNT STEP ============ */}
                    {currentStep === "account" && (
                        <div className="p-10 md:p-12">
                            {isLoading && !isSubmitting ? (
                                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border-4 border-zinc-100 border-t-emerald-500 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 font-medium text-sm tracking-wide uppercase">
                                        {isSubmitting ? "Creating Account..." : "Authenticating"}
                                    </p>
                                </div>
                            ) : authMode === "options" ? (
                                <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Create Your Account</h2>
                                        <p className="text-zinc-500 font-medium">Synced across all your devices</p>
                                    </div>

                                    <div className="space-y-3 max-w-[320px] mx-auto">
                                        <Button
                                            onClick={handleGoogleSignIn}
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
                                            variant="outline"
                                            className="w-full h-12 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 font-semibold text-zinc-700 text-[15px] gap-3 transition-all duration-200 shadow-sm"
                                        >
                                            <Envelope weight="fill" className="w-5 h-5 text-zinc-400" />
                                            Sign up with Email
                                        </Button>
                                    </div>

                                    <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                                        By continuing, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleEmailSignUp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode("options")}
                                            className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <h2 className="text-xl font-bold text-zinc-900">Sign up with Email</h2>
                                    </div>

                                    <div className="space-y-4 max-w-sm mx-auto pt-2">
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
                                                minLength={6}
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
                                                "Create Account"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ============ PROFILE STEP ============ */}
                    {currentStep === "profile" && (
                        <div className="p-10 md:p-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2 text-center">
                                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Set Up Your Profile</h2>
                                <p className="text-zinc-500 font-medium">Customize your learning experience</p>
                            </div>

                            <div className="space-y-6 max-w-md mx-auto">
                                {/* Display Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-700 ml-1 flex items-center gap-1">
                                        Display Name <span className="text-purple-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Ex: William Blair"
                                        value={displayName}
                                        onChange={(e) => {
                                            setDisplayName(e.target.value);
                                            if (profileError) setProfileError("");
                                        }}
                                        className={cn(
                                            "h-12 rounded-xl border-transparent bg-zinc-100 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 font-medium placeholder:text-zinc-400",
                                            profileError && "border-red-300 bg-red-50"
                                        )}
                                        required
                                    />
                                    {profileError && (
                                        <p className="text-xs font-medium text-red-500 ml-1 flex items-center gap-1">
                                            <Sparkle weight="fill" className="w-3 h-3" />
                                            {profileError}
                                        </p>
                                    )}
                                </div>

                                {/* School */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-700 ml-1">
                                        School / University <span className="text-zinc-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Buildings weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <Input
                                            type="text"
                                            placeholder="Ex: Stanford University"
                                            value={school}
                                            onChange={(e) => setSchool(e.target.value)}
                                            className="h-12 pl-11 rounded-xl border-transparent bg-zinc-100 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 font-medium placeholder:text-zinc-400"
                                        />
                                    </div>
                                </div>

                                {/* Subjects */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-700 ml-1">
                                        Field of Study
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {SUBJECTS.map((subject) => {
                                            const isSelected = selectedSubjects.includes(subject.id);
                                            const Icon = subject.icon;
                                            return (
                                                <button
                                                    key={subject.id}
                                                    type="button"
                                                    onClick={() => toggleSubject(subject.id)}
                                                    className={cn(
                                                        "group flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-purple-500/20",
                                                        isSelected
                                                            ? "bg-purple-50 border-purple-500/50 text-purple-700 shadow-sm shadow-purple-500/5"
                                                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50/80"
                                                    )}
                                                >
                                                    <Icon
                                                        weight={isSelected ? "fill" : "duotone"}
                                                        className={cn(
                                                            "w-4 h-4 transition-colors",
                                                            isSelected ? "text-purple-600" : "text-zinc-400 group-hover:text-zinc-500"
                                                        )}
                                                    />
                                                    {subject.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={!displayName.trim() || isSubmitting}
                                    className={cn(
                                        "h-12 px-8 rounded-full font-bold text-base transition-all select-none cursor-pointer",
                                        displayName.trim() && !isSubmitting
                                            ? "bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-purple-900/10 hover:shadow-2xl hover:-translate-y-0.5"
                                            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <CircleNotch className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight weight="bold" className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ============ WALKTHROUGH STEP ============ */}
                    {currentStep === "walkthrough" && (
                        <div className="p-8 md:p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200/50 mb-2 shadow-inner">
                                    <Rocket weight="fill" className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">How It Works</h2>
                                <p className="text-zinc-500 font-medium">Your first exam in 3 steps</p>
                            </div>

                            {/* Refined Mock UI */}
                            <div className="relative max-w-lg mx-auto">
                                <div className="bg-zinc-100 rounded-2xl p-4 border border-zinc-200/60 shadow-inner">
                                    <div className="bg-white rounded-xl border border-zinc-200/60 overflow-hidden shadow-sm relative">
                                        {/* Mock Header */}
                                        <div className="px-4 py-3 border-b border-zinc-100/80 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                    <GraduationCap weight="fill" className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="w-24 h-2 rounded bg-zinc-100" />
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-zinc-100" />
                                        </div>

                                        {/* Mock Content Container */}
                                        <div className="p-5 h-[280px] relative">
                                            {/* Step 1: Upload Mock (Files) */}
                                            <div className={cn(
                                                "absolute inset-0 p-5 transition-all duration-500 ease-out flex flex-col gap-3",
                                                tourStep === 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                                            )}>
                                                <div className="border-2 border-dashed border-emerald-100 bg-emerald-50/30 rounded-xl h-24 flex flex-col items-center justify-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                        <Upload weight="bold" className="w-4 h-4" />
                                                    </div>
                                                    <div className="h-1.5 w-24 bg-emerald-100 rounded-full" />
                                                </div>
                                                {/* Realistic File List */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-100 bg-white shadow-sm">
                                                        <FilePdf weight="fill" className="w-8 h-8 text-red-500" />
                                                        <div className="space-y-1 flex-1">
                                                            <div className="h-2 w-24 bg-zinc-800 rounded-full opacity-80" /> {/* "Bio_Lecture.pdf" */}
                                                            <div className="h-1.5 w-12 bg-zinc-200 rounded-full" />
                                                        </div>
                                                        <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-100 bg-white shadow-sm opacity-60">
                                                        <FileDoc weight="fill" className="w-8 h-8 text-blue-500" />
                                                        <div className="space-y-1 flex-1">
                                                            <div className="h-2 w-20 bg-zinc-800 rounded-full opacity-80" /> {/* "Syllabus.docx" */}
                                                            <div className="h-1.5 w-10 bg-zinc-200 rounded-full" />
                                                        </div>
                                                        <div className="w-4 h-4 rounded-full border-2 border-zinc-200" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Step 2: Settings Mock */}
                                            <div className={cn(
                                                "absolute inset-0 p-5 transition-all duration-500 ease-out flex flex-col gap-4",
                                                tourStep === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
                                            )}>
                                                {/* Topic Input */}
                                                <div className="space-y-1.5">
                                                    <div className="h-2 w-12 bg-zinc-400 rounded-full opacity-50" />
                                                    <div className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 flex items-center px-3">
                                                        <div className="h-2 w-24 bg-zinc-300 rounded-full" />
                                                    </div>
                                                </div>

                                                {/* Difficulty Chips */}
                                                <div className="space-y-1.5">
                                                    <div className="h-2 w-16 bg-zinc-400 rounded-full opacity-50" />
                                                    <div className="flex gap-2">
                                                        <div className="h-7 px-3 rounded-md bg-zinc-100 border border-zinc-200 flex items-center"><div className="w-6 h-1.5 bg-zinc-300 rounded-full" /></div>
                                                        <div className="h-7 px-3 rounded-md bg-purple-600 border border-purple-600 flex items-center shadow-lg shadow-purple-500/20"><div className="w-10 h-1.5 bg-white rounded-full" /></div>
                                                        <div className="h-7 px-3 rounded-md bg-zinc-100 border border-zinc-200 flex items-center"><div className="w-6 h-1.5 bg-zinc-300 rounded-full" /></div>
                                                    </div>
                                                </div>

                                                {/* Toggles */}
                                                <div className="flex items-center justify-between p-2 rounded-lg border border-purple-100 bg-purple-50/50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-600"><Lightbulb weight="fill" className="w-3.5 h-3.5" /></div>
                                                        <div className="w-16 h-2 bg-purple-900/20 rounded-full" />
                                                    </div>
                                                    <ToggleLeft weight="fill" className="w-8 h-8 text-purple-500" />
                                                </div>
                                            </div>

                                            {/* Step 3: Generate/Exam Mock */}
                                            <div className={cn(
                                                "absolute inset-0 p-5 transition-all duration-500 ease-out flex flex-col",
                                                tourStep === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
                                            )}>
                                                {/* Question Card */}
                                                <div className="flex-1 bg-white rounded-xl border border-zinc-200 shadow-sm p-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                                            <span>Question 1</span>
                                                            <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                                            <span>Multiple Choice</span>
                                                        </div>
                                                        <div className="space-y-1.5"> {/* Question Text */}
                                                            <div className="h-3 w-full bg-zinc-800 rounded-full opacity-80" />
                                                            <div className="h-3 w-3/4 bg-zinc-800 rounded-full opacity-80" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className={cn(
                                                                "h-8 rounded-lg border flex items-center px-3 gap-3",
                                                                i === 2 ? "bg-emerald-50 border-emerald-200" : "bg-white border-zinc-200"
                                                            )}>
                                                                <div className={cn(
                                                                    "w-4 h-4 rounded-full border flex items-center justify-center",
                                                                    i === 2 ? "border-emerald-500 bg-emerald-500" : "border-zinc-300"
                                                                )}>
                                                                    {i === 2 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <div className={cn(
                                                                    "h-2 w-24 rounded-full",
                                                                    i === 2 ? "bg-emerald-800 opacity-40" : "bg-zinc-200"
                                                                )} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Animated Cursor */}
                                    <div className={cn(
                                        "absolute z-20 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
                                        tourStep === 0 && "top-[40%] left-[25%]",
                                        tourStep === 1 && "top-[35%] right-[25%]",
                                        tourStep === 2 && "bottom-[20%] left-[50%]"
                                    )}>
                                        <Cursor weight="fill" className="w-6 h-6 text-black drop-shadow-xl" />
                                        <div className="w-8 h-8 rounded-full bg-white/30 animate-ping absolute -top-1 -left-1" />
                                    </div>
                                </div>

                                {/* Tour Step Info Card */}
                                <div className="mt-8 bg-white border border-zinc-200/60 rounded-xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-sm relative overflow-hidden">
                                    <div
                                        className={cn(
                                            "absolute top-0 left-0 w-1 h-full transition-colors duration-300",
                                            tourStep === 0 && "bg-emerald-500",
                                            tourStep === 1 && "bg-purple-500",
                                            tourStep === 2 && "bg-zinc-900"
                                        )}
                                    />
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors duration-300",
                                            tourStep === 0 && "bg-emerald-50 border-emerald-100 text-emerald-600",
                                            tourStep === 1 && "bg-purple-50 border-purple-100 text-purple-600",
                                            tourStep === 2 && "bg-zinc-50 border-zinc-200 text-zinc-900"
                                        )}>
                                            {(() => {
                                                const Icon = TOUR_STEPS[tourStep].icon;
                                                return <Icon weight="fill" className="w-6 h-6" />;
                                            })()}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-zinc-900 text-base">
                                                {TOUR_STEPS[tourStep].title}
                                            </h3>
                                            <p className="text-zinc-500 text-sm leading-relaxed">
                                                {TOUR_STEPS[tourStep].description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Buttons - Clean & Modern */}
                            <div className="flex items-center justify-between pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => tourStep > 0 ? setTourStep(tourStep - 1) : prevStep()}
                                    className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 -ml-2"
                                >
                                    {tourStep > 0 ? "Back" : "Back to Profile"}
                                </Button>

                                <div className="flex gap-1.5">
                                    {TOUR_STEPS.map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                i === tourStep
                                                    ? "bg-zinc-900 w-4"
                                                    : "bg-zinc-200"
                                            )}
                                        />
                                    ))}
                                </div>

                                {tourStep < TOUR_STEPS.length - 1 ? (
                                    <Button
                                        onClick={() => setTourStep(tourStep + 1)}
                                        className="rounded-full bg-zinc-900 hover:bg-black text-white px-6 shadow-lg shadow-zinc-900/10 cursor-pointer"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleComplete}
                                        className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 font-bold shadow-lg shadow-emerald-500/25 cursor-pointer"
                                    >
                                        Create Exam
                                        <Sparkle weight="fill" className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Indicators */}
                <div className="mt-8 flex justify-center gap-6 opacity-60">
                    {STEPS.map((step, i) => (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center gap-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                                i === currentStepIndex ? "text-zinc-900" : "text-zinc-400"
                            )}
                        >
                            <span className={cn(
                                "flex items-center justify-center w-5 h-5 rounded-full border text-[10px]",
                                i === currentStepIndex ? "border-zinc-900 bg-zinc-900 text-white" :
                                    i < currentStepIndex ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 text-zinc-400"
                            )}>
                                {i < currentStepIndex ? <Check weight="bold" className="w-3 h-3" /> : i + 1}
                            </span>
                            {step.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
