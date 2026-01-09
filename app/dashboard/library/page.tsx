import { Button } from "@/components/ui/button";
import { MagnifyingGlass, Sparkle, Lock } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { db } from "@/db";
import { auth } from "@/auth";
import { examTemplates, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { startExamFromTemplate } from "@/app/actions/library";
import Image from "next/image";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch User Subscription
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { subscriptionTier: true }
  });

  const isPro = user?.subscriptionTier === 'pro';

  // Fetch Templates
  const templates = await db.select().from(examTemplates);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Exam Library
        </h1>
        <p className="text-zinc-500">Practice with professionally curated certification exams.</p>
      </div>

      {/* Search and Filter */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search for exams (e.g. NCLEX, AWS, Bar Exam)..."
          className="pl-10 bg-white border-zinc-200 focus:border-accent-purple/50 focus:ring-accent-purple/20"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          // Assign different accent colors based on category
          const categoryColors: Record<string, { bg: string; text: string; gradient: string; button: string; shadow: string }> = {
            "Law": {
              bg: "bg-accent-purple/10",
              text: "text-accent-purple",
              gradient: "from-accent-purple/5",
              button: "bg-accent-purple hover:bg-accent-purple/90",
              shadow: "shadow-accent-purple/20"
            },
            "Medical": {
              bg: "bg-emerald-500/10",
              text: "text-emerald-500",
              gradient: "from-emerald-500/5",
              button: "bg-emerald-500 hover:bg-emerald-600",
              shadow: "shadow-emerald-500/20"
            },
            "College Prep": {
              bg: "bg-blue-500/10",
              text: "text-blue-500",
              gradient: "from-blue-500/5",
              button: "bg-blue-500 hover:bg-blue-600",
              shadow: "shadow-blue-500/20"
            },
            "Tech": {
              bg: "bg-violet-500/10",
              text: "text-violet-500",
              gradient: "from-violet-500/5",
              button: "bg-violet-500 hover:bg-violet-600",
              shadow: "shadow-violet-500/20"
            },
            "Business": {
              bg: "bg-amber-500/10",
              text: "text-amber-500",
              gradient: "from-amber-500/5",
              button: "bg-amber-500 hover:bg-amber-600",
              shadow: "shadow-amber-500/20"
            },
          };
          const colors = categoryColors[template.topic] || {
            bg: "bg-zinc-100",
            text: "text-zinc-500",
            gradient: "from-zinc-100",
            button: "bg-zinc-900 hover:bg-zinc-800",
            shadow: "shadow-zinc-900/20"
          };

          const isLocked = (!!template.isPremium) && !isPro;

          return (
            <div
              key={template.id}
              className="group relative bg-white rounded-xl border border-zinc-200 p-6 hover:border-zinc-300 transition-all hover:shadow-md overflow-hidden flex flex-col"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent opacity-50 pointer-events-none`} />

              {/* Locked Overlay */}
              {isLocked && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider border border-zinc-800 shadow-sm">
                    <Lock weight="fill" className="w-3 h-3" />
                    Premium
                  </div>
                </div>
              )}

              <div className="mb-4 relative z-10 flex-1">
                {template.title === "NCLEX-RN Practice Exam" ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden mb-4 group-hover:scale-110 transition-transform relative">
                    <Image
                      src="/images/nursingicon(1).jpg"
                      alt="Nursing Icon"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Sparkle weight="fill" className={`w-5 h-5 ${colors.text}`} />
                  </div>
                )}
                <h3 className="text-base font-bold text-zinc-900 mb-1 group-hover:text-accent-purple transition-colors">{template.title}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2">{template.description}</p>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400 border-t border-zinc-100 pt-4 relative z-10 mb-4">
                <span className={`font-medium ${colors.text} ${colors.bg} px-2 py-0.5 rounded border border-current/20`}>{template.subtopic}</span>
                <span>•</span>
                <span>{template.questionCount} Qs</span>
                <span>•</span>
                <span>{template.timeLimit} mins</span>
              </div>

              {/* Action Button */}
              <form action={async () => {
                'use server';
                await startExamFromTemplate(template.id);
              }}>
                <Button
                  disabled={isLocked}
                  className={`w-full font-bold shadow-lg transition-all active:scale-[0.98] ${isLocked
                    ? "bg-zinc-100 text-zinc-400 shadow-none cursor-not-allowed hover:bg-zinc-100"
                    : `${colors.button} text-white ${colors.shadow}`
                    }`}
                >
                  {isLocked ? "Upgrade to Unlock" : "Start Exam"}
                </Button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  );
}
