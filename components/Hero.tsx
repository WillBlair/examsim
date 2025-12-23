import Image from "next/image";
import { HeroCTAButton } from "@/components/HeroCTAButton";

export function Hero() {
  return (
    <section id="home" className="relative w-full pt-28 md:pt-[8.5rem] pb-0 bg-transparent overflow-visible">
      <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">

        {/* Top Tagline */}
        <div className="mb-4 md:mb-6 animate-fade-in-up">
          <p className="text-sm md:text-[17px] font-medium text-zinc-600 px-2">
            See how you can save 4+ hours on your next study session below.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto animate-fade-in-up-delay-1">
          <h1 className="text-[2.5rem] md:text-[3.9rem] lg:text-[4.75rem] font-bold text-zinc-900 mb-6 md:mb-8 tracking-tighter leading-[1.1] px-2">
            Experience the exam <br className="hidden md:block" />
            <span className="text-accent-purple">before it happens.</span>
          </h1>

          <p className="text-base md:text-[1.35rem] text-zinc-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-medium px-4">
            Turn your course materials into a full-scale dress rehearsal.
            Walk into the exam hall having already passed the test.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 md:mb-16 px-4">
            <HeroCTAButton />
          </div>


        </div>

        {/* Browser/Dashboard Mockup (Centered & Large) */}
        <div className="relative w-full max-w-5xl perspective-1000 mx-auto px-4 md:px-0 mb-[-50px] z-20 animate-fade-in-up-delay-2">
          {/* Browser Window Mockup Container */}
          <div className="relative rounded-lg border-2 border-zinc-900 shadow-2xl overflow-hidden bg-white">
            {/* Browser Toolbar */}
            <div className="h-10 bg-zinc-100 border-b-2 border-zinc-900 flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20" />

              <div className="ml-4 flex-1 max-w-2xl mx-auto bg-white h-7 rounded-sm border-2 border-zinc-200 text-[10px] flex items-center px-4 text-zinc-500 font-mono shadow-sm justify-center gap-2">
                <div className="w-3 h-3 text-zinc-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
                examsim.app/dashboard
              </div>
            </div>

            {/* Screenshot - LCP Element */}
            <Image
              src="/images/compressed-dashboard-preview.webp"
              alt="ExamSim Dashboard Preview"
              width={1200}
              height={675}
              className="w-full h-auto block"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
