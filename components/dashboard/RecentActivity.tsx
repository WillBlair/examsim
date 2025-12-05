"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900">Recent Simulations</h2>
        <Link href="/dashboard/exams" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors">
            View all <CaretRight weight="bold" className="w-3 h-3" />
        </Link>
      </div>

      {exams.length === 0 ? (
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50"
         >
            <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-zinc-100 flex items-center justify-center mb-4">
                <Plus weight="bold" className="w-6 h-6 text-zinc-400" />
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
                            <div className="group bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-lg font-bold text-zinc-700 group-hover:scale-110 transition-transform shadow-sm">
                                        {exam.title.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 group-hover:text-brand-orange transition-colors">{exam.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                            <span className="font-medium bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">{exam.topic}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(exam.createdAt))} ago</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {result ? (
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Score</span>
                                            <span className={`font-bold text-lg ${result.score > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                                {Math.round((result.score / result.totalQuestions) * 100)}%
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 bg-zinc-50 rounded-lg text-xs font-bold text-zinc-400 border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
                                            NOT TAKEN
                                        </div>
                                    )}
                                    <CaretRight weight="bold" className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all" />
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



