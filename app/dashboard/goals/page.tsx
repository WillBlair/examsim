"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Calendar, TrendUp, Fire, Plus, Check, Trash, ArrowRight, Trophy, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Mock goals
const defaultGoals = [
  { id: 1, title: "Complete 3 exams this week", target: 3, current: 1, type: "weekly", unit: "exams" },
  { id: 2, title: "Maintain 7-day streak", target: 7, current: 3, type: "streak", unit: "days" },
  { id: 3, title: "Score 80%+ on next exam", target: 80, current: 0, type: "score", unit: "%" },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState(defaultGoals);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleAddGoal = () => {
    if (newGoalTitle && newGoalTarget) {
      setGoals([
        ...goals,
        {
          id: Date.now(),
          title: newGoalTitle,
          target: parseInt(newGoalTarget),
          current: 0,
          type: "custom",
          unit: ""
        }
      ]);
      setNewGoalTitle("");
      setNewGoalTarget("");
    }
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white border-[3px] border-zinc-900 shadow-neo-xl rounded-lg p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10B981_1px,transparent_1px),linear-gradient(to_bottom,#10B981_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.12]" />
        
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none transition-all duration-700 group-hover:bg-emerald-500/25" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 border-2 border-zinc-900 rounded-md shadow-neo-sm">
                    <Target weight="fill" className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Study Goals</h1>
            </div>
            <p className="text-lg text-zinc-600 font-medium max-w-lg text-center md:text-left">
              Set targets and track your study commitments. Consistency is key!
            </p>
          </div>
          
          <Button 
            onClick={scrollToForm}
            className="bg-brand-orange text-white hover:bg-emerald-600 border-2 border-zinc-900 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black h-12 px-6 rounded-md"
          >
            <Plus weight="bold" className="w-5 h-5 mr-2" />
            Add New Goal
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border-[3px] border-zinc-900 shadow-neo p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-md bg-emerald-100 border-2 border-zinc-900 flex items-center justify-center">
                <Check weight="fill" className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="px-2 py-1 bg-emerald-50 rounded border border-emerald-200 text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                    All Time
                </div>
            </div>
            <p className="text-4xl font-black text-zinc-900 tracking-tight mb-1 tabular-nums">{goals.filter(g => g.current >= g.target).length}</p>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider">Completed</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border-[3px] border-zinc-900 shadow-neo p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-md bg-violet-100 border-2 border-zinc-900 flex items-center justify-center">
                <Target weight="fill" className="w-6 h-6 text-violet-600" />
                </div>
                <div className="px-2 py-1 bg-violet-50 rounded border border-violet-200 text-[10px] font-black uppercase text-violet-700 tracking-wider">
                    Active
                </div>
            </div>
            <p className="text-4xl font-black text-zinc-900 tracking-tight mb-1 tabular-nums">{goals.filter(g => g.current < g.target).length}</p>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider">In Progress</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border-[3px] border-zinc-900 shadow-neo p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-md bg-amber-100 border-2 border-zinc-900 flex items-center justify-center relative">
                    <Fire weight="fill" className="w-6 h-6 text-amber-600 relative z-10" />
                    <div className="absolute inset-0 bg-amber-400/20 blur-md rounded-full animate-pulse" />
                </div>
                <div className="px-2 py-1 bg-amber-50 rounded border border-amber-200 text-[10px] font-black uppercase text-amber-700 tracking-wider flex items-center gap-1">
                    <Sparkle weight="fill" className="w-3 h-3" /> Best
                </div>
            </div>
            <p className="text-4xl font-black text-zinc-900 tracking-tight mb-1 tabular-nums">3</p>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-6">
        <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            Active Goals
            <span className="h-[2px] flex-1 bg-zinc-200" />
        </h2>
        
        {goals.length === 0 ? (
          <div className="bg-white rounded-lg border-[3px] border-zinc-200 border-dashed p-12 text-center group hover:border-zinc-300 transition-colors">
            <div className="w-16 h-16 rounded-lg bg-zinc-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">No Goals Yet</h3>
            <p className="text-zinc-500 font-medium mb-6">Set your first study goal to start tracking progress.</p>
            <Button onClick={scrollToForm} className="bg-brand-orange text-white hover:bg-emerald-600 border-2 border-zinc-900 shadow-neo-sm font-bold rounded-md">
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="grid gap-5">
            <AnimatePresence>
            {goals.map((goal) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100);
              const isComplete = goal.current >= goal.target;

              return (
                <motion.div 
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "bg-white rounded-lg border-[3px] p-6 relative overflow-hidden transition-all group hover:shadow-neo-sm",
                    isComplete ? "border-emerald-500 shadow-none" : "border-zinc-900 shadow-neo"
                  )}
                >
                  {isComplete && <div className="absolute inset-0 bg-emerald-50/50 pointer-events-none" />}
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-14 h-14 rounded-md border-2 border-zinc-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white",
                          isComplete && "bg-emerald-400 border-emerald-600 shadow-[4px_4px_0px_0px_#047857]"
                        )}>
                          {goal.type === "weekly" && <Calendar weight="fill" className={cn("w-7 h-7", isComplete ? "text-white" : "text-zinc-900")} />}
                          {goal.type === "streak" && <Fire weight="fill" className={cn("w-7 h-7", isComplete ? "text-white" : "text-amber-500")} />}
                          {goal.type === "score" && <TrendUp weight="fill" className={cn("w-7 h-7", isComplete ? "text-white" : "text-blue-500")} />}
                          {goal.type === "custom" && <Target weight="fill" className={cn("w-7 h-7", isComplete ? "text-white" : "text-violet-500")} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-zinc-900">{goal.title}</h3>
                            {isComplete && <Trophy weight="fill" className="w-5 h-5 text-amber-500 animate-bounce" />}
                          </div>
                          <p className="text-sm font-bold text-zinc-500 mt-1 tabular-nums">
                            {goal.current} / {goal.target} {goal.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isComplete && (
                          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-md border-2 border-emerald-200 uppercase tracking-wide flex items-center gap-1">
                            <Check weight="bold" className="w-3 h-3" />
                            Complete
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash weight="bold" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-zinc-500">Progress</span>
                        <span className={cn(isComplete ? "text-emerald-700" : "text-zinc-900")}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full h-5 bg-zinc-100 rounded-full border-2 border-zinc-200 overflow-hidden relative">
                        {/* Background pattern for track */}
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] bg-[size:10px_10px]" />
                        
                        <div 
                          className={cn(
                            "h-full rounded-full border-r-2 border-zinc-900 transition-all duration-700 ease-out relative overflow-hidden",
                            isComplete ? "bg-emerald-400" : "bg-brand-orange"
                          )}
                          style={{ width: `${progress}%` }}
                        >
                            {/* Striped animation on the bar itself */}
                            <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[size:16px_16px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Suggested Goals */}
      <div className="space-y-6">
        <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            Suggested Goals
            <span className="h-[2px] flex-1 bg-zinc-200" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: "Answer 100 questions", icon: Target, desc: "Build consistency", color: "bg-violet-100 text-violet-600" },
            { title: "Achieve 90% on any exam", icon: TrendUp, desc: "Push for excellence", color: "bg-emerald-100 text-emerald-600" },
            { title: "30-day streak", icon: Fire, desc: "Long-term commitment", color: "bg-amber-100 text-amber-600" },
            { title: "Complete all weak areas", icon: Check, desc: "Targeted improvement", color: "bg-blue-100 text-blue-600" },
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => {
                setNewGoalTitle(suggestion.title);
                setNewGoalTarget("1");
                scrollToForm();
              }}
              className="flex items-center gap-5 p-5 bg-white border-[3px] border-zinc-200 rounded-lg hover:border-zinc-900 hover:shadow-neo-sm transition-all text-left group"
            >
              <div className={cn("w-12 h-12 rounded-md border-2 border-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]", suggestion.color)}>
                <suggestion.icon weight="fill" className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-zinc-900 group-hover:text-brand-orange transition-colors">{suggestion.title}</p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">{suggestion.desc}</p>
              </div>
              <ArrowRight weight="bold" className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Create New Goal - Always Visible */}
      <div ref={formRef} className="bg-zinc-50 rounded-lg border-[3px] border-zinc-900 p-6 relative">
        <div className="relative z-10">
            <h3 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
                <Plus weight="bold" className="w-5 h-5" />
                Create New Goal
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Goal Description</label>
                    <Input
                    placeholder="e.g., Complete 5 exams this week"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="bg-white border-2 border-zinc-300 focus-visible:border-zinc-900 focus-visible:ring-0 font-medium h-12 rounded-md"
                    />
                </div>
                <div className="w-full md:w-32 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Target</label>
                    <Input
                    type="number"
                    placeholder="10"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="bg-white border-2 border-zinc-300 focus-visible:border-zinc-900 focus-visible:ring-0 font-medium h-12 rounded-md"
                    />
                </div>
                <div className="flex gap-2 items-end">
                    <Button onClick={handleAddGoal} className="bg-zinc-900 text-white hover:bg-emerald-600 border-2 border-zinc-900 font-bold h-12 rounded-md shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                        Add Goal
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
