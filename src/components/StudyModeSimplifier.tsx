import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, HelpCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface SimplifiedTopic {
  originalConcept: string;
  simpleExplanation: string;
  analogy: string;
}

interface SimplifierResult {
  simplifiedTopics: SimplifiedTopic[];
}

interface StudyModeSimplifierProps {
  dataString: string;
}

export default function StudyModeSimplifier({ dataString }: StudyModeSimplifierProps) {
  let parsed: SimplifierResult;
  try {
    parsed = JSON.parse(dataString);
  } catch (e) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200">
        <p className="font-medium font-display">Error rendering simplified guide</p>
        <p className="text-sm mt-1 text-red-300/80">The AI response could not be parsed as structured data.</p>
      </div>
    );
  }

  const topics = parsed.simplifiedTopics || [];

  if (topics.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        No topics simplified. Try another document or mode!
      </div>
    );
  }

  return (
    <div className="space-y-6" id="study-mode-simplifier">
      {/* Feynman Introduction Card */}
      <div className="bg-slate-950/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col md:flex-row gap-5 items-start">
        <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-2xl shrink-0">
          <Sparkles className="animate-pulse" size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-widest text-violet-400 uppercase font-mono">The Feynman Method</h3>
          <p className="text-gray-200 text-sm mt-1.5 leading-relaxed font-sans">
            "If you can't explain it to a six-year-old, you don't understand it yourself." We've broken down the hardest, most complex topics in your notes into zero-jargon, simple explanations paired with vivid everyday analogies.
          </p>
        </div>
      </div>

      {/* Grid of simplified topics */}
      <div className="grid gap-6">
        {topics.map((topic, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5 hover:border-violet-500/20 transition-colors relative overflow-hidden"
          >
            {/* Tag / Title */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-bold tracking-widest text-violet-400 font-mono uppercase bg-violet-500/5 border border-violet-500/10 px-2.5 py-1 rounded-md">
                Topic {idx + 1}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Feynman Simplicity
              </span>
            </div>

            <h4 className="text-xl font-bold text-white font-display tracking-tight">
              {topic.originalConcept}
            </h4>

            <div className="grid gap-5 md:grid-cols-2 pt-2">
              {/* Simple explanation */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-medium uppercase">
                  <HelpCircle size={13} className="text-slate-500" />
                  Plain English Explanation
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-sans">
                  {topic.simpleExplanation}
                </p>
              </div>

              {/* Analogy Box */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-xl rounded-full" />
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-medium uppercase">
                  <Lightbulb size={13} className="text-indigo-400 animate-pulse" />
                  Visual Analogy
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed font-sans">
                  "{topic.analogy}"
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
