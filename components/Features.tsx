"use client";

import { FileText, Brain, Funnel } from "@phosphor-icons/react";
import { IngestionVisualization } from "./IngestionVisualization";

export function Features() {
  return (
    <section className="pt-32 pb-24 bg-transparent">
      <div className="container max-w-5xl px-4 md:px-6 mx-auto space-y-24">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            Turn passive consumption into <br />
            <span className="text-green-600">active mastery.</span>
          </h2>
          <p className="text-zinc-600 text-lg">
            Don't just read. Simulate. The only study tool built for retention.
          </p>
        </div>

        {/* Highlighted Feature 1 - Large, Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wide mb-6">
              Ingestion Engine
            </div>
            <h3 className="text-3xl font-bold text-zinc-900 mb-6">
              Turn chaos into structure instantly.
            </h3>
            <p className="text-zinc-600 text-lg leading-relaxed mb-8">
              Don't waste time organizing notes. Just dump your PDFs, slides, and docs. 
              Our engine parses and structures everything into a coherent study graph.
            </p>
            <ul className="space-y-6">
              {[
                {
                  title: "Broad Format Support",
                  text: "Supports PDF, PPTX, DOCX, and Text",
                  icon: <FileText weight="duotone" className="w-6 h-6 text-brand-orange" />,
                  bg: "bg-orange-50"
                },
                {
                  title: "Semantic Analysis",
                  text: "Identifies and links key concepts",
                  icon: <Brain weight="duotone" className="w-6 h-6 text-brand-orange" />,
                  bg: "bg-orange-50"
                },
                {
                  title: "Smart Deduplication",
                  text: "Automatically merges redundant content",
                  icon: <Funnel weight="duotone" className="w-6 h-6 text-brand-orange" />,
                  bg: "bg-orange-50"
                }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-zinc-700">
                  <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 border border-zinc-200/50 mt-1`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-base mb-1">{item.title}</h4>
                    <p className="text-zinc-600 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Feature Preview - Enhanced Visualization */}
          <div className="h-full min-h-[450px]">
             <IngestionVisualization />
          </div>
        </div>

        {/* Highlighted Features 2 & 3 - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 bg-zinc-50 rounded-xl border border-zinc-100 mb-8 flex items-center justify-center text-zinc-400 text-sm relative overflow-hidden">
               {/* Abstract UI for Config */}
               <div className="w-3/4 h-3/4 bg-zinc-50 rounded border border-zinc-100 p-4 space-y-2">
                   <div className="h-2 bg-zinc-200 rounded w-1/2" />
                   <div className="h-8 bg-white border border-zinc-200 rounded" />
                   <div className="h-2 bg-zinc-200 rounded w-1/3 mt-4" />
                   <div className="flex gap-2">
                       <div className="h-8 w-8 rounded bg-zinc-100" />
                       <div className="h-8 w-8 rounded bg-zinc-100" />
                   </div>
               </div>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Exam Simulation</h3>
            <p className="text-zinc-600 leading-relaxed">
              Configure the exact conditions of your exam. Time limits, question types, and difficulty levels mirrored perfectly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 bg-zinc-50 rounded-xl border border-zinc-100 mb-8 flex items-center justify-center text-zinc-400 text-sm relative overflow-hidden">
               {/* Abstract UI for Grading */}
               <div className="w-3/4 h-3/4 flex flex-col gap-2">
                   <div className="flex items-start gap-2 bg-green-50 p-2 rounded border border-green-100">
                       <div className="w-4 h-4 rounded-full bg-green-200 shrink-0" />
                       <div className="space-y-1 w-full">
                           <div className="h-2 bg-green-200 rounded w-3/4" />
                           <div className="h-2 bg-green-200 rounded w-1/2" />
                       </div>
                   </div>
                   <div className="flex items-start gap-2 bg-red-50 p-2 rounded border border-red-100">
                       <div className="w-4 h-4 rounded-full bg-red-200 shrink-0" />
                       <div className="space-y-1 w-full">
                           <div className="h-2 bg-red-200 rounded w-full" />
                       </div>
                   </div>
               </div>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">AI Tutor Grading</h3>
            <p className="text-zinc-600 leading-relaxed">
              Get instant feedback on your essays. Our AI evaluates your logic and cites the exact source material you missed.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
