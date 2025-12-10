"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Calendar, TrendUp, Fire, Plus, Check, Trash, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Mock goals - in production, these would come from the database
const defaultGoals = [
  { id: 1, title: "Complete 3 exams this week", target: 3, current: 1, type: "weekly", unit: "exams" },
  { id: 2, title: "Maintain 7-day streak", target: 7, current: 3, type: "streak", unit: "days" },
  { id: 3, title: "Score 80%+ on next exam", target: 80, current: 0, type: "score", unit: "%" },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState(defaultGoals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

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
      setShowAddGoal(false);
    }
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Study Goals</h1>
          <p className="text-zinc-500">Set targets and track your study commitments.</p>
        </div>
        <Button 
          onClick={() => setShowAddGoal(true)}
          className="bg-brand-orange hover:bg-emerald-600 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
          <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Check weight="bold" className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">{goals.filter(g => g.current >= g.target).length}</p>
            <p className="text-xs text-zinc-500 font-medium">Goals Completed</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
          <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent-purple/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Target weight="fill" className="w-5 h-5 text-accent-purple" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">{goals.filter(g => g.current < g.target).length}</p>
            <p className="text-xs text-zinc-500 font-medium">In Progress</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 relative overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
          <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Fire weight="fill" className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">3</p>
            <p className="text-xs text-zinc-500 font-medium">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Create New Goal</h3>
            <div className="flex gap-4">
              <Input
                placeholder="Goal description (e.g., Complete 5 exams)"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Target"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                className="w-24"
              />
              <Button onClick={handleAddGoal} className="bg-zinc-900 text-white hover:bg-zinc-800">
                Add
              </Button>
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Active Goals</h2>
        
        {goals.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
            <Target className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Goals Yet</h3>
            <p className="text-zinc-500 mb-6">Set your first study goal to start tracking progress.</p>
            <Button onClick={() => setShowAddGoal(true)} className="bg-brand-orange text-white hover:bg-emerald-600">
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100);
              const isComplete = goal.current >= goal.target;

              return (
                <div 
                  key={goal.id}
                  className={cn(
                    "bg-white rounded-xl border p-6 relative overflow-hidden transition-all group",
                    isComplete ? "border-emerald-200 bg-emerald-50/30" : "border-zinc-200"
                  )}
                >
                  <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          isComplete ? "bg-emerald-100" : "bg-zinc-100"
                        )}>
                          {goal.type === "weekly" && <Calendar weight="duotone" className={cn("w-6 h-6", isComplete ? "text-emerald-600" : "text-zinc-500")} />}
                          {goal.type === "streak" && <Fire weight="duotone" className={cn("w-6 h-6", isComplete ? "text-emerald-600" : "text-zinc-500")} />}
                          {goal.type === "score" && <TrendUp weight="duotone" className={cn("w-6 h-6", isComplete ? "text-emerald-600" : "text-zinc-500")} />}
                          {goal.type === "custom" && <Target weight="duotone" className={cn("w-6 h-6", isComplete ? "text-emerald-600" : "text-zinc-500")} />}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-zinc-900">{goal.title}</h3>
                          <p className="text-sm text-zinc-500">
                            {goal.current} / {goal.target} {goal.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isComplete && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                            Complete
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Progress</span>
                        <span className={cn("font-semibold", isComplete ? "text-emerald-600" : "text-zinc-900")}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-[3px] overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-[2px] transition-all duration-500",
                            isComplete ? "bg-emerald-500" : "bg-brand-orange"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggested Goals */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Suggested Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Answer 100 questions", icon: Target, desc: "Build consistency", bgColor: "bg-accent-purple/10", textColor: "text-accent-purple" },
            { title: "Achieve 90% on any exam", icon: TrendUp, desc: "Push for excellence", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
            { title: "30-day streak", icon: Fire, desc: "Long-term commitment", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
            { title: "Complete all weak areas", icon: Check, desc: "Targeted improvement", bgColor: "bg-violet-500/10", textColor: "text-violet-500" },
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => {
                setNewGoalTitle(suggestion.title);
                setNewGoalTarget("1");
                setShowAddGoal(true);
              }}
              className="flex items-center gap-4 p-4 bg-white border border-zinc-200 rounded-xl hover:border-accent-purple/30 hover:shadow-md transition-all text-left group"
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform", suggestion.bgColor)}>
                <suggestion.icon weight="fill" className={cn("w-5 h-5", suggestion.textColor)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900 group-hover:text-accent-purple transition-colors">{suggestion.title}</p>
                <p className="text-xs text-zinc-500">{suggestion.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-accent-purple group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


