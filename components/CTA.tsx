"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 bg-transparent">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="bg-[#041D13] rounded-3xl p-8 md:p-16 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to crush your finals?
              </h2>
              <p className="text-zinc-300 text-lg mb-8 max-w-md">
                Stop guessing what's on the exam. Start simulating the real thing today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button className="bg-white text-[#041D13] hover:bg-zinc-100 h-12 px-8 rounded-full font-bold flex items-center gap-2">
                    Get Started for Free
                    <ArrowRight weight="bold" className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            
            {/* Abstract Browser/App Representation */}
            <div className="relative lg:h-[400px] flex items-center justify-center">
               <div className="w-[500px] h-[350px] bg-zinc-800 rounded-xl border border-zinc-700 shadow-2xl transform rotate-3 lg:absolute lg:top-12 lg:right-0 overflow-hidden">
                  <div className="h-8 bg-zinc-900 border-b border-zinc-700 flex items-center gap-2 px-4">
                     <div className="w-2 h-2 rounded-full bg-zinc-600" />
                     <div className="w-2 h-2 rounded-full bg-zinc-600" />
                     <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  </div>
                  <div className="p-8 flex items-center justify-center h-full">
                     <div className="text-center">
                        <div className="text-5xl font-bold text-white mb-2">94%</div>
                        <div className="text-zinc-500 text-sm uppercase tracking-widest">Readiness Score</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
