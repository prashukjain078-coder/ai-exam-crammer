import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, HelpCircle, Code, Lightbulb, CheckCircle2, Bookmark, Flame } from 'lucide-react';

interface Concept {
  term: string;
  explanation: string;
}

interface Formula {
  term: string;
  explanation: string;
}

interface ExamTopic {
  topic: string;
  context: string;
}

interface MemoryTrick {
  concept: string;
  trick: string;
}

interface CrammerResult {
  summary: string;
  keyConcepts: Concept[];
  formulasAndDefinitions: Formula[];
  likelyExamTopics: ExamTopic[];
  memoryTricks: MemoryTrick[];
}

interface StudyModeCrammerProps {
  dataString: string;
}

export default function StudyModeCrammer({ dataString }: StudyModeCrammerProps) {
  let parsed: CrammerResult;
  try {
    parsed = JSON.parse(dataString);
  } catch (e) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200">
        <p className="font-medium font-display">Error rendering study guide</p>
        <p className="text-sm mt-1 text-red-300/80">The AI response could not be parsed as structured data.</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'concepts' | 'formulas' | 'topics' | 'tricks'>('concepts');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { id: 'concepts', label: 'Key Concepts', icon: BookOpen, color: 'from-violet-500 to-indigo-600' },
    { id: 'formulas', label: 'Formulas & Terms', icon: Code, color: 'from-cyan-500 to-blue-600' },
    { id: 'topics', label: 'Exam Predictions', icon: Flame, color: 'from-amber-500 to-orange-600' },
    { id: 'tricks', label: 'Memory Hacks', icon: Lightbulb, color: 'from-emerald-500 to-teal-600' },
  ] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <div className="space-y-6" id="study-mode-crammer">
      {/* Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-900/40 p-6 rounded-2xl shadow-xl shadow-indigo-950/10"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400">
          <BookOpen size={160} />
        </div>
        <div className="relative flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
            <Bookmark className="animate-pulse" size={24} />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono">Scope Overview</h3>
            <p className="text-gray-200 text-lg mt-1 font-display leading-relaxed font-medium">
              "{parsed.summary || 'Summary of your custom notes study session.'}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium text-sm transition-all border font-display cursor-pointer ${
                isActive
                  ? `bg-slate-900 border-indigo-500/50 text-white shadow-lg shadow-indigo-950/30`
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className={`absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${tab.color} opacity-10 blur-md`}
                />
              )}
              <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content cards container */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'concepts' && (
            <motion.div
              key="concepts"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: 10 }}
              className="grid gap-4"
            >
              {parsed.keyConcepts && parsed.keyConcepts.length > 0 ? (
                parsed.keyConcepts.map((concept, index) => {
                  const itemKey = `concept-${index}`;
                  const isDone = completedItems[itemKey];
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.005, borderColor: 'rgba(124, 58, 237, 0.3)' }}
                      onClick={() => toggleComplete(itemKey)}
                      className={`p-5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
                        isDone
                          ? 'bg-slate-950/20 border-emerald-950/40 opacity-60'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950/80'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(itemKey);
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-indigo-400'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <div className="space-y-1">
                        <h4 className={`font-semibold font-display text-base ${isDone ? 'line-through text-slate-500' : 'text-gray-100'}`}>
                          {concept.term}
                        </h4>
                        <p className={`text-sm leading-relaxed ${isDone ? 'text-slate-600' : 'text-slate-300'}`}>
                          {concept.explanation}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-center text-slate-500 py-12">No key concepts identified in this document.</p>
              )}
            </motion.div>
          )}

          {activeTab === 'formulas' && (
            <motion.div
              key="formulas"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: 10 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {parsed.formulasAndDefinitions && parsed.formulasAndDefinitions.length > 0 ? (
                parsed.formulasAndDefinitions.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/80 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-cyan-400 font-mono uppercase bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded-md">
                        Reference Item
                      </span>
                      <h4 className="font-semibold font-display text-gray-100 text-base mt-2.5">
                        {item.term}
                      </h4>
                    </div>
                    <p className="text-sm font-mono mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800/60 text-cyan-200/90 leading-relaxed break-words">
                      {item.explanation}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center text-slate-500 py-12">
                  No formulaic or quick definitions flagged. Recommended for technical materials!
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'topics' && (
            <motion.div
              key="topics"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: 10 }}
              className="grid gap-4"
            >
              {parsed.likelyExamTopics && parsed.likelyExamTopics.length > 0 ? (
                parsed.likelyExamTopics.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.005 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-slate-950/70 to-slate-950/40 border border-slate-800/80 hover:border-amber-500/20 transition-all flex gap-4 items-start"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold font-display text-gray-100 text-base">
                        {item.topic}
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        <strong className="text-amber-400 font-medium font-mono text-[11px] uppercase tracking-wider mr-1">Focus strategy:</strong>
                        {item.context}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-12">No test-specific topics found.</p>
              )}
            </motion.div>
          )}

          {activeTab === 'tricks' && (
            <motion.div
              key="tricks"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: 10 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {parsed.memoryTricks && parsed.memoryTricks.length > 0 ? (
                parsed.memoryTricks.map((trick, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/20 transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full" />
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-display">
                        <Lightbulb size={13} />
                        Mnemonic / Trick
                      </span>
                      <h4 className="font-semibold font-display text-gray-100 text-base mt-2.5">
                        {trick.concept}
                      </h4>
                    </div>
                    <div className="text-sm italic mt-3.5 p-3.5 bg-slate-900/60 border border-emerald-950/40 rounded-lg text-emerald-200/90 leading-relaxed font-sans">
                      "{trick.trick}"
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center text-slate-500 py-12">
                  No specific memory associations recommended. Try checking key concepts!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
