import { Button } from "@/components/ui/button";
import { MagnifyingGlass, Sparkle, Lock } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";

export default function LibraryPage() {
  // Placeholder data for exam templates
  const templates = [
    {
      id: "bar-exam",
      title: "Bar Exam Simulator",
      description: "Comprehensive practice for the Uniform Bar Examination (UBE).",
      questions: 200,
      time: "6 hours",
      category: "Law",
      difficulty: "Hard",
      isLocked: true
    },
    {
      id: "mcat",
      title: "MCAT Full Length",
      description: "Full-length Medical College Admission Test simulation.",
      questions: 230,
      time: "7.5 hours",
      category: "Medical",
      difficulty: "Hard",
      isLocked: true
    },
    {
      id: "usmle-step1",
      title: "USMLE Step 1",
      description: "United States Medical Licensing Examination Step 1 practice.",
      questions: 280,
      time: "8 hours",
      category: "Medical",
      difficulty: "Hard",
      isLocked: true
    },
    {
      id: "sat-math",
      title: "SAT Math Prep",
      description: "Targeted practice for SAT Mathematics section.",
      questions: 58,
      time: "80 mins",
      category: "College Prep",
      difficulty: "Medium",
      isLocked: true
    },
    {
      id: "aws-saa",
      title: "AWS Solutions Architect",
      description: "Practice for AWS Certified Solutions Architect - Associate.",
      questions: 65,
      time: "130 mins",
      category: "Tech",
      difficulty: "Medium",
      isLocked: true
    },
    {
      id: "pmp",
      title: "PMP Certification",
      description: "Project Management Professional exam simulation.",
      questions: 180,
      time: "230 mins",
      category: "Business",
      difficulty: "Medium",
      isLocked: true
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Exam Library
        </h1>
        <p className="text-zinc-500">Browse and take pre-generated professional certification exams.</p>
      </div>

      {/* Search and Filter */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input 
            placeholder="Search for exams (e.g. Bar Exam, AWS, MCAT)..." 
            className="pl-10 bg-white border-zinc-200 focus:border-accent-purple/50 focus:ring-accent-purple/20"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => {
            // Assign different accent colors based on category
            const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
              "Law": { bg: "bg-accent-purple/10", text: "text-accent-purple", gradient: "from-accent-purple/5" },
              "Medical": { bg: "bg-emerald-500/10", text: "text-emerald-500", gradient: "from-emerald-500/5" },
              "College Prep": { bg: "bg-blue-500/10", text: "text-blue-500", gradient: "from-blue-500/5" },
              "Tech": { bg: "bg-violet-500/10", text: "text-violet-500", gradient: "from-violet-500/5" },
              "Business": { bg: "bg-amber-500/10", text: "text-amber-500", gradient: "from-amber-500/5" },
            };
            const colors = categoryColors[template.category] || { bg: "bg-zinc-100", text: "text-zinc-500", gradient: "from-zinc-100" };
            
            return (
            <div 
                key={template.id}
                className="group relative bg-white rounded-xl border border-zinc-200 p-6 hover:border-zinc-300 transition-all hover:shadow-md overflow-hidden"
            >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent opacity-50 pointer-events-none`} />
                
                {/* Locked Overlay */}
                {template.isLocked && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-accent-purple/10 text-accent-purple text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider border border-accent-purple/20">
                            <Lock weight="fill" className="w-3 h-3" />
                            Coming Soon
                        </div>
                    </div>
                )}

                <div className="mb-4 relative z-10">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Sparkle weight="fill" className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1 group-hover:text-accent-purple transition-colors">{template.title}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2">{template.description}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 border-t border-zinc-100 pt-4 relative z-10">
                    <span className={`font-medium ${colors.text} ${colors.bg} px-2 py-0.5 rounded border border-current/20`}>{template.category}</span>
                    <span>•</span>
                    <span>{template.questions} Qs</span>
                    <span>•</span>
                    <span>{template.time}</span>
                </div>
                
                {/* Hover Action */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <Button disabled className="bg-accent-purple text-white font-medium rounded-lg shadow-lg shadow-accent-purple/20">
                        Coming Soon
                    </Button>
                </div>
            </div>
        )})}
      </div>
    </div>
  );
}

