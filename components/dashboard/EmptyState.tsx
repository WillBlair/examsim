"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Sparkle, Rocket, BookOpen } from "@phosphor-icons/react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel = "Get Started", 
  actionHref = "/dashboard/new",
  icon 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-6">
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-16 h-16 rounded-sm bg-brand-orange border-2 border-zinc-900 flex items-center justify-center shadow-neo"
        >
          {icon || <FileText className="w-8 h-8 text-white" weight="fill" />}
        </motion.div>
      </div>
      
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-black text-zinc-900 mb-2 uppercase tracking-tight"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-zinc-500 max-w-sm mb-8 leading-relaxed text-sm font-medium"
      >
        {description}
      </motion.p>
      
      {actionHref && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href={actionHref}>
            <Button className="h-11 px-6 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-white font-bold border-2 border-zinc-900 shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all gap-2">
              <Plus weight="bold" className="w-4 h-4" />
              {actionLabel}
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}

export function DashboardEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white border-2 border-zinc-900 shadow-neo">
      <div className="absolute inset-0 pattern-grid opacity-5" />
      
      <EmptyState
        title="Start Your Learning Journey"
        description="Upload your course materials and generate AI-powered practice exams. Track your progress and master any subject."
        actionLabel="Create First Exam"
        actionHref="/dashboard/new"
        icon={<Rocket className="w-8 h-8 text-white" weight="fill" />}
      />
    </div>
  );
}

export function ExamsEmptyState() {
  return (
    <EmptyState
      title="No Exams Yet"
      description="Create your first practice exam to start testing your knowledge and tracking improvement."
      actionLabel="Create New Exam"
      actionHref="/dashboard/new"
      icon={<Sparkle className="w-8 h-8 text-white" weight="fill" />}
    />
  );
}

export function ResultsEmptyState() {
  return (
    <EmptyState
      title="No Results Yet"
      description="Complete a practice exam to see your detailed performance analytics here."
      actionLabel="Take an Exam"
      actionHref="/dashboard/exams"
      icon={<BookOpen className="w-8 h-8 text-white" weight="fill" />}
    />
  );
}
