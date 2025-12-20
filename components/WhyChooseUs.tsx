"use client";

import Image from "next/image";

const benefits = [
  {
    title: "Smart Extraction",
    description: "Upload any syllabus, slides, or notes — we instantly identify the concepts that matter.",
  },
  {
    title: "Tailored Practice",
    description: "Customize difficulty, topics, and question types to match exactly what you need.",
  },
  {
    title: "Real-Time Simulation",
    description: "Experience authentic exam pressure with timed sessions before the real thing.",
  },
  {
    title: "Instant Feedback",
    description: "Get graded with detailed explanations so you learn from every single question.",
  }
];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-16 bg-transparent">
      <div className="container max-w-5xl px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Why Choose <span className="text-accent-purple">ExamSim</span>
          </h2>
          <p className="text-zinc-600 max-w-2xl mx-auto font-medium">
            Practice smarter with tools designed to make learning stick.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center group cursor-default"
            >
              {/* Star Image */}
              <div className="mb-5 group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/images/staryellow.png"
                  alt=""
                  width={64}
                  height={64}
                  className="w-16 h-16"
                />
              </div>

              <h3 className="font-bold text-zinc-900 mb-2 text-base group-hover:text-zinc-700 transition-colors">
                {benefit.title}
              </h3>
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
