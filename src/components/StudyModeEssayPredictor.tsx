import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Clock, Award, CheckSquare, Square, ChevronRight, ChevronDown, Copy, Check, AlertTriangle, RefreshCw } from 'lucide-react';

interface Essay {
  question: string;
  markingCriteria: string[];
  modelSkeleton: string[];
  keywordsToUse: string[];
  timeMinutes: number;
  difficulty: string;
}

interface ParsedData {
  essays: Essay[];
}

interface Props {
  dataString: string;
}

export default function StudyModeEssayPredictor({ dataString }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, Set<number>>>({});
  const [expandedSkeleton, setExpandedSkeleton] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.essays || !Array.isArray(parsed.essays)) {
        throw new Error('Invalid format: Missing essays predictions.');
      }
      setData(parsed);
      setError(null);
      setActiveTabIdx(0);
      setCheckedCriteria({});
      setExpandedSkeleton({});
      setCopied(false);
    } catch (err: any) {
      setError(err.message || 'Failed to parse essay predictor data.');
    }
  }, [dataString]);

  const toggleCriteria = (tabIdx: number, critIdx: number) => {
    setCheckedCriteria((prev) => {
      const currentSet = new Set(prev[tabIdx] || []);
      if (currentSet.has(critIdx)) {
        currentSet.delete(critIdx);
      } else {
        currentSet.add(critIdx);
      }
      return {
        ...prev,
        [tabIdx]: currentSet,
      };
    });
  };

  const toggleSkeletonSection = (sectIdx: number) => {
    setExpandedSkeleton((prev) => ({
      ...prev,
      [sectIdx]: !prev[sectIdx],
    }));
  };

  const handleCopyQuestion = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Essay Predictor Parse Error</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-lg overflow-x-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!data || data.essays.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
        Loading essay predictions...
      </div>
    );
  }

  const activeEssay = data.essays[activeTabIdx];
  const activeCheckedSet = checkedCriteria[activeTabIdx] || new Set<number>();

  const getDiffColor = (diff: string) => {
    const d = diff.toLowerCase();
    if (d.includes('easy')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (d.includes('hard')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div className="space-y-6" id="essay-predictor">
      {/* Tab bar header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 flex-wrap gap-4">
        <div className="flex gap-1.5 p-1 bg-slate-950/55 rounded-2xl border border-slate-900 relative overflow-x-auto max-w-full custom-scrollbar">
          {data.essays.map((_, idx) => {
            const isActive = idx === activeTabIdx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveTabIdx(idx);
                  setExpandedSkeleton({});
                }}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 z-10 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeEssayTabPill"
                    className="absolute inset-0 bg-rose-600/10 border border-rose-500/30 rounded-xl -z-10 shadow shadow-rose-950/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>Q{idx + 1}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-bold font-mono">
            {data.essays.length} Long Qs Predicted
          </span>
        </div>
      </div>

      {/* Main panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabIdx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="space-y-6"
        >
          {/* Question card */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 border rounded text-[10px] font-mono font-semibold uppercase ${getDiffColor(activeEssay.difficulty)}`}>
                  {activeEssay.difficulty}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <Clock size={12} className="text-slate-500" />
                  <span>{activeEssay.timeMinutes} Mins Suggested</span>
                </span>
              </div>
              <button
                onClick={() => handleCopyQuestion(activeEssay.question)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-all cursor-pointer font-mono"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy Question'}</span>
              </button>
            </div>

            <p className="text-base sm:text-lg font-serif italic text-slate-100 leading-relaxed font-medium">
              "{activeEssay.question}"
            </p>
          </div>

          {/* Marking criteria check-list */}
          <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
                Examiner's Marking Criteria Checklist
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {activeCheckedSet.size} / {activeEssay.markingCriteria.length} Met
              </span>
            </div>

            <div className="space-y-2.5">
              {activeEssay.markingCriteria.map((criteria, cIdx) => {
                const isChecked = activeCheckedSet.has(cIdx);
                return (
                  <div
                    key={cIdx}
                    onClick={() => toggleCriteria(activeTabIdx, cIdx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                        : 'bg-slate-950/65 border-slate-900/60 hover:bg-slate-900/30 text-slate-200'
                    }`}
                  >
                    <button className="p-0.5 text-indigo-400 shrink-0 mt-0.5">
                      {isChecked ? (
                        <CheckSquare size={14} className="text-emerald-400 stroke-[2.5]" />
                      ) : (
                        <Square size={14} className="text-slate-600" />
                      )}
                    </button>
                    <p className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
                      {criteria}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expandable Model Answer skeleton */}
          <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300 border-b border-slate-900 pb-2">
              Model Answer Skeleton Walkthrough
            </h4>

            <div className="space-y-2.5">
              {activeEssay.modelSkeleton.map((step, sIdx) => {
                const isExpanded = !!expandedSkeleton[sIdx];
                return (
                  <div
                    key={sIdx}
                    className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/40"
                  >
                    <div
                      onClick={() => toggleSkeletonSection(sIdx)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-400 flex items-center justify-center">
                          {sIdx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-200 font-display">
                          {step.split(':')[0] || 'Section Title'}
                        </h5>
                      </div>
                      <div className="text-slate-500">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed font-sans border-t border-slate-900 bg-slate-950/10"
                        >
                          {step.split(':').slice(1).join(':').trim() || step}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Examiner Keywords */}
          <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400">
              High-Value Key Terms (Examiner targets these)
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeEssay.keywordsToUse.map((word, wIdx) => (
                <span
                  key={wIdx}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[10px] font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
