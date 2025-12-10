"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AppIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  exams: {
    id: number;
    title: string;
    topic: string;
    createdAt: Date;
  }[];
  results: {
    examId: number;
    score: number;
    totalQuestions: number;
  }[];
}

export function RecentActivity({ exams, results }: RecentActivityProps) {
  return (
    <div className="space-y-6">
      {exams.length === 0 ? (
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50"
         >
            <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-zinc-100 flex items-center justify-center mb-4">
                <AppIcon name="Plus" className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-zinc-900 font-bold">No exams generated yet</h3>
            <p className="text-zinc-500 text-sm max-w-sm mt-1 mb-6">
                Upload your course notes to generate your first interactive simulation.
            </p>
            <Link href="/dashboard/new">
                <Button variant="outline" className="rounded-full">Get Started</Button>
            </Link>
         </motion.div>
      ) : (
        <div className="grid gap-4">
            {exams.map((exam, index) => {
                 const result = results.find(r => r.examId === exam.id);
                 return (
                    <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                    >
                        <Link href={`/dashboard/exams/${exam.id}`}>
                            <div className="group bg-white p-4 rounded-lg border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-between relative overflow-hidden">
                                {/* Colored spine on hover */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <div className="flex items-center gap-4 pl-2 group-hover:pl-3 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-sm bg-zinc-100 border border-zinc-900 flex items-center justify-center text-sm font-bold text-zinc-700 group-hover:bg-brand-orange group-hover:text-white transition-all shadow-sm">
                                        {exam.title.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 group-hover:text-brand-orange transition-colors text-sm">{exam.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                            <span className="font-medium bg-zinc-50 px-1.5 py-0.5 rounded-sm border border-zinc-200 text-[10px] uppercase tracking-wide">{exam.topic}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(exam.createdAt))} ago</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {result ? (
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Score</span>
                                            <div className={cn(
                                                "px-2 py-0.5 rounded text-xs font-bold border-2 border-transparent",
                                                result.score > 70 
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {Math.round((result.score / result.totalQuestions) * 100)}%
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1.5 bg-zinc-50 rounded-md text-[10px] font-bold text-zinc-400 border border-zinc-200 uppercase tracking-wide group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-colors">
                                            Start
                                        </div>
                                    )}
                                    <AppIcon name="NavArrowRight" className="w-4 h-4 text-zinc-300 group-hover:text-accent-purple group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                 );
            })}
        </div>
      )}
    </div>
  );
}





