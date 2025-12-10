"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GridBackground } from "@/components/GridBackground";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import Link from "next/link";
import { checkAuth } from "@/app/actions/auth";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth().then(setIsAuthenticated);
  }, []);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Simplified Bevel Animation
  const rotateX = useTransform(scrollYProgress, [0.6, 0.75], [0, 90]);
  const inverseY = useTransform(scrollYProgress, [0.75, 0.9], ["100%", "0%"]);

  return (
    <section ref={containerRef} id="home" className="relative w-full pt-32 pb-0 bg-transparent overflow-visible">
      <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">
        
        {/* Top Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-sm md:text-base font-medium text-zinc-600">
            See how you can save 4+ hours on your next study session below.
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-900 mb-8 tracking-tighter leading-[1.1]">
            Experience the exam <br className="hidden md:block" />
            <span className="text-accent-purple">before it happens.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Turn your course materials into a full-scale dress rehearsal. 
            Walk into the exam hall having already passed the test.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href={isAuthenticated ? "/dashboard/new" : "/register"}>
              <Button className="h-12 px-8 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-base flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Generate My First Exam
                <AppIcon name="ArrowRight" className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Social Proof / Logos */}
          <div className="mb-16">
            <p className="text-sm text-zinc-500 font-medium mb-6">
              Loved by 1,000,000+ learners from top institutions
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale mix-blend-multiply">
               {/* University Logos - using text placeholders for now to match style */}
               {["Harvard", "MIT", "Stanford", "Penn", "Toronto", "McGill"].map((uni, i) => (
                 <div key={i} className="text-lg font-serif font-bold text-zinc-800">
                   {uni}
                 </div>
               ))}
            </div>
          </div>
        </motion.div>

        {/* Browser/Dashboard Mockup (Centered & Large) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-4xl perspective-1000 mx-auto px-4 md:px-0 mb-[-50px] z-20"
        >
           {/* Browser Window Mockup */}
           <div className="relative bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden ring-1 ring-black/5">
             {/* Browser Toolbar */}
             <div className="h-10 bg-zinc-100 border-b border-zinc-200 flex items-center gap-2 px-4">
                 <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                 <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                 <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                 <div className="ml-4 flex-1 max-w-2xl mx-auto bg-white h-6 rounded-md border border-zinc-200 text-[10px] flex items-center px-2 text-zinc-400 font-mono shadow-sm justify-center">
                     examsim.app/dashboard
                 </div>
             </div>
             
             {/* Dashboard Mockup Content */}
             <div className="aspect-[16/9] bg-zinc-50 flex relative">
                 {/* Sidebar Mockup */}
                 <div className="w-64 bg-white border-r border-zinc-200 flex flex-col p-4 hidden md:flex">
                     <div className="h-8 w-8 bg-zinc-900 rounded-lg mb-8 flex items-center justify-center text-white font-bold">ES</div>
                     <div className="space-y-1">
                         <div className="flex items-center gap-3 px-3 py-2 bg-accent-purple/10 text-accent-purple rounded-md text-sm font-medium">
                             <AppIcon name="Home" className="w-4 h-4" />
                             <span>Home</span>
                         </div>
                         <div className="flex items-center gap-3 px-3 py-2 text-zinc-500 rounded-md text-sm font-medium">
                             <AppIcon name="Page" className="w-4 h-4" />
                             <span>Exams</span>
                         </div>
                         <div className="flex items-center gap-3 px-3 py-2 text-zinc-500 rounded-md text-sm font-medium">
                             <AppIcon name="GraphUp" className="w-4 h-4" />
                             <span>Analytics</span>
                         </div>
                     </div>
                 </div>

                 {/* Main Content Area */}
                 <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden text-left">
                     {/* Header */}
                     <div className="flex justify-between items-center">
                         <div>
                             <h3 className="text-2xl font-bold text-zinc-900">Welcome back, Alex</h3>
                             <p className="text-sm text-zinc-500">Here's your exam preparation overview</p>
                         </div>
                         <div className="flex items-center gap-3">
                             <Button size="sm" className="bg-brand-orange text-white hover:bg-emerald-600">
                                <AppIcon name="Plus" className="w-4 h-4 mr-2" /> New Exam
                             </Button>
                         </div>
                     </div>

                     {/* Quick Stats */}
                     <div className="grid grid-cols-3 gap-4">
                         <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                             <div className="text-sm text-zinc-500 mb-1">Total Exams</div>
                             <div className="text-2xl font-bold text-zinc-900">12</div>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                             <div className="text-sm text-zinc-500 mb-1">Avg. Score</div>
                             <div className="text-2xl font-bold text-emerald-600">85%</div>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                             <div className="text-sm text-zinc-500 mb-1">Time Spent</div>
                             <div className="text-2xl font-bold text-zinc-900">24h</div>
                         </div>
                     </div>
                 </div>
                 
                 {/* Overlay Gradient for bottom fade if needed, but clean is better */}
             </div>
           </div>
        </motion.div>

      </div>
      
      {/* Removed Bevel Container */}
    </section>
  );
}
