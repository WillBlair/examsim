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
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="relative mb-8">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-brand-orange/20 blur-3xl rounded-full scale-150" />
        
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center shadow-xl shadow-brand-orange/20"
        >
          {icon || <FileText className="w-10 h-10 text-white" weight="fill" />}
        </motion.div>
      </div>
      
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-foreground mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-sm mb-8 leading-relaxed text-sm"
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
            <Button className="h-12 px-8 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-semibold gap-2.5 glow-orange-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-zinc-200 shadow-md">
      {/* Background decoration */}
      <div className="absolute inset-0 pattern-grid opacity-50" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/5 blur-[100px] rounded-full" />
      
      <EmptyState
        title="Start Your Learning Journey"
        description="Upload your course materials and generate AI-powered practice exams. Track your progress and master any subject."
        actionLabel="Create First Exam"
        actionHref="/dashboard/new"
        icon={<Rocket className="w-10 h-10 text-white" weight="fill" />}
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
      icon={<Sparkle className="w-10 h-10 text-white" weight="fill" />}
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
      icon={<BookOpen className="w-10 h-10 text-white" weight="fill" />}
    />
  );
}
