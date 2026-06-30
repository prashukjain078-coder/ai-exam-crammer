import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STUDY_FACTS } from '../data/studyFacts';
import MobiusLoader from './MobiusLoader';

interface CrammingLoaderProps {
  loadingStep: string;
}

export const CrammingLoader = memo(function CrammingLoader({ loadingStep }: CrammingLoaderProps) {
  const [factIndex, setFactIndex] = useState(() => {
    return Math.floor(Math.random() * STUDY_FACTS.length);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prevIndex) => {
        let nextIndex = Math.floor(Math.random() * STUDY_FACTS.length);
        // Avoid repeating the previous fact
        while (nextIndex === prevIndex && STUDY_FACTS.length > 1) {
          nextIndex = Math.floor(Math.random() * STUDY_FACTS.length);
        }
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const currentFact = STUDY_FACTS[factIndex] || 'Your brain is ready to learn.';

  return (
    <div className="w-full flex justify-center py-4">
      <style>{`
        .loader-glow-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .progress-bar-shimmer {
          background-size: 200% auto;
          animation: progress-shimmer 3s ease infinite;
        }
        @keyframes progress-shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        /* Floating custom animation for card */
        .cramming-card-float {
          animation: cramming-card-float-anim 6s ease-in-out infinite;
        }
        @keyframes cramming-card-float-anim {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .progress-bar-shimmer {
            animation: none !important;
            background-size: 100% auto !important;
          }
          .cramming-card-float {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <motion.div
        id="cramming-loader-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="cramming-card-float p-6 md:p-8 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col items-center text-center space-y-6 max-w-md w-full relative overflow-hidden shadow-2xl shadow-black/80"
      >
        {/* Soft glowing background element inside the card */}
        <div className="loader-glow-bg" />

        {/* Mobius Animation */}
        <div className="flex justify-center items-center h-16 relative">
          <MobiusLoader size={90} />
        </div>

        {/* Loading Steps */}
        <div className="space-y-1 z-10 w-full">
          <p className="text-[10px] font-bold tracking-widest font-mono text-indigo-400 uppercase">
            Cram Engine Live
          </p>
          <div className="h-6 overflow-hidden relative w-full flex justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="text-sm font-semibold text-white truncate max-w-xs absolute"
              >
                {loadingStep || 'Initializing...'}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Study Facts */}
        <div className="h-[52px] flex items-center justify-center relative w-full z-10 px-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              className="text-xs text-slate-400 leading-relaxed max-w-[280px] absolute"
            >
              💡 {currentFact}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Thin animated gradient progress bar */}
        <div className="w-full space-y-1.5 z-10">
          <div className="w-full h-1 bg-slate-900 border border-slate-800/60 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 progress-bar-shimmer h-full rounded-full" />
          </div>
          <p className="text-[8px] text-slate-500 font-mono text-right tracking-wider uppercase">
            Compiling context & insights
          </p>
        </div>
      </motion.div>
    </div>
  );
});

export default CrammingLoader;
