"use client";

import { UploadSimple, Sliders, Play, ChartBar } from "@phosphor-icons/react";

const benefits = [
  {
    title: "Smart Ingestion",
    description: "Upload your syllabus, slides, or notes. We structure the chaos instantly.",
    icon: <UploadSimple weight="duotone" className="w-6 h-6" />
  },
  {
    title: "Custom Configuration",
    description: "Tailor the difficulty, topics, and question types to your exact needs.",
    icon: <Sliders weight="duotone" className="w-6 h-6" />
  },
  {
    title: "Realistic Simulation",
    description: "Experience the pressure of the exam hall before the actual day.",
    icon: <Play weight="duotone" className="w-6 h-6" />
  },
  {
    title: "Instant Feedback",
    description: "Get graded immediately with detailed explanations and source citations.",
    icon: <ChartBar weight="duotone" className="w-6 h-6" />
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-transparent">
      <div className="container max-w-5xl px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            Why Choose ExamSim
          </h2>
          <p className="text-zinc-600 max-w-2xl mx-auto">
            Make your strengths obvious with our unique approach to active learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 mb-4">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">{benefit.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
