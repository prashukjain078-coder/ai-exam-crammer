import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanSearch, CheckSquare, Square, ChevronDown, ChevronUp, AlertTriangle, RefreshCw, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface Gap {
  topic: string;
  whyHard: string;
  microStudy: string[];
  killerQ: string;
  killerA: string;
  docSection: string;
}

interface ParsedData {
  gaps: Gap[];
}

interface Props {
  dataString: string;
}

export default function StudyModeGapFinder({ dataString }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for checkable study steps: gapIdx -> Set of checked step indices (0, 1, 2)
  const [checkedSteps, setCheckedSteps] = useState<Record<number, Set<number>>>({});
  // State for which Killer Questions are revealed (gapIdx -> boolean)
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.gaps || !Array.isArray(parsed.gaps)) {
        throw new Error('Invalid format: Missing gaps diagnostician list.');
      }
      setData(parsed);
      setError(null);
      setCheckedSteps({});
      setRevealedAnswers({});
    } catch (err: any) {
      setError(err.message || 'Failed to parse gap finder data.');
    }
  }, [dataString]);

  const toggleStep = (gapIdx: number, stepIdx: number) => {
    setCheckedSteps((prev) => {
      const currentSet = new Set(prev[gapIdx] || []);
      if (currentSet.has(stepIdx)) {
        currentSet.delete(stepIdx);
      } else {
        currentSet.add(stepIdx);
      }
      return {
        ...prev,
        [gapIdx]: currentSet,
      };
    });
  };

  const toggleAnswer = (gapIdx: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [gapIdx]: !prev[gapIdx],
    }));
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Topic Gap Finder Parse Error</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-lg overflow-x-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!data || data.gaps.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
        Running diagnostic scans...
      </div>
    );
  }

  // Calculate global step progress
  const totalSteps = data.gaps.length * 3;
  let checkedStepsCount = 0;
  Object.keys(checkedSteps).forEach((key) => {
    const set = checkedSteps[Number(key)];
    if (set) {
      checkedStepsCount += set.size;
    }
  });
  const progressPercent = totalSteps > 0 ? (checkedStepsCount / totalSteps) * 100 : 0;

  return (
    <div className="space-y-6" id="gap-finder">
      {/* Pulse Banner Header */}
      <div className="bg-gradient-to-r from-orange-600/10 to-amber-600/5 border border-orange-500/20 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                DIAGNOSTIC REPORT: COMPLETE
              </h3>
              <p className="text-xs text-slate-400">
                Identified <strong className="text-orange-400">{data.gaps.length} critical topic gaps</strong> requiring immediate intervention.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-xs font-bold font-mono">
            Diagnostic Scan
          </span>
        </div>

        {/* Diagnostic Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Fix Plan Progress</span>
            <span className="text-orange-300 font-bold">{checkedStepsCount} / {totalSteps} steps completed</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* List of Gaps */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-6">
          {data.gaps.map((gap, idx) => {
            const activeSet = checkedSteps[idx] || new Set<number>();
            const isCompleted = activeSet.size === 3;
            const isAnswerShown = !!revealedAnswers[idx];

            return (
              <motion.div
                key={`${gap.topic}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ type: "spring", stiffness: 300, damping: 26, delay: idx * 0.05 }}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-slate-950/40 shadow-lg shadow-emerald-950/5'
                    : 'border-slate-800/80 bg-slate-950/50 hover:border-orange-500/20'
                }`}
              >
                {/* Gap Header */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4 border-b border-slate-900 bg-slate-950/20">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest block">Gap Diagnose #{idx + 1}</span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-full uppercase">
                          <CheckCircle2 size={10} />
                          <span>Gap Healed</span>
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 font-display truncate">
                      {gap.topic}
                    </h4>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider shrink-0">
                    {gap.docSection || 'General'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Why Hard Section - Amber Tint Box */}
                  <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold block">Why Students Get It Wrong</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {gap.whyHard}
                    </p>
                  </div>

                  {/* 3-Step checklist */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">3-Step 10-Min Study Fix Plan</span>
                    {gap.microStudy.map((step, sIdx) => {
                      const isChecked = activeSet.has(sIdx);
                      return (
                        <div
                          key={sIdx}
                          onClick={() => toggleStep(idx, sIdx)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-500'
                              : 'bg-slate-950/40 border-slate-900/60 text-slate-300 hover:bg-slate-900/10'
                          }`}
                        >
                          <button className="text-indigo-400 shrink-0 mt-0.5">
                            {isChecked ? (
                              <CheckSquare size={13} className="text-emerald-400" />
                            ) : (
                              <Square size={13} className="text-slate-600" />
                            )}
                          </button>
                          <p className={`text-[11px] leading-relaxed ${isChecked ? 'line-through' : ''}`}>
                            <strong className="font-mono text-slate-400/80 mr-1">Step {sIdx + 1}:</strong>
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Killer Question Reveal Box */}
                  <div className="border border-slate-900 rounded-xl bg-slate-950/40 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest font-bold flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>Killer Understanding Test Question</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                      {gap.killerQ}
                    </p>

                    <div className="pt-1.5">
                      <button
                        onClick={() => toggleAnswer(idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white transition-all cursor-pointer font-mono"
                      >
                        {isAnswerShown ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        <span>{isAnswerShown ? 'Hide Model Answer' : 'Show Model Answer'}</span>
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {isAnswerShown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-3 border-t border-slate-900 text-xs text-slate-400 leading-relaxed font-mono"
                        >
                          <span className="text-[9px] text-emerald-400 block mb-1 font-sans font-bold uppercase tracking-wider">Correct Model Solution</span>
                          {gap.killerA}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
