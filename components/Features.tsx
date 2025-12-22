import Image from "next/image";
import { FileUp, Brain, Sparkles } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="pt-32 pb-24 bg-transparent">
      <div className="container max-w-5xl px-4 md:px-6 mx-auto space-y-32">

        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-2">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-zinc-900 mb-6 tracking-tight leading-relaxed md:leading-loose">
            Turn passive consumption into <br className="hidden sm:block" />
            <span className="bg-brand-orange text-zinc-900 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-2 md:px-3 py-1 inline-block mt-2 text-xl md:text-4xl lg:text-5xl">
              active mastery.
            </span>
          </h2>
          <p className="text-zinc-900 text-base md:text-xl font-bold max-w-2xl mx-auto">
            Don&apos;t just read. Simulate. The only study tool built for retention.
          </p>
        </div>

        {/* Highlighted Features 2 & 3 - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 2 */}
          <div className="bg-white rounded-lg p-6 md:p-8 border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300">
            <div className="mb-6 text-center">
              <h3 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 tracking-tight">
                <span className="bg-brand-orange text-zinc-900 px-3 py-1 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">Customizable</span> Practice
              </h3>
              <p className="text-zinc-700 leading-relaxed font-medium text-lg">
                Set time limits, adjust difficulty levels, and choose specific topics.
              </p>
            </div>
            <div className="aspect-square bg-zinc-50 rounded-lg border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-zinc-400 text-sm relative overflow-hidden">
              <Image
                src="/images/examsettingssamewidthandheight.png"
                alt="Exam Settings Preview"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg p-6 md:p-8 border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300">
            <div className="mb-6 text-center">
              <h3 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 tracking-tight">
                <span className="bg-accent-purple text-white px-3 py-1 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">Instant</span> Feedback
              </h3>
              <p className="text-zinc-700 leading-relaxed font-medium text-lg">
                Get detailed explanations for every question you answer.
              </p>
            </div>
            <div className="aspect-square bg-zinc-50 rounded-lg border-[3px] border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-zinc-400 text-sm relative overflow-hidden">
              <Image
                src="/images/compressed-explanationssamewidthandheight.png"
                alt="Exam Feedback Preview"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Highlighted Feature 1 - Large, Split Layout */}
        <div className="flex flex-col">
          {/* Centered Heading */}
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
              <span className="bg-accent-purple text-white px-2 md:px-3 py-1 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block text-xl md:text-4xl lg:text-5xl">Upload</span> Your Study Materials
            </h3>
          </div>

          {/* Side-by-side content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left: Description + Bullet Points */}
            <div className="flex flex-col">
              <p className="text-zinc-900 text-lg md:text-xl font-semibold leading-relaxed mb-10 text-center">
                Drag and drop your course materials and we'll analyze the content to generate practice questions tailored to what you need to learn.
              </p>
              <ul className="space-y-8">
                {[
                  {
                    title: "Any Format",
                    text: "Upload PDFs, PowerPoints, Word docs, or paste text directly",
                    icon: FileUp,
                    bg: "bg-emerald-300",
                  },
                  {
                    title: "Smart Parsing",
                    text: "Automatically extracts and identifies key concepts from your materials",
                    icon: Brain,
                    bg: "bg-accent-purple",
                  },
                  {
                    title: "Auto Analysis",
                    text: "Filters out irrelevant content and focuses on what matters most",
                    icon: Sparkles,
                    bg: "bg-blue-300",
                  }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-zinc-900">
                    <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                      <item.icon className="w-6 h-6 text-zinc-900" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-zinc-900 text-xl">{item.title}</span>
                      <span className="text-zinc-600 text-base leading-relaxed">{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Full image with gradient fade */}
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white rounded-lg border-2 border-zinc-900 shadow-neo overflow-hidden">
                <Image
                  src="/images/uploadbox.png"
                  alt="Upload Interface Preview"
                  width={450}
                  height={340}
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
              {/* Subtle gradient fade at bottom for elegant finish */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none rounded-b-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
