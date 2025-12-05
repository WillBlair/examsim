"use client";

export function About() {
  return (
    <section id="about" className="bg-[#041D13] text-white py-24 md:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <span className="text-xs font-bold text-[#FF5F1F] uppercase tracking-[0.2em] block mb-8">
              The Vision
            </span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mb-8 leading-[1.1]">
              We are building the infrastructure for <br />
              <span className="text-[#A3E635]">active learning.</span>
            </h2>
            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
              <p>
                Students are drowning in content but starving for validation. They have the textbooks (data), 
                but they lack the testing mechanism (feedback).
              </p>
              <p>
                I built ExamSim to solve my own problem during a Supply Chain Management midterm. 
                Existing tools like flashcards were too simple, and generic AI chatbots were too hallucination-prone 
                to be trusted with high-stakes exams.
              </p>
              <p className="text-white font-medium">
                We are moving education from passive consumption (reading) to active simulation (testing). 
                It&apos;s not just a study tool; it&apos;s an anxiety-reduction engine.
              </p>
            </div>
          </div>
          
          {/* Visual Content */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5F1F]/20 to-transparent rounded-2xl blur-3xl" />
            <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#FF5F1F] flex items-center justify-center text-[#041D13] font-bold text-xl">
                  A
                </div>
                <div>
                  <div className="font-semibold text-white tracking-tight">The &quot;Aha!&quot; Moment</div>
                  <div className="text-sm text-zinc-400">Supply Chain Management Midterm</div>
                </div>
              </div>
              <p className="text-zinc-300 italic leading-relaxed">
                &quot;You read the notes over and over, feeling like you know it, but when you sit down for the actual exam, 
                you realize you can&apos;t recall the answers under pressure.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
