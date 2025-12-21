"use client";

import { Button } from "@/components/ui/button";
import { Spinner, CheckCircle } from "@phosphor-icons/react";
import { useExamState } from "@/hooks/useExamState";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { ExamProgress } from "@/components/exam/ExamProgress";
import { QuestionCard } from "@/components/exam/QuestionCard";

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  hint?: string | null;
  type: string;
}

interface Exam {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
  timeLimit?: number | null;
}

export function ExamClient({
  exam,
  questions,
  initialTimer,
  isGenerating = false,
  allowHints = false,
  allowExplanations = true
}: {
  exam: Exam;
  questions: Question[];
  initialTimer?: number;
  isGenerating?: boolean;
  allowHints?: boolean;
  allowExplanations?: boolean;
}) {
  const {
    answers,
    visibleHints,
    isSubmitted,
    isSubmitting,
    score,
    isSaving,
    lastSaved,
    handleOptionSelect,
    handleTextChange,
    toggleHint,
    handleSubmit,
    checkAnswer,
  } = useExamState(exam.id, questions);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Header */}
      <ExamProgress
        exam={exam}
        questionsCount={questions.length}
        answeredCount={Object.keys(answers).length}
        isSubmitted={isSubmitted}
        isSaving={isSaving}
        lastSaved={lastSaved}
      >
        <ExamTimer
          examId={exam.id}
          initialTimer={initialTimer}
          isSubmitted={isSubmitted}
        />
      </ExamProgress>

      {/* Results Banner */}
      {isSubmitted && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 border-2 border-green-200 p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4">
          <h2 className="text-2xl font-bold mb-2 text-zinc-900">Exam Results</h2>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-green-600">
              {Math.round((score / questions.length) * 100)}%
            </span>
            <span className="text-zinc-600 mb-1 font-medium">
              ({score} out of {questions.length} correct)
            </span>
          </div>
          <p className="mt-4 text-zinc-700">
            Review your answers below. {allowExplanations ? "Explanations are now visible." : "See how you did!"}
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const isCorrect = checkAnswer(q, userAnswer);

          return (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              userAnswer={userAnswer}
              isSubmitted={isSubmitted}
              isCorrect={isCorrect}
              allowHints={allowHints}
              allowExplanations={allowExplanations}
              visibleHint={visibleHints[q.id] || false}
              onOptionSelect={(option, type) => handleOptionSelect(q.id, option, type)}
              onTextChange={(text) => handleTextChange(q.id, text)}
              onToggleHint={() => toggleHint(q.id)}
            />
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="flex justify-end mt-12 pb-8">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isGenerating}
            className="h-14 px-8 rounded-full bg-brand-orange text-white hover:bg-emerald-600 font-bold shadow-xl shadow-emerald-500/20 text-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Spinner className="w-5 h-5 animate-spin mr-2" />
                Generating Questions...
              </>
            ) : isSubmitting ? (
              <>
                <Spinner className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Exam"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}