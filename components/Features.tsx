"use client";

import Image from "next/image";
import { FileUp, Brain, Sparkles } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="pt-32 pb-24 bg-transparent">
      <div className="container max-w-5xl px-4 md:px-6 mx-auto space-y-24">

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

        {/* Highlighted Feature 1 - Large, Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-none bg-emerald-300 text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-wider mb-6">
              Smart Knowledge Extraction
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-zinc-900 mb-6 tracking-tight">
              From raw notes to exam-ready questions.
            </h3>
            <p className="text-zinc-700 text-lg leading-relaxed mb-8 font-bold">
              Simply upload your PDF lectures or paste your class notes.
              We analyze the content to extract the core concepts you need to master.
            </p>
            <ul className="space-y-6">
              {[
                {
                  title: "Flexible Input",
                  text: "Upload PDFs, Slides, or paste text directly",
                  icon: FileUp,
                  color: "text-zinc-900",
                  bg: "bg-emerald-300",
                },
                {
                  title: "Topic Identification",
                  text: "Automatically extracts key themes",
                  icon: Brain,
                  color: "text-zinc-900",
                  bg: "bg-accent-purple",
                },
                {
                  title: "Intelligent Parsing",
                  text: "Focuses on content, ignores noise",
                  icon: Sparkles,
                  color: "text-zinc-900",
                  bg: "bg-blue-300",
                }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-zinc-900">
                  <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-1 transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`}>
                    <item.icon className="w-6 h-6 text-zinc-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-lg mb-1">{item.title}</h4>
                    <p className="text-zinc-600 text-sm leading-relaxed font-medium">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Feature Preview - Enhanced Visualization */}
          <div className="relative w-full bg-white rounded-lg border-2 border-zinc-900 shadow-neo overflow-hidden flex items-center justify-center p-0">
            <Image
              src="/images/uploadbox.png"
              alt="Upload Interface Preview"
              width={800}
              height={600}
              className="w-full h-auto object-contain"
            />
          </div>
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
                className="object-cover"
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
                src="/images/explanationssamewidthandheight.png"
                alt="Exam Feedback Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
