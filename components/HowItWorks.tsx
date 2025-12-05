"use client";

import { UploadSimple, Sliders, Play, ChartBar } from "@phosphor-icons/react";

const steps = [
  {
    id: "01",
    title: "Upload Materials",
    description: "Feed the app your course material. PDF, PPTX, DOCX, or raw text. We structure the chaos.",
    color: "text-[#A3E635]",
    bg: "bg-[#A3E635]/10",
    border: "border-[#A3E635]/20",
    icon: <UploadSimple weight="duotone" className="w-8 h-8" />
  },
  {
    id: "02",
    title: "Configure Exam",
    description: "Set the rules. '20 questions, hard mode, focus on Chapter 3'. You control the simulation.",
    color: "text-[#FF5F1F]",
    bg: "bg-[#FF5F1F]/10",
    border: "border-[#FF5F1F]/20",
    icon: <Sliders weight="duotone" className="w-8 h-8" />
  },
  {
    id: "03",
    title: "Simulate Test",
    description: "Take the test in a distraction-free environment that mimics the real thing. No do-overs.",
    color: "text-[#A3E635]",
    bg: "bg-[#A3E635]/10",
    border: "border-[#A3E635]/20",
    icon: <Play weight="duotone" className="w-8 h-8" />
  },
  {
    id: "04",
    title: "Instant Grading",
    description: "Get instant, detailed feedback on both multiple choice and written answers with semantic analysis.",
    color: "text-[#FF5F1F]",
    bg: "bg-[#FF5F1F]/10",
    border: "border-[#FF5F1F]/20",
    icon: <ChartBar weight="duotone" className="w-8 h-8" />
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#F3F4F6] py-24 md:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-zinc-200 text-zinc-600 text-xs font-bold uppercase tracking-widest mb-6">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#041D13] mb-6 tracking-tight">
            From raw notes to graded exam <br />
            <span className="text-green-600">in seconds.</span>
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed max-w-2xl mx-auto">
            Stop wasting time making flashcards. Our pipeline handles the heavy lifting so you can focus on active recall.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold mb-6 ${step.bg} ${step.color} ${step.border} border`}>
                {step.icon}
              </div>
              <div className="mb-4">
                <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Step {step.id}</span>
              </div>
              <h3 className="text-xl font-semibold text-[#041D13] mb-3 tracking-tight">{step.title}</h3>
              <p className="text-zinc-600 leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
