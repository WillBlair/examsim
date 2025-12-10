"use client";

import { AppIcon } from "@/components/ui/icon";

const reviews = [
  {
    name: "Alex Chen",
    role: "Economics Student",
    content: "I was failing Econ 101 until I started using ExamSim. The active recall engine is a game changer.",
    stars: 5
  },
  {
    name: "Sarah Miller",
    role: "Pre-Med",
    content: "The AI grading is shockingly accurate. It caught logical fallacies in my essays that my professor missed.",
    stars: 5
  },
  {
    name: "Jordan Smith",
    role: "Law Student",
    content: "ExamSim saved me hours of flashcard making. It just understands the material instantly.",
    stars: 5
  },
  {
    name: "Emily Zhang",
    role: "Computer Science",
    content: "Being able to simulate the exact exam conditions reduced my anxiety significantly.",
    stars: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-transparent">
      <div className="container max-w-5xl px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Let happy users convince the rest.
          </h2>
          <p className="text-zinc-600 max-w-2xl mx-auto font-medium">
            Join thousands of students who have transformed their study habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(review.stars)].map((_, s) => (
                  <AppIcon key={s} name="StarSolid" className="w-4 h-4 text-brand-orange" />
                ))}
              </div>
              <p className="text-zinc-700 mb-6 text-sm leading-relaxed font-medium">
                &quot;{review.content}&quot;
              </p>
              <div>
                <div className="font-bold text-zinc-900 text-sm">{review.name}</div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{review.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

