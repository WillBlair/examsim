"use client";

import Image from "next/image";
import { FileUp, Brain, Sparkles } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="pt-32 pb-24 bg-transparent">
      <div className="container max-w-5xl px-4 md:px-6 mx-auto space-y-24">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight leading-loose">
            Turn passive consumption into <br />
            <span className="bg-brand-orange text-zinc-900 border-2 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-1 inline-block mt-2">
              active mastery.
            </span>
          </h2>
          <p className="text-zinc-900 text-xl font-bold max-w-2xl mx-auto">
            Don&apos;t just read. Simulate. The only study tool built for retention.
          </p>
        </div>

        {/* Highlighted Feature 1 - Large, Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-none bg-emerald-300 text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-wider mb-6">
              Smart Knowledge Extraction
            </div>
            <h3 className="text-4xl font-black text-zinc-900 mb-6 tracking-tight">
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
          <div className="bg-white rounded-lg p-8 md:p-12 border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300">
            <div className="h-48 bg-zinc-50 rounded-lg border border-zinc-200 mb-8 flex items-center justify-center text-zinc-400 text-sm relative overflow-hidden">
              {/* Abstract UI for Config */}
              <div className="w-3/4 h-3/4 bg-white rounded-sm border-2 border-zinc-900 shadow-neo-sm p-4 space-y-2">
                <div className="h-2 bg-zinc-200 rounded-sm w-1/2" />
                <div className="h-8 bg-zinc-50 border border-zinc-200 rounded-sm" />
                <div className="h-2 bg-zinc-200 rounded-sm w-1/3 mt-4" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-sm bg-zinc-100 border border-zinc-200" />
                  <div className="h-8 w-8 rounded-sm bg-zinc-100 border border-zinc-200" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4 tracking-tight">Customizable Practice</h3>
            <p className="text-zinc-600 leading-relaxed font-medium">
              Design your perfect study session. Set time limits, adjust difficulty levels, and choose specific topics to simulate real exam pressure.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg p-8 md:p-12 border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300">
            <div className="h-48 bg-zinc-50 rounded-lg border border-zinc-200 mb-8 flex items-center justify-center text-zinc-400 text-sm relative overflow-hidden">
              {/* Abstract UI for Grading */}
              <div className="w-3/4 h-3/4 flex flex-col gap-3 p-4">
                <div className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-sm border border-emerald-100">
                  <div className="w-4 h-4 rounded-full bg-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 w-full">
                    <div className="h-2 bg-emerald-200/50 rounded-sm w-3/4" />
                    <div className="h-2 bg-emerald-200/50 rounded-sm w-1/2" />
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-red-50/50 p-3 rounded-sm border border-red-100">
                  <div className="w-4 h-4 rounded-full bg-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 w-full">
                    <div className="h-2 bg-red-200/50 rounded-sm w-full" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4 tracking-tight">Instant Step-by-Step Feedback</h3>
            <p className="text-zinc-600 leading-relaxed font-medium">
              Go beyond simple scoring. Receive detailed explanations for every question, understanding exactly why an answer is right or wrong.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
