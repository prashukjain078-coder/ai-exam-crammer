import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, RefreshCw, Trophy, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface QuizResult {
  questions: QuizQuestion[];
}

interface StudyModeQuizProps {
  dataString: string;
}

export default function StudyModeQuiz({ dataString }: StudyModeQuizProps) {
  let parsed: QuizResult;
  try {
    parsed = JSON.parse(dataString);
  } catch (e) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200">
        <p className="font-medium font-display">Error rendering quiz</p>
        <p className="text-sm mt-1 text-red-300/80">The AI response could not be parsed as structured data.</p>
      </div>
    );
  }

  const questions = parsed.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return; // Prevent changing answers after submission
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        score++;
      }
    });
    return score;
  };

  if (questions.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        No mock quiz questions generated. Try parsing another document first!
      </div>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx];
  const userSelectedOption = selectedAnswers[currentIdx];
  const score = calculateScore();

  return (
    <div className="max-w-3xl mx-auto space-y-6" id="study-mode-quiz">
      {isSubmitted ? (
        /* SCORE SUMMARIZED BANNER */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/20 p-8 rounded-2xl text-center space-y-4 shadow-2xl"
        >
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <Trophy size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-display text-white">Quiz Completed!</h3>
            <p className="text-slate-400 text-sm mt-1">Excellent job self-testing to verify your last-minute retention.</p>
          </div>
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-display">
            {score} / {totalQuestions} Correct
          </div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            {((score / totalQuestions) * 100).toFixed(0)}% Retention accuracy
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg cursor-pointer"
            >
              Review My Answers
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} />
              Retake Quiz
            </button>
          </div>
        </motion.div>
      ) : null}

      {/* QUIZ MAIN CARD */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        {/* Progress header */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-4 border-b border-slate-900">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <HelpCircle size={14} />
            PRACTICE QUESTION {currentIdx + 1} OF {totalQuestions}
          </span>
          <span>{isSubmitted ? 'REVIEW MODE' : 'EXAM SIMULATION'}</span>
        </div>

        {/* Question text */}
        <div className="space-y-2">
          <h3 className="text-gray-100 text-lg md:text-xl font-display font-medium leading-relaxed">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Options grid */}
        <div className="grid gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = userSelectedOption === index;
            const isCorrect = currentQuestion.correctOptionIndex === index;
            
            let optionStyles = 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80';
            let statusIcon = null;

            if (isSubmitted) {
              if (isCorrect) {
                optionStyles = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                statusIcon = <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />;
              } else if (isSelected) {
                optionStyles = 'bg-rose-500/10 border-rose-500/40 text-rose-300';
                statusIcon = <AlertTriangle size={16} className="text-rose-400 shrink-0" />;
              } else {
                optionStyles = 'bg-slate-950/20 border-slate-900/60 text-slate-600 opacity-50';
              }
            } else if (isSelected) {
              optionStyles = 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200';
            }

            return (
              <motion.button
                whileHover={!isSubmitted ? { x: 6 } : {}}
                whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                key={index}
                onClick={() => handleSelectOption(currentIdx, index)}
                disabled={isSubmitted}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all font-sans text-sm select-none cursor-pointer ${optionStyles}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border font-mono shrink-0 ${
                    isSelected && !isSubmitted
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
                {statusIcon}
              </motion.button>
            );
          })}
        </div>

        {/* Individual question feedback under submission */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2"
            >
              <div className="text-[10px] font-bold tracking-widest text-indigo-400 font-mono uppercase">
                Tutor Explanation
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-sans">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-900">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                currentIdx === 0
                  ? 'border-slate-900/60 text-slate-700 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <ArrowLeft size={14} />
              Previous
            </button>
            <button
              onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentIdx === totalQuestions - 1}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                currentIdx === totalQuestions - 1
                  ? 'border-slate-900/60 text-slate-700 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              Next
              <ArrowRight size={14} />
            </button>
          </div>

          {!isSubmitted ? (
            <button
              onClick={() => setIsSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                Object.keys(selectedAnswers).length === 0
                  ? 'bg-slate-900/40 border border-slate-900/60 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white border border-emerald-500/10'
              }`}
            >
              Submit Quiz Answers
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} />
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
