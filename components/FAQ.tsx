"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppIcon } from "@/components/ui/icon";

const faqs = [
  {
    question: "How does ExamSim work?",
    answer: "ExamSim turns your study materials into an interactive exam experience. Simply upload your notes, slides, or textbooks, and our AI generates realistic practice questions, grades your answers, and provides detailed feedback to help you master the material."
  },
  {
    question: "What types of files can I upload?",
    answer: "We support a wide range of formats including PDF, PPTX (PowerPoint), DOCX (Word), and even images of handwritten notes. You can also paste text directly into the dashboard."
  },
  {
    question: "Can I customize the practice exams?",
    answer: "Yes! You have full control. You can set specific time limits, choose the number of questions, select difficulty levels, and even focus on specific topics or chapters from your uploaded materials."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. Your uploaded documents and personal data are encrypted and stored deeply securely. We never share your data with third parties or use it to train public AI models without your explicit permission."
  },
  {
    question: "How accurate is the AI grading?",
    answer: "Our grading engine is highly advanced. It uses semantic analysis to compare your answers against the source material, ensuring that you get credit for understanding concepts, not just matching keywords. It provides granular feedback on exactly what you missed."
  },
  {
    question: "Can I save my progress?",
    answer: "Yes, all your generated exams, attempts, and performance analytics are automatically saved to your dashboard. You can review past exams and track your improvement over time."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-transparent">
      <div className="container max-w-4xl px-4 md:px-6 mx-auto flex flex-col gap-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            FAQ
          </h2>
          <p className="text-zinc-600 font-medium">
            Reduce hesitation with smart answers to common concerns.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-2 border-zinc-900 shadow-neo rounded-lg overflow-hidden bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-200">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-zinc-50 transition-colors"
              >
                <span className="font-bold text-zinc-900">{faq.question}</span>
                {openIndex === index ? (
                  <AppIcon name="Minus" className="w-5 h-5 text-zinc-900" />
                ) : (
                  <AppIcon name="Plus" className="w-5 h-5 text-zinc-900" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-6 pt-0 text-zinc-600 bg-white font-medium border-t-2 border-zinc-100">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

