import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RefreshCw, Eye, EyeOff, BookmarkCheck, Lightbulb } from 'lucide-react';

interface Flashcard {
  question: string;
  answer: string;
  hint: string;
}

interface FlashcardResult {
  flashcards: Flashcard[];
}

interface StudyModeFlashcardsProps {
  dataString: string;
}

export default function StudyModeFlashcards({ dataString }: StudyModeFlashcardsProps) {
  let parsed: FlashcardResult;
  try {
    parsed = JSON.parse(dataString);
  } catch (e) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200">
        <p className="font-medium font-display">Error rendering flashcards</p>
        <p className="text-sm mt-1 text-red-300/80">The AI response could not be parsed as structured data.</p>
      </div>
    );
  }

  const flashcards = parsed.flashcards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [mastered, setMastered] = useState<Record<number, boolean>>({});

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowHint(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  };

  const toggleMastery = (idx: number) => {
    setMastered((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        No active study flashcards generated for this file. Try another mode!
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const isCurrentMastered = mastered[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6" id="study-mode-flashcards">
      {/* Cards counter & mastery toggle */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <span>CARD {currentIndex + 1} OF {totalCards}</span>
        <button
          onClick={() => toggleMastery(currentIndex)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
            isCurrentMastered
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookmarkCheck size={14} />
          {isCurrentMastered ? 'Mastered!' : 'Mark Mastered'}
        </button>
      </div>

      {/* 3D Flipping Card Section */}
      <div className="relative w-full h-80 perspective-1000">
        <motion.div
          onClick={() => setIsFlipped(!isFlipped)}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full cursor-pointer rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-indigo-950/10 hover:border-indigo-500/30 transition-colors"
        >
          {/* FRONT (Question) */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 p-8 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-indigo-400 font-mono uppercase">
              <span>Question Card</span>
              <RefreshCw size={14} className="text-slate-600 animate-pulse" />
            </div>
            
            <div className="text-center my-auto">
              <h3 className="text-gray-100 text-xl font-display font-medium leading-relaxed">
                {currentCard.question}
              </h3>
            </div>

            <div className="text-center text-xs text-slate-500 font-mono">
              Click anywhere to flip and see the answer
            </div>
          </div>

          {/* BACK (Answer) */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 p-8 flex flex-col justify-between bg-gradient-to-br from-indigo-950/20 to-slate-950/90 rounded-2xl"
          >
            <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-emerald-400 font-mono uppercase">
              <span>Verified Answer</span>
              <RefreshCw size={14} className="text-slate-600" />
            </div>

            <div className="text-center my-auto overflow-y-auto max-h-48 pr-1">
              <p className="text-gray-200 text-lg font-sans leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs text-slate-500 font-mono">
              Click anywhere to flip back
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hint toggle widget */}
      <AnimatePresence mode="wait">
        {currentCard.hint && (
          <div className="w-full flex flex-col items-center">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-mono font-medium py-1.5 px-3 bg-indigo-500/5 rounded-full border border-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer"
            >
              {showHint ? <EyeOff size={13} /> : <Eye size={13} />}
              {showHint ? 'Hide Clue' : 'Reveal Clue'}
            </button>
            
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                className="mt-3 text-center bg-slate-950/30 border border-slate-800/40 px-5 py-3 rounded-xl max-w-md w-full"
              >
                <p className="text-xs text-slate-400 leading-relaxed italic flex items-center justify-center gap-1.5">
                  <Lightbulb size={13} className="text-amber-500 shrink-0" />
                  "{currentCard.hint}"
                </p>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            currentIndex === 0
              ? 'bg-slate-950/10 border-slate-900/60 text-slate-800 cursor-not-allowed'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs font-mono font-bold tracking-widest text-slate-500">
          {currentIndex + 1} / {totalCards}
        </span>
        <button
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            currentIndex === totalCards - 1
              ? 'bg-slate-950/10 border-slate-900/60 text-slate-800 cursor-not-allowed'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
