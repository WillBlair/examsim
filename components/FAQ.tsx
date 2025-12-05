"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "@phosphor-icons/react";

const faqs = [
  {
    question: "How does the ingestion engine work?",
    answer: "We use advanced OCR and NLP to parse your documents (PDF, PPTX, DOCX) and structure them into a knowledge graph. This allows us to generate questions that are contextually accurate."
  },
  {
    question: "Can I upload handwritten notes?",
    answer: "Yes! Our OCR technology is capable of reading legible handwriting and converting it into digital text for analysis."
  },
  {
    question: "Is my data private?",
    answer: "Absolutely. Your course materials are encrypted and only accessible to you. We do not use your data to train public models."
  },
  {
    question: "How accurate is the AI grading?",
    answer: "Our grading engine compares your answers against the source material using semantic similarity. It provides specific feedback on what you missed based on your actual notes."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-transparent">
      <div className="container max-w-4xl px-4 md:px-6 mx-auto flex flex-col gap-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            FAQ
          </h2>
          <p className="text-zinc-600">
            Reduce hesitation with smart answers to common concerns.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-zinc-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
              >
                <span className="font-semibold text-zinc-900">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-zinc-500" />
                ) : (
                  <Plus className="w-5 h-5 text-zinc-500" />
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
                    <div className="p-6 pt-0 text-zinc-600 bg-zinc-50/50">
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

